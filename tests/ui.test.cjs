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
const elements={};
for(const m of html.matchAll(/<(\w+)\b[^>]*\bid="([^"]+)"[^>]*>/g)){
 const [raw,tag,id]=m,el=new Element(tag);el.id=id;el.type=(raw.match(/type="([^"]+)"/)||[])[1];el.value=(raw.match(/value="([^"]+)"/)||[])[1]||'';
 for(const key of ['min','max','step'])el[key]=+(raw.match(new RegExp(key+'="([^"]+)"'))||[])[1];
 if(tag==='select'){const section=html.slice(m.index+raw.length).split('</select>')[0];el.options=Array.from(section.matchAll(/<option value="([^"]+)">/g),o=>({value:o[1],disabled:false}));el.value=el.options[0].value}
 elements[id]=el;
}
let now=Date.UTC(2026,9,17,12), intervals=new Map(),seq=0;
class FakeDate extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
const body=new Element('body');
const doc={body,hidden:false,getElementById:id=>elements[id],createElement:tag=>new Element(tag),addEventListener(){},querySelectorAll:selector=>Object.values(elements).filter(e=>selector.includes('number')?e.type==='number':['input','select','textarea'].includes(e.tag)),querySelector:selector=>({textContent:selector})};
const ctx=vm.createContext({console,Intl,Date:FakeDate,TextEncoder,document:doc,window:{isSecureContext:false},setInterval:fn=>{intervals.set(++seq,fn);return seq},clearInterval:id=>intervals.delete(id),setTimeout:fn=>fn(),Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}}});
for(const name of ['messages','planner','profiles','reminders','availability','ui'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),ctx);
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
