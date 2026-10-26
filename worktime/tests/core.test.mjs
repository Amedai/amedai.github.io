import test from "node:test";
import assert from "node:assert/strict";
import { interval, durationInterval, validateData, validateItem, filterItems, parseBackup, mergeData, transitionTimer, workBill, elapsedMilliseconds, timerClock, localInput, moscowInputToISO, createInvoice, invoiceCandidates, invoiceCSV, invoiceTotal } from "../core.mjs";
import { localRepository, cloudRepository } from "../storage.mjs";
const project = { id:"10000000-0000-4000-8000-000000000001", name:"Студия", created_at:"2026-10-18T09:00:00Z" };
const item = { id:"20000000-0000-4000-8000-000000000001", project_id:project.id, title:"Шапка сайта", note:"", kind:"work", done:false, started_at:"2026-10-18T10:00:00Z", ended_at:"2026-10-18T10:25:00Z", created_at:project.created_at };
test("Ввод длительности: полночь, границы оплаты и предел в семь дней", () => {
  const start = "2026-09-30T23:50:00+03:00";
  for (const [hours, minutes, amount] of [[0,9,0],[0,10,200],[1,25,1600],[168,0,201600]]) {
    const result = durationInterval(start, String(hours), String(minutes));
    assert.equal(workBill(result).amount, amount);
    assert.equal(Date.parse(result.ended_at)-Date.parse(result.started_at),(hours*60+minutes)*60000);
  }
  assert.equal(localInput(durationInterval(start,"1","25").ended_at),"2026-10-01T01:15");
  for (const [hours,minutes] of [[0,0],[-1,10],[1.5,0],[0,60],[168,1],[169,0],["",10],[0,""],["Infinity",0],["1e2",0],[null,10]]) {
    assert.throws(()=>durationInterval(start,hours,minutes));
  }
});
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
  assert.throws(() => parseBackup(JSON.stringify({...backup,version:5})));
  assert.throws(() => validateData({projects:[],items:[item]}),/отсутствует проект/);
  assert.throws(() => validateData({projects:[project,project],items:[]}),/повторяются/);
  assert.equal(mergeData(validateData(backup),backup).items.length,1);
});
test("МСК: ввод и обратное преобразование, полночь и некорректные даты", () => {
  assert.equal(localInput("2026-10-18T18:13:00Z"), "2026-10-18T21:13");
  assert.equal(moscowInputToISO("2026-10-18T21:13"), "2026-10-18T18:13:00.000Z");
  assert.equal(localInput("2026-12-31T21:00:00Z"), "2027-01-01T00:00");
  assert.equal(moscowInputToISO("2027-01-01T00:00"), "2026-12-31T21:00:00.000Z");
  for (const input of ["2026-02-30T12:00", "2026-10-18T24:00", "2026-10-18T21:60", "2026-10-18T09:13 PM", "", null]) assert.throws(() => moscowInputToISO(input));
});
test("Фильтр месяца использует московскую дату на границе UTC", () => {
  const boundary = {...item,started_at:"2026-10-31T21:30:00Z",ended_at:"2026-10-31T22:00:00Z"};
  assert.equal(filterItems([boundary], {month:"2026-10"}).length,0);
  assert.equal(filterItems([boundary], {month:"2026-11"}).length,1);
});
test("Фильтры: проект, месяц по МСК, поиск и планы", () => {
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
  assert.deepEqual(await repo.list(),{projects:[],items:[],invoices:[]});
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
  await assert.rejects(repo.removeInvoice(project.id),/network/);
});

