export const STORAGE_KEY = "worktime.demo.v1";
export const TIME_ZONE = "Europe/Moscow";
const inputFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX = 10000;
function text(value, max, required = true) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new Error("Проверьте название и длину текста.");
  return value.trim();
}
function id(value) {
  if (!UUID.test(value)) throw new Error("Некорректный идентификатор записи.");
  return value;
}
function timestamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error("Некорректная дата.");
  return new Date(value).toISOString();
}
export function interval(start, end) {
  const from = Date.parse(timestamp(start));
  const to = Date.parse(timestamp(end));
  if (to <= from) throw new Error("Окончание должно быть позже начала. Для работы после полуночи выберите следующий день.");
  if (to - from > 7 * 86400000) throw new Error("Один интервал не может быть длиннее 7 дней.");
  return billMilliseconds(to - from);
}
export function durationInterval(start, hours, minutes) {
  if (![hours, minutes].every(value => /^\d+$/.test(String(value)))
    || !Number.isSafeInteger(Number(hours)) || !Number.isSafeInteger(Number(minutes))
    || Number(minutes) > 59) throw new Error("Укажите целые часы и минуты от 0 до 59.");
  const total = Number(hours) * 60 + Number(minutes);
  if (total <= 0) throw new Error("Потраченное время должно быть больше нуля.");
  if (total > 7 * 24 * 60) throw new Error("Одна запись не может быть длиннее 168 часов (7 дней). Разделите работу на несколько записей.");
  const started_at = timestamp(start);
  return { started_at, ended_at: new Date(Date.parse(started_at) + total * 60000).toISOString() };
}
function billMilliseconds(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const blocks = Math.floor(milliseconds / 600000);
  return { minutes, blocks, amount: blocks * 200, freeMinutes: minutes - blocks * 10 };
}
export const activeTimer = item => ["running", "paused"].includes(item.timer_state);
export function elapsedMilliseconds(item, now = Date.now()) {
  return (item.elapsed_ms || 0) + (item.timer_state === "running" ? Math.max(0, now - Date.parse(item.running_since)) : 0);
}
export function workBill(item, now = Date.now()) {
  return !item.timer_state || item.timer_state === "manual" ? interval(item.started_at, item.ended_at) : billMilliseconds(elapsedMilliseconds(item, now));
}
export function timerClock(item, now = Date.now()) {
  const seconds = Math.floor(elapsedMilliseconds(item, now) / 1000);
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, "0")).join(":");
}
export function transitionTimer(value, action, now = Date.now()) {
  const item = validateItem(value);
  if (!activeTimer(item) || !["pause", "resume", "finish"].includes(action)
    || (action === "pause" && item.timer_state !== "running") || (action === "resume" && item.timer_state !== "paused")) throw new Error("Состояние таймера изменилось. Обновите список.");
  if (now < Date.parse(item.running_since || item.started_at)) throw new Error("Проверьте часы устройства: время оказалось раньше запуска.");
  const next = { ...item, elapsed_ms: elapsedMilliseconds(item, now), running_since: null, timer_version: item.timer_version + 1 };
  if (action === "resume") { next.timer_state = "running"; next.running_since = new Date(now).toISOString(); }
  else if (action === "pause") next.timer_state = "paused";
  else { next.timer_state = "finished"; next.ended_at = new Date(now).toISOString(); }
  return validateItem(next);
}
export function validateProject(value) {
  if (!value || typeof value !== "object") throw new Error("Некорректный проект.");
  return { id: id(value.id), name: text(value.name, 100), created_at: timestamp(value.created_at) };
}
export function validateItem(value) {
  if (!value || typeof value !== "object" || !["work", "plan"].includes(value.kind) || typeof value.done !== "boolean") throw new Error("Некорректная задача.");
  const item = { id: id(value.id), project_id: id(value.project_id), title: text(value.title, 200), note: text(value.note ?? "", 2000, false), kind: value.kind, done: value.done, started_at: null, ended_at: null, created_at: timestamp(value.created_at), timer_state: value.timer_state ?? "manual", elapsed_ms: value.elapsed_ms ?? 0, running_since: null, timer_version: value.timer_version ?? 0 };
  if (!["manual", "running", "paused", "finished"].includes(item.timer_state) || !Number.isSafeInteger(item.elapsed_ms) || item.elapsed_ms < 0 || !Number.isSafeInteger(item.timer_version) || item.timer_version < 0) throw new Error("Некорректное состояние таймера.");
  if (item.kind === "work") {
    item.started_at = timestamp(value.started_at);
    if (item.timer_state === "manual") {
      item.ended_at = timestamp(value.ended_at);
      interval(item.started_at, item.ended_at);
    } else if (item.timer_state === "finished") {
      item.ended_at = timestamp(value.ended_at);
      if (Date.parse(item.ended_at) < Date.parse(item.started_at) || item.elapsed_ms > Date.parse(item.ended_at) - Date.parse(item.started_at)) throw new Error("Активное время не может превышать время задачи.");
    } else if (value.ended_at != null) throw new Error("Активный таймер не может иметь время завершения.");
    if (item.timer_state === "running") {
      item.running_since = timestamp(value.running_since);
      if (Date.parse(item.running_since) < Date.parse(item.started_at) || item.elapsed_ms > Date.parse(item.running_since) - Date.parse(item.started_at)) throw new Error("Некорректное время запуска таймера.");
    }
    item.done = false;
  } else if (value.started_at != null || value.ended_at != null) throw new Error("У запланированной задачи не должно быть рабочего интервала.");
  if ((item.kind === "plan" && item.timer_state !== "manual") || (item.timer_state === "manual" && item.elapsed_ms !== 0) || (item.timer_state !== "running" && value.running_since != null)) throw new Error("Некорректные данные таймера.");
  item.images = validateImages(value.images ?? []);
  return item;
}
export const MAX_TASK_IMAGES = 5;
export const MAX_IMAGE_DATA = 2000000;
export function validateImages(images) {
  if (!Array.isArray(images) || images.length > MAX_TASK_IMAGES) throw new Error("К задаче можно прикрепить до 5 фото.");
  let size = 0;
  for (const image of images) {
    if (typeof image !== "string" || image.length > MAX_IMAGE_DATA || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(image) || image.split(",")[1].length % 4 !== 0) throw new Error("Некорректное фото. Используйте PNG, JPEG или WebP.");
    size += image.length;
  }
  if (size > MAX_IMAGE_DATA) throw new Error("Фото занимают слишком много места. Удалите лишнее или вставьте меньший фрагмент.");
  return [...images];
}
export function validateData(value) {
  if (!value || !Array.isArray(value.projects) || !Array.isArray(value.items) || value.projects.length > MAX || value.items.length > MAX) throw new Error("Некорректная копия или слишком много записей (максимум 10 000).");
  const projects = value.projects.map(validateProject);
  const items = value.items.map(validateItem);
  const projectIds = new Set(projects.map(p => p.id));
  if (projectIds.size !== projects.length || new Set(items.map(i => i.id)).size !== items.length) throw new Error("Идентификаторы в копии повторяются.");
  if (items.some(i => !projectIds.has(i.project_id))) throw new Error("В копии отсутствует проект одной из задач.");
  if (items.filter(activeTimer).length > 1) throw new Error("Одновременно можно вести только один таймер. Завершите текущую задачу.");
  const invoices = (value.invoices ?? []).map(validateInvoice);
  if (invoices.length > MAX || new Set(invoices.map(i => i.id)).size !== invoices.length) throw new Error("Некорректный список счетов.");
  const billed = invoices.flatMap(i => i.items.map(task => task.id));
  if (new Set(billed).size !== billed.length || billed.some(taskId => !items.some(i => i.id === taskId))) throw new Error("Задача счёта отсутствует или включена дважды.");
  const byId = new Map(items.map(i => [i.id, i]));
  if (invoices.some(invoice => invoice.items.some(task => JSON.stringify(validateItem(task)) !== JSON.stringify(byId.get(task.id))))) throw new Error("Задачи не совпадают с сохранённым счётом.");
  return { projects, items, invoices };
}
export function parseBackup(raw) {
  const value = JSON.parse(raw);
  if (value.format !== "worktime" || ![1, 2, 3, 4].includes(value.version)) throw new Error("Это не копия Worktime поддерживаемой версии.");
  return validateData(value);
}
export function mergeData(current, incoming) {
  const source = validateData(incoming);
  const projectIds = new Set(current.projects.map(p => p.id));
  const itemIds = new Set(current.items.map(i => i.id));
  const invoiceIds = new Set((current.invoices ?? []).map(i => i.id));
  return validateData({ projects: [...current.projects, ...source.projects.filter(p => !projectIds.has(p.id))], items: [...current.items, ...source.items.filter(i => !itemIds.has(i.id))], invoices: [...(current.invoices ?? []), ...source.invoices.filter(i => !invoiceIds.has(i.id))] });
}
export function invoicePeriod(start, end) {
  moscowInputToISO(`${start}T00:00`); moscowInputToISO(`${end}T00:00`);
  if (start > end) throw new Error("Конец периода должен быть не раньше начала.");
  return { start, end };
}
export function invoiceFor(data, itemId) { return (data.invoices ?? []).find(i => i.items.some(task => task.id === itemId)); }
export function invoiceCandidates(data, start, end, project = "all") {
  invoicePeriod(start, end);
  const billed = new Set((data.invoices ?? []).flatMap(i => i.items.map(task => task.id)));
  return data.items.filter(i => i.kind === "work" && !activeTimer(i) && !billed.has(i.id)
    && (project === "all" || i.project_id === project) && localInput(i.started_at).slice(0,10) >= start && localInput(i.started_at).slice(0,10) <= end)
    .sort((a,b) => a.started_at.localeCompare(b.started_at));
}
export function validateInvoice(value) {
  if (!value || !Array.isArray(value.items) || !value.items.length || value.items.length > MAX) throw new Error("Счёт должен содержать завершённые задачи.");
  invoicePeriod(value.period_start, value.period_end);
  const items = value.items.map(row => {
    const task = validateItem(row);
    if (task.kind !== "work" || activeTimer(task) || localInput(task.started_at).slice(0,10) < value.period_start || localInput(task.started_at).slice(0,10) > value.period_end) throw new Error("Задача не входит в период счёта или ещё не завершена.");
    return { ...task, project_name: text(row.project_name, 100) };
  });
  const created_at = timestamp(value.created_at), paid_at = value.paid_at == null ? null : timestamp(value.paid_at);
  if (paid_at && paid_at < created_at) throw new Error("Дата оплаты раньше создания счёта.");
  return { id: id(value.id), period_start:value.period_start, period_end:value.period_end, created_at, paid_at, items };
}
export function createInvoice(data, { id: invoiceId, start, end, project = "all" }, now = new Date().toISOString()) {
  const items = invoiceCandidates(data, start, end, project).map(i => ({ ...i, project_name:data.projects.find(p => p.id === i.project_id)?.name }));
  return validateInvoice({ id:invoiceId, period_start:start, period_end:end, created_at:now, paid_at:null, items });
}
export const invoiceTotal = invoice => invoice.items.reduce((sum, i) => sum + workBill(i).amount, 0);
export function invoiceCSV(invoice) {
  const cell = value => {
    let raw = String(value ?? "");
    if (/^[\s]*[=+@-]/u.test(raw)) raw = "'" + raw;
    return `"${raw.replaceAll('"', '""')}"`;
  };
  const rows = [["Счёт за период", invoice.period_start, invoice.period_end], ["Задача", "Проект", "Дата · МСК", "Время, мин", "Стоимость, ₽", "Примечание"],
    ...invoice.items.map(i => [i.title, i.project_name, localInput(i.started_at).replace("T", " "), workBill(i).minutes, workBill(i).amount, i.note]),
    ["ИТОГО", "", "", invoice.items.reduce((sum,i) => sum + workBill(i).minutes,0), invoiceTotal(invoice), ""]];
  return "\uFEFF" + rows.map(row => row.map(cell).join(";")).join("\r\n");
}
export const money = value => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
export const duration = minutes => minutes >= 60 ? `${Math.floor(minutes / 60)} ч${minutes % 60 ? ` ${minutes % 60} мин` : ""}` : `${minutes} мин`;
export function localInput(value = new Date()) {
  const parts = Object.fromEntries(inputFormat.formatToParts(new Date(value)).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
export function moscowInputToISO(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error("Укажите дату и время по МСК в формате ЧЧ:ММ.");
  const date = new Date(`${value}:00+03:00`);
  if (!Number.isFinite(date.getTime()) || localInput(date) !== value) throw new Error("Проверьте дату и время по МСК.");
  return date.toISOString();
}
export function filterItems(items, { project = "all", month = "", search = "", kind = "work" } = {}) {
  const query = search.trim().toLocaleLowerCase("ru");
  return items.filter(i => i.kind === kind && (project === "all" || i.project_id === project)
    && (!month || kind === "plan" || localInput(i.started_at).startsWith(month))
    && (!query || `${i.title} ${i.note}`.toLocaleLowerCase("ru").includes(query)))
    .sort((a, b) => kind === "plan" ? Number(a.done) - Number(b.done) || b.created_at.localeCompare(a.created_at) : b.started_at.localeCompare(a.started_at));
}
