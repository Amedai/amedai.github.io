import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import vm from "node:vm";
import { parseHTML } from "linkedom";
import * as core from "../core.mjs";
import { localRepository } from "../storage.mjs";
const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
const source=(await readFile(new URL("../app.js",import.meta.url),"utf8")).replace(/^import .*\r?\n/gm,"").replace(/^boot\(\);$/m,"globalThis.initialization = boot();");
const owner="10000000-0000-4000-8000-000000000001";
const project={id:randomUUID(),name:"Студия",created_at:"2026-10-18T09:00:00Z"};
const item={id:randomUUID(),project_id:project.id,title:"Шапка сайта",note:"Адаптивная версия",kind:"work",done:false,started_at:"2026-10-18T10:00:00Z",ended_at:"2026-10-18T10:25:00Z",created_at:project.created_at};
const settle=async()=>{for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));};
async function app({cloud=false,session=null,items=[item],projects=[project],invoices=[],missingSchema=false,writeError=null}={}) {
  const {window,document}=parseHTML(html);
  const values=new Map([[core.STORAGE_KEY,JSON.stringify({projects,items,invoices})]]);
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  for(const dialog of document.querySelectorAll("dialog")) {
    dialog.showModal=()=>{dialog.open=true;dialog.setAttribute("open","");};
    dialog.close=value=>{if(!dialog.open)return;dialog.open=false;dialog.removeAttribute("open");if(value!==undefined)dialog.returnValue=value;dialog.dispatchEvent(new window.Event("close"));};
  }
  for(const form of document.querySelectorAll("form")) form.reset=()=>{for(const input of form.querySelectorAll("input,textarea"))input.value="";};
  const select=document.getElementById("item-project");
  Object.defineProperty(select,"value",{get(){return this._selectedValue||"";},set(value){this._selectedValue=value;}});
  let authCallback, schemaMissing=missingSchema;
  const client={
    from(){return {select(){return this;},async single(){return schemaMissing?{error:{code:"PGRST205"}}:{data:{owner_id:owner}};}};},
    auth:{
      async getSession(){return {data:{session}};},onAuthStateChange(fn){authCallback=fn;},
      async signOut(){session=null;authCallback?.("SIGNED_OUT",null);return {};},
      async signInWithPassword(){session={user:{id:owner}};authCallback?.("SIGNED_IN",session);return {data:session};}
    }
  };
  window.supabase={createClient:()=>client};
  const append=document.head.append.bind(document.head);
  document.head.append=element=>{append(element);if(element.localName==="script")queueMicrotask(()=>element.onload());};
  const cloudData={projects:structuredClone(projects),items:structuredClone(items),invoices:structuredClone(invoices)};
  let downloadBlob;
  const context=vm.createContext({...core,localRepository,cloudRepository:()=>({
    async list(){return structuredClone(cloudData);},
    async saveItem(next){if(writeError)throw writeError;cloudData.items=cloudData.items.filter(i=>i.id!==next.id).concat(core.validateItem(next));},
    async updateItemDetails(next){cloudData.items=cloudData.items.map(i=>i.id===next.id?core.validateItem({...i,title:next.title,project_id:next.project_id,note:next.note,images:next.images}):i);},
    async removeItem(id){if(writeError)throw writeError;cloudData.items=cloudData.items.filter(i=>i.id!==id);}
  }),config:{supabaseUrl:"https://test.supabase.co",supabaseKey:"sb_publishable_test"},window,document,location:{search:cloud?"":"?demo=1"},localStorage:storage,crypto:{randomUUID},URL:{createObjectURL(blob){downloadBlob=blob;return "blob:test";},revokeObjectURL(){}},URLSearchParams,Blob,setTimeout,clearTimeout,setInterval:()=>1});
  vm.runInContext(source,context,{filename:"app.js"}); await context.initialization;
  return {document,window,storage,context,get:id=>document.getElementById(id),
    setTime(id,value){const [date,time]=value.split("T");document.getElementById(id+"-date").value=date;document.getElementById(id).value=time;},
    async click(id){document.getElementById(id).click();await settle();},
    async submit(id){document.getElementById(id).dispatchEvent(new window.Event("submit",{cancelable:true}));await settle();},
    async session(next){session=next;authCallback("SIGNED_IN",next);await settle();},
    enableSchema(){schemaMissing=false;},get downloadBlob(){return downloadBlob;}
  };
}
for (const cloud of [false,true]) test(`DOM: старая задача по длительности, сумма и счёт (${cloud?"облако":"демо"})`,async()=>{
  const ui=await app({cloud,session:cloud?{user:{id:owner}}:null,items:[]});
  await ui.click("add-completed");assert.equal(ui.get("editor").open,true);
  assert.equal(ui.get("duration-fields").hidden,false);assert.equal(ui.get("end-label").hidden,true);
  assert.equal(ui.get("end").required,false);assert.equal(ui.get("spent-hours").required,true);
  ui.get("item-title").value="Работа до запуска сайта";ui.get("item-note").value="Из старых записей";
  ui.setTime("start","2026-09-30T23:50");ui.get("spent-hours").value="1";ui.get("spent-minutes").value="25";
  ui.get("spent-minutes").dispatchEvent(new ui.window.Event("input"));assert.match(ui.get("calc-amount").textContent,/1\s?600/);
  ui.get("end").value="";ui.get("end-date").value="";
  await ui.submit("item-form");assert.equal(ui.get("editor").open,false);assert.equal(ui.get("timer").hidden,true);
  assert.match(ui.get("total").textContent,/1\s?600/);assert.match(ui.get("time-total").textContent,/1 ч 25 мин/);
  assert.match(ui.get("rows").textContent,/Работа до запуска сайта/);
  await ui.click("new-invoice");ui.get("invoice-start").value="2026-09-30";ui.get("invoice-end").value="2026-09-30";
  ui.get("invoice-start").dispatchEvent(new ui.window.Event("input"));assert.match(ui.get("invoice-preview").textContent,/1\s?600/);
  if (!cloud) {
    const saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));assert.equal(saved.items.length,1);
    assert.equal(saved.items[0].started_at,"2026-09-30T20:50:00.000Z");assert.equal(saved.items[0].ended_at,"2026-09-30T22:15:00.000Z");
    const restored=await app({items:saved.items});assert.match(restored.get("total").textContent,/1\s?600/);
    restored.document.querySelector('[aria-label="Изменить задачу"]').click();assert.equal(restored.get("duration-fields").hidden,true);
    restored.setTime("end","2026-10-01T01:25");await restored.submit("item-form");assert.match(restored.get("total").textContent,/1\s?800/);
  }
});

