import { config } from "./config.js";
import { STORAGE_KEY, parseAmount, formatAmount, amountForInput, countLabel, validateRecord, parseBackup, sortRecords, existingNames, summarizePeople, personKey } from "./core.mjs";
import { localRepository, cloudRepository } from "./storage.mjs";

const $ = id => document.getElementById(id);
const cloud = Boolean(config.supabaseUrl || config.supabaseKey);
let repository;
let client;
let records = [];
let direction = "me";
let editingId = null;
let busy = false;
let ready = false;
let userId;
let ownerId;
let canEdit = !cloud;
let generation = 0;
let requestId = 0;

function notice(message, error = false) {
  $("notice").textContent = message;
  $("notice").classList.toggle("notice--error", error);
  $("notice").hidden = !message;
}

function readableError(error) {
  if (!navigator.onLine) return "Нет соединения с интернетом. Подключитесь и попробуйте ещё раз.";
  if (error?.message === "Invalid login credentials") return "Неверная почта или пароль.";
  if (error?.message === "Email not confirmed") return "Подтвердите почту перед входом.";
  if (error?.code === "PGRST205" || error?.code === "42P01") return "База ещё не настроена. Выполните supabase.sql по инструкции в README.";
  if (error?.code === "42703" || error?.code === "PGRST204") return "Обновите базу: выполните новый supabase.sql, чтобы добавить примечания и права доступа.";
  if (error instanceof SyntaxError) return "Не удалось прочитать сохранённые записи. Они не перезаписаны. Проверьте данные браузера.";
  if (/fetch|network/i.test(error?.message || "")) return "Не удалось связаться с хранилищем. Проверьте интернет и попробуйте снова.";
  return error?.message || "Не удалось выполнить действие. Попробуйте ещё раз.";
}

function setBusy(value) {
  busy = value;
  document.querySelectorAll("button").forEach(button => { button.disabled = value; });
  document.querySelectorAll("button[data-action]").forEach(button => { button.disabled = value || !ready; });
  ["add-debt", "add-first", "import", "migrate-local", "save-debt"].forEach(id => { $(id).disabled = value || !ready || !canEdit; });
  $("export").disabled = value || !ready;
  $("ledger").setAttribute("aria-busy", String(value));
}

function createAction(label, action, id, path) {
  const button = document.createElement("button");
  button.className = "button button--icon";
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.dataset.action = action;
  button.dataset.id = id;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.6");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
  shape.setAttribute("d", path);
  svg.append(shape);
  button.append(svg);
  return button;
}

