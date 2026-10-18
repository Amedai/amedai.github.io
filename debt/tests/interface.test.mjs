import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import vm from "node:vm";
import { parseHTML } from "linkedom";
import * as core from "../core.mjs";
import { localRepository } from "../storage.mjs";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const source = (await readFile(new URL("../app.js", import.meta.url), "utf8"))
  .replace(/^import .*\r?\n/gm, "")
  .replace("initialize().catch(", "globalThis.initialization = initialize().catch(");
const owner = "10000000-0000-4000-8000-000000000001";
const item = (overrides = {}) => ({ id: randomUUID(), direction: "me", title: "Ужин", person: "Алексей", note: "Вернуть в пятницу", amount_cents: 150050, created_at: "2026-10-18T00:00:00Z", ...overrides });
const settle = async () => { for (let i = 0; i < 4; i++) await new Promise(resolve => setImmediate(resolve)); };

async function app({ cloud = false, records = [], local = [], session = null } = {}) {
  const { window, document } = parseHTML(html);
  const values = new Map([[core.STORAGE_KEY, JSON.stringify(cloud ? local : records)]]);
  window.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  document.getElementById("sort-order").firstElementChild.selected = true;
  Object.defineProperty(document, "visibilityState", { value: "visible" });
  for (const dialog of document.querySelectorAll("dialog")) {
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = value => {
      if (!dialog.open) return;
      dialog.open = false;
      dialog.returnValue = value || "";
      dialog.dispatchEvent(new window.Event("close"));
    };
  }
  document.getElementById("debt-form").reset = () => {
    for (const input of document.querySelectorAll("#debt-form input, #debt-form textarea")) input.value = "";
  };
  let callback;
  let currentSession = session;
  const data = records.map(record => ({ ...record }));
  const scopes = [];
  const client = {
    from: () => ({ select() { return this; }, eq() { return this; }, async single() { return { data: { owner_id: owner }, error: null }; } }),
    auth: {
      onAuthStateChange(handler) { callback = handler; },
      async getSession() { return { data: { session: currentSession }, error: null }; },
      async signOut() { currentSession = null; callback("SIGNED_OUT", null); return { error: null }; },
    },
  };
  window.supabase = { createClient: () => client };
  const append = document.head.append.bind(document.head);
  document.head.append = element => { append(element); if (element.localName === "script") queueMicrotask(() => element.onload()); };
  const context = vm.createContext({
    ...core, localRepository,
    cloudRepository: (_client, user) => {
      scopes.push(user);
      return {
        async list() { return data.map(record => ({ ...record })); },
        async save(record) {
          const index = data.findIndex(value => value.id === record.id);
          if (index < 0) data.push(record); else data[index] = record;
        },
        async remove(id) { const index = data.findIndex(value => value.id === id); if (index >= 0) data.splice(index, 1); },
        async import(incoming) {
          const added = incoming.filter(record => !data.some(value => value.id === record.id));
          data.push(...added);
          return added.length;
        },
      };
    },
    config: { supabaseUrl: cloud ? "https://example.supabase.co" : "", supabaseKey: cloud ? "sb_publishable_test" : "" },
    window, document, navigator: { onLine: true }, crypto: { randomUUID }, URL, Blob,
    setTimeout, setInterval: () => 1,
  });
  vm.runInContext(source, context, { filename: "app.js" });
  await context.initialization;
  return {
    context, document, window, scopes, data,
    get: id => document.getElementById(id),
    async click(id) { document.getElementById(id).click(); await settle(); },
    async submit(id) { document.getElementById(id).dispatchEvent(new window.Event("submit", { cancelable: true })); await settle(); },
  };
}