test("DOM: неверная длительность и сбой записи не сохраняют старую задачу",async()=>{
  const ui=await app({items:[]});await ui.click("add-completed");ui.get("item-title").value="Старая задача";
  for (const [hours,minutes] of [["0","0"],["-1","10"],["0","60"],["168","1"],["1.5","0"],["","10"]]) {
    ui.get("spent-hours").value=hours;ui.get("spent-minutes").value=minutes;await ui.submit("item-form");
    assert.equal(ui.get("editor").open,true);assert.equal(ui.get("item-error").hidden,false);
    assert.equal(JSON.parse(ui.storage.getItem(core.STORAGE_KEY)).items.length,0);
  }
  ui.get("spent-hours").value="1";ui.get("spent-minutes").value="0";
  ui.storage.setItem=()=>{throw new Error("QuotaExceededError");};await ui.submit("item-form");
  assert.equal(ui.get("editor").open,true);assert.match(ui.get("item-error").textContent,/QuotaExceeded/);
});

test("DOM: старая задача добавляется при активном таймере; поля формы сбрасываются",async()=>{
  const running={...item,ended_at:null,timer_state:"running",elapsed_ms:0,running_since:item.started_at,timer_version:0};
  const ui=await app({items:[running]});assert.equal(ui.get("add-item").disabled,true);assert.equal(ui.get("add-completed").disabled,false);
  await ui.click("add-completed");ui.get("item-title").value="Старая задача";ui.setTime("start","2026-09-15T10:00");
  ui.get("spent-hours").value="2";ui.get("spent-minutes").value="0";await ui.submit("item-form");
  const saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));assert.equal(saved.items.length,2);assert.equal(saved.items.filter(core.activeTimer).length,1);
  assert.deepEqual(saved.items.find(i=>i.id===running.id),core.validateItem(running));assert.match(ui.get("total").textContent,/2\s?400/);
  await ui.click("tab-plan");assert.equal(ui.get("add-completed").hidden,true);await ui.click("add-item");
  assert.equal(ui.get("duration-fields").hidden,true);assert.equal(ui.get("spent-hours").required,false);
  ui.get("editor").close();await ui.click("timer-finish");await ui.click("tab-work");await ui.click("add-item");
  assert.equal(ui.get("duration-fields").hidden,true);assert.equal(ui.get("start").disabled,false);assert.equal(ui.get("end").required,false);
});

