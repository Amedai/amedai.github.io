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
async function app({cloud=false,session=null,items=[item],projects=[project],missingSchema=false}={}) {
  const {window,document}=parseHTML(html);
  const values=new Map([[core.STORAGE_KEY,JSON.stringify({projects,items})]]);
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
  const cloudData={projects:structuredClone(projects),items:structuredClone(items)};
  const context=vm.createContext({...core,localRepository,cloudRepository:()=>({
    async list(){return structuredClone(cloudData);},
    async saveItem(next){cloudData.items=cloudData.items.filter(i=>i.id!==next.id).concat(core.validateItem(next));}
  }),config:{supabaseUrl:"https://test.supabase.co",supabaseKey:"sb_publishable_test"},window,document,location:{search:cloud?"":"?demo=1"},localStorage:storage,crypto:{randomUUID},URL,URLSearchParams,Blob,setTimeout,clearTimeout,setInterval:()=>1});
  vm.runInContext(source,context,{filename:"app.js"}); await context.initialization;
  return {document,window,storage,context,get:id=>document.getElementById(id),
    setTime(id,value){const [date,time]=value.split("T");document.getElementById(id+"-date").value=date;document.getElementById(id).value=time;},
    async click(id){document.getElementById(id).click();await settle();},
    async submit(id){document.getElementById(id).dispatchEvent(new window.Event("submit",{cancelable:true}));await settle();},
    async session(next){session=next;authCallback("SIGNED_IN",next);await settle();},
    enableSchema(){schemaMissing=false;}
  };
}
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
  for(const id of ["add-item","import","manage-projects"])assert.equal(ui.get(id).hidden,true);
  assert.equal(ui.document.querySelectorAll(".journal__actions button").length,0);
  await ui.session({user:{id:"stranger"}});assert.equal(ui.get("add-item").hidden,true);
});
test("DOM: выход владельца закрывает редактор и скрывает изменения",async()=>{
  const ui=await app({cloud:true,session:{user:{id:owner}}});assert.equal(ui.get("add-item").hidden,false);
  await ui.click("add-item");assert.equal(ui.get("editor").open,true);
  await ui.session(null);assert.equal(ui.get("editor").open,false);assert.equal(ui.get("add-item").hidden,true);assert.equal(ui.get("rows").children.length,1);
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
