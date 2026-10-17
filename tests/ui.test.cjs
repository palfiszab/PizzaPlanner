// UI event-handler integration in an isolated DOM model (no browser notifications).
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
class Element{
 set value(value){this._value=String(value)}
 get value(){return this._value}
 constructor(tag='div'){this.tag=tag;this.value='';this.textContent='';this.children=[];this.parentElement={hidden:false};this.disabled=false;this.checked=false;this.listeners={};this.options=[]}
 append(el){this.children.push(el);el.parentElement=this}
 replaceChildren(){this.children=[];this.textContent=''}
 setAttribute(){}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
 change(){for(const fn of this.listeners.change||[])fn()}
 click(){for(const fn of this.listeners.click||[])fn()}
 remove(){this.parentElement.children=this.parentElement.children.filter(e=>e!==this)}
 get firstElementChild(){return this.children[0]}
 checkValidity(){const v=+this.value;return v>=this.min&&v<=this.max&&Math.abs((v-this.min)/this.step-Math.round((v-this.min)/this.step))<1e-6}
}
const elements={},allElements=[],root=new Element('root'),stack=[root];
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
for(const token of html.matchAll(/<[^>]*>|[^<]+/g)){
 const raw=token[0];
 if(raw.startsWith('</')){stack.pop();continue}
 if(raw.startsWith('<!'))continue;
 if(!raw.startsWith('<')){stack[stack.length-1].textContent+=decode(raw);continue}
 const tag=raw.match(/^<(\w+)/)[1],el=new Element(tag),attrs={};
 for(const a of raw.matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=decode(a[2]);
 el.attrs=attrs;el.dataset={};
 for(const [key,value] of Object.entries(attrs))if(key.startsWith('data-'))el.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;
 el.id=attrs.id;el.type=attrs.type;el.value=attrs.value||'';
 for(const key of ['min','max','step'])el[key]=+attrs[key];
 if(el.id)elements[el.id]=el;allElements.push(el);stack[stack.length-1].append(el);
 if(!['meta','link','input','br','hr'].includes(tag))stack.push(el);
}
for(const el of allElements.filter(e=>e.tag==='select')){el.options=el.children.filter(e=>e.tag==='option');el.value=el.options[0].value}
let now=Date.UTC(2026,9,17,12), intervals=new Map(),seq=0;
class FakeDate extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
const body=allElements.find(e=>e.tag==='body'),storage=new Map();
const doc={body,documentElement:allElements.find(e=>e.tag==='html'),hidden:false,getElementById:id=>elements[id],createElement:tag=>new Element(tag),addEventListener(){},
 querySelectorAll:selector=>allElements.filter(e=>selector==='[data-i18n]'?e.dataset.i18n:selector==='[data-i18n-placeholder]'?e.dataset.i18nPlaceholder:selector.includes('number')?e.type==='number':['input','select','textarea'].includes(e.tag)),
 querySelector:selector=>{const id=selector.match(/for="([^"]+)"/)[1];return allElements.find(e=>e.tag==='label'&&e.attrs.for===id)}
};
const ctx=vm.createContext({console,Intl,Date:FakeDate,TextEncoder,localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},document:doc,window:{isSecureContext:false},setInterval:fn=>{intervals.set(++seq,fn);return seq},clearInterval:id=>intervals.delete(id),setTimeout:fn=>fn(),Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}}});
for(const name of ['locales','messages','planner','profiles','reminders','availability','ui'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),allText=el=>el.textContent+el.children.map(allText).join(' ');
assert(run('current!==null'),allText(elements.results));
for(const mode of ['start','bake'])for(const style of ['fast','normal','long']){
 elements.mode.value=mode;elements.style.value=style;run('calc()');assert.equal(run('current.totalHours'),{fast:24,normal:36,long:48}[style]);assert.equal(elements.style.disabled,false);
}
elements.mode.value='both';elements.startDate.value='2026-10-17T12:00';elements.bakeDate.value='2026-10-18T18:00';run('calc()');assert.equal(elements.style.disabled,true);assert.equal(run('current.totalHours'),30);
assert(allText(elements.results).includes('már elmúlt'));
for(const profile of ['naples','roman','round','legacy']){elements.profile.value=profile;elements.profile.change();assert(run('current!==null'),allText(elements.results));assert.equal(run('current.c.profile'),profile)}
// Procedure changes replace both the timeline and running reminders.
elements.profile.value='naples';elements.profile.change();assert.equal(elements.foldMode.value,'lamination');
elements.mode.value='start';elements.startDate.value='2026-10-20T12:00';run('calc()');elements.startReminders.click();
elements.foldMode.value='none';elements.foldMode.change();
assert.equal(run('current.foldMode'),'none');assert.equal(run("queue.some(e=>e.event.id==='fold1'||e.event.id==='fold2')"),false);
assert.equal(run("current.events.some(e=>e.label.includes('laminálás'))"),false);
assert.equal(run("current.events.find(e=>e.id==='bulkRest').minutes"),30);assert.equal(run('running'),true);
elements.foldMode.value='two';elements.foldMode.change();assert(run("queue.some(e=>e.event.id==='fold1')"));
elements.stopReminders.click();elements.profile.value='legacy';elements.profile.change();
elements.mode.value='start';elements.startDate.value='2026-10-18T12:00';run('calc()');
elements.startReminders.click();assert.equal(run('running'),true);assert.equal(intervals.size,1);
const oldStart=run('+current.start');elements.startDate.value='2026-10-19T12:00';elements.startDate.change();assert(run('+current.start')>oldStart);assert(run('queue.every(e=>+e.event.time>=+current.start)'));assert.equal(intervals.size,1);
// Advance to the first alert. It must appear once, even if checked repeatedly.
now=run('queue[0].at');run('tick()');const alerts=elements.alerts.children.length;assert(alerts>0);run('tick()');assert.equal(elements.alerts.children.length,alerts);
elements.stopReminders.click();assert.equal(run('running'),false);assert.equal(intervals.size,0);
// An invalid recipe clears the usable plan and stops all timers.
elements.startReminders.click();elements.poolishPct.value='70';elements.poolishPct.change();assert.equal(run('current'),null);assert.equal(run('running'),false);assert.equal(elements.exportCalendar.disabled,true);assert.equal(intervals.size,0);
elements.poolishPct.value='50';elements.poolishPct.change();assert(run('current!==null'));
// Disable every future choice: no timer may start.
run("for(const e of current.events)choices.set(e.id,false)");elements.startReminders.click();assert.equal(run('running'),false);
// Export skips past steps and never needs OS permission.
run("for(const e of current.events)choices.set(e.id,true)");elements.exportCalendar.click();assert(elements.reminderStatus.textContent.includes('naptárfájl'));
console.log('Felületi eseménykezelők: profilok, 3 időzítési mód, múltbeli kezdés, emlékeztető indítás/csere/leállítás, hibás terv, üres kijelölés, export: OK');

elements.profile.value='round';elements.profile.change();
assert.equal(elements.ballWeight.value,'220');assert.equal(elements.quantity.value,'pieces');
assert.equal(elements.method.value,'direct');assert(run("current.events.some(e=>e.id==='roll')"));
assert.equal(run('current.c.hydration'),62.5);
elements.startReminders.click();assert(run("queue.some(e=>e.event.id==='roll')"));
elements.profile.value='roman';elements.profile.change();assert(!run("queue.some(e=>e.event.id==='roll')"));
elements.stopReminders.click();
console.log('Tonda romana: alapértékek, profilváltás és emlékeztetők: OK');
// v0.5 experimental workflows require an explicitly entered ADY dose.
elements.profile.value='naples';elements.profile.change();elements.mode.value='start';elements.startDate.value='2026-10-24T12:00';elements.style.value='normal';
elements.method.value='biga';elements.method.change();
assert.equal(run('current'),null);assert.equal(elements.bigaYeastPct.disabled,false);assert.equal(elements.yeastPct.disabled,true);assert.equal(elements.longYeastPct.disabled,true);
elements.bigaYeastPct.value='.2';elements.bigaYeastPct.change();assert.equal(run('current.c.method'),'biga');
assert(Math.abs(run('current.yeast')-run('current.amounts.prefermentFlour*.002'))<1e-9);
elements.startReminders.click();assert(run("queue.some(e=>e.event.id==='bigaCheck')"));
elements.bigaHours.value='20';elements.bigaHours.change();assert(run('running'));assert.equal(run('current.c.bigaHours'),20);
elements.method.value='direct';elements.method.change();assert(!run("queue.some(e=>e.event.id==='biga')"));
elements.directVariant.value='long';elements.directVariant.change();assert.equal(run('current'),null);assert(!run('running'));assert.equal(elements.longYeastPct.disabled,false);
elements.longYeastPct.value='.05';elements.longYeastPct.change();assert(run('current.longDirect'));assert.equal(elements.bigaYeastPct.disabled,true);
elements.startReminders.click();assert(run("queue.some(e=>e.event.id==='bulkCheck')"));
elements.directVariant.value='standard';elements.directVariant.change();assert(!run('current.longDirect'));assert(!run("queue.some(e=>e.event.id==='bulkCheck')"));
// Invalid hidden experimental fields do not break an unrelated recipe.
elements.bigaYeastPct.value='';elements.longYeastPct.value='';run('calc()');assert(run('current!==null'));
elements.stopReminders.click();
console.log('v0.5 felület: üres ADY-adag blokkolása, biga/direkt-váltás, mezők, futó emlékeztetők cseréje: OK');
// Language changes preserve inputs, selections, timer count and delivered reminders.
elements.profile.value='naples';elements.profile.change();elements.mode.value='start';elements.startDate.value='2026-10-26T12:00';elements.availability.value='ma 18:00-22:00';run('calc()');
elements.startReminders.click();
now=run('queue[0].at');run('tick()');
const inputSnapshot=()=>JSON.stringify(Object.fromEntries(Object.entries(elements).filter(([id,e])=>e.tag==='input'||e.tag==='select'||e.tag==='textarea').filter(([id])=>id!=='language').map(([id,e])=>[id,e.value,e.checked])));
const beforeInputs=inputSnapshot(),beforeTimes=run('JSON.stringify(current.events.map(e=>+e.time))'),beforeChoices=run('JSON.stringify(Array.from(selectedIds()))'),beforeSeen=run('JSON.stringify(Array.from(seen))'),beforeAlerts=elements.alerts.children.length;
for(const lang of ['it','fr','de','en','hu']){
 elements.language.value=lang;elements.language.change();
 assert.equal(doc.documentElement.lang,lang);assert.equal(storage.get('pizzaplanner.language'),lang);
 assert.equal(inputSnapshot(),beforeInputs);assert.equal(run('JSON.stringify(current.events.map(e=>+e.time))'),beforeTimes);
 assert.equal(run('JSON.stringify(Array.from(selectedIds()))'),beforeChoices);assert.equal(run('JSON.stringify(Array.from(seen))'),beforeSeen);
 assert.equal(intervals.size,1);assert.equal(elements.alerts.children.length,beforeAlerts);assert(run('running'));
 assert.equal(elements.calc.textContent,run("PizzaText.t('m209')"));
 assert.equal(allText(elements.results).includes(run("PizzaText.t('m076')")),true);
 assert.equal(elements.reminderStatus.textContent,run("PizzaText.t('m051')"));
 assert(!elements.alerts.children.some(e=>lang!=='hu'&&/[őű]|Dagasztás|ideje/.test(e.textContent)));
}
elements.stopReminders.click();
// Invalid experimental input remains entered and its error changes language.
elements.method.value='biga';elements.bigaYeastPct.value='';elements.method.change();assert.equal(run('current'),null);
elements.language.value='en';elements.language.change();assert.equal(elements.bigaYeastPct.value,'');assert.equal(run('current'),null);assert(allText(elements.results).includes('check the entered value'));
console.log('Nyelvváltás: mezők, időpontok, kijelölések, futó időzítő, már kézbesített jelzések és hibás bevitel megőrzése: OK');

// Browser APIs are mocked: this verifies control flow, not audible sound or OS delivery.
(async()=>{
 let delivered=0,tones=0,resumed=0;
 class FakeNotification{static permission='granted';constructor(title,options){delivered++;assert.equal(title,'PizzaPlanner');assert.equal(options.body,run("PizzaText.t('test.title')"));}}
 ctx.Notification=ctx.window.Notification=FakeNotification;
 ctx.window.AudioContext=class{constructor(){this.currentTime=0;this.destination={};}async resume(){resumed++;}createOscillator(){return {frequency:{},connect(){},start(){tones++;},stop(){}};}createGain(){return {gain:{},connect(){}};}};
 elements.sound.checked=true;
 const count=elements.alerts.children.length;
 await elements.testAlert.listeners.click[0]();
 assert.equal(delivered,1);assert.equal(tones,1);assert.equal(resumed,1);assert.equal(elements.alerts.children.length,Math.min(10,count+1));
 assert.equal(run('running'),false);assert.equal(intervals.size,0);assert.equal(run('current'),null);
 // A browser may leave resume() pending: visible and OS alerts must still fire immediately.
 let releaseAudio;
 run('audio').resume=()=>new Promise(resolve=>{releaseAudio=resolve;});
 const pending=elements.testAlert.listeners.click[0]();
 assert.equal(delivered,2);assert.equal(tones,1);
 assert(elements.alerts.children.at(-1).textContent.includes(run("PizzaText.t('test.title')")));
 assert.equal(intervals.size,0);assert.equal(run('running'),false);
 releaseAudio();await pending;assert.equal(tones,2);
 FakeNotification.permission='denied';elements.sound.checked=false;
 await elements.testAlert.listeners.click[0]();assert.equal(delivered,2);assert.equal(tones,2);
 delete ctx.window.Notification;delete ctx.Notification;
 await elements.testAlert.listeners.click[0]();assert.equal(delivered,2);assert.equal(tones,2);
 console.log('Próbajelzés: hang és értesítési API utánzattal, tiltott/nem támogatott értesítés, terv és időzítő nélkül: OK');
})().catch(error=>{console.error(error);process.exitCode=1;});