test("DOM: новая работа запускает таймер без ввода окончания",async()=>{
  const ui=await app();assert.match(ui.get("total").textContent,/400/);assert.equal(ui.get("demo-banner").hidden,false);
  await ui.click("add-item");assert.equal(ui.get("editor").open,true);
  assert.equal(ui.get("end-label").hidden,true);assert.equal(ui.get("end").required,false);assert.equal(ui.get("end-date").required,false);
  ui.get("item-title").value="Новый блок";ui.setTime("start",core.localInput(Date.now()-60000));
  ui.get("end").value="";ui.get("end-date").value="";
  await ui.submit("item-form");assert.equal(ui.get("editor").open,false);
  let saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));assert.equal(saved.items.length,2);
  const running=saved.items.find(i=>i.title==="Новый блок");assert.equal(running.timer_state,"running");assert.equal(running.ended_at,null);
  await ui.click("timer-finish");saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));
  assert.equal(saved.items.find(i=>i.id===running.id).timer_state,"finished");assert.ok(saved.items.find(i=>i.id===running.id).ended_at);
  assert.match(ui.get("rows").textContent,/Бесплатно/);
});

test("DOM: счёт, выгрузка с итогом, оплата и история; новые задачи остаются в журнале",async()=>{
  const ui=await app();await ui.click("new-invoice");assert.equal(ui.get("invoice-dialog").open,true);
  ui.get("invoice-start").value="2026-10-18";ui.get("invoice-end").value="2026-10-18";ui.get("invoice-start").dispatchEvent(new ui.window.Event("input"));
  assert.match(ui.get("invoice-preview").textContent,/ИТОГО/);assert.match(ui.get("invoice-preview").textContent,/400/);
  await ui.submit("invoice-form");assert.equal(ui.get("invoice-dialog").open,false);assert.equal(ui.get("tab-invoices").getAttribute("aria-pressed"),"true");
  assert.match(ui.get("invoice-list").textContent,/Ожидает оплаты/);ui.document.querySelector('[aria-label="Скачать таблицу счёта"]').click();
  assert.match(await ui.downloadBlob.text(),/ИТОГО/);assert.match(await ui.downloadBlob.text(),/Шапка сайта/);
  await ui.click("tab-work");assert.equal(ui.get("rows").children.length,1);assert.match(ui.get("rows").textContent,/В счёте/);assert.equal(ui.get("rows").querySelectorAll("button").length,0);
  await ui.click("add-item");ui.get("item-title").value="Следующий период";ui.setTime("start",core.localInput(Date.now()-60000));await ui.submit("item-form");
  await ui.click("tab-invoices");ui.document.querySelector('[aria-label="Отметить счёт оплаченным"]').click();assert.equal(ui.get("confirm-title").textContent,"Подтвердить оплату?");
  ui.get("confirm-dialog").close("delete");await settle();
  const saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));assert.ok(saved.invoices[0].paid_at);assert.equal(saved.items.length,2);
  await ui.click("tab-work");assert.equal(ui.get("rows").children.length,1);assert.match(ui.get("rows").textContent,/Следующий период/);assert.match(ui.get("total").textContent,/^0/);
  await ui.click("tab-history");assert.match(ui.get("invoice-list").textContent,/Оплачен/);assert.match(ui.get("invoice-list").textContent,/Шапка сайта/);assert.equal(ui.document.querySelector('[aria-label="Отметить счёт оплаченным"]'),null);
  assert.equal(ui.document.querySelector('[aria-label="Удалить счёт"]'),null);
  const restored=await app({items:saved.items,invoices:saved.invoices});await restored.click("tab-history");assert.match(restored.get("invoice-list").textContent,/400/);
});