function render() {
  const visible = sortRecords(records.filter(record => record.direction === direction), $("sort-order").value);
  ["add-debt", "add-first", "import"].forEach(id => { $(id).hidden = !canEdit; });
  $("migrate-local").hidden = !cloud || !canEdit;
  $("actions-heading").hidden = !canEdit;
  document.querySelector(".debt-table").classList.toggle("debt-table--readonly", !canEdit);
  $("empty-description").textContent = !ready ? "Нажмите «Обновить», чтобы повторить загрузку." : canEdit ? "Добавьте первый долг — и он появится здесь." : "В этой вкладке пока нет записей.";
  const names = existingNames(records).map(name => {
    const option = document.createElement("option");
    option.value = name;
    return option;
  });
  $("person-names").replaceChildren(...names);
  const peopleFragment = document.createDocumentFragment();
  for (const person of summarizePeople(records)) {
    const row = document.createElement("tr");
    const balance = person.me - person.i;
    for (const value of [person.person, formatAmount(person.me), formatAmount(person.i)]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }
    const cell = document.createElement("td");
    cell.className = balance < 0n ? "people__balance people__balance--outgoing" : "people__balance";
    cell.textContent = formatAmount(balance < 0n ? -balance : balance);
    const label = document.createElement("span");
    label.className = "people__balance-label";
    label.textContent = balance > 0n ? "мне должны" : balance < 0n ? "я должен" : "расчёт в ноль";
    cell.append(label);
    row.append(cell);
    peopleFragment.append(row);
  }
  $("people-rows").replaceChildren(peopleFragment);
  $("people").hidden = !records.length;
  const total = visible.reduce((sum, record) => sum + BigInt(record.amount_cents), 0n);
  $("total").textContent = formatAmount(total);
  $("total").classList.toggle("summary__amount--outgoing", direction === "i");
  $("summary-label").textContent = direction === "me" ? "Мне должны" : "Я должен";
  $("summary-note").textContent = visible.length ? `${countLabel(visible.length)} · ничего не забыто` : "Все долги в одном месте";
  $("record-count").textContent = countLabel(visible.length);
  $("table-caption").textContent = direction === "me" ? "Долги мне" : "Мои долги";
  $("empty-title").textContent = !ready ? "Список не загружен" : direction === "me" ? "Пока никто не должен" : "Пока вы никому не должны";
  $("empty").hidden = Boolean(visible.length);
  ["me", "i"].forEach(value => {
    const active = value === direction;
    $("count-" + value).textContent = records.filter(record => record.direction === value).length;
    const tab = $("tab-" + value);
    tab.classList.toggle("tabs__tab--active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  $("debt-panel").setAttribute("aria-labelledby", "tab-" + direction);
  const fragment = document.createDocumentFragment();
  for (const record of visible) {
    const row = document.createElement("tr");
    for (const [value, className] of [[record.title, ""], [formatAmount(record.amount_cents), "debt-table__amount"], [record.person, "debt-table__person"]]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      cell.className = className;
      row.append(cell);
    }
    if (record.note) {
      const note = document.createElement("span");
      note.className = "debt-table__note";
      note.textContent = record.note;
      row.firstElementChild.append(note);
    }
    if (canEdit) {
      const actions = document.createElement("td");
      const group = document.createElement("div");
      group.className = "debt-table__actions";
      group.append(
        createAction(`Изменить: ${record.title}`, "edit", record.id, "m16 3 5 5-12 12-6 1 1-6Z M14 5l5 5"),
        createAction(`Удалить: ${record.title}`, "delete", record.id, "M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7"),
      );
      actions.append(group);
      row.append(actions);
    }
    fragment.append(row);
  }
  $("debt-rows").replaceChildren(fragment);
  setBusy(busy);
}

async function refreshRecords() {
  if (!repository) return;
  const currentRequest = ++requestId;
  const currentGeneration = generation;
  try {
    const data = await repository.list();
    if (currentRequest !== requestId || currentGeneration !== generation) return;
    records = data;
    ready = true;
    render();
  } catch (error) {
    if (currentRequest !== requestId || currentGeneration !== generation) return;
    ready = false;
    render();
    throw error;
  }
}

async function perform(action) {
  if (busy) return;
  setBusy(true);
  try { await action(); }
  catch (error) { notice(readableError(error), true); }
  finally { setBusy(false); }
}

function openEditor(record) {
  if (busy || !ready || !canEdit) return;
  editingId = record?.id || null;
  $("debt-form").reset();
  $("editor-error").hidden = true;
  $("editor-title").textContent = record ? "Изменить долг" : "Новый долг";
  $("save-debt").textContent = record ? "Сохранить" : "Добавить";
  $("editor-direction").textContent = direction === "me" ? "Мне должны" : "Я должен";
  if (record) {
    $("debt-title").value = record.title;
    $("debt-amount").value = amountForInput(record.amount_cents);
    $("debt-person").value = record.person;
    $("debt-note").value = record.note || "";
  }
  $("editor").showModal();
  $("debt-title").focus();
}

function confirmAction(title, description, label) {
  $("confirm-title").textContent = title;
  $("confirm-description").textContent = description;
  $("confirm-action").textContent = label;
  $("confirmation").returnValue = "cancel";
  $("confirmation").showModal();
  return new Promise(resolve => $("confirmation").addEventListener("close", () => resolve($("confirmation").returnValue === "confirm"), { once: true }));
}

$("add-debt").addEventListener("click", () => openEditor());
$("add-first").addEventListener("click", () => openEditor());
$("sort-order").addEventListener("change", render);
$("sign-in").addEventListener("click", () => {
  $("login").hidden = !$("login").hidden;
  $("sign-in").setAttribute("aria-expanded", String(!$("login").hidden));
  if (!$("login").hidden) $("email").focus();
});
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => $(button.dataset.close).close()));
[$("editor"), $("confirmation")].forEach(dialog => dialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); }));
document.querySelectorAll(".tabs__tab").forEach(tab => {
  tab.addEventListener("click", () => { direction = tab.dataset.direction; render(); });
  tab.addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      direction = event.key === "Home" ? "me" : event.key === "End" ? "i" : direction === "me" ? "i" : "me";
      render();
      $("tab-" + direction).focus();
    }
  });
});