test("Облачное удаление счёта ограничено ID и владельцем, отсутствие записи возвращает ошибку", async () => {
  const calls=[];let error=null;
  const query={delete(){calls.push(["delete"]);return this;},eq(...args){calls.push(["eq",...args]);return this;},select(...args){calls.push(["select",...args]);return this;},async single(){return {data:error?null:{id:item.id},error};}};
  const repo=cloudRepository({from(table){calls.push(["from",table]);return query;}},project.id);
  await repo.removeInvoice(item.id);
  assert.deepEqual(calls,[["from","worktime_invoices"],["delete"],["eq","id",item.id],["eq","user_id",project.id],["select","id"]]);
  error=new Error("Счёт не найден");await assert.rejects(repo.removeInvoice(item.id),/не найден/);
});
test("Облачное чтение обходит лимит страницы в 500 строк", async () => {
  let calls=0;
  const client={from(table){const query={select(){return this;},eq(){return this;},order(){return this;},async range(start){calls++; return {data:table === "worktime_projects" ? [project] : table === "worktime_invoices" ? [] : start===0 ? Array.from({length:500},(_,n)=>({...item,id:`20000000-0000-4000-8000-${String(n).padStart(12,"0")}`})) : []};}};return query;}};
  const result=await cloudRepository(client,project.id).list(); assert.equal(result.items.length,500); assert.equal(calls,4);
});
const timer = () => validateItem({...item,ended_at:null,timer_state:"running",elapsed_ms:0,running_since:item.started_at,timer_version:0});

test("Счёт: период МСК включительно, отдельное округление, исключение активных и уже выставленных задач", () => {
  const data = validateData({projects:[project], items:[item, {...item,id:"20000000-0000-4000-8000-000000000002",started_at:"2026-10-17T21:00:00Z",ended_at:"2026-10-17T21:09:00Z"}, {...timer(),id:"20000000-0000-4000-8000-000000000003"}]});
  const invoice=createInvoice(data,{id:project.id,start:"2026-10-18",end:"2026-10-18"});
  assert.equal(invoice.items.length,2);assert.equal(invoiceTotal(invoice),400);
  assert.equal(invoiceCandidates({...data,invoices:[invoice]},"2026-10-18","2026-10-18").length,0);
  assert.throws(()=>createInvoice(data,{id:project.id,start:"2026-10-19",end:"2026-10-18"}),/Конец/);
  assert.throws(()=>createInvoice(data,{id:project.id,start:"2026-10-01",end:"2026-10-01"}),/завершённые/);
  assert.throws(()=>validateData({...data,invoices:[invoice,{...invoice,id:item.id}]}),/дважды/);
  assert.throws(()=>validateData({...data,items:data.items.map(i=>({...i,title:"Изменено"})),invoices:[invoice]}),/не совпадают/);
});

test("CSV содержит итог, экранирует текст и формулы, сохраняет русские названия", () => {
  const invoice=createInvoice({projects:[project],items:[{...item,title:'=HYPERLINK("x")',note:'Детали; строка\nещё'}]}, {id:project.id,start:"2026-10-18",end:"2026-10-18"});
  const csv=invoiceCSV(invoice);assert.ok(csv.startsWith("\uFEFF"));assert.match(csv,/'=HYPERLINK\(""x""\)/);assert.match(csv,/"ИТОГО";"";"";"25";"400"/);assert.match(csv,/Студия/);
});

test("Локальные счета: снимок, оплата, перезагрузка и резервная копия", async () => {
  const values=new Map(), storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}, repo=localRepository(storage);
  await repo.saveProject(project);await repo.saveItem(item);
  await repo.createInvoice({id:project.id,start:"2026-10-18",end:"2026-10-18"});
  await assert.rejects(repo.removeItem(item.id),/включена/);await assert.rejects(repo.saveItem({...item,title:"Новая цена"}),/включена/);
  await assert.rejects(repo.updateItemDetails({...item,title:"Изменить"}),/включена/);
  await repo.payInvoice(project.id);const paid=(await repo.list()).invoices[0].paid_at;await repo.payInvoice(project.id);
  const saved=await localRepository(storage).list();assert.equal(saved.invoices[0].paid_at,paid);assert.equal(saved.items.length,1);
  assert.deepEqual(parseBackup(JSON.stringify({format:"worktime",version:3,...saved})),saved);
  assert.deepEqual(mergeData(saved,saved),saved);
});

