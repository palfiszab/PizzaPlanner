const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context=vm.createContext({Date,Intl,TextEncoder});
for(const name of ['planner','profiles','reminders'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),context);
const run=s=>vm.runInContext(s,context);
// Doses below are synthetic test inputs, not baking recommendations.
run(`var base={profile:'naples',method:'biga',quantity:'flour',flour:1000,poolishPct:50,bigaHydration:45,bigaHours:18,bigaTemp:18,bigaYeastPct:.2,hydration:62,salt:2.8,oil:0,yeastPct:.1,bulkHours:16,bulkTemp:16,longYeastPct:.05,count:4,ballWeight:250,width:30,length:40,density:.5,temp:22,fridge:5,flourType:'00',style:'normal'}; var start=new Date('2026-10-24T12:00');`);
let count=0;
for(const profile of ['naples','roman'])for(const hydration of [40,45,50])for(const foldMode of ['lamination','two','none'])for(const hours of [36,48]){
 Object.assign(context,{profile,hydration,foldMode,hours});
 run('var c={...base,profile,bigaHydration:hydration,foldMode}; var result=recipePlan(start,addMin(start,hours*60),c);');
 assert.equal(run('result.amounts.prefermentFlour'),500);
 assert.equal(run('result.amounts.prefermentWater'),500*hydration/100);
 assert.equal(run('result.amounts.prefermentWater+result.amounts.finalWater'),620);
 assert.equal(run('result.amounts.prefermentFlour+result.amounts.finalFlour'),1000);
 assert.equal(run('result.yeast'),1);
 assert.equal(run("(result.events.find(e=>e.id==='bigaCheck').time-result.events.find(e=>e.id==='bigaRest').time)/3600000"),18);
 assert.equal(run('(result.mix-start)/60000'),18*60+20);
 assert(!run("result.events.some(e=>e.id==='poolish')"));
 assert(run('result.events.every((e,i,a)=>!i||e.time>=a[i-1].time)'));
 assert.equal(run('result.totalHours'),hours);count++;
}
for(const profile of ['naples','round','roman'])for(const foldMode of ['lamination','two','none'])for(const hours of [24,36,48]){
 Object.assign(context,{profile,foldMode,hours});
 run("var c={...base,profile,method:'direct',directVariant:'long',foldMode}; var result=recipePlan(start,addMin(start,hours*60),c);");
 const duration=run("(result.events.find(e=>e.id==='bulkCheck').time-result.events.find(e=>e.id==='salt').time)/60000-15");
 assert.equal(duration,16*60);
 assert.equal(run('result.yeast'),.5);
 assert.equal(run('result.longDirect'),true);
 assert.equal(run('result.totalHours'),hours);
 assert.equal(run("result.events.some((e,i,a)=>i>0&&!e.active&&!a[i-1].active)"),false);
 if(foldMode!=='none')assert(run("result.events.find(e=>e.id==='rest2').minutes>=30"));count++;
}
for(const [field,value] of [['bigaHydration',39],['bigaHydration',51],['bigaHours',7],['bigaHours',25],['bigaTemp',NaN],['bigaYeastPct',NaN],['bigaYeastPct',0]]){
 context.field=field;context.value=value;assert.throws(()=>run('recipePlan(start,addMin(start,36*60),{...base,[field]:value})'));
}
assert.throws(()=>run("recipePlan(start,addMin(start,24*60),base)"));
assert.throws(()=>run("recipePlan(start,addMin(start,36*60),{...base,method:'direct',directVariant:'long',longYeastPct:NaN})"));
assert.throws(()=>run("recipePlan(start,addMin(start,36*60),{...base,method:'direct',directVariant:'long',bulkHours:1})"));
assert.throws(()=>run("recipePlan(start,addMin(start,36*60),{...base,profile:'round'})"));
// Changing the planned biga maturity shifts mixing and cold duration, not baking.
run('var r18=recipePlan(start,addMin(start,36*60),base),r20=recipePlan(start,addMin(start,36*60),{...base,bigaHours:20});');
assert.equal(run('(r20.mix-r18.mix)/3600000'),2);assert.equal(run('r18.cold-r20.cold'),2);
run("var q=reminderQueue(r18.events,new Set(['biga','bigaCheck','mix']),10,+start-3600000);");
assert.equal(run("q.filter(e=>e.key.endsWith(':due')).length"),3);
const ics=run("calendarText(r18.events,new Set(['biga','bigaCheck','mix']),10,new Date(+start-3600000),'biga-test')");
assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,3);assert(ics.includes('ADY'));
console.log(`${count} új eljárás/időtartam kombináció, biga vízmérleg, önálló ADY-adagolás, első fermentáció teljes ideje, hibás adatok és naptár: OK`);