$("debt-form").addEventListener("submit", async event => {
  event.preventDefault();
  if (busy || !ready || !canEdit) return;
  $("editor-error").hidden = true;
  let record;
  try {
    if (!editingId && records.length >= 10_000) throw new Error("В заметке может быть не больше 10 000 записей.");
    const previous = records.find(item => item.id === editingId);
    const name = $("debt-person").value.trim().replace(/\s+/g, " ");
    const person = existingNames(records).find(value => personKey(value) === personKey(name)) || name;
    record = validateRecord({ id: editingId || crypto.randomUUID(), direction, title: $("debt-title").value.trim(), amount_cents: parseAmount($("debt-amount").value), person, note: $("debt-note").value, created_at: previous?.created_at || new Date().toISOString() });
  } catch (error) {
    $("editor-error").textContent = !$("debt-title").value.trim() || !$("debt-person").value.trim() ? "Заполните название и имя человека." : readableError(error);
    $("editor-error").hidden = false;
    return;
  }
  setBusy(true);
  try {
    await repository.save(record, Boolean(editingId));
    $("editor").close();
    notice("Запись сохранена.");
    try { await refreshRecords(); } catch (error) { notice("Запись сохранена, но список не обновился. " + readableError(error), true); }
  } catch (error) {
    $("editor-error").textContent = readableError(error);
    $("editor-error").hidden = false;
  } finally { setBusy(false); }
});

$("debt-rows").addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button || busy || !ready || !canEdit) return;
  const record = records.find(item => item.id === button.dataset.id);
  if (!record) return;
  if (button.dataset.action === "edit") return openEditor(record);
  const currentGeneration = generation;
  if (await confirmAction("Удалить долг?", `«${record.title}» · ${formatAmount(record.amount_cents)} · ${record.person}. Запись будет удалена.`, "Удалить")) {
    if (currentGeneration !== generation || !canEdit || !ready) return;
    await perform(async () => {
      await repository.remove(record.id);
      notice("Долг удалён.");
      await refreshRecords();
    });
  }
});

