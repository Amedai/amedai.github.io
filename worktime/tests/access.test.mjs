import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const owner="10000000-0000-4000-8000-000000000001", stranger="10000000-0000-4000-8000-000000000002";
const project="20000000-0000-4000-8000-000000000001", task="30000000-0000-4000-8000-000000000001";
const sql=(await readFile(new URL("../supabase.sql",import.meta.url),"utf8")).replace("edb177a9-ec4a-4cee-9489-4e2650811dca",owner);
async function database() {
  const db=new PGlite();
  await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated;
    insert into auth.users values ('${owner}'),('${stranger}');`);
  await db.exec(sql);
  await db.exec(`insert into public.worktime_projects(id,user_id,name) values ('${project}','${owner}','Студия');
    insert into public.worktime_items(id,user_id,project_id,title,kind) values ('${task}','${owner}','${project}','Блок','plan');`);
  return db;
}
async function as(db,role,user,fn) {
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user||""]); await db.exec(`set role ${role}`);
  try {await fn();} finally {await db.exec("reset role");}
}
test("Посетитель читает, но не меняет записи, настройки и не вызывает импорт", async()=>{
  const db=await database(); try {await as(db,"anon",null,async()=>{
    assert.equal((await db.query("select * from public.worktime_items")).rows.length,1);
    for (const statement of ["delete from public.worktime_projects","update public.worktime_items set title='hack'",`update public.worktime_settings set owner_id='${stranger}'`,"select public.worktime_import('{}')"]) await assert.rejects(db.exec(statement),/permission denied/);
  });} finally {await db.close();}
});
test("Чужой аккаунт не пишет даже при посторонней разрешающей политике", async()=>{
  const db=await database(); try {
    for (const table of ["worktime_projects","worktime_items"]) await db.exec(`create policy broad on public.${table} for all to authenticated using(true) with check(true)`);
    await as(db,"authenticated",stranger,async()=>{
      assert.equal((await db.query("update public.worktime_items set title='hack' returning id")).rows.length,0);
      assert.equal((await db.query("delete from public.worktime_projects returning id")).rows.length,0);
      for (const user of [owner,stranger]) await assert.rejects(db.exec(`insert into public.worktime_projects(user_id,name) values ('${user}','hack')`),/row-level security/);
      await assert.rejects(db.exec("select public.worktime_import('{\"projects\":[],\"items\":[]}')"),/Only the owner/);
    });
  } finally {await db.close();}
});
test("Владелец редактирует; ограничения дат и проекта сохраняются на стороне SQL", async()=>{
  const db=await database(); try {await as(db,"authenticated",owner,async()=>{
    assert.equal((await db.query("update public.worktime_items set title='Исправлено' returning id")).rows.length,1);
    await assert.rejects(db.exec(`update public.worktime_items set user_id='${stranger}'`),/row-level security/);
    await assert.rejects(db.exec("update public.worktime_items set kind='work',started_at='2026-10-18 10:00Z',ended_at='2026-10-18 09:00Z'"),/worktime_interval/);
    await assert.rejects(db.exec("delete from public.worktime_projects"),/foreign key/);
    await db.exec("update public.worktime_items set kind='work',started_at='2026-10-18 23:50Z',ended_at='2026-10-19 00:15Z'");
    assert.equal((await db.query("select floor(extract(epoch from(ended_at-started_at))/600)*200 as amount from public.worktime_items")).rows[0].amount,"400");
    await db.exec("delete from public.worktime_items; delete from public.worktime_projects");
  });} finally {await db.close();}
});
test("Импорт атомарен, повторяем и не заменяет существующие задачи", async()=>{
  const db=await database(); try {await as(db,"authenticated",owner,async()=>{
    const importedProject="20000000-0000-4000-8000-000000000002";
    const payload={projects:[{id:importedProject,name:"Новый",created_at:"2026-10-18T10:00:00Z"}],items:[{id:"30000000-0000-4000-8000-000000000002",project_id:importedProject,title:"Новая задача",kind:"work",done:false,started_at:"2026-10-18T10:00:00Z",ended_at:"2026-10-18T09:00:00Z",created_at:"2026-10-18T10:00:00Z"}]};
    await assert.rejects(db.query("select public.worktime_import($1::jsonb)",[JSON.stringify(payload)]),/worktime_interval/);
    assert.equal((await db.query("select count(*)::int as n from public.worktime_projects")).rows[0].n,1);
    payload.items[0].ended_at="2026-10-18T10:25:00Z";
    await db.query("select public.worktime_import($1::jsonb)",[JSON.stringify(payload)]);
    payload.items[0].title="Не заменять";
    await db.query("select public.worktime_import($1::jsonb)",[JSON.stringify(payload)]);
    assert.equal((await db.query("select title from public.worktime_items where id=$1",[payload.items[0].id])).rows[0].title,"Новая задача");
  });} finally {await db.close();}
});
test("Повторный запуск SQL сохраняет записи; таблицы долгов не затрагиваются", async()=>{
  const db=await database(); try {
    await db.exec("create table public.debts(id integer primary key, note text); insert into public.debts values (1,'Сохранить')");
    await db.exec(sql);
    assert.equal((await db.query("select count(*)::int as n from public.worktime_items")).rows[0].n,1);
    assert.equal((await db.query("select note from public.debts")).rows[0].note,"Сохранить");
  } finally {await db.close();}
});
test("SQL: таймер складывает активные отрезки и защищает переходы версией", async()=>{
  const db=await database();try {await as(db,"authenticated",owner,async()=>{
    await db.exec(`update public.worktime_items set kind='work',started_at=clock_timestamp()-interval '30 minutes',
      timer_state='running',running_since=clock_timestamp()-interval '6 minutes' where id='${task}'`);
    await db.query("select public.worktime_timer_action($1,'pause',0)",[task]);
    let result=(await db.query("select * from public.worktime_items where id=$1",[task])).rows[0];
    assert.equal(result.timer_state,"paused");assert.equal(result.running_since,null);assert.equal(result.timer_version,1);
    assert.ok(Number(result.elapsed_ms)>=360000 && Number(result.elapsed_ms)<361000);
    await assert.rejects(db.query("select public.worktime_timer_action($1,'pause',0)",[task]),/Timer changed/);
    await assert.rejects(db.query("select public.worktime_timer_action($1,'pause',1)",[task]),/Timer changed/);
    await db.query("select public.worktime_timer_action($1,'resume',1)",[task]);
    await db.exec(`update public.worktime_items set running_since=clock_timestamp()-interval '6 minutes' where id='${task}'`);
    await db.query("select public.worktime_timer_action($1,'finish',2)",[task]);
    result=(await db.query("select *,floor(elapsed_ms/600000)*200 as amount from public.worktime_items where id=$1",[task])).rows[0];
    assert.equal(result.timer_state,"finished");assert.equal(result.timer_version,3);assert.equal(Number(result.amount),200);
    assert.ok(Number(result.elapsed_ms)>=720000 && Number(result.elapsed_ms)<722000);assert.ok(result.ended_at);
    await assert.rejects(db.query("select public.worktime_timer_action($1,'resume',3)",[task]),/Timer changed/);
  });}finally{await db.close();}
});
test("SQL: завершение на паузе не добавляет время перерыва; второй таймер запрещён",async()=>{
  const db=await database();try{await as(db,"authenticated",owner,async()=>{
    await db.exec(`update public.worktime_items set kind='work',started_at=clock_timestamp()-interval '2 hours',timer_state='paused',elapsed_ms=1500000 where id='${task}'`);
    await assert.rejects(db.exec(`insert into public.worktime_items(project_id,title,kind,started_at,timer_state,running_since)
      values('${project}','Второй','work',clock_timestamp(),'running',clock_timestamp())`),/worktime_one_timer/);
    await db.query("select public.worktime_timer_action($1,'finish',0)",[task]);
    assert.equal((await db.query("select elapsed_ms from public.worktime_items where id=$1",[task])).rows[0].elapsed_ms,1500000);
  });}finally{await db.close();}
});
test("SQL: посетитель и чужой аккаунт не управляют таймером через RPC",async()=>{
  const db=await database();try{
    await as(db,"anon",null,async()=>{await assert.rejects(db.query("select public.worktime_timer_action($1,'finish',0)",[task]),/permission denied/);});
    await as(db,"authenticated",stranger,async()=>{await assert.rejects(db.query("select public.worktime_timer_action($1,'finish',0)",[task]),/Only the owner/);});
  }finally{await db.close();}
});
test("SQL: миграция прежней схемы сохраняет ручные записи и копии таймера",async()=>{
  const db=await database();try{
    await db.exec("alter table public.worktime_items drop column timer_state cascade,drop column elapsed_ms cascade,drop column running_since cascade,drop column timer_version cascade");
    await db.exec(sql);
    let result=(await db.query("select * from public.worktime_items where id=$1",[task])).rows[0];assert.equal(result.timer_state,"manual");assert.equal(result.title,"Блок");
    await as(db,"authenticated",owner,async()=>{
      const payload={projects:[],items:[{id:"30000000-0000-4000-8000-000000000002",project_id:project,title:"Таймер из копии",kind:"work",done:false,started_at:"2026-01-01T10:00:00Z",ended_at:"2026-01-01T12:00:00Z",created_at:"2026-01-01T10:00:00Z",timer_state:"finished",elapsed_ms:1500000,timer_version:4}]};
      await db.query("select public.worktime_import($1::jsonb)",[JSON.stringify(payload)]);
      result=(await db.query("select * from public.worktime_items where id=$1",[payload.items[0].id])).rows[0];assert.equal(result.elapsed_ms,1500000);assert.equal(result.timer_state,"finished");assert.equal(result.timer_version,4);
    });
  }finally{await db.close();}
});
