import test from "node:test";
import assert from "node:assert/strict";
import { MAX_AMOUNT_CENTS, STORAGE_KEY, parseAmount, amountForInput, formatAmount, validateRecords, parseBackup, countLabel } from "../core.mjs";
import { localRepository, cloudRepository } from "../storage.mjs";

const firstId = "10000000-0000-4000-8000-000000000001";
const secondId = "10000000-0000-4000-8000-000000000002";
const record = (overrides = {}) => ({ id: firstId, direction: "me", title: "За ужин", amount_cents: 150050, person: "Алексей", created_at: "2026-10-17T10:00:00.000Z", ...overrides });
function memoryStorage(initial) {
  const values = new Map(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test("суммы с запятой, точкой, пробелами и копейками читаются точно", () => {
  for (const [input, expected] of [["1 500,50", 150050], ["0.01", 1], ["1\u202f234,5", 123450], ["12", 1200], ["9999999999.99", MAX_AMOUNT_CENTS]]) assert.equal(parseAmount(input), expected);
  assert.equal(parseAmount("0.10") + parseAmount("0.20"), 30);
});

test("нулевые, отрицательные, слишком большие и неоднозначные суммы отклоняются", () => {
  for (const input of ["", "0", "-1", "1.001", "1e3", "NaN", "Infinity", "1,2,3", "10000000000", "1.000,00", "99999999999999999999999999"]) assert.throws(() => parseAmount(input));
});

test("редактирование суммы сохраняет копейки", () => {
  for (const cents of [1, 10, 100, 150050, MAX_AMOUNT_CENTS]) assert.equal(parseAmount(amountForInput(cents)), cents);
});

test("итоги больше безопасного Number форматируются без потери копеек", () => {
  assert.equal(formatAmount(30), "0,30\u00a0₽");
  assert.equal(formatAmount(100), "1\u00a0₽");
  assert.equal(formatAmount(9999999999990001n).replace(/\s/g, ""), "99999999999900,01₽");
});

test("копия сохраняет обе вкладки и удаляет посторонние поля", () => {
  const data = [record({ user_id: "не переносить" }), record({ id: secondId, direction: "i" })];
  const restored = parseBackup(JSON.stringify({ version: 1, records: data }));
  assert.equal(restored.length, 2);
  assert.equal(restored[1].direction, "i");
  assert.equal("user_id" in restored[0], false);
});

test("некорректные копии и дубли не принимаются", () => {
  for (const data of ["{", JSON.stringify({ version: 2, records: [] }), JSON.stringify({ version: 1, records: [record({ amount_cents: 1.5 })] }), JSON.stringify({ version: 1, records: [record(), record()] }), JSON.stringify({ version: 1, records: [record({ direction: "all" })] }), JSON.stringify({ version: 1, records: [record({ created_at: "not-a-date" })] })]) assert.throws(() => parseBackup(data));
  assert.throws(() => validateRecords(Array(10001).fill(record())));
});

test("русские подписи количества", () => {
  for (const [n, text] of [[0, "Нет записей"], [1, "1 запись"], [2, "2 записи"], [11, "11 записей"], [21, "21 запись"], [112, "112 записей"]]) assert.equal(countLabel(n), text);
});

test("локальный долг сохраняется после нового открытия, редактируется и удаляется", async () => {
  const storage = memoryStorage();
  const repo = localRepository(storage);
  assert.deepEqual(await repo.list(), []);
  await repo.save(record());
  const reopened = localRepository(storage);
  assert.deepEqual(await reopened.list(), [record()]);
  await reopened.save(record({ amount_cents: 1 }));
  assert.equal((await repo.list())[0].amount_cents, 1);
  await reopened.remove(firstId);
  assert.deepEqual(await repo.list(), []);
});

test("локальный импорт не затирает изменённые записи с тем же ID", async () => {
  const repo = localRepository(memoryStorage());
  await repo.save(record({ title: "Изменённая запись" }));
  const added = await repo.import([record(), record({ id: secondId, direction: "i" })]);
  assert.equal(added, 1);
  const all = await repo.list();
  assert.equal(all.length, 2);
  assert.equal(all.find(item => item.id === firstId).title, "Изменённая запись");
});

test("повреждённое хранилище не перезаписывается при попытке сохранения", async () => {
  const storage = memoryStorage("broken json");
  const repo = localRepository(storage);
  await assert.rejects(repo.list());
  await assert.rejects(repo.save(record()));
  assert.equal(storage.getItem(STORAGE_KEY), "broken json");
});

test("ошибка квоты не выдаётся за успешное сохранение", async () => {
  const storage = memoryStorage();
  storage.setItem = () => { const error = new Error(); error.name = "QuotaExceededError"; throw error; };
  await assert.rejects(localRepository(storage).save(record()), /не разрешил сохранить/);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});

test("некорректный импорт не меняет локальные данные", async () => {
  const repo = localRepository(memoryStorage());
  await repo.save(record());
  await assert.rejects(repo.import([record({ id: secondId, amount_cents: -1 })]));
  assert.deepEqual(await repo.list(), [record()]);
});

function fakeCloud(responses) {
  const calls = [];
  const client = {
    from(table) {
      const call = { table, filters: [], orders: [] };
      calls.push(call);
      const chain = {
        select(fields) { call.fields = fields; return this; },
        eq(field, value) { call.filters.push([field, value]); return this; },
        order(field, options) { call.orders.push([field, options]); return this; },
        range(start, end) { call.range = [start, end]; return Promise.resolve(responses.shift()); },
        insert(data) { call.operation = "insert"; call.data = data; return this; },
        update(data) { call.operation = "update"; call.data = data; return this; },
        delete() { call.operation = "delete"; return this; },
        single() { return Promise.resolve(responses.shift()); },
        then(resolve, reject) { return Promise.resolve(responses.shift()).then(resolve, reject); },
      };
      return chain;
    },
  };
  return { client, calls };
}

test("облако читает больше 500 записей и фильтрует каждую страницу по владельцу", async () => {
  const batch = Array.from({ length: 500 }, (_, i) => record({ id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}` }));
  const { client, calls } = fakeCloud([{ data: batch, error: null }, { data: [record({ id: "20000000-0000-4000-8000-000000000001" })], error: null }]);
  assert.equal((await cloudRepository(client, "owner").list()).length, 501);
  assert.deepEqual(calls.map(call => call.range), [[0, 499], [500, 999]]);
  for (const call of calls) assert.deepEqual(call.filters, [["user_id", "owner"]]);
});

test("создание облачного долга привязывает его к текущему пользователю", async () => {
  const { client, calls } = fakeCloud([{ data: { id: firstId }, error: null }]);
  await cloudRepository(client, "owner").save(record());
  assert.equal(calls[0].operation, "insert");
  assert.equal(calls[0].data.user_id, "owner");
});

test("изменение и удаление в облаке ограничены ID и владельцем", async () => {
  const { client, calls } = fakeCloud([{ data: { id: firstId }, error: null }, { data: { id: firstId }, error: null }]);
  const repo = cloudRepository(client, "owner");
  await repo.save(record(), true);
  await repo.remove(firstId);
  for (const call of calls) assert.deepEqual(call.filters, [["id", firstId], ["user_id", "owner"]]);
  assert.equal(calls[0].operation, "update");
  assert.equal(calls[1].operation, "delete");
});

test("ошибка API при чтении, сохранении и удалении возвращается вызывающему коду", async () => {
  const error = new Error("network unavailable");
  const { client } = fakeCloud(Array.from({ length: 3 }, () => ({ data: null, error })));
  const repo = cloudRepository(client, "owner");
  await assert.rejects(repo.list(), /network unavailable/);
  await assert.rejects(repo.save(record()), /network unavailable/);
  await assert.rejects(repo.remove(firstId), /network unavailable/);
});

test("облачный импорт добавляет только новые ID и не переносит владельца из копии", async () => {
  const { client, calls } = fakeCloud([{ data: [record()], error: null }, { data: null, error: null }]);
  const added = await cloudRepository(client, "owner").import([record(), record({ id: secondId, user_id: "other" })]);
  assert.equal(added, 1);
  assert.equal(calls[1].data.length, 1);
  assert.equal(calls[1].data[0].user_id, "owner");
});
