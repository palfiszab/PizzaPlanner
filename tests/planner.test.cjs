const assert=require('node:assert/strict');
const {plan,waterSplit,TOTAL_HOURS}=require('../src/planner.js');
let count=0;
for(const style of Object.keys(TOTAL_HOURS)) for(const temp of [16,19,22,24,26,30]) for(const flourType of ['00','durum','strong']){
 const start=new Date('2026-10-24T12:00:00'),bake=new Date(+start+TOTAL_HOURS[style]*3600000);
 const tl=plan(start,bake,{style,temp,flourType});
 const dates=Object.values(tl).map(Number);
 assert(dates.every((v,i)=>i===0||v>dates[i-1]));
 assert.equal((tl.bake-tl.poolish)/3600000,TOTAL_HOURS[style]);
 assert.equal((tl.restAfterLam1-tl.lam1)/60000,5);
 assert.equal((tl.lam2-tl.restAfterLam1)/60000,25);
 assert.equal((tl.lam1-tl.rest)/60000,20);
 assert.equal((tl.restAfterLam2-tl.lam2)/60000,5);
 assert.equal((tl.ball-tl.restAfterLam2)/60000,30);
 count++;
}
for(const water of [0,1,5,10,25,110,1000]) {const w=waterSplit(water); assert.equal(w.saltWater+w.firstWater,water); assert(w.firstWater>=0&&w.saltWater>=0)}
const options={style:'normal',temp:22,flourType:'00'}, start=new Date('2026-10-20T12:00');
for(const h of [-1,0,12,35,100]) assert.throws(()=>plan(start,new Date(+start+h*3600000),options));
assert.throws(()=>plan(new Date('invalid'),start,options));
assert.throws(()=>waterSplit(-1));
// Exercise UI handlers and input parsing without a browser dependency.
const vm=require('node:vm'), fs=require('node:fs');
const values={mode:'start',style:'normal',startDate:'2026-10-20T12:00',bakeDate:'2026-10-22T00:00',flourTotal:'1000',poolishFlour:'500',hydration:'61',saltPct:'3',oil:'8',roomTemp:'22',fridgeTemp:'5',flourType:'00',availability:''};
const els={}; for(const [id,value] of Object.entries(values)) els[id]={value,disabled:false,checkValidity:()=>true,addEventListener(){}};
for(const id of ['calc','results','timingHelp']) els[id]={addEventListener(){},replaceChildren(){this.innerHTML=''},append(box){this.error=box.textContent}};
const context=vm.createContext({console,Intl,Date,document:{getElementById:id=>els[id],querySelectorAll:sel=>sel.includes('number')?['flourTotal','poolishFlour','hydration','saltPct','oil','roomTemp','fridgeTemp'].map(id=>els[id]):[],querySelector:()=>({textContent:'Mező'}),createElement:()=>({setAttribute(){}})}});
for(const file of ['messages.js','planner.js','ui.js']) vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../src',file),'utf8'),context);
for(const style of Object.keys(TOTAL_HOURS)) for(const mode of ['start','bake']){
 els.mode.value=mode; els.style.value=style; vm.runInContext('calc()',context);
 assert.equal((new Date(els.bakeDate.value)-new Date(els.startDate.value))/3600000,TOTAL_HOURS[style]);
 assert(els.results.innerHTML.includes('Teljes idő:'));
}
els.mode.value='both'; els.startDate.value='2026-10-20T12:00'; els.bakeDate.value='2026-10-20T13:00'; vm.runInContext('calc()',context); assert(els.results.error.includes('hidegérlelés')); assert.equal(els.results.innerHTML,'');
for(const line of ['ma 25:00-26:00','hibás sor','ma 12:00-12:00','2026-02-30 12:00-13:00']) { context.line=line; assert.throws(()=>vm.runInContext('parseAvailability(line,new Date())',context)) }
assert.equal(vm.runInContext("parseAvailability('ma 22:00–02:00',new Date())[0].e-parseAvailability('ma 22:00–02:00',new Date())[0].s",context),4*3600000);
assert.equal(vm.runInContext("parseAvailability('ma 12:00-13:00\\nma 13:00-14:00',new Date()).length",context),1);
console.log(`${count} idővonal és a vízmegosztás, három UI-mód, hibakezelés, idősávok: OK`);

// Fixed endpoints ignore the previous preset and remain editable.
els.startDate.value='2026-10-20T12:00'; els.bakeDate.value='2026-10-21T18:00';
let previous;
for(const style of ['fast','normal','long']){
 els.style.value=style; vm.runInContext('calc()',context);
 assert.equal(els.style.disabled,true);
 assert.equal(els.startDate.disabled,false); assert.equal(els.bakeDate.disabled,false);
 assert(els.results.innerHTML.includes('Teljes idő: 30 óra'));
 if(previous) assert.equal(els.results.innerHTML,previous);
 previous=els.results.innerHTML;
}
els.mode.value='start'; vm.runInContext('calc()',context); assert.equal(els.style.disabled,false);
console.log('Rögzített időintervallum, profilfüggetlenség, választó visszakapcsolása: OK');