test("DOM: посетитель скачивает историю без возможности менять оплату",async()=>{
  const invoice=core.createInvoice({projects:[project],items:[item]},{id:randomUUID(),start:"2026-10-18",end:"2026-10-18"});
  const ui=await app({cloud:true,invoices:[invoice]});assert.equal(ui.get("new-invoice").hidden,true);
  await ui.click("tab-invoices");assert.equal(ui.document.querySelector('[aria-label="Отметить счёт оплаченным"]'),null);
  assert.equal(ui.document.querySelector('[aria-label="Удалить счёт"]'),null);
  assert.ok(ui.document.querySelector('[aria-label="Скачать таблицу счёта"]'));
});

test("DOM: удаление счёта после подтверждения сохраняет задачи и позволяет выставить их снова",async()=>{
  const invoice=core.createInvoice({projects:[project],items:[item]},{id:randomUUID(),start:"2026-10-18",end:"2026-10-18"});
  const ui=await app({invoices:[invoice]});await ui.click("tab-invoices");
  const remove=()=>ui.document.querySelector('[aria-label="Удалить счёт"]').click();
  remove();assert.equal(ui.get("confirm-title").textContent,"Удалить счёт?");assert.match(ui.get("confirm-text").textContent,/Задачи останутся в журнале/);
  ui.get("confirm-dialog").close("cancel");await settle();assert.equal(JSON.parse(ui.storage.getItem(core.STORAGE_KEY)).invoices.length,1);
  remove();ui.get("confirm-dialog").close("delete");await settle();
  const saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));assert.equal(saved.invoices.length,0);assert.deepEqual(saved.items,[core.validateItem(item)]);
  assert.equal(ui.get("count-invoices").textContent,"0");assert.match(ui.get("invoice-list").textContent,/Пока нет счетов/);
  await ui.click("tab-work");assert.doesNotMatch(ui.get("rows").textContent,/В счёте/);assert.ok(ui.document.querySelector('[aria-label="Изменить задачу"]'));
  await ui.click("new-invoice");ui.get("invoice-start").value="2026-10-18";ui.get("invoice-end").value="2026-10-18";
  await ui.submit("invoice-form");assert.equal(JSON.parse(ui.storage.getItem(core.STORAGE_KEY)).invoices.length,1);
});

test("DOM: сбой удаления и оплата в другой вкладке сохраняют счёт и показывают ошибку",async()=>{
  const invoice=core.createInvoice({projects:[project],items:[item]},{id:randomUUID(),start:"2026-10-18",end:"2026-10-18"});
  for (const paid of [false,true]) {
    const ui=await app({invoices:[invoice]});await ui.click("tab-invoices");ui.document.querySelector('[aria-label="Удалить счёт"]').click();
    if (paid) {const saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));saved.invoices[0].paid_at=new Date().toISOString();ui.storage.setItem(core.STORAGE_KEY,JSON.stringify(saved));}
    else ui.storage.setItem=()=>{throw new Error("QuotaExceededError");};
    ui.get("confirm-dialog").close("delete");await settle();
    assert.equal(JSON.parse(ui.storage.getItem(core.STORAGE_KEY)).invoices.length,1);assert.equal(ui.get("notice").hidden,false);
    assert.match(ui.get("notice").textContent,paid?/Оплаченный счёт нельзя удалить/:/QuotaExceeded/);
    assert.doesNotMatch(ui.get("notice").textContent,/Счёт удалён/);
  }
});

