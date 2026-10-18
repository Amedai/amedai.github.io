import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const owner = "10000000-0000-4000-8000-000000000001";
const stranger = "10000000-0000-4000-8000-000000000002";
const debt = "20000000-0000-4000-8000-000000000001";
const otherDebt = "20000000-0000-4000-8000-000000000002";
const sql = await readFile(new URL("../supabase.sql", import.meta.url), "utf8");
const withOwner = value => sql.replace(/values \(true, '[^']+'::uuid\)/, `values (true, '${value}'::uuid)`);
const migration = withOwner(owner);

async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    insert into auth.users values ('${owner}'), ('${stranger}');
  `);
  return db;
}

async function asRole(db, role, user, action) {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user || ""]);
  await db.exec(`set role ${role}`);
  try { return await action(); }
  finally { await db.exec("reset role"); }
}

async function seed(db) {
  await db.query(`insert into public.debts (id, user_id, direction, title, amount_cents, person)
    values ($1, $2, 'me', 'Старый долг', 150050, 'Алексей'),
           ($3, $4, 'i', 'Чужая запись', 900, 'Борис')`, [debt, owner, otherDebt, stranger]);
}

test("SQL: посетитель видит долги владельца, но не может писать или менять владельца", async () => {
  const db = await database();
  try {
    await db.exec(migration);
    await seed(db);
    await asRole(db, "anon", null, async () => {
      assert.deepEqual((await db.query("select id from public.debts")).rows, [{ id: debt }]);
      assert.deepEqual((await db.query("select owner_id from public.debt_settings")).rows, [{ owner_id: owner }]);
      for (const query of [
        "update public.debts set amount_cents = 1",
        "delete from public.debts",
        `insert into public.debts (user_id, direction, title, amount_cents, person) values ('${owner}', 'me', 'Подмена', 1, 'Чужой')`,
        `update public.debt_settings set owner_id = '${stranger}'`,
      ]) await assert.rejects(db.exec(query), /permission denied/);
    });
  } finally { await db.close(); }
});

test("SQL: чужой аккаунт читает общий список, но не меняет даже свои скрытые записи", async () => {
  const db = await database();
  try {
    await db.exec(migration);
    await seed(db);
    // Другая разрешающая политика не должна обходить ограничения списка.
    await db.exec('create policy "Unexpected broad policy" on public.debts for all to authenticated using (true) with check (true)');
    await asRole(db, "authenticated", stranger, async () => {
      assert.deepEqual((await db.query("select id from public.debts")).rows, [{ id: debt }]);
      assert.equal((await db.query("update public.debts set amount_cents = 1 returning id")).rows.length, 0);
      assert.equal((await db.query("delete from public.debts returning id")).rows.length, 0);
      for (const user of [owner, stranger]) {
        await assert.rejects(db.query(`insert into public.debts (user_id, direction, title, amount_cents, person)
          values ($1, 'me', 'Подмена', 1, 'Чужой')`, [user]), /row-level security/);
      }
      await assert.rejects(db.exec(`update public.debt_settings set owner_id = '${stranger}'`), /permission denied/);
    });
  } finally { await db.close(); }
});

test("SQL: владелец создаёт, редактирует и удаляет записи, но не передаёт их другому аккаунту", async () => {
  const db = await database();
  try {
    await db.exec(migration);
    await seed(db);
    await asRole(db, "authenticated", owner, async () => {
      assert.equal((await db.query("update public.debts set note = 'В пятницу' where id = $1 returning id", [debt])).rows.length, 1);
      const result = await db.query(`insert into public.debts (direction, title, amount_cents, person, note)
        values ('i', 'Такси', 100, 'Борис', 'Пополам') returning id, user_id`);
      assert.equal(result.rows[0].user_id, owner);
      assert.equal((await db.query("delete from public.debts where id = $1 returning id", [result.rows[0].id])).rows.length, 1);
      await assert.rejects(db.query("update public.debts set user_id = $1 where id = $2", [stranger, debt]), /row-level security/);
      await assert.rejects(db.query("update public.debts set note = $1 where id = $2", ["x".repeat(2001), debt]), /debts_note_length/);
      await assert.rejects(db.exec(`update public.debt_settings set owner_id = '${stranger}'`), /permission denied/);
    });
  } finally { await db.close(); }
});

test("SQL: обновление старой базы и повторный запуск сохраняют долги и примечания", async () => {
  const db = await database();
  try {
    // Схема предыдущей версии: примечаний ещё нет, доступ только по user_id.
    await db.exec(`create table public.debts (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null default auth.uid() references auth.users(id),
      direction text not null, title text not null, amount_cents bigint not null,
      person text not null, created_at timestamptz not null default now()
    );
    alter table public.debts enable row level security;
    create policy "Users manage their own debts" on public.debts for all to authenticated
      using (auth.uid() = user_id) with check (auth.uid() = user_id);`);
    await seed(db);
    await db.exec(migration);
    assert.equal((await db.query("select note from public.debts where id = $1", [debt])).rows[0].note, "");
    await db.query("update public.debts set note = 'Сохранить' where id = $1", [debt]);
    await db.exec(migration);
    assert.equal((await db.query("select count(*)::int as total from public.debts")).rows[0].total, 2);
    assert.equal((await db.query("select note from public.debts where id = $1", [debt])).rows[0].note, "Сохранить");
    await asRole(db, "authenticated", stranger, async () => {
      assert.equal((await db.query("delete from public.debts returning id")).rows.length, 0);
    });
  } finally { await db.close(); }
});

test("SQL: незаполненный UUID прерывает обновление целиком", async () => {
  const db = await database();
  try {
    await assert.rejects(db.exec(withOwner("OWNER_USER_UUID")), /invalid input syntax for type uuid/);
    await db.exec("rollback");
    assert.equal((await db.query("select to_regclass('public.debts') as name")).rows[0].name, null);
    assert.equal((await db.query("select to_regclass('public.debt_settings') as name")).rows[0].name, null);
  } finally { await db.close(); }
});