test("интерфейс: старые записи отображаются, сортируются, имена и сводка доступны", async () => {
  const old = item({ person: "Яна" });
  delete old.note;
  const ui = await app({ records: [old, item(), item({ person: "алексей ", direction: "i", amount_cents: 50050 })] });
  assert.equal(ui.get("ledger").hidden, false);
  assert.equal(ui.get("people-rows").children.length, 2);
  assert.match(ui.get("people-rows").firstElementChild.textContent, /1\s000\s₽/);
  assert.equal(ui.get("person-names").children.length, 2);
  assert.equal(ui.get("debt-rows").firstElementChild.children[2].textContent, "Алексей");
  const select = ui.get("sort-order");
  select.firstElementChild.selected = false;
  select.children[1].selected = true;
  select.dispatchEvent(new ui.window.Event("change"));
  assert.equal(ui.get("debt-rows").firstElementChild.children[2].textContent, "Яна");
});

test("интерфейс: создание и редактирование сохраняют примечание и существующее имя", async () => {
  const ui = await app({ records: [item()] });
  await ui.click("add-debt");
  assert.equal(ui.get("editor").open, true);
  ui.get("debt-title").value = "Такси";
  ui.get("debt-amount").value = "100,10";
  ui.get("debt-person").value = " алексей ";
  ui.get("debt-note").value = "Пополам\nПосле ужина";
  await ui.submit("debt-form");
  assert.equal(ui.get("editor").open, false);
  const stored = JSON.parse(ui.window.localStorage.getItem(core.STORAGE_KEY));
  const created = stored.find(record => record.title === "Такси");
  assert.equal(created.person, "Алексей");
  assert.equal(created.note, "Пополам\nПосле ужина");
  assert.equal(created.amount_cents, 10010);
  const button = ui.document.querySelector(`button[data-action="edit"][data-id="${created.id}"]`);
  button.click();
  assert.equal(ui.get("debt-note").value, created.note);
  ui.get("debt-note").value = "Оплатить завтра";
  await ui.submit("debt-form");
  assert.match(ui.get("debt-rows").textContent, /Оплатить завтра/);
});

test("интерфейс: гость читает облако без входа, редактирование и импорт скрыты", async () => {
  const ui = await app({ cloud: true, records: [item()] });
  assert.equal(ui.get("ledger").hidden, false);
  assert.equal(ui.get("login").hidden, true);
  assert.equal(ui.get("sign-in").hidden, false);
  for (const id of ["add-debt", "add-first", "import", "migrate-local"]) assert.equal(ui.get(id).hidden, true);
  assert.equal(ui.document.querySelectorAll("button[data-action]").length, 0);
  assert.equal(ui.get("debt-rows").children.length, 1);
  assert.ok(ui.scopes.every(value => value === owner));
  await ui.click("sign-in");
  assert.equal(ui.get("login").hidden, false);
  assert.equal(ui.get("ledger").hidden, false);
});

test("интерфейс: владелец редактирует, после выхода или входа чужим аккаунтом доступ только для чтения", async () => {
  const ui = await app({ cloud: true, records: [item()], session: { user: { id: owner } } });
  assert.equal(ui.get("add-debt").hidden, false);
  assert.equal(ui.document.querySelectorAll('button[data-action="edit"]').length, 1);
  await ui.click("sign-out");
  assert.equal(ui.get("add-debt").hidden, true);
  assert.equal(ui.get("debt-rows").children.length, 1);
  await ui.context.useSession({ user: { id: "stranger" } });
  assert.equal(ui.get("import").hidden, true);
  assert.equal(ui.document.querySelectorAll("button[data-action]").length, 0);
  assert.match(ui.get("notice").textContent, /только просматривать/);
  assert.ok(ui.scopes.every(value => value === owner));
});

test("интерфейс: перенос в облако сохраняет локальные записи и повторно не добавляет их", async () => {
  const local = [item()];
  const ui = await app({ cloud: true, local, session: { user: { id: owner } } });
  const original = ui.window.localStorage.getItem(core.STORAGE_KEY);
  for (let i = 0; i < 2; i++) {
    await ui.click("migrate-local");
    assert.equal(ui.get("confirmation").open, true);
    ui.get("confirmation").close("confirm");
    await settle();
    assert.equal(ui.data.length, 1);
    assert.equal(ui.window.localStorage.getItem(core.STORAGE_KEY), original);
  }
});
