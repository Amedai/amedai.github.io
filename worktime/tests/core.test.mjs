import test from "node:test";
import assert from "node:assert/strict";
import { interval, validateData, validateItem, filterItems, parseBackup, mergeData, transitionTimer, workBill, elapsedMilliseconds, timerClock } from "../core.mjs";
import { localRepository, cloudRepository } from "../storage.mjs";
const project = { id:"10000000-0000-4000-8000-000000000001", name:"Студия", created_at:"2026-10-18T09:00:00Z" };
const item = { id:"20000000-0000-4000-8000-000000000001", project_id:project.id, title:"Шапка сайта", note:"", kind:"work", done:false, started_at:"2026-10-18T10:00:00Z", ended_at:"2026-10-18T10:25:00Z", created_at:project.created_at };
test("Оплата только полных десяток: границы, секунды и длительные интервалы", () => {
  const start = "2026-10-18T10:00:00Z";
  for (const [seconds, expected] of [[1,0],[599,0],[600,200],[1199,200],[1200,400],[1500,400],[3600,1200],[86400,28800]]) {
    const result = interval(start, new Date(Date.parse(start) + seconds*1000).toISOString());
    assert.equal(result.amount, expected, String(seconds));
  }
  assert.deepEqual(interval(item.started_at,item.ended_at), { minutes:25, blocks:2, amount:400, freeMinutes:5 });
});
test("Короткие задачи округляются отдельно, их время не объединяется для оплаты", () => {
  const work = [9,9].map(minutes => interval(item.started_at, new Date(Date.parse(item.started_at) + minutes*60000).toISOString()));
  assert.equal(work.reduce((sum,i) => sum+i.amount,0), 0);
});
test("Переход через полночь с явной датой", () => {
  assert.equal(interval("2026-10-18T23:50:00+03:00", "2026-10-19T00:15:00+03:00").amount, 400);
  assert.throws(() => interval("2026-10-18T23:50:00Z", "2026-10-18T00:15:00Z"), /позже начала/);
});
test("Ошибочные, равные даты и чрезмерные интервалы отклоняются", () => {
  for (const end of ["bad",item.started_at,"2026-10-17T10:00:00Z","2026-10-26T10:00:00Z"]) assert.throws(() => interval(item.started_at,end));
});
test("Планы без времени; неизвестные поля не сохраняются", () => {
  const checked = validateItem({...item,kind:"plan",started_at:null,ended_at:null,user_id:"injected"});
  assert.equal(checked.started_at,null); assert.equal("user_id" in checked,false);
  assert.throws(() => validateItem({...item,kind:"plan"}));
  assert.throws(() => validateItem({...item,title:" "}));
  assert.throws(() => validateItem({...item,note:"x".repeat(2001)}));
});
test("Резервная копия проверяет ссылки, формат и повторяющиеся ID", () => {
  const backup = {format:"worktime",version:1,projects:[project],items:[item]};
  assert.equal(parseBackup(JSON.stringify(backup)).items.length,1);
  assert.throws(() => parseBackup(JSON.stringify({...backup,version:3})));
  assert.throws(() => validateData({projects:[],items:[item]}),/отсутствует проект/);
  assert.throws(() => validateData({projects:[project,project],items:[]}),/повторяются/);
  assert.equal(mergeData(validateData(backup),backup).items.length,1);
});
test("Фильтры: проект, месяц по местному времени, поиск и планы", () => {
  const plan = {...item,id:"20000000-0000-4000-8000-000000000002",kind:"plan",started_at:null,ended_at:null};
  assert.equal(filterItems([item,plan], {search:"ШАПКА",month:"2026-10"}).length,1);
  assert.equal(filterItems([item], {month:"2026-09"}).length,0);
  assert.equal(filterItems([item], {project:"other"}).length,0);
  assert.equal(filterItems([plan], {kind:"plan",month:"2026-09"}).length,1);
});
test("Локальное сохранение, перенос проекта, импорт, удаление и перезагрузка", async () => {
  const values = new Map(); const storage = {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const repo = localRepository(storage);
  await repo.saveProject(project); await repo.saveItem(item);
  await assert.rejects(repo.removeProject(project.id),/Сначала удалите/);
  await repo.import({projects:[project],items:[item]});
  assert.equal((await localRepository(storage).list()).items.length,1);
  await repo.saveItem({...item,title:"Подвал сайта"});
  assert.equal((await repo.list()).items[0].title,"Подвал сайта");
  await repo.removeItem(item.id); await repo.removeProject(project.id);
  assert.deepEqual(await repo.list(),{projects:[],items:[]});
});
test("Сбой хранилища не объявляется успешным сохранением", async () => {
  const repo=localRepository({getItem:()=>null,setItem:()=>{throw new Error("QuotaExceededError");}});
  await assert.rejects(repo.saveProject(project),/QuotaExceeded/);
});
test("Облачный адаптер проверяет ошибки и не подменяет их локальной записью", async () => {
  const error = new Error("network unavailable");
  const query = new Proxy({}, {get:(_,key)=>key === "then" ? resolve=>resolve({error,data:null}) : ()=>query});
  const repo = cloudRepository({from:()=>query,rpc:async()=>({error})},project.id);
  await assert.rejects(repo.list(),/network/); await assert.rejects(repo.saveItem(item),/network/);
  await assert.rejects(repo.removeItem(item.id),/network/); await assert.rejects(repo.import({projects:[project],items:[item]}),/network/);
});
test("Облачное чтение обходит лимит страницы в 500 строк", async () => {
  let calls=0;
  const client={from(table){const query={select(){return this;},eq(){return this;},order(){return this;},async range(start){calls++; return {data:table === "worktime_projects" ? [project] : start===0 ? Array.from({length:500},(_,n)=>({...item,id:`20000000-0000-4000-8000-${String(n).padStart(12,"0")}`})) : []};}};return query;}};
  const result=await cloudRepository(client,project.id).list(); assert.equal(result.items.length,500); assert.equal(calls,3);
});
const timer = () => validateItem({...item,ended_at:null,timer_state:"running",elapsed_ms:0,running_since:item.started_at,timer_version:0});
test("Таймер: работа, длинная пауза, продолжение и завершение; округление общей активности", () => {
  const start=Date.parse(item.started_at);
  const paused=transitionTimer(timer(),"pause",start+6*60000);
  assert.equal(elapsedMilliseconds(paused,start+100*60000),6*60000);
  const running=transitionTimer(paused,"resume",start+100*60000);
  const finished=transitionTimer(running,"finish",start+106*60000);
  assert.equal(finished.elapsed_ms,12*60000); assert.equal(finished.timer_state,"finished");
  assert.equal(finished.ended_at,new Date(start+106*60000).toISOString());
  assert.equal(workBill(finished).amount,200); assert.equal(timerClock(finished),"00:12:00");
  assert.equal(finished.timer_version,3);
});
test("Таймер: секунды складываются до округления и сохраняются при перезагрузке", () => {
  const start=Date.parse(item.started_at);
  const paused=transitionTimer(timer(),"pause",start+9*60000+35000);
  const restored=validateItem(JSON.parse(JSON.stringify(paused)));
  const running=transitionTimer(restored,"resume",start+20*60000);
  const finished=transitionTimer(running,"finish",start+20*60000+35000);
  assert.equal(finished.elapsed_ms,610000); assert.equal(workBill(finished).amount,200);
  assert.equal(workBill(finished).minutes,10);
});
test("Таймер можно завершить на паузе; повторные и неверные переходы отклоняются", () => {
  const start=Date.parse(item.started_at), paused=transitionTimer(timer(),"pause",start+25*60000);
  assert.throws(()=>transitionTimer(paused,"pause",start+30*60000),/Состояние/);
  assert.throws(()=>transitionTimer(timer(),"resume",start+30*60000),/Состояние/);
  const finished=transitionTimer(paused,"finish",start+100*60000);
  assert.equal(workBill(finished).amount,400);assert.equal(finished.elapsed_ms,25*60000);
  assert.throws(()=>transitionTimer(finished,"resume",start+110*60000));
});
test("Старые интервалы и копии совместимы; повреждённые и два активных таймера отклоняются", () => {
  assert.equal(workBill(validateItem(item)).amount,400);
  const paused=transitionTimer(timer(),"pause",Date.parse(item.started_at)+60000);
  const copy=parseBackup(JSON.stringify({format:"worktime",version:2,projects:[project],items:[paused]}));
  assert.equal(copy.items[0].elapsed_ms,60000);
  assert.throws(()=>validateItem({...paused,elapsed_ms:-1}));
  assert.throws(()=>validateItem({...timer(),running_since:null}));
  assert.throws(()=>validateItem({...paused,running_since:item.started_at}));
  assert.throws(()=>validateData({projects:[project],items:[paused,{...paused,id:"20000000-0000-4000-8000-000000000002"}]}),/один таймер/);
});
test("Локальный таймер: состояние сохраняется, устаревшая команда не перезаписывает его", async () => {
  const values=new Map(), storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const repo=localRepository(storage);await repo.saveProject(project);await repo.saveItem(timer());
  await repo.timerAction(item.id,"pause",0);
  const reloaded=localRepository(storage);assert.equal((await reloaded.list()).items[0].timer_state,"paused");
  await assert.rejects(repo.timerAction(item.id,"resume",0),/другой вкладке/);
  await reloaded.timerAction(item.id,"finish",1);
  assert.equal((await repo.list()).items[0].timer_state,"finished");
});
