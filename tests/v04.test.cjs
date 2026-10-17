const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx=vm.createContext({console,Date,Intl,TextEncoder});
for(const name of ['planner','profiles','reminders'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run(`var base={profile:'legacy',method:'poolish',quantity:'flour',flour:1000,poolishPct:50,hydration:61,salt:3,oil:8,yeastPct:.1,count:4,ballWeight:250,width:30,length:40,density:.5,temp:22,fridge:5,flourType:'00',style:'normal'}; var start=new Date('2026-10-24T12:00:00');`);
let count=0;
for(const profile of ['legacy','naples','round','roman'])for(const method of profile==='legacy'?['poolish']:profile==='naples'?['direct','poolish']:['direct'])for(const hours of [24,36,48])for(const temp of [16,22,30]){
 ctx.p=profile;ctx.m=method;ctx.h=hours;ctx.temp=temp;
 run(`var c={...base,profile:p,method:m,temp,style:h===24?'fast':h===36?'normal':'long',hydration:p==='roman'?75:61,quantity:p==='roman'?'pan':'pieces',count:p==='roman'?1:4}; var result=recipePlan(start,addMin(start,h*60),c);`);
 assert.equal(run('result.totalHours'),hours);
 assert(run('result.events.every((e,i,a)=>!i||e.time>=a[i-1].time)'));
 assert(run('result.cold>=1&&result.cold<=48'));
 assert.equal(run("result.events.some(e=>e.id==='fold1')"),true);
 assert.equal(run("result.events.some(e=>e.id==='shape')"),profile==='roman');
 {
  assert.equal(run("(result.events.find(e=>e.id==='rest1').time-result.events.find(e=>e.id==='fold1').time)/60000"),5);
  assert.equal(run("(result.events.find(e=>e.id==='fold2').time-result.events.find(e=>e.id==='rest1').time)/60000"),25);
 }
 assert(Math.abs(run('result.amounts.total')-(profile==='roman'?600:1000))<1e-7);count++;
}
// Folding is an independent procedure for every supported recipe pair.
for(const profile of ['legacy','naples','round','roman'])for(const method of profile==='legacy'?['poolish']:profile==='naples'?['direct','poolish']:['direct']){
 ctx.p=profile;ctx.m=method;
 run(`var folded=recipePlan(start,addMin(start,36*60),{...base,profile:p,method:m,foldMode:'two'}); var plain=recipePlan(start,addMin(start,36*60),{...base,profile:p,method:m,foldMode:'none'});`);
 assert.equal(run("plain.events.filter(e=>e.id==='fold1'||e.id==='fold2'||e.id==='rest').length"),0);
 assert.equal(run("plain.events.find(e=>e.id==='bulkRest').minutes"),30);
 assert.equal(run("(plain.events.find(e=>e.id==='bulkRest').time-plain.events.find(e=>e.id==='salt').time)/60000"),15);
 assert.equal(run("(folded.events.find(e=>e.id==='fold1').time-folded.events.find(e=>e.id==='rest').time)/60000"),20);
 assert.equal(run("(folded.events.find(e=>e.id==='fold2').time-folded.events.find(e=>e.id==='rest1').time)/60000"),25);
 assert.equal(run("(folded.events.find(e=>e.id==='rest2').time-folded.events.find(e=>e.id==='fold2').time)/60000"),5);
 assert(Math.abs(run('(plain.cold-folded.cold)*60')-55)<1e-7);
 assert.equal(run('plain.totalHours'),run('folded.totalHours'));
 assert.equal(run("plain.events.some((e,i,a)=>i>0&&!e.active&&!a[i-1].active)"),false);
}
assert.throws(()=>run("recipePlan(start,addMin(start,36*60),{...base,foldMode:'invalid'})"));
assert.throws(()=>run("recipePlan(start,addMin(start,60),base)"));
assert.throws(()=>run("recipePlan(start,addMin(start,36*60),{...base,profile:'roman',method:'poolish'})"));
assert.throws(()=>run("doughAmounts({...base,poolishPct:70,hydration:50})"));
assert(Math.abs(run("doughAmounts({...base,quantity:'pan',count:2,width:30,length:40,density:.5}).total")-1200)<1e-7);
run(`var now=Date.UTC(2026,9,24,10), events=[{id:'past',time:new Date(now-1000),active:true,label:'Múlt',minutes:5,detail:''},{id:'mix',time:new Date(now+20*60000),active:true,label:'Dagasztás, só; olaj',minutes:30,detail:'Árvíztűrő tészta '.repeat(30)+'\\nMásodik sor'},{id:'rest',time:new Date(now+25*60000),active:false,label:'Pihenő',minutes:25,detail:''}], selected=new Set(['past','mix','rest']), seen=new Set(); var q=reminderQueue(events,selected,10,now);`);
assert.equal(run('q.length'),2);assert.equal(run('dueReminders(q,now,seen).due.length'),0);
assert.equal(run('dueReminders(q,now+10*60000,seen).due.length'),1);
assert.equal(run('dueReminders(q,now+10*60000,seen).due.length'),0);
assert.equal(run('dueReminders(q,now+30*60000,seen).missed.length'),1);
assert.equal(run('reminderQueue(events,new Set(),10,now).length'),0);
assert.equal(run('reminderQueue(events,selected,0,now).length'),1);
const ics=run("calendarText(events,selected,10,new Date(now),'test')");
assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,1);assert.equal((ics.match(/BEGIN:VALARM/g)||[]).length,2);
assert(ics.includes('TRIGGER:-PT10M'));assert(ics.includes('DTSTART:20261024T102000Z'));assert(ics.includes('UID:test-mix@pizzaplanner.local'));
assert(ics.split('\r\n').every(line=>Buffer.byteLength(line)<=75));
assert(ics.replace(/\r\n /g,'').includes('Dagasztás\\, só\\; olaj'));assert(!ics.includes('UID:test-past'));
console.log(`${count} profil/időtartam/hőmérséklet kombináció, mennyiségek, pihenők, értesítési sor, elmulasztott jelzések és UTF-8 naptárexport: OK`);

run("var roundPlan=recipePlan(start,addMin(start,36*60),{...base,profile:'round',method:'direct'});");
assert.equal(run("roundPlan.events.find(e=>e.id==='roll').minutes"),15);
assert.equal(run("(roundPlan.events.find(e=>e.id==='bake').time-roundPlan.events.find(e=>e.id==='roll').time)/60000"),15);
assert(!run("roundPlan.events.find(e=>e.id==='bake').detail.includes('peremet')"));
assert.throws(()=>run("recipePlan(start,addMin(start,36*60),{...base,profile:'round',method:'poolish'})"));
run("var lam=recipePlan(start,addMin(start,36*60),{...base,profile:'naples',method:'direct',foldMode:'lamination'});");
assert(run("lam.events.find(e=>e.id==='fold1').label.includes('laminálás')"));
assert.equal(run("(lam.events.find(e=>e.id==='fold2').time-lam.events.find(e=>e.id==='rest1').time)/60000"),25);
console.log('Tonda romana: önálló profil, sodrófás lépés; külön laminálási eljárás: OK');
