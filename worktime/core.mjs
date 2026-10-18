export const STORAGE_KEY = "worktime.demo.v1";
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
  return item;
}
export function validateData(value) {
  if (!value || !Array.isArray(value.projects) || !Array.isArray(value.items) || value.projects.length > MAX || value.items.length > MAX) throw new Error("Некорректная копия или слишком много записей (максимум 10 000).");
  const projects = value.projects.map(validateProject);
  const items = value.items.map(validateItem);
  const projectIds = new Set(projects.map(p => p.id));
  if (projectIds.size !== projects.length || new Set(items.map(i => i.id)).size !== items.length) throw new Error("Идентификаторы в копии повторяются.");
  if (items.some(i => !projectIds.has(i.project_id))) throw new Error("В копии отсутствует проект одной из задач.");
  if (items.filter(activeTimer).length > 1) throw new Error("Одновременно можно вести только один таймер. Завершите текущую задачу.");
  return { projects, items };
}
export function parseBackup(raw) {
  const value = JSON.parse(raw);
  if (value.format !== "worktime" || ![1, 2].includes(value.version)) throw new Error("Это не копия Worktime поддерживаемой версии.");
  return validateData(value);
}
export function mergeData(current, incoming) {
  const source = validateData(incoming);
  const projectIds = new Set(current.projects.map(p => p.id));
  const itemIds = new Set(current.items.map(i => i.id));
  return validateData({ projects: [...current.projects, ...source.projects.filter(p => !projectIds.has(p.id))], items: [...current.items, ...source.items.filter(i => !itemIds.has(i.id))] });
}
export const money = value => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
export const duration = minutes => minutes >= 60 ? `${Math.floor(minutes / 60)} ч${minutes % 60 ? ` ${minutes % 60} мин` : ""}` : `${minutes} мин`;
export function localInput(value = new Date()) {
  const date = new Date(value);
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function filterItems(items, { project = "all", month = "", search = "", kind = "work" } = {}) {
  const query = search.trim().toLocaleLowerCase("ru");
  return items.filter(i => i.kind === kind && (project === "all" || i.project_id === project)
    && (!month || kind === "plan" || localInput(i.started_at).startsWith(month))
    && (!query || `${i.title} ${i.note}`.toLocaleLowerCase("ru").includes(query)))
    .sort((a, b) => kind === "plan" ? Number(a.done) - Number(b.done) || b.created_at.localeCompare(a.created_at) : b.started_at.localeCompare(a.started_at));
}
