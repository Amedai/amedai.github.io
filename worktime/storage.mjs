import { STORAGE_KEY, validateData, validateItem, validateProject, mergeData, transitionTimer, createInvoice, invoiceFor } from "./core.mjs";

function itemDetails(value) {
  const { id, project_id, title, note, images } = validateItem(value);
  return { id, project_id, title, note, images };
}

export function localRepository(storage) {
  const read = () => validateData(JSON.parse(storage.getItem(STORAGE_KEY) || '{"projects":[],"items":[]}'));
  const write = data => storage.setItem(STORAGE_KEY, JSON.stringify(validateData(data)));
  return {
    async list() { return read(); },
    async saveProject(value) {
      const project = validateProject(value), data = read();
      data.projects = [...data.projects.filter(p => p.id !== project.id), project]; write(data);
    },
    async removeProject(id) {
      const data = read();
      if (data.items.some(i => i.project_id === id)) throw new Error("Сначала удалите или перенесите задачи проекта.");
      data.projects = data.projects.filter(p => p.id !== id); write(data);
    },
    async saveItem(value) { const item = validateItem(value), data = read(); if (invoiceFor(data, item.id)) throw new Error("Задача уже включена в счёт и сохранена для истории."); data.items = [...data.items.filter(i => i.id !== item.id), item]; write(data); },
    async updateItemDetails(value) {
      const details = itemDetails(value), data = read();
      if (invoiceFor(data, details.id)) throw new Error("Задача уже включена в счёт и сохранена для истории.");
      if (!data.items.some(i => i.id === details.id)) throw new Error("Запись не найдена. Обновите список.");
      data.items = data.items.map(i => i.id === details.id ? { ...i, ...details } : i); write(data);
    },
    async removeItem(id) { const data = read(); if (invoiceFor(data, id)) throw new Error("Задача уже включена в счёт и сохранена для истории."); data.items = data.items.filter(i => i.id !== id); write(data); },
    async createInvoice(options) { const data = read(), invoice = createInvoice(data, options); data.invoices.push(invoice); write(data); return invoice.id; },
    async removeInvoice(id) {
      const data = read(), invoice = data.invoices.find(i => i.id === id);
      if (!invoice) throw new Error("Счёт не найден. Обновите список.");
      if (invoice.paid_at) throw new Error("Оплаченный счёт нельзя удалить.");
      data.invoices = data.invoices.filter(i => i.id !== id); write(data);
    },
    async payInvoice(id) {
      const data = read(), invoice = data.invoices.find(i => i.id === id);
      if (!invoice) throw new Error("Счёт не найден. Обновите список.");
      invoice.paid_at ||= new Date().toISOString(); write(data);
    },
    async timerAction(id, action, version) {
      const data = read(), item = data.items.find(i => i.id === id);
      if (!item || item.timer_version !== version) throw new Error("Таймер изменился в другой вкладке. Обновите список.");
      data.items = data.items.map(i => i.id === id ? transitionTimer(i, action) : i); write(data);
    },
    async import(value) { write(mergeData(read(), value)); },
  };
}
export function cloudRepository(client, owner) {
  async function listTable(table, fields) {
    const rows = [];
    for (let from = 0; ; from += 500) {
      const { data, error } = await client.from(table).select(fields).eq("user_id", owner).order("created_at").order("id").range(from, from + 499);
      if (error) throw error;
      rows.push(...data);
      if (rows.length > 10000) throw new Error("Слишком много записей.");
      if (data.length < 500) return rows;
    }
  }
  async function save(table, row, existing) {
    const query = existing ? client.from(table).update(row).eq("id", row.id).eq("user_id", owner) : client.from(table).insert({ ...row, user_id: owner });
    const { data, error } = await query.select("id").single();
    if (error) throw error;
    if (!data) throw new Error("Запись не найдена. Обновите список.");
  }
  async function remove(table, id) {
    const { error } = await client.from(table).delete().eq("id", id).eq("user_id", owner).select("id").single();
    if (error) throw error;
  }
  return {
    async list() {
      const [projects, items, invoices] = await Promise.all([
        listTable("worktime_projects", "id,name,created_at"),
        listTable("worktime_items", "id,project_id,title,note,images,kind,done,started_at,ended_at,created_at,timer_state,elapsed_ms,running_since,timer_version"),
        listTable("worktime_invoices", "id,period_start,period_end,created_at,paid_at,items"),
      ]);
      return validateData({ projects, items, invoices });
    },
    saveProject(value, existing) { return save("worktime_projects", validateProject(value), existing); },
    removeProject(id) { return remove("worktime_projects", id); },
    saveItem(value, existing) { return save("worktime_items", validateItem(value), existing); },
    updateItemDetails(value) { return save("worktime_items", itemDetails(value), true); },
    removeItem(id) { return remove("worktime_items", id); },
    removeInvoice(id) { return remove("worktime_invoices", id); },
    async createInvoice({ id, start, end, project = "all" }) {
      const { error } = await client.rpc("worktime_create_invoice", { invoice_id:id, date_start:start, date_end:end, selected_project:project === "all" ? null : project });
      if (error) throw error;
      return id;
    },
    async payInvoice(id) {
      const { error } = await client.rpc("worktime_pay_invoice", { invoice_id:id });
      if (error) throw error;
    },
    async timerAction(id, action, version) {
      const { error } = await client.rpc("worktime_timer_action", { item_id:id, operation:action, expected_version:version });
      if (error) throw error;
    },
    async import(value) {
      const checked = validateData(value);
      const { error } = await client.rpc("worktime_import", { payload: checked });
      if (error) throw error;
    },
  };
}
