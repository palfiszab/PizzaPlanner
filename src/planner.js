function poolishHours(temp, style, flourType){
  let h = style==='fast'?7.5:style==='normal'?10:12;
  if(temp>=26) h-=3; else if(temp>=24) h-=2; else if(temp>=22) h-=1; else if(temp<=19) h+=2;
  if(flourType==='durum') h+=1.5;
  return Math.max(5,h);
}
function benchBeforeBake(temp){return temp>=26?120:temp>=24?150:165}
function yeast(poolishFlour,temp,style){
  const kg=poolishFlour/1000; let perKg;
  if(style==='fast') perKg=temp>=26?2.0:temp>=24?2.4:3.0;
  else if(style==='normal') perKg=temp>=26?0.32:temp>=24?0.42:temp>=22?0.52:0.62;
  else perKg=temp>=24?0.18:0.24;
  return Math.max(0.04, kg*perKg);
}
function processDurations(){
  return { mix:30, autolyse:20, saltOil:15, rest:20, lamination:5, restBetweenFolds:25, restBeforeBalling:30, balling:15, fridgeBuffer:10 };
}

const TOTAL_HOURS = {fast:24,normal:36,long:48};
function plan(start, bake, options){
  if(!Number.isFinite(+start)||!Number.isFinite(+bake)) throw new Error('Érvénytelen időpont.');
  const hours=(bake-start)/3600000;
  if(hours<=0) throw new Error('A sütés időpontja legyen későbbi a kezdésnél.');
  if(!options.fixedInterval && hours<TOTAL_HOURS[options.style]) throw new Error(`A kiválasztott tervhez legalább ${TOTAL_HOURS[options.style]} óra kell; most ${Math.round(hours*100)/100} óra áll rendelkezésre.`);
  const d=processDurations(), poolish=new Date(start);
  const mix=addMin(poolish,poolishHours(options.temp,options.style,options.flourType)*60);
  const salt=addMin(mix,d.mix+d.autolyse), rest=addMin(salt,d.saltOil);
  const lam1=addMin(rest,d.rest),restAfterLam1=addMin(lam1,d.lamination);
  const lam2=addMin(restAfterLam1,d.restBetweenFolds),restAfterLam2=addMin(lam2,d.lamination);
  const ball=addMin(restAfterLam2,d.restBeforeBalling);
  const fridgeIn=addMin(ball,d.balling+d.fridgeBuffer),out=addMin(bake,-benchBeforeBake(options.temp));
  const cold=(out-fridgeIn)/3600000;
  // Operational planning limits, not a validated fermentation model.
  if(cold<1 || cold>48) throw new Error('Ebben a prototípusban 1–48 óra hidegérlelés tervezhető. Módosítsd az időpontokat vagy az időtartamot.');
  return {poolish,mix,salt,rest,lam1,restAfterLam1,lam2,restAfterLam2,ball,fridgeIn,out,bake:new Date(bake)};
}
function waterSplit(finalWater){
  if(!Number.isFinite(finalWater)||finalWater<0) throw new Error('A poolish vize meghaladja a teljes vízmennyiséget.');
  const saltWater=Math.min(finalWater,25,Math.round(finalWater*.22));
  return {saltWater,firstWater:finalWater-saltWater};
}
function addMin(d,m){return new Date(d.getTime()+m*60000)}
const PizzaPlanner={plan,waterSplit,TOTAL_HOURS};
if(typeof module!=='undefined') module.exports=PizzaPlanner;