test("DOM: ошибка сохранения счёта остаётся видимой, пустой период нельзя выставить",async()=>{
  const ui=await app();await ui.click("new-invoice");
  ui.get("invoice-start").value="2026-10-01";ui.get("invoice-end").value="2026-10-01";ui.get("invoice-start").dispatchEvent(new ui.window.Event("input"));
  assert.equal(ui.get("invoice-submit").disabled,true);
  ui.get("invoice-start").value="2026-10-18";ui.get("invoice-end").value="2026-10-18";ui.get("invoice-start").dispatchEvent(new ui.window.Event("input"));
  assert.equal(ui.get("invoice-submit").disabled,false);ui.storage.setItem=()=>{throw new Error("QuotaExceededError");};
  await ui.submit("invoice-form");assert.equal(ui.get("invoice-dialog").open,true);assert.equal(ui.get("invoice-error").hidden,false);assert.match(ui.get("invoice-error").textContent,/QuotaExceeded/);
  assert.equal(JSON.parse(ui.storage.getItem(core.STORAGE_KEY)).invoices.length,0);
});
test("DOM: план создаётся без дат, отмечается выполненным и переносится в журнал",async()=>{
  const ui=await app();await ui.click("tab-plan");await ui.click("add-item");
  assert.equal(ui.get("time-fields").hidden,true);ui.get("item-title").value="Проверить форму";
  await ui.submit("item-form");assert.match(ui.get("plan-total").textContent,/01/);
  ui.document.querySelector('[aria-label="Отметить выполненной"]').click();await settle();assert.match(ui.get("plan-total").textContent,/00/);
  ui.document.querySelector('[aria-label="Запустить таймер по задаче"]').click();
  assert.equal(ui.get("end-label").hidden,true);
  ui.setTime("start",core.localInput(Date.now()-25*60000));ui.get("end").value="";await ui.submit("item-form");
  const saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));assert.equal(saved.items.length,2);assert.equal(saved.items.filter(i=>i.kind==="plan").length,0);assert.equal(ui.get("tab-work").getAttribute("aria-pressed"),"true");
});
test("DOM: неверный интервал не закрывает форму и не сохраняется",async()=>{
  const ui=await app();ui.document.querySelector('[aria-label="Изменить задачу"]').click();ui.get("item-title").value="Ошибка времени";
  ui.setTime("start","2026-10-18T14:00");ui.setTime("end","2026-10-18T13:00");await ui.submit("item-form");
  assert.equal(ui.get("editor").open,true);assert.equal(ui.get("item-error").hidden,false);assert.match(ui.get("item-error").textContent,/позже начала/);
  assert.equal(JSON.parse(ui.storage.getItem(core.STORAGE_KEY)).items.length,1);
});
test("DOM: посетитель и чужой аккаунт видят список без действий редактирования",async()=>{
  const ui=await app({cloud:true});assert.equal(ui.get("rows").children.length,1);
  for(const id of ["add-item","add-completed","import","manage-projects"])assert.equal(ui.get(id).hidden,true);
  assert.equal(ui.document.querySelectorAll(".journal__actions button").length,0);
  await ui.session({user:{id:"stranger"}});assert.equal(ui.get("add-item").hidden,true);
});
test("DOM: выход владельца закрывает редактор и скрывает изменения",async()=>{
  const ui=await app({cloud:true,session:{user:{id:owner}}});assert.equal(ui.get("add-item").hidden,false);
  await ui.click("add-item");assert.equal(ui.get("editor").open,true);
  await ui.session(null);assert.equal(ui.get("editor").open,false);assert.equal(ui.get("add-item").hidden,true);assert.equal(ui.get("rows").children.length,1);
});

for (const message of ['permission denied for table worktime_items','new row violates row-level security policy for table "worktime_items"']) test(`DOM: отказ базы владельцу при удалении: ${message}`,async()=>{
  const ui=await app({cloud:true,session:{user:{id:owner}},writeError:{code:"42501",message}});
  ui.document.querySelector('[aria-label="Удалить задачу"]').click();
  ui.get("confirm-dialog").close("delete");await settle();
  assert.match(ui.get("notice").textContent,/supabase.sql/);
  assert.ok(ui.get("notice").textContent.includes(message));
  assert.doesNotMatch(ui.get("notice").textContent,/Войдите своим аккаунтом/);
  assert.equal(ui.get("rows").children.length,1);
  assert.equal(ui.get("logout").hidden,false);
});

test("DOM: отказ RLS посетителю предлагает войти и сохраняет причину",async()=>{
  const ui=await app({cloud:true});
  const message=vm.runInContext('errorText({code:"42501",message:"new row violates row-level security policy"})',ui.context);
  assert.match(message,/Войдите своим аккаунтом/);
  assert.match(message,/row-level security/);
});