$("refresh").addEventListener("click", () => perform(async () => { await refreshRecords(); notice("Список обновлён."); }));
$("export").addEventListener("click", () => perform(async () => {
  await refreshRecords();
  const blob = new Blob([JSON.stringify({ version: 1, exported_at: new Date().toISOString(), records }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `debt-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}));
$("import").addEventListener("click", () => { if (canEdit && ready && !busy) $("import-file").click(); });
$("import-file").addEventListener("change", async event => {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file || busy || !ready || !canEdit) return;
  const currentGeneration = generation;
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error("Копия слишком большая. Максимум — 10 МБ.");
    const imported = parseBackup(await file.text());
    if (!await confirmAction("Загрузить копию?", `${countLabel(imported.length)} в копии. Будут добавлены только записи с новыми идентификаторами. Существующие записи сохранятся.`, "Загрузить")) return;
    if (currentGeneration !== generation || !canEdit || !ready) return;
    await perform(async () => {
      const added = await repository.import(imported);
      await refreshRecords();
      notice(`Добавлено записей: ${added}.`);
    });
  } catch (error) { notice(readableError(error), true); }
});

$("migrate-local").addEventListener("click", async () => {
  if (!cloud || !canEdit || !ready || busy) return;
  const currentGeneration = generation;
  try {
    const local = await localRepository(window.localStorage).list();
    if (!local.length) return notice("В этом браузере нет локальных долгов. На старом устройстве скачайте копию и загрузите её здесь.");
    if (!await confirmAction("Перенести долги в облако?", `${countLabel(local.length)} из этого браузера будут добавлены в общий список и станут видны всем по ссылке, включая примечания. Существующие записи и локальная копия сохранятся.`, "Перенести")) return;
    if (currentGeneration !== generation || !canEdit || !ready) return;
    await perform(async () => {
      const added = await repository.import(local);
      await refreshRecords();
      notice(`Перенесено записей: ${added}. Локальная копия сохранена.`);
    });
  } catch (error) { notice(readableError(error), true); }
});

$("login-form").addEventListener("submit", async event => {
  event.preventDefault();
  if (busy || !client) return;
  $("login-error").hidden = true;
  setBusy(true);
  try {
    const { error } = await client.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
    if (error) throw error;
    $("password").value = "";
  } catch (error) {
    $("login-error").textContent = readableError(error);
    $("login-error").hidden = false;
  } finally { setBusy(false); }
});

$("sign-out").addEventListener("click", () => perform(async () => {
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) throw error;
  await useSession(null);
}));

async function useSession(session) {
  const nextUserId = session?.user?.id || null;
  if (userId === nextUserId) return;
  userId = nextUserId;
  canEdit = userId === ownerId;
  generation++;
  records = [];
  ready = false;
  repository = cloudRepository(client, ownerId);
  $("editor").close();
  $("confirmation").close("cancel");
  $("login").hidden = true;
  $("sign-in").hidden = Boolean(userId);
  $("sign-in").setAttribute("aria-expanded", "false");
  $("ledger").hidden = false;
  $("sign-out").hidden = !userId;
  $("storage-status").textContent = canEdit ? "● Вы владелец" : "● Только просмотр";
  notice("");
  render();
  if (userId && !canEdit) notice("Этот аккаунт может только просматривать список. Для изменений войдите в аккаунт владельца.");
  const ownsBusy = !busy;
  if (ownsBusy) setBusy(true);
  try { await refreshRecords(); }
  catch (error) { notice(readableError(error), true); }
  finally { if (ownsBusy) setBusy(false); }
}

async function initialize() {
  if (!cloud) {
    repository = localRepository(window.localStorage);
    $("storage-status").textContent = "● В этом браузере";
    $("ledger").hidden = false;
    $("refresh").hidden = false;
    $("storage-hint").textContent = "Только на этом устройстве. Скачивайте копию, чтобы сохранить записи.";
    await perform(refreshRecords);
    return;
  }
  if (!config.supabaseUrl || !config.supabaseKey) throw new Error("В config.js нужно заполнить и адрес Supabase, и публичный ключ.");
  const url = new URL(config.supabaseUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || !["", "/"].includes(url.pathname)) throw new Error("Укажите HTTPS-адрес проекта Supabase без пути и параметров.");
  if (config.supabaseKey.startsWith("sb_secret_")) throw new Error("В config.js нужен публичный publishable key. Secret key нельзя размещать на сайте.");
  if (!config.supabaseKey.startsWith("sb_publishable_")) {
    try {
      const part = config.supabaseKey.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      if (JSON.parse(atob(part)).role !== "anon") throw new Error();
    } catch { throw new Error("Укажите publishable key или старый anon key. Секретные ключи не поддерживаются."); }
  }
  $("storage-hint").textContent = "Просмотр доступен всем по ссылке. Изменения — только владельцу. Список обновляется каждые 30 секунд.";
  $("refresh").hidden = false;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js";
    script.referrerPolicy = "no-referrer";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Не удалось загрузить подключение к облаку. Проверьте интернет и перезагрузите страницу."));
    document.head.append(script);
  });
  client = window.supabase.createClient(url.origin, config.supabaseKey);
  const settings = await client.from("debt_settings").select("owner_id").eq("singleton", true).single();
  if (settings.error) throw settings.error;
  if (!settings.data?.owner_id) throw new Error("Не указан владелец списка. Выполните supabase.sql со своим UUID пользователя.");
  ownerId = settings.data.owner_id;
  client.auth.onAuthStateChange((_event, session) => {
    // Обработчик Supabase должен завершиться до новых запросов к клиенту.
    setTimeout(() => useSession(session).catch(error => notice(readableError(error), true)), 0);
  });
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  await useSession(data.session);
}

window.addEventListener("storage", event => {
  if (!cloud && event.key === STORAGE_KEY && !busy) perform(refreshRecords);
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && repository && !busy && !$("editor").open && !$("confirmation").open) perform(refreshRecords);
});
window.addEventListener("online", () => { if (cloud && repository && !busy) perform(refreshRecords); });
setInterval(() => {
  if (cloud && document.visibilityState === "visible" && repository && !busy && !$("editor").open && !$("confirmation").open) perform(refreshRecords);
}, 30_000);
initialize().catch(error => { $("storage-status").textContent = "Ошибка подключения"; notice(readableError(error), true); });
