import { STORAGE_KEY, sortRecords, validateRecord, validateRecords } from "./core.mjs";

export function localRepository(storage) {
  function read() {
    const raw = storage.getItem(STORAGE_KEY);
    return raw === null ? [] : validateRecords(JSON.parse(raw));
  }
  function write(records) {
    try { storage.setItem(STORAGE_KEY, JSON.stringify(validateRecords(records))); }
    catch (error) {
      if (error.name === "QuotaExceededError" || error.name === "SecurityError") throw new Error("Браузер не разрешил сохранить запись. Проверьте доступ к хранилищу или скачайте копию.");
      throw error;
    }
  }
  return {
    async list() { return sortRecords(read()); },
    async save(record) {
      const checked = validateRecord(record);
      const records = read();
      const index = records.findIndex(item => item.id === checked.id);
      if (index < 0) records.push(checked); else records[index] = checked;
      write(records);
    },
    async remove(id) { write(read().filter(record => record.id !== id)); },
    async import(records) {
      const current = read();
      const ids = new Set(current.map(record => record.id));
      const added = validateRecords(records).filter(record => !ids.has(record.id));
      write([...current, ...added]);
      return added.length;
    },
  };
}

export function cloudRepository(client, userId) {
  const fields = "id,direction,title,person,amount_cents,created_at";
  return {
    async list() {
      const records = [];
      // Supabase ограничивает размер ответа: читаем все страницы по 500 записей.
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await client.from("debts").select(fields).eq("user_id", userId).order("created_at", { ascending: false }).order("id").range(offset, offset + 499);
        if (error) throw error;
        records.push(...data);
        if (data.length < 500) break;
      }
      return sortRecords(validateRecords(records));
    },
    async save(record, existing = false) {
      const checked = validateRecord(record);
      const query = existing
        ? client.from("debts").update(checked).eq("id", checked.id).eq("user_id", userId)
        : client.from("debts").insert({ ...checked, user_id: userId });
      const { data, error } = await query.select("id").single();
      if (error) throw error;
      if (!data) throw new Error("Запись уже изменилась. Обновите список.");
    },
    async remove(id) {
      const { error } = await client.from("debts").delete().eq("id", id).eq("user_id", userId).select("id").single();
      if (error) throw error;
    },
    async import(records) {
      const current = await this.list();
      const ids = new Set(current.map(record => record.id));
      const added = validateRecords(records).filter(record => !ids.has(record.id));
      if (current.length + added.length > 10_000) throw new Error("В заметке может быть не больше 10 000 записей.");
      if (added.length) {
        const { error } = await client.from("debts").insert(added.map(record => ({ ...record, user_id: userId })));
        if (error) throw error;
      }
      return added.length;
    },
  };
}