test("DOM: отказ прав при сохранении владельцем оставляет введённые данные в форме",async()=>{
  const ui=await app({cloud:true,session:{user:{id:owner}},writeError:{code:"42501",message:"permission denied for table worktime_items"}});
  ui.document.querySelector('[aria-label="Изменить задачу"]').click();
  ui.get("item-title").value="Сохранить введённый текст";
  await ui.submit("item-form");
  assert.equal(ui.get("editor").open,true);
  assert.equal(ui.get("item-title").value,"Сохранить введённый текст");
  assert.match(ui.get("item-error").textContent,/supabase.sql/);
  assert.match(ui.get("item-error").textContent,/permission denied for table worktime_items/);
  assert.doesNotMatch(ui.get("item-error").textContent,/Войдите своим аккаунтом/);
  assert.match(ui.get("rows").textContent,/Шапка сайта/);
});
test("DOM: после настройки SQL можно повторить подключение кнопкой обновления",async()=>{
  const ui=await app({cloud:true,missingSchema:true});assert.match(ui.get("notice").textContent,/supabase.sql/);assert.equal(ui.get("refresh").disabled,false);
  ui.enableSchema();await ui.click("refresh");assert.equal(ui.get("rows").children.length,1);assert.equal(ui.get("export").disabled,false);
});
test("DOM: названия задач отображаются текстом, поиск не влияет на сводку",async()=>{
  const ui=await app({items:[{...item,title:'<img src=x onerror="alert(1)">'}]});
  assert.equal(ui.get("rows").querySelectorAll("img").length,0);ui.get("search").value="нет совпадений";ui.get("search").dispatchEvent(new ui.window.Event("input"));
  assert.equal(ui.get("rows").children.length,0);assert.match(ui.get("total").textContent,/400/);
});
test("DOM: пуск с выбранным временем, пауза после перезагрузки, продолжение и завершение",async()=>{
  const ui=await app({items:[]});await ui.click("add-item");assert.equal(ui.get("editor").open,true);
  assert.equal(ui.get("end-label").hidden,true);assert.equal(ui.get("end").required,false);
  ui.get("item-title").value="Задача с таймером";ui.setTime("start",core.localInput(Date.now()-25*60000));
  await ui.submit("item-form");assert.equal(ui.get("editor").open,false);assert.equal(ui.get("timer").hidden,false);
  assert.equal(ui.get("add-item").disabled,true);assert.match(ui.get("timer-clock").textContent,/00:25:/);
  assert.match(ui.get("total").textContent,/^0/);
  await ui.click("timer-toggle");assert.match(ui.get("timer-status").textContent,/НА ПАУЗЕ/);
  let saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));assert.equal(saved.items[0].timer_state,"paused");
  const restored=await app({items:saved.items});assert.match(restored.get("timer-status").textContent,/НА ПАУЗЕ/);
  assert.equal(restored.get("timer-clock").textContent,ui.get("timer-clock").textContent);
  await restored.click("timer-toggle");assert.match(restored.get("timer-status").textContent,/В РАБОТЕ/);
  await restored.click("timer-finish");assert.equal(restored.get("timer").hidden,true);assert.equal(restored.get("add-item").disabled,false);
  assert.match(restored.get("total").textContent,/400/);
  saved=JSON.parse(restored.storage.getItem(core.STORAGE_KEY));assert.equal(saved.items[0].timer_state,"finished");assert.equal(saved.items.length,1);
  restored.document.querySelector('[aria-label="Изменить задачу"]').click();restored.get("item-note").value="Исправлено примечание";
  assert.equal(restored.get("end-label").hidden,true);restored.get("end").value="";restored.get("end-date").value="";
  await restored.submit("item-form");const edited=JSON.parse(restored.storage.getItem(core.STORAGE_KEY)).items[0];
  assert.equal(edited.elapsed_ms,saved.items[0].elapsed_ms);assert.equal(edited.ended_at,saved.items[0].ended_at);
  assert.equal(edited.note,"Исправлено примечание");
});
test("DOM: таймер запускается из планов; пауза и завершение не создают дублей",async()=>{
  const plan={...item,kind:"plan",started_at:null,ended_at:null};
  const ui=await app({items:[plan]});await ui.click("tab-plan");ui.document.querySelector('[aria-label="Запустить таймер по задаче"]').click();
  await ui.submit("item-form");let saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));
  assert.equal(saved.items[0].id,plan.id);assert.equal(saved.items[0].timer_state,"running");assert.equal(saved.items[0].kind,"work");
  assert.equal(ui.get("tab-work").getAttribute("aria-pressed"),"true");
  await ui.click("timer-toggle");await ui.click("timer-finish");saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));
  assert.equal(saved.items.length,1);assert.equal(saved.items[0].timer_state,"finished");assert.equal(saved.items[0].note,plan.note);
});
test("DOM: будущее начало отклоняется, посетителю недоступны кнопки таймера",async()=>{
  const ui=await app();await ui.click("add-item");ui.get("item-title").value="Ошибка запуска";
  ui.setTime("start",core.localInput(Date.now()+3600000));await ui.submit("item-form");
  assert.equal(ui.get("editor").open,true);assert.match(ui.get("item-error").textContent,/в будущем/);
  const running={...item,ended_at:null,timer_state:"running",elapsed_ms:0,running_since:item.started_at,timer_version:0};
  const visitor=await app({cloud:true,items:[running]});assert.equal(visitor.get("timer").hidden,false);
  assert.equal(visitor.get("timer-controls").hidden,true);assert.equal(visitor.get("add-item").hidden,true);
});

