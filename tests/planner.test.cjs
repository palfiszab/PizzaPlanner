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
console.log(`${count} korábbi idővonal és a vízmegosztás: OK`);
