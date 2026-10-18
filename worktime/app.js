import { config } from "./config.js";
import { interval, money, duration, localInput, filterItems, parseBackup, activeTimer, workBill, timerClock } from "./core.mjs";
import { localRepository, cloudRepository } from "./storage.mjs";

const $ = id => document.getElementById(id);
const demo = new URLSearchParams(location.search).get("demo") === "1";
let data = { projects: [], items: [] }, project = "all", kind = "work";
let repository, client, owner, canEdit = false, ready = false, busy = false;
let editingItem = null, editorKind = "work", editingProject = null, revision = 0;
let editorTimer = false;
let confirmAction = null;
const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });
const clockFormat = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });
const make = (tag, className = "", content = "") => { const e = document.createElement(tag); e.className = className; e.textContent = content; return e; };
function action(label, text, handler, className = "icon-button") {
  const button = make("button", className, text);
  button.type = "button"; button.title = label; button.setAttribute("aria-label", label);
  button.addEventListener("click", handler); button.disabled = busy;
  return button;
}
function notice(message, error = false) {
  $("notice").textContent = message; $("notice").hidden = !message;
  $("notice").classList.toggle("notice--error", error);
}
function errorText(error) {
  if (["42P01", "42703", "PGRST204", "PGRST205", "PGRST202"].includes(error.code)) return "Хранилище нужно обновить. Выполните файл worktime/supabase.sql в SQL Editor вашего Supabase и нажмите «Обновить». Для знакомства с интерфейсом откройте ?demo=1.";
  if (error.code === "23503") return "В проекте остались задачи либо проект уже удалён. Обновите список.";
  if (error.code === "23505") return /worktime_one_timer/.test(error.message || "") ? "Уже есть незавершённый таймер. Обновите список и завершите текущую задачу." : "Запись уже существует. Обновите список.";
  if (/Timer changed/.test(error.message || "")) return "Таймер изменился на другом устройстве. Нажмите «Обновить», прежде чем продолжить.";
  if (error.code === "42501") return "Изменять данные может только владелец. Войдите своим аккаунтом.";
  if (/fetch|network|load failed/i.test(error.message || "")) return "Не удалось связаться с хранилищем. Проверьте интернет и нажмите «Обновить».";
  return error.message || "Не удалось выполнить действие.";
}
function setBusy(value) {
  busy = value;
  document.querySelectorAll("button").forEach(button => { button.disabled = value; });
  if (!value) {
    $("refresh").disabled = !repository && !client;
    $("export").disabled = !ready;
    $("login").disabled = !client || !owner;
    $("start-timer").disabled = !ready || data.items.some(activeTimer);
  }
}
async function perform(task, errorId) {
  if (busy) return;
  setBusy(true);
  try { await task(); }
  catch (error) {
    if (errorId) { $(errorId).textContent = errorText(error); $(errorId).hidden = false; }
    else notice(errorText(error), true);
  } finally { setBusy(false); }
}
function render() {
  const editable = ready && canEdit;
  for (const id of ["add-project", "manage-projects", "add-item", "start-timer", "import", "actions-heading"]) $(id).hidden = !editable;
  $("login").hidden = demo || canEdit;
  $("logout").hidden = demo || !canEdit;
  $("access-label").textContent = demo ? "Локальное демо · без синхронизации" : canEdit ? "Вы вошли как владелец" : "Просмотр · изменения только владельцу";
  $("demo-banner").hidden = !demo;
  $("page-title").textContent = project === "all" ? "Обзор работы." : (data.projects.find(p => p.id === project)?.name || "Обзор работы.");
  const projects = [...data.projects].sort((a,b) => a.name.localeCompare(b.name, "ru"));
  const links = [{ id: "all", name: "Все проекты" }, ...projects].map((p, index) => {
    const button = action(p.name, "", () => { project = p.id; render(); }, "projects__button");
    button.classList.toggle("projects__button--active", p.id === project);
    button.setAttribute("aria-current", p.id === project ? "true" : "false");
    button.append(make("span", "projects__symbol", index === 0 ? "▦" : p.name.slice(0,1).toUpperCase()), make("span", "projects__name", p.name), make("span", "projects__count", String(data.items.filter(i => p.id === "all" || i.project_id === p.id).length)));
    return button;
  });
  $("projects").replaceChildren(...links);
  const month = $("month").value;
  const work = filterItems(data.items, { project, month });
  const plans = filterItems(data.items, { project, kind: "plan" });
  const sum = work.filter(i => !activeTimer(i)).reduce((acc,i) => { const bill = workBill(i); acc.amount += bill.amount; acc.minutes += bill.minutes; acc.free += bill.freeMinutes; return acc; }, { amount:0, minutes:0, free:0 });
  $("total").textContent = ready ? money(sum.amount) : "—";
  $("time-total").textContent = ready ? duration(sum.minutes) : "—";
  $("time-note").textContent = `${duration(sum.free)} не вошло в полные десятки`;
  $("plan-total").textContent = ready ? String(plans.filter(i => !i.done).length).padStart(2,"0") : "—";
  $("count-work").textContent = String(work.length);
  $("count-plan").textContent = String(plans.filter(i => !i.done).length);
  for (const tab of ["work", "plan"]) { $("tab-" + tab).classList.toggle("tabs__button--active", tab === kind); $("tab-" + tab).setAttribute("aria-pressed", String(tab === kind)); }
  $("period-label").hidden = kind === "plan"; $("plan-hint").hidden = kind === "work";
  $("add-item").textContent = kind === "work" ? "＋ Записать работу" : "＋ Добавить задачу";
  $("table-caption").textContent = kind === "work" ? "Журнал работы" : "Запланированные задачи";
  $("date-heading").textContent = kind === "work" ? "Когда" : "Создана";
  $("duration-heading").textContent = kind === "work" ? "Время" : "Статус";
  $("amount-heading").hidden = kind === "plan";
  $("billing-note").textContent = kind === "work" ? "Каждые полные 10 минут = 200 ₽" : "Запишите время, когда задача будет сделана";
  const visible = filterItems(data.items, { project, month, kind, search: $("search").value });
  const rows = visible.map(item => {
    const row = make("tr");
    const task = make("td");
    task.append(make("div", `journal__title${item.done ? " journal__done" : ""}`, item.title));
    if (item.note) task.append(make("span", "journal__note", item.note));
    const meta = make("div", "journal__meta"); meta.append(make("span", "journal__project", data.projects.find(p => p.id === item.project_id)?.name || "Проект")); task.append(meta); row.append(task);
    const date = make("td", "journal__date");
    if (item.kind === "work") {
      const start = new Date(item.started_at), end = item.ended_at ? new Date(item.ended_at) : null;
      const ending = end ? `${localInput(start).slice(0,10) === localInput(end).slice(0,10) ? "" : dateFormat.format(end) + " "}${clockFormat.format(end)}` : item.timer_state === "paused" ? "пауза" : "в работе";
      date.append(make("span", "", dateFormat.format(start)), make("span", "journal__secondary", `${clockFormat.format(start)} — ${ending}`));
      date.title = `${start.toLocaleString("ru-RU")} — ${end ? end.toLocaleString("ru-RU") : ending}`;
      const bill = workBill(item);
      const time = make("td", "", duration(bill.minutes));
      if (bill.freeMinutes) time.append(make("span", "journal__secondary", `${bill.freeMinutes} мин без оплаты`));
      if (item.timer_state === "finished") time.append(make("span", "journal__secondary", "Без учёта пауз"));
      const amount = make("td", bill.amount ? "journal__amount" : "journal__free", bill.amount ? money(bill.amount) : activeTimer(item) ? money(0) : "Бесплатно");
      if (activeTimer(item)) amount.append(make("span", "journal__secondary", "Предварительно"));
      row.append(date, time, amount);
    } else { date.textContent = dateFormat.format(new Date(item.created_at)); row.append(date, make("td", "journal__status", item.done ? "✓ Выполнена" : "○ Предстоит")); }
    if (editable) {
      const cell = make("td"), group = make("div", "journal__actions");
      if (item.kind === "plan") {
        group.append(action(item.done ? "Вернуть в планы" : "Отметить выполненной", item.done ? "↶" : "✓", () => mutate(() => repository.saveItem({ ...item, done: !item.done }, true), "Статус задачи сохранён.")));
        group.append(action("Записать время по задаче", "◷", () => openEditor(item, true)));
        group.append(action("Запустить таймер по задаче", "▶", () => openEditor(item, true, true)));
      }
      if (!activeTimer(item)) group.append(action("Изменить задачу", "✎", () => openEditor(item)), action("Удалить задачу", "×", () => confirmDelete(`Удалить «${item.title}»? Восстановить её можно будет только из копии.`, () => mutate(() => repository.removeItem(item.id), "Задача удалена."))));
      cell.append(group); row.append(cell);
    }
    return row;
  });
  $("rows").replaceChildren(...rows);
  $("empty").hidden = visible.length > 0;
  $("result-count").textContent = `${visible.length} ${kind === "work" ? "рабочих записей" : "задач"}`;
  const filtered = $("search").value.trim() || (kind === "work" && month);
  $("empty-title").textContent = !ready ? "Хранилище не подключено" : filtered ? "Здесь пока нет записей" : kind === "plan" ? "Освободите голову для работы" : "У вашей работы будет история";
  $("empty-description").textContent = !ready ? "Проверьте сообщение выше и нажмите «Обновить»." : filtered ? "Измените поиск или выберите другой период." : editable ? kind === "plan" ? "Запишите будущие задачи, чтобы всё важное было под рукой." : "Добавьте проект и запишите первый рабочий интервал. Стоимость посчитается сама." : "Владелец ещё не добавил записи. Для изменений нужен вход.";
  $("add-first").hidden = !editable || Boolean(filtered) || Boolean(visible.length);
  $("add-first").textContent = data.projects.length ? kind === "plan" ? "＋ Добавить задачу" : "＋ Первая запись" : "＋ Создать первый проект";
  renderTimer();
  if (!busy) setBusy(false);
}
function renderTimer() {
  const task = data.items.find(activeTimer);
  $("timer").hidden = !task;
  $("timer-controls").hidden = !canEdit;
  if (!task) return;
  $("timer").classList.toggle("timer--paused", task.timer_state === "paused");
  $("timer-status").textContent = task.timer_state === "paused" ? "НА ПАУЗЕ · ВРЕМЯ НЕ ИДЁТ" : "В РАБОТЕ";
  $("timer-title").textContent = task.title;
  $("timer-project").textContent = `${data.projects.find(p => p.id === task.project_id)?.name || "Проект"} · начало ${new Date(task.started_at).toLocaleString("ru-RU", {day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}`;
  $("timer-toggle").textContent = task.timer_state === "paused" ? "▶ Продолжить" : "Ⅱ Пауза";
  tickTimer();
}
function tickTimer() {
  const task = data.items.find(activeTimer);
  if (!task) return;
  $("timer-clock").textContent = timerClock(task);
  $("timer-cost").textContent = `${money(workBill(task).amount)} · предварительно`;
}
async function controlTimer(operation) {
  const task = data.items.find(activeTimer);
  if (!task) return;
  await mutate(() => repository.timerAction(task.id, operation, task.timer_version), operation === "finish" ? "Задача завершена. В журнале сохранено время без перерывов." : operation === "pause" ? "Таймер на паузе. Перерыв не оплачивается." : "Таймер продолжен.");
}
async function refresh() {
  if (!repository) return;
  const request = ++revision;
  const next = await repository.list();
  if (request !== revision) return;
  data = next; ready = true;
  if (project !== "all" && !data.projects.some(p => p.id === project)) project = "all";
  render();
}
function requireEdit() { if (!canEdit || !ready) throw new Error("Войдите владельцем и дождитесь загрузки данных."); }
async function mutate(operation, message) {
  return perform(async () => {
    requireEdit(); await operation();
    try { await refresh(); notice(message); }
    catch (error) { notice(`Изменение сохранено, но обновить список не удалось. ${errorText(error)}`, true); }
  });
}
function openEditor(item = null, convert = false, timer = false) {
  if (!canEdit || !ready || busy) return;
  if (timer && data.items.some(activeTimer)) { notice("Сначала завершите текущий таймер. Одновременно можно вести одну задачу.", true); return; }
  if (!data.projects.length) return openProject();
  editingItem = item;
  editorTimer = timer;
  editorKind = timer || convert ? "work" : item?.kind || kind;
  $("item-form").reset(); $("item-error").hidden = true;
  $("editor-title").textContent = editorKind === "plan" ? item ? "Изменить задачу" : "Новая задача" : convert ? "Записать время по задаче" : item ? "Изменить запись" : "Записать работу";
  if (timer) $("editor-title").textContent = "Запустить таймер";
  $("item-project").replaceChildren(...data.projects.map(p => { const option = make("option", "", p.name); option.value = p.id; return option; }));
  $("item-project").value = item?.project_id || (project !== "all" ? project : data.projects[0].id);
  $("item-title").value = item?.title || ""; $("item-note").value = item?.note || "";
  $("time-fields").hidden = editorKind !== "work"; $("calculation").hidden = timer || editorKind !== "work";
  $("end-label").hidden = timer;
  $("timer-editor-note").hidden = !timer && item?.timer_state !== "finished";
  $("timer-editor-note").textContent = timer ? "Укажите, когда начали работу, и нажмите «Пуск». Перерывы исключаются кнопкой «Пауза»." : "Активное время рассчитано таймером без пауз. Здесь можно изменить название, проект и примечание.";
  $("item-submit").textContent = timer ? "▶ Пуск" : "Сохранить";
  $("start").required = editorKind === "work";
  $("end").required = editorKind === "work" && !timer;
  $("start").disabled = $("end").disabled = item?.timer_state === "finished";
  $("start").value = localInput(item?.started_at || (timer ? Date.now() : Date.now() - 30 * 60000));
  $("end").value = localInput(item?.ended_at || new Date());
  updateCalculation(); $("editor").showModal(); $("item-title").focus();
}
function updateCalculation() {
  try {
    const bill = editingItem?.timer_state === "finished" && !editorTimer ? workBill(editingItem) : interval(new Date($("start").value).toISOString(), new Date($("end").value).toISOString());
    $("calc-time").textContent = duration(bill.minutes); $("calc-amount").textContent = money(bill.amount);
    $("calc-note").textContent = `${bill.blocks} × 200 ₽${bill.freeMinutes ? ` · ${bill.freeMinutes} мин без оплаты` : ""}. ${editingItem?.timer_state === "finished" ? "Общее активное время без пауз." : "Каждый интервал рассчитывается отдельно."}`;
  } catch { $("calc-time").textContent = "Проверьте начало и окончание"; $("calc-amount").textContent = "—"; $("calc-note").textContent = "Окончание должно быть позже начала. После полуночи выберите следующий день."; }
}
function projectList() {
  $("project-list").replaceChildren(...data.projects.map(p => {
    const row = make("div", "project-list__row"); row.append(make("span", "", p.name), action(`Переименовать ${p.name}`, "Изменить", () => { editingProject = p; $("project-title").textContent = "Изменить проект"; $("project-name").value = p.name; $("project-name").focus(); }, "text-button"), action(`Удалить ${p.name}`, "×", () => {
      if (data.items.some(i => i.project_id === p.id)) { $("project-error").textContent = "Сначала удалите или перенесите все задачи проекта."; $("project-error").hidden = false; return; }
      confirmDelete(`Удалить пустой проект «${p.name}»?`, async () => { await mutate(() => repository.removeProject(p.id), "Проект удалён."); projectList(); });
    })); return row;
  }));
}
function openProject() {
  if (!canEdit || !ready || busy) return;
  editingProject = null; $("project-form").reset(); $("project-error").hidden = true; $("project-title").textContent = "Новый проект";
  projectList(); $("project-dialog").showModal(); $("project-name").focus();
}
function confirmDelete(message, handler) { confirmAction = handler; $("confirm-text").textContent = message; $("confirm-dialog").returnValue = "cancel"; $("confirm-dialog").showModal(); }
$("confirm-dialog").addEventListener("close", () => { const handler = confirmAction; confirmAction = null; if ($("confirm-dialog").returnValue === "delete") handler?.(); });
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => { if (!busy) $(button.dataset.close).close(); }));
document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); }));
$("add-project").addEventListener("click", openProject); $("manage-projects").addEventListener("click", openProject);
$("add-item").addEventListener("click", () => openEditor()); $("add-first").addEventListener("click", () => openEditor());
$("start-timer").addEventListener("click", () => openEditor(null, false, true));
$("timer-toggle").addEventListener("click", () => controlTimer(data.items.find(activeTimer)?.timer_state === "paused" ? "resume" : "pause"));
$("timer-finish").addEventListener("click", () => controlTimer("finish"));
$("start").addEventListener("input", updateCalculation); $("end").addEventListener("input", updateCalculation);
$("search").addEventListener("input", render); $("month").addEventListener("change", render);
$("all-time").addEventListener("click", () => { $("month").value = ""; render(); });
for (const tab of ["work", "plan"]) $("tab-" + tab).addEventListener("click", () => { kind = tab; render(); });
$("refresh").addEventListener("click", () => perform(async () => { if (!repository) await setupCloud(); await refresh(); notice("Данные обновлены."); }));
$("item-form").addEventListener("submit", event => {
  event.preventDefault(); $("item-error").hidden = true;
  perform(async () => {
    requireEdit();
    const item = { ...editingItem, id: editingItem?.id || crypto.randomUUID(), project_id: $("item-project").value, title: $("item-title").value.trim(), note: $("item-note").value.trim(), kind: editorKind, done: editorKind === "plan" ? editingItem?.done || false : false, started_at: editorKind === "work" ? new Date($("start").value).toISOString() : null, ended_at: editorKind === "work" && !editorTimer ? new Date($("end").value).toISOString() : null, created_at: editingItem?.created_at || new Date().toISOString() };
    if (editingItem?.timer_state === "finished" && !editorTimer) { item.started_at = editingItem.started_at; item.ended_at = editingItem.ended_at; }
    if (editorTimer) {
      if (Date.parse(item.started_at) > Date.now()) throw new Error("Начало таймера не может быть в будущем.");
      if (data.items.some(activeTimer)) throw new Error("Сначала завершите текущий таймер.");
      Object.assign(item, { timer_state:"running", elapsed_ms:0, running_since:item.started_at, timer_version:0 });
    }
    await repository.saveItem(item, Boolean(editingItem)); $("editor").close();
    if (editorTimer || (editingItem?.kind === "plan" && editorKind === "work")) kind = "work";
    try { await refresh(); notice(editorTimer ? "Таймер запущен. Перерывы отмечайте кнопкой «Пауза»." : "Задача сохранена."); }
    catch (error) { notice(`Задача сохранена. Не удалось обновить список: ${errorText(error)}`, true); }
  }, "item-error");
});
$("project-form").addEventListener("submit", event => {
  event.preventDefault(); $("project-error").hidden = true;
  perform(async () => {
    requireEdit(); const next = { id: editingProject?.id || crypto.randomUUID(), name: $("project-name").value.trim(), created_at: editingProject?.created_at || new Date().toISOString() };
    await repository.saveProject(next, Boolean(editingProject)); $("project-dialog").close(); project = next.id;
    try { await refresh(); notice("Проект сохранён. Теперь можно добавить задачи."); }
    catch (error) { notice(`Проект сохранён. Не удалось обновить список: ${errorText(error)}`, true); }
  }, "project-error");
});
$("login").addEventListener("click", () => { $("login-error").hidden = true; $("login-dialog").showModal(); });
$("login-dialog").addEventListener("close", () => { $("password").value = ""; });
$("login-form").addEventListener("submit", event => {
  event.preventDefault(); $("login-error").hidden = true;
  perform(async () => {
    const { data: result, error } = await client.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
    $("password").value = "";
    if (error) throw new Error(error.code === "invalid_credentials" ? "Неверная почта или пароль." : errorText(error));
    if (result.user.id !== owner) { await client.auth.signOut(); throw new Error("У этого аккаунта нет доступа к изменениям."); }
    canEdit = true; $("login-dialog").close(); render(); notice("Вы вошли. Изменения доступны.");
  }, "login-error");
});
$("logout").addEventListener("click", () => perform(async () => {
  const { error } = await client.auth.signOut(); if (error) throw error;
  canEdit = false; revision++; document.querySelectorAll("dialog[open]").forEach(d => d.close()); render(); notice("Вы вышли. Включён режим просмотра.");
}));
$("export").addEventListener("click", () => {
  if (!ready) return;
  const blob = new Blob([JSON.stringify({ format:"worktime", version:2, exported_at:new Date().toISOString(), ...data }, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob), link = document.createElement("a"); link.href = url; link.download = `worktime-backup-${localInput().slice(0,10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$("import").addEventListener("click", () => $("import-file").click());
$("import-file").addEventListener("change", event => {
  const file = event.target.files[0]; event.target.value = ""; if (!file) return;
  perform(async () => { requireEdit(); if (file.size > 10 * 1024 * 1024) throw new Error("Размер копии не должен превышать 10 МБ."); const backup = parseBackup(await file.text()); await repository.import(backup); await refresh(); notice("Копия загружена. Существующие записи сохранены."); });
});
async function setupCloud() {
  if (!config.supabaseUrl || !config.supabaseKey) throw new Error("Заполните config.js для облачного хранения. Для локального знакомства откройте ?demo=1.");
  if (!client) await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js";
    const timeout = setTimeout(() => reject(new Error("Не удалось загрузить модуль входа. Проверьте интернет и перезагрузите страницу.")), 15000);
    script.onload = () => { clearTimeout(timeout); resolve(); }; script.onerror = () => { clearTimeout(timeout); reject(new Error("Не удалось загрузить модуль входа. Перезагрузите страницу.")); }; document.head.append(script);
  });
  client ||= window.supabase.createClient(config.supabaseUrl, config.supabaseKey, { auth: { storageKey:"worktime.auth.v1" } });
  const { data: settings, error } = await client.from("worktime_settings").select("owner_id").single();
  if (error) throw error;
  owner = settings.owner_id; repository = cloudRepository(client, owner);
  const { data: session, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  canEdit = session.session?.user.id === owner;
  client.auth.onAuthStateChange((_event, next) => {
    canEdit = next?.user.id === owner;
    if (!canEdit) document.querySelectorAll("dialog[open]").forEach(d => d.close());
    render();
  });
}
async function boot() {
  $("today").textContent = new Intl.DateTimeFormat("ru-RU", { day:"numeric", month:"long", year:"numeric" }).format(new Date());
  $("today").dateTime = localInput().slice(0,10);
  setBusy(true);
  try { if (demo) { repository = localRepository(localStorage); canEdit = true; } else await setupCloud(); await refresh(); }
  catch (error) { render(); notice(errorText(error), true); }
  finally { setBusy(false); }
}
async function autoRefresh() {
  if (!repository || busy || document.hidden || document.querySelector("dialog[open]")) return;
  await perform(async () => { await refresh(); });
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) autoRefresh(); });
setInterval(autoRefresh, 30000);
setInterval(tickTimer, 1000);
window.addEventListener("storage", event => { if (demo && event.key === "worktime.demo.v1") autoRefresh(); });
boot();