test("DOM: активный таймер блокирует новую работу, но позволяет добавлять планы",async()=>{
  const running={...item,ended_at:null,timer_state:"running",elapsed_ms:0,running_since:item.started_at,timer_version:0};
  const ui=await app({items:[running]});assert.equal(ui.get("add-item").disabled,true);
  await ui.click("tab-plan");assert.equal(ui.get("add-item").disabled,false);
  await ui.click("add-item");ui.get("item-title").value="Будущая задача";await ui.submit("item-form");
  const saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY));assert.equal(saved.items.length,2);
  assert.equal(saved.items.filter(core.activeTimer).length,1);assert.equal(saved.items.find(i=>i.kind==="plan").title,"Будущая задача");
  await ui.click("tab-work");assert.equal(ui.get("add-item").disabled,true);
});

for (const cloud of [false,true]) test(`DOM: переименование работающего и приостановленного таймера (${cloud?"облако":"демо"})`,async()=>{
  const started_at=new Date(Date.now()-25*60000-12345).toISOString();
  const running={...item,started_at,ended_at:null,timer_state:"running",elapsed_ms:0,running_since:started_at,timer_version:0};
  for (const state of ["running","paused"]) {
    const task=state==="running"?running:core.transitionTimer(running,"pause");
    const otherProject={...project,id:randomUUID(),name:"Другой проект"};
    const ui=await app({cloud,session:cloud?{user:{id:owner}}:null,items:[task],projects:[project,otherProject]});
    const edit=ui.document.querySelector('[aria-label="Изменить задачу"]');
    assert.ok(edit,"У активной задачи доступно редактирование");edit.click();
    assert.equal(ui.get("editor").open,true);assert.equal(ui.get("end-label").hidden,true);
    for (const id of ["start","start-date","end","end-date"]) assert.equal(ui.get(id).disabled,true);
    ui.get("item-title").value=`Новое название ${state}`;ui.get("item-note").value="Новые детали";ui.get("item-project").value=otherProject.id;
    ui.get("end").value="";ui.get("end-date").value="";
    await ui.submit("item-form");
    assert.equal(ui.get("editor").open,false);assert.equal(ui.get("item-error").hidden,true);
    assert.equal(ui.get("timer-title").textContent,`Новое название ${state}`);
    assert.match(ui.get("timer-project").textContent,/Другой проект/);
    assert.match(ui.get("rows").textContent,/Новые детали/);
    if (!cloud) {
      const saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY)).items;
      assert.equal(saved.length,1);
      assert.deepEqual(saved[0],core.validateItem({...task,title:`Новое название ${state}`,note:"Новые детали",project_id:otherProject.id}));
    }
    await ui.click("tab-plan");await ui.click("timer-edit");
    assert.equal(ui.get("editor").open,true);assert.equal(ui.get("item-title").value,`Новое название ${state}`);
  }
});