test("Удаление неоплаченного счёта сохраняет задачи и освобождает их для нового счёта", async () => {
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)},repo=localRepository(storage);
  await repo.saveProject(project);await repo.saveItem(item);
  await repo.createInvoice({id:project.id,start:"2026-10-18",end:"2026-10-18"});
  const before=await repo.list();await repo.removeInvoice(project.id);
  const saved=await localRepository(storage).list();assert.deepEqual(saved.items,before.items);assert.deepEqual(saved.projects,before.projects);assert.equal(saved.invoices.length,0);
  assert.equal(invoiceCandidates(saved,"2026-10-18","2026-10-18").length,1);
  await assert.rejects(repo.removeInvoice(project.id),/Счёт не найден/);
  await repo.saveItem({...item,title:"Исправленная задача"});
  await repo.createInvoice({id:project.id,start:"2026-10-18",end:"2026-10-18"});await repo.payInvoice(project.id);
  const paid=await repo.list();await assert.rejects(repo.removeInvoice(project.id),/Оплаченный счёт нельзя удалить/);assert.deepEqual(await repo.list(),paid);
});
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

test("Переименование из устаревшей формы сохраняет последние паузу, продолжение и завершение", async () => {
  const values=new Map(), storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const repo=localRepository(storage), snapshot=timer();
  await repo.saveProject(project);await repo.saveItem(snapshot);
  for (const operation of ["pause","resume","finish"]) {
    const current=(await repo.list()).items[0];
    await repo.timerAction(item.id,operation,current.timer_version);
    const latest=(await repo.list()).items[0];
    await repo.updateItemDetails({...snapshot,title:`Название после ${operation}`,note:"Исправлено"});
    assert.deepEqual((await repo.list()).items[0],{...latest,title:`Название после ${operation}`,note:"Исправлено"});
  }
  await assert.rejects(repo.updateItemDetails({...snapshot,title:" "}),/название/);
  await repo.removeItem(item.id);
  await assert.rejects(repo.updateItemDetails(snapshot),/не найдена/);
  assert.equal((await repo.list()).items.length,0);
});

test("Облачное переименование обновляет только детали задачи с фильтром владельца", async () => {
  const snapshot=timer(), calls=[];
  const latest=transitionTimer(snapshot,"pause",Date.parse(item.started_at)+25*60000);
  const client={from(table){
    assert.equal(table,"worktime_items");
    return {update(row){calls.push(row);return this;},eq(key,value){calls.push([key,value]);return this;},select(){return this;},async single(){return {data:{id:snapshot.id}};}};
  }};
  await cloudRepository(client,project.id).updateItemDetails({...snapshot,title:"Исправлено",note:"Детали"});
  assert.deepEqual(calls,[{id:snapshot.id,project_id:project.id,title:"Исправлено",note:"Детали",images:[]},["id",snapshot.id],["user_id",project.id]]);
  assert.deepEqual({...latest,...calls[0]},{...latest,title:"Исправлено",note:"Детали"});
  const failed=cloudRepository({from(){return {update(){return this;},eq(){return this;},select(){return this;},async single(){return {error:new Error("network unavailable")};}};}},project.id);
  await assert.rejects(failed.updateItemDetails(snapshot),/network/);
});

test("Фото: валидация, перезапуск таймера, счета и копия версии 4 сохраняют вложения", async () => {
  const image = "data:image/png;base64,aGVsbG8=";
  const task = validateItem({...item, images:[image]});
  assert.deepEqual(validateItem(item).images, []);
  for (const images of [["javascript:alert(1)"], ["data:image/svg+xml;base64,PHN2Zz4="], ["data:image/png;base64,xx"], [image.repeat(100000)], Array(6).fill(image), "bad"]) {
    assert.throws(() => validateItem({...item, images}));
  }
  const large = "data:image/png;base64," + "a".repeat(1100000);
  assert.throws(() => validateItem({...item, images:[large,large]}), /много места/);
  const values = new Map(); const storage = {getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const repo = localRepository(storage);
  await repo.saveProject(project); await repo.saveItem(task);
  const invoice = await repo.createInvoice({id:project.id,start:"2026-10-18",end:"2026-10-18"});
  const data = await localRepository(storage).list();
  assert.deepEqual(data.items[0].images, [image]);
  assert.deepEqual(data.invoices.find(i=>i.id===invoice).items[0].images, [image]);
  assert.deepEqual(parseBackup(JSON.stringify({format:"worktime",version:4,...data})), data);
  const running = {...timer(),images:[image]};
  assert.deepEqual(transitionTimer(running,"pause",Date.parse(item.started_at)+60000).images,[image]);
});
