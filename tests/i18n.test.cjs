const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const catalog=require('../src/locales.js'),huKeys=Object.keys(catalog.hu).sort();
for(const lang of ['hu','en','it','fr','de']){
 assert.deepEqual(Object.keys(catalog[lang]).sort(),huKeys);
 for(const key of huKeys){
  assert(catalog[lang][key].trim(),`${lang}: ${key}`);
  const fields=s=>Array.from(new Set(s.match(/\{\d+\}/g)||[])).sort();
  assert.deepEqual(fields(catalog[lang][key]),fields(catalog.hu[key]),`${lang}: ${key}`);
 }
}
const ctx=vm.createContext({Date,Intl,TextEncoder});
for(const name of ['locales','messages','planner','profiles','reminders','availability'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run("function localValue(d){const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`} var start=new Date('2026-10-24T12:00');var base={profile:'naples',method:'direct',quantity:'pieces',count:4,ballWeight:250,width:30,length:40,density:.5,flour:1000,poolishPct:50,bigaHydration:45,bigaHours:18,bigaTemp:18,bigaYeastPct:.2,hydration:62,salt:2.8,oil:0,yeastPct:.1,bulkHours:16,bulkTemp:16,longYeastPct:.05,temp:22,fridge:5,flourType:'00',style:'normal'};");
let checked=0;
for(const profile of ['legacy','naples','roman','round'])for(const method of profile==='legacy'?['poolish']:profile==='naples'?['direct','poolish','biga']:profile==='roman'?['direct','biga']:['direct'])for(const variant of method==='direct'?['standard','long']:['standard']){
 Object.assign(ctx,{profile,method,variant});
 run("PizzaText.setLanguage('hu');var baseline=recipePlan(start,addMin(start,36*60),{...base,profile,method,directVariant:variant});var times=baseline.events.map(e=>+e.time);");
 for(const lang of ['hu','en','it','fr','de']){
  ctx.lang=lang;run('PizzaText.setLanguage(lang);var result=recipePlan(start,addMin(start,36*60),{...base,profile,method,directVariant:variant});');
  assert.equal(run('JSON.stringify(result.events.map(e=>+e.time))'),run('JSON.stringify(times)'));
  assert.equal(run('JSON.stringify(result.amounts)'),run('JSON.stringify(baseline.amounts)'));
  if(lang!=='hu')assert(!run("result.events.some(e=>/[őű]|Letakarva|liszt|pihenő|hajtogatás/.test(e.label+' '+e.detail))"));
  const ics=run("calendarText(result.events,new Set(result.events.filter(e=>e.active).map(e=>e.id)),10,new Date(+start-3600000),'lang-test')");
  assert(ics.includes(`//${lang.toUpperCase()}`));assert(ics.includes('SUMMARY:PizzaPlanner'));assert(ics.split('\r\n').every(line=>Buffer.byteLength(line)<=75));
  assert.equal(run("reminderQueue(result.events,new Set(['mix']),10,+start-3600000)[0].label"),run("PizzaText.t('m147',[10,result.events.find(e=>e.id==='mix').label])"));
  assert.throws(()=>run("recipePlan(start,new Date(+start-1),base)"),e=>e.message===run("PizzaText.t('m066')"));checked++;
 }
}
for(const line of ['ma','today','oggi',"aujourd’hui",'heute']){ctx.line=line;assert.equal(run("parseAvailability(line+' 18:00-22:00',start)[0].s.getDate()"),24)}
for(const line of ['holnap','tomorrow','domani','demain','morgen']){ctx.line=line;assert.equal(run("parseAvailability(line+' 18:00-22:00',start)[0].s.getDate()"),25)}
for(const line of ['holnapután','day after tomorrow','dopodomani','après-demain','übermorgen']){ctx.line=line;assert.equal(run("parseAvailability(line+' 18:00-22:00',start)[0].s.getDate()"),26)}
for(const line of ['hétfő','Monday','lunedì','lundi','Montag']){ctx.line=line;assert.equal(run("parseAvailability(line+' 18:00-22:00',start)[0].s.getDay()"),1)}
run("PizzaText.setLanguage('en')");assert.throws(()=>run("parseAvailability('bad line',start)"),e=>e.message.includes('line 1'));
assert.throws(()=>run("parseAvailability('2026-02-30 12:00-13:00',start)"));
// Stored language survives reload; unavailable browser storage is harmless.
for(const saved of ['it','unsupported']){
 const fresh=vm.createContext({Intl,localStorage:{getItem:()=>saved,setItem(){}}});
 for(const name of ['locales','messages'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),fresh);
 assert.equal(vm.runInContext('PizzaI18n.language',fresh),saved==='it'?'it':'hu');
}
const blocked=vm.createContext({Intl,localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}});
for(const name of ['locales','messages'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),blocked);
assert(vm.runInContext("PizzaI18n.setLanguage('fr')",blocked));
console.log(`${huKeys.length} teljes fordítási kulcs × 5 nyelv; ${checked} változatlan számítás; lokalizált események, hibák, naptár és többnyelvű idősávok: OK`);
