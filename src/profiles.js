// Experimental household profiles; see docs/PROFILES.md for sources and adaptations.
const PIZZA_PROFILES={
 legacy:{get name(){return PizzaText.t("m055")},hydration:61,salt:3,oil:8,methods:['poolish'],foldDefault:'lamination',pan:false,get note(){return PizzaText.t("m056")}},
 naples:{get name(){return PizzaText.t("m057")},hydration:62,salt:2.8,oil:0,methods:['direct','poolish','biga'],foldDefault:'lamination',pan:false,get note(){return PizzaText.t("m058")}},
 round:{get name(){return PizzaText.t("m059")},hydration:62.5,salt:3.1,oil:31,methods:['direct'],foldDefault:'two',ballWeight:220,pan:false,get note(){return PizzaText.t("m060")}},
 roman:{get name(){return PizzaText.t("m061")},hydration:75,salt:2.5,oil:25,methods:['direct','biga'],foldDefault:'two',pan:true,get note(){return PizzaText.t("m062")}}
};
function doughAmounts(c){
 const profile=PIZZA_PROFILES[c.profile]; if(!profile) throw new Error(PizzaText.t("m063"));
 let target=null;
 if(c.quantity==='pieces') target=c.count*c.ballWeight;
 else if(c.quantity==='pan') target=c.count*c.width*c.length*c.density;
 const ratio=1+c.hydration/100+c.salt/100+c.oil/1000;
 const flour=target===null?c.flour:target/ratio;
 const water=flour*c.hydration/100,salt=flour*c.salt/100,oil=flour*c.oil/1000;
 const pf=['poolish','biga'].includes(c.method)?flour*c.poolishPct/100:0;
 const prefermentWater=c.method==='biga'?pf*c.bigaHydration/100:pf;
 if(![flour,water,salt,oil,pf].every(Number.isFinite)||flour<=0||pf>=flour||!Number.isFinite(prefermentWater)||pf<0||prefermentWater<0||prefermentWater>water) throw new Error(PizzaText.t("m064"));
 return {flour,water,salt,oil,poolishFlour:pf,poolishWater:prefermentWater,prefermentFlour:pf,prefermentWater,finalFlour:flour-pf,finalWater:water-prefermentWater,total:flour+water+salt+oil,target};
}
function recipePlan(start,bake,c){
 const p=PIZZA_PROFILES[c.profile]; if(!p||!p.methods.includes(c.method)) throw new Error(PizzaText.t("m065"));
 if(!Number.isFinite(+start)||!Number.isFinite(+bake)||bake<=start) throw new Error(PizzaText.t("m066"));
 validateProcedure(c);
 const longDirect=c.method==='direct'&&c.directVariant==='long';
 const foldMode=c.foldMode??p.foldDefault;
 if(!['lamination','two','none'].includes(foldMode)) throw new Error(PizzaText.t("m067"));
 const a=doughAmounts(c), events=[];
 const event=(id,time,label,minutes,detail,active=true)=>events.push({id,time:new Date(time),label,minutes,detail,active});
 let at=new Date(start);
 if(c.method==='biga'){
  const y=a.prefermentFlour*c.bigaYeastPct/100;
  event('biga',at,PizzaText.t("m068"),15,PizzaText.t("m069", [g(a.prefermentFlour), g(a.prefermentWater), g(y,2)]));
  event('bigaRest',addMin(at,15),PizzaText.t("m070"),c.bigaHours*60,PizzaText.t("m071", [g(c.bigaHours), g(c.bigaTemp)]),false);
  at=addMin(at,15+c.bigaHours*60);
  event('bigaCheck',at,PizzaText.t("m072"),5,PizzaText.t("m073"));
  at=addMin(at,5);
 }
 if(c.method==='poolish'){
  const y=yeast(a.poolishFlour,c.temp,c.style);
  event('poolish',at,PizzaText.t("m074"),15,PizzaText.t("m075", [g(a.poolishFlour), g(a.poolishWater), g(y,2)]));
  at=addMin(at,poolishHours(c.temp,c.style,c.flourType)*60);
 }
 const mix=at, split=waterSplit(a.finalWater), directYeast=a.flour*(longDirect?c.longYeastPct:c.yeastPct)/100;
 event('mix',at,PizzaText.t("m076"),30,PizzaText.t("m080", [c.method==='poolish'?PizzaText.t("m077"):c.method==='biga'?PizzaText.t("m078"):'', g(a.finalFlour), g(split.firstWater), c.method==='direct'?PizzaText.t("m079", [g(directYeast,2)]):'']));
 at=addMin(at,30); event('mixRest',at,PizzaText.t("m081"),20,PizzaText.t("m082"),false);
 at=addMin(at,20); event('salt',at,PizzaText.t("m083"),15,PizzaText.t("m084", [g(a.salt), g(split.saltWater), g(a.oil)]));
 at=addMin(at,15);
 const bulkStart=new Date(at), bulkEnd=longDirect?addMin(bulkStart,c.bulkHours*60):null;
 const finalRestMinutes=()=>longDirect?(bulkEnd-at)/60000:30;
 if(foldMode!=='none'){
  const laminate=foldMode==='lamination';
  event('rest',at,laminate?PizzaText.t("m085"):PizzaText.t("m086"),20,PizzaText.t("m082"),false); at=addMin(at,20);
  event('fold1',at,laminate?PizzaText.t("m087"):PizzaText.t("m088"),5,laminate?PizzaText.t("m089"):PizzaText.t("m090"));
  at=addMin(at,5); event('rest1',at,PizzaText.t("m091"),25,PizzaText.t("m092"),false);
  at=addMin(at,25); event('fold2',at,laminate?PizzaText.t("m093"):PizzaText.t("m094"),5,laminate?PizzaText.t("m095"):PizzaText.t("m096"));
  at=addMin(at,5);
  const restMinutes=finalRestMinutes();
  if(restMinutes<30) throw new Error(PizzaText.t("m097"));
  event('rest2',at,longDirect?PizzaText.t("m098"):PizzaText.t("m099"),restMinutes,longDirect?PizzaText.t("m100", [g(restMinutes), g(c.bulkTemp), g(c.bulkHours)]):PizzaText.t("m101"),false); at=addMin(at,restMinutes);
 }else{const restMinutes=finalRestMinutes();event('bulkRest',at,longDirect?PizzaText.t("m102"):p.pan?PizzaText.t("m103"):PizzaText.t("m104"),restMinutes,longDirect?PizzaText.t("m105", [g(c.bulkHours), g(c.bulkTemp)]):PizzaText.t("m106"),false);at=addMin(at,restMinutes)}
 if(longDirect) event('bulkCheck',at,PizzaText.t("m107"),5,PizzaText.t("m108"));
 if(longDirect) at=addMin(at,5);
 if(!p.pan){event('ball',at,PizzaText.t("m109"),15,c.quantity==='pieces'?PizzaText.t("m110", [c.count, g(a.total/c.count)]):PizzaText.t("m111"));at=addMin(at,25)}
 const fridgeIn=new Date(at),out=addMin(bake,-(p.pan?240:benchBeforeBake(c.temp))),cold=(out-fridgeIn)/3600000;
 if(cold<1||cold>48){
  const earliest=(fridgeIn-start)/3600000+(bake-out)/3600000+1;
  throw new Error(PizzaText.t("m112", [g(earliest,2)]));
 }
 event('fridge',fridgeIn,PizzaText.t("m113"),5,PizzaText.t("m116", [c.fridge, p.pan?PizzaText.t("m114"):PizzaText.t("m115"), g(cold,1)]));
 event('out',out,PizzaText.t("m117"),5,PizzaText.t("m118"));
 if(p.pan){event('divide',addMin(out,30),PizzaText.t("m119"),15,PizzaText.t("m120", [c.count, g(a.total/c.count)]));event('shape',addMin(bake,-45),PizzaText.t("m121"),15,PizzaText.t("m122"));event('panRest',addMin(bake,-30),PizzaText.t("m123"),30,PizzaText.t("m124"),false)}
 if(c.profile==='round') event('roll',addMin(bake,-15),PizzaText.t("m125"),15,PizzaText.t("m126"));
 event('preheat',addMin(bake,-60),PizzaText.t("m127"),5,PizzaText.t("m128"));
 event('bake',bake,PizzaText.t("m129"),0,p.pan?PizzaText.t("m130"):c.profile==='round'?PizzaText.t("m131"):PizzaText.t("m132"));
 events.sort((a,b)=>a.time-b.time);
 return {events,foldMode,longDirect,amounts:a,cold,mix,yeast:c.method==='poolish'?yeast(a.poolishFlour,c.temp,c.style):c.method==='biga'?a.prefermentFlour*c.bigaYeastPct/100:directYeast,totalHours:(bake-start)/3600000};
}
function validateProcedure(c){
 const range=(name,value,min,max)=>{if(!Number.isFinite(value)||value<min||value>max)throw new Error(PizzaText.t("m133", [name, min, max]))};
 if(c.method==='direct'&&c.directVariant==='long'){
  range(PizzaText.t("m134"),c.bulkHours,2,24);
  range(PizzaText.t("m135"),c.bulkTemp,16,24);
  range(PizzaText.t("m136"),c.longYeastPct,.01,1);
 }
 if(c.method==='biga'){
  range(PizzaText.t("m137"),c.poolishPct,5,70);
  range(PizzaText.t("m138"),c.bigaHydration,40,50);
  range(PizzaText.t("m139"),c.bigaHours,8,24);
  range(PizzaText.t("m140"),c.bigaTemp,16,20);
  range(PizzaText.t("m141"),c.bigaYeastPct,.01,2);
 }
}
function g(n,d=1){return Number(n.toFixed(d)).toLocaleString(PizzaText.locale,{maximumFractionDigits:d})}
if(typeof module!=='undefined') module.exports={PIZZA_PROFILES,doughAmounts,recipePlan};