test("DOM: время отображается и сохраняется по МСК в 24-часовом формате",async()=>{
  const ui=await app();
  assert.match(ui.get("rows").textContent,/13:00 — 13:25/);
  ui.document.querySelector('[aria-label="Изменить задачу"]').click();
  assert.equal(ui.get("start-date").value,"2026-10-18");assert.equal(ui.get("start").value,"13:00");
  ui.setTime("start","2026-10-18T21:13");ui.setTime("end","2026-10-18T21:38");await ui.submit("item-form");
  const saved=JSON.parse(ui.storage.getItem(core.STORAGE_KEY)).items[0];
  assert.equal(saved.started_at,"2026-10-18T18:13:00.000Z");assert.equal(saved.ended_at,"2026-10-18T18:38:00.000Z");
  assert.match(ui.get("rows").textContent,/21:13 — 21:38/);assert.match(ui.get("total").textContent,/400/);
  await ui.click("add-item");ui.setTime("start","2026-10-18T24:00");await ui.submit("item-form");
  assert.equal(ui.get("editor").open,true);assert.match(ui.get("item-error").textContent,/МСК/);
  assert.equal(JSON.parse(ui.storage.getItem(core.STORAGE_KEY)).items.length,1);
});

const pastedImage = "data:image/png;base64,aGVsbG8=";
async function paste(ui, files = [], text = "") {
  const event = new ui.window.Event("paste", {bubbles:true,cancelable:true});
  event.clipboardData = {items:files.map(file=>({kind:"file",type:file.type,getAsFile:()=>file})),files,getData:()=>text};
  ui.get("item-note").dispatchEvent(event); await settle(); return event;
}
for (const cloud of [false,true]) test(`DOM: Ctrl+V прикрепляет фото, просмотр и удаление (${cloud?"облако":"демо"})`,async()=>{
  const ui=await app({cloud,session:cloud?{user:{id:owner}}:null,items:[]});
  vm.runInContext('encodePhoto = async file => file.encoded',ui.context);
  await ui.click("tab-plan");await ui.click("add-item");ui.get("item-title").value="По скриншоту";
  const text=await paste(ui,[],"Описание");assert.equal(text.defaultPrevented,false);
  const image=await paste(ui,[{type:"image/png",encoded:pastedImage}]);assert.equal(image.defaultPrevented,true);
  assert.equal(ui.get("item-photos").querySelectorAll("img").length,1);
  await ui.submit("item-form");assert.equal(ui.get("editor").open,false);
  assert.equal(ui.get("rows").querySelector("img").src,pastedImage);
  ui.get("rows").querySelector('[aria-label="Открыть фото 1"]').click();assert.equal(ui.get("photo-viewer").open,true);
  assert.equal(ui.get("photo-full").src,pastedImage);ui.get("photo-viewer").close();assert.equal(ui.get("photo-full").hasAttribute("src"),false);
  ui.document.querySelector('[aria-label="Запустить таймер по задаче"]').click();
  assert.equal(ui.get("item-photos").querySelectorAll("img").length,1);await ui.submit("item-form");
  await ui.click("timer-edit");assert.equal(ui.get("item-photos").querySelectorAll("img").length,1);
  ui.get("item-photos").querySelector('[aria-label="Удалить фото 1"]').click();await ui.submit("item-form");
  assert.equal(ui.get("rows").querySelectorAll("img").length,0);
  await ui.click("timer-edit");assert.equal(ui.get("item-photos").querySelectorAll("img").length,0);
});
test("DOM: лимит, отмена и ошибка записи сохраняют правильный набор фото",async()=>{
  const ui=await app({items:[]});await ui.click("tab-plan");await ui.click("add-item");
  vm.runInContext('encodePhoto = async file => file.encoded',ui.context);
  ui.get("item-title").value="Не потерять";
  const file={type:"image/png",encoded:pastedImage};
  await paste(ui,Array(5).fill(file));await paste(ui,[file]);
  assert.equal(ui.get("item-photos").querySelectorAll("img").length,5);assert.match(ui.get("item-error").textContent,/до 5/);
  const write=ui.storage.setItem;ui.storage.setItem=()=>{throw new Error("QuotaExceededError");};
  await ui.submit("item-form");assert.equal(ui.get("editor").open,true);assert.equal(ui.get("item-photos").querySelectorAll("img").length,5);
  ui.storage.setItem=write;ui.get("editor").close();await ui.click("add-item");assert.equal(ui.get("item-photos").querySelectorAll("img").length,0);
  vm.runInContext('encodePhoto = async () => { throw new Error("Не удалось прочитать фото."); }',ui.context);
  await paste(ui,[file]);assert.equal(ui.get("item-photos").querySelectorAll("img").length,0);assert.match(ui.get("item-error").textContent,/прочитать фото/);
});
