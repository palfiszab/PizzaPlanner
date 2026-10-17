// Experimental household profiles; see docs/PROFILES.md for sources and adaptations.
const PIZZA_PROFILES={
 legacy:{name:'Saját poolish (v0.3)',hydration:61,salt:3,oil:8,methods:['poolish'],foldDefault:'lamination',pan:false,note:'A megszokott poolish-recept, 20 / 25 / 30 perces pihenőkkel.'},
 naples:{name:'Nápolyi jellegű',hydration:62,salt:2.8,oil:0,methods:['direct','poolish','biga'],foldDefault:'lamination',pan:false,note:'Házi, hidegérleléses adaptáció, nem AVPN-minősített recept. Direkt, poolish vagy kézzel megadott ADY-biga időterv; a hajtogatási eljárás külön választható. A két hajtogatás házi receptváltozat, nem nápolyi követelmény. A sütési hőfokot a sütőd és a recept szerint válaszd meg.'},
 round:{name:'Római kerek – tonda romana',hydration:62.5,salt:3.1,oil:31,methods:['direct'],foldDefault:'two',ballWeight:220,pan:false,note:'Kísérleti, direkt, hidegérleléses házi adaptáció. Vékonyra nyújtott, ropogós pizza. Sütés előtt sodrófával is nyújtható; nem a nápolyi perem megőrzése a cél.'},
 roman:{name:'Római tepsis – in teglia',hydration:75,salt:2.5,oil:25,methods:['direct','biga'],foldDefault:'two',pan:true,note:'Kísérleti direkt, illetve kézzel megadott ADY-bigás házi adaptáció. Kíméletes hajtogatások, egyben hidegérlelés, majd tepsinkénti osztás és nyújtás. Az arányok módosíthatók.'}
};
function doughAmounts(c){
 const profile=PIZZA_PROFILES[c.profile]; if(!profile) throw new Error('Ismeretlen pizzaprofil.');
 let target=null;
 if(c.quantity==='pieces') target=c.count*c.ballWeight;
 else if(c.quantity==='pan') target=c.count*c.width*c.length*c.density;
 const ratio=1+c.hydration/100+c.salt/100+c.oil/1000;
 const flour=target===null?c.flour:target/ratio;
 const water=flour*c.hydration/100,salt=flour*c.salt/100,oil=flour*c.oil/1000;
 const pf=['poolish','biga'].includes(c.method)?flour*c.poolishPct/100:0;
 const prefermentWater=c.method==='biga'?pf*c.bigaHydration/100:pf;
 if(![flour,water,salt,oil,pf].every(Number.isFinite)||flour<=0||pf>=flour||!Number.isFinite(prefermentWater)||pf<0||prefermentWater<0||prefermentWater>water) throw new Error('Az előtészta liszt- és vízmennyisége nem fér bele a teljes receptbe.');
 return {flour,water,salt,oil,poolishFlour:pf,poolishWater:prefermentWater,prefermentFlour:pf,prefermentWater,finalFlour:flour-pf,finalWater:water-prefermentWater,total:flour+water+salt+oil,target};
}
function recipePlan(start,bake,c){
 const p=PIZZA_PROFILES[c.profile]; if(!p||!p.methods.includes(c.method)) throw new Error('Ez az eljárás még nem támogatott ennél a pizzánál.');
 if(!Number.isFinite(+start)||!Number.isFinite(+bake)||bake<=start) throw new Error('Adj meg érvényes kezdést és annál későbbi sütést.');
 validateProcedure(c);
 const longDirect=c.method==='direct'&&c.directVariant==='long';
 const foldMode=c.foldMode??p.foldDefault;
 if(!['lamination','two','none'].includes(foldMode)) throw new Error('Ismeretlen hajtogatási eljárás.');
 const a=doughAmounts(c), events=[];
 const event=(id,time,label,minutes,detail,active=true)=>events.push({id,time:new Date(time),label,minutes,detail,active});
 let at=new Date(start);
 if(c.method==='biga'){
  const y=a.prefermentFlour*c.bigaYeastPct/100;
  event('biga',at,'Biga bekeverése – ADY',15,`${g(a.prefermentFlour)} g liszt + ${g(a.prefermentWater)} g víz + ${g(y,2)} g ADY a megadott receptadagból. Csak egyenletesen morzsásra keverd, ne dagaszd simára. Az ADY előkészítése a gyártó szerint; annak vize is a fenti víz része.`);
  event('bigaRest',addMin(at,15),'Biga tervezett érlelése',c.bigaHours*60,`${g(c.bigaHours)} óra, ${g(c.bigaTemp)} °C-os környezetben, lefedve. Ez kézi ütemezés; az időpont nem garantál érett bigát.`,false);
  at=addMin(at,15+c.bigaHours*60);
  event('bigaCheck',at,'Biga állapotellenőrzése',5,'Ellenőrizd a saját recepted szerinti érettséget. Ha még nem megfelelő, a főtészta dagasztását és a további időpontokat újra kell tervezni.');
  at=addMin(at,5);
 }
 if(c.method==='poolish'){
  const y=yeast(a.poolishFlour,c.temp,c.style);
  event('poolish',at,'Poolish indítása',15,`${g(a.poolishFlour)} g liszt + ${g(a.poolishWater)} g víz + ${g(y,2)} g aktív szárított élesztő (becslés).`);
  at=addMin(at,poolishHours(c.temp,c.style,c.flourType)*60);
 }
 const mix=at, split=waterSplit(a.finalWater), directYeast=a.flour*(longDirect?c.longYeastPct:c.yeastPct)/100;
 event('mix',at,'Dagasztás',30,`${c.method==='poolish'?'Érett poolish + ':c.method==='biga'?'Állapotellenőrzött biga + ':''}${g(a.finalFlour)} g liszt + ${g(split.firstWater)} g víz${c.method==='direct'?` + ${g(directYeast,2)} g aktív szárított élesztő`:''}.`);
 at=addMin(at,30); event('mixRest',at,'Pihenő a bedolgozás után',20,'Letakarva 20 perc.',false);
 at=addMin(at,20); event('salt',at,'Só + olaj',15,`${g(a.salt)} g só, ${g(split.saltWater)} g visszatartott víz, ${g(a.oil)} g olaj. A víz már része a teljes mennyiségnek.`);
 at=addMin(at,15);
 const bulkStart=new Date(at), bulkEnd=longDirect?addMin(bulkStart,c.bulkHours*60):null;
 const finalRestMinutes=()=>longDirect?(bulkEnd-at)/60000:30;
 if(foldMode!=='none'){
  const laminate=foldMode==='lamination';
  event('rest',at,laminate?'Pihenő az első laminálás előtt':'Pihenő az első hajtogatás előtt',20,'Letakarva 20 perc.',false); at=addMin(at,20);
  event('fold1',at,laminate?'1. laminálás – kézi nyújtás és összehajtás':'1. kíméletes hajtogatás',5,laminate?'Munkalapon óvatosan nyújtsd széles, vékony lappá, ameddig szakadás nélkül engedi. Hajtsd össze, majd takard le. Ne használj sodrófát.':'Kíméletes nyújtás és visszahajtás; nem teljes lapra laminálás. Csak amíg a tészta engedi; ne erőltesd.');
  at=addMin(at,5); event('rest1',at,'Pihenő',25,'Letakarva 25 perc; ha feszes, több időre lehet szükség.',false);
  at=addMin(at,25); event('fold2',at,laminate?'2. laminálás (ha szükséges)':'2. kíméletes hajtogatás (ha szükséges)',5,laminate?'Kézzel nyújtsd ki a munkalapon, csak ameddig szakadás nélkül engedi, majd hajtsd össze és takard le. Ha már elég erős vagy ellenáll, hagyd ki; az idő pihenő marad.':'Ha a tészta már elég erős, hagyd ki; az időt töltsd pihenéssel.');
  at=addMin(at,5);
  const restMinutes=finalRestMinutes();
  if(restMinutes<30) throw new Error('Az első fermentációba a műveletek mellett legalább 30 perc utolsó pihenőnek is bele kell férnie.');
  event('rest2',at,longDirect?'Első fermentáció folytatása':'Pihenő az utolsó hajtogatás után',restMinutes,longDirect?`Letakarva ${g(restMinutes)} perc, ${g(c.bulkTemp)} °C-os környezetben; az első fermentáció összesen ${g(c.bulkHours)} óra. Nem automatikus érettségi előrejelzés.`:'Letakarva 30 perc.',false); at=addMin(at,restMinutes);
 }else{const restMinutes=finalRestMinutes();event('bulkRest',at,longDirect?'Hosszú első fermentáció':p.pan?'Pihenő a hidegérlelés előtt':'Pihenő a bucizás előtt',restMinutes,longDirect?`Letakarva ${g(c.bulkHours)} óra, ${g(c.bulkTemp)} °C-os környezetben; kézzel megadott terv, érettségi garancia nélkül.`:'Letakarva 30 perc. Hajtogatás nélküli eljárás; ha a tészta még feszes, pihentesd tovább.',false);at=addMin(at,restMinutes)}
 if(longDirect) event('bulkCheck',at,'Tészta állapotellenőrzése',5,'Ellenőrizd az első fermentáció eredményét a saját recepted alapján. Ha változtatni kell az időn, tervezd újra a hátralévő lépéseket.');
 if(longDirect) at=addMin(at,5);
 if(!p.pan){event('ball',at,'Bucizás',15,c.quantity==='pieces'?`${c.count} db, kb. ${g(a.total/c.count)} g-os buci (élesztő nélkül).`:'Oszd a tésztát a kívánt méretű bucikra.');at=addMin(at,25)}
 const fridgeIn=new Date(at),out=addMin(bake,-(p.pan?240:benchBeforeBake(c.temp))),cold=(out-fridgeIn)/3600000;
 if(cold<1||cold>48){
  const earliest=(fridgeIn-start)/3600000+(bake-out)/3600000+1;
  throw new Error(`A tervezett munkafázisok mellett 1–48 óra hidegérlelés szükséges. A jelenlegi beállításokkal legalább ${g(earliest,2)} óra teljes idő kell. Ellenőrizd az érlelési időket és a kezdés–sütés intervallumát.`);
 }
 event('fridge',fridgeIn,'Hűtőbe helyezés',5,`${c.fridge} °C, lezárt dobozban; ${p.pan?'egyben':'bucizva'}. Tervezett hidegérlelés: ${g(cold,1)} óra.`);
 event('out',out,'Kivétel a hűtőből',5,'Letakarva hagyd melegedni; a tényleges állapot alapján dolgozz tovább.');
 if(p.pan){event('divide',addMin(out,30),'Osztás tepsinként',15,`${c.count} adag, kb. ${g(a.total/c.count)} g/adag (élesztő nélkül). Lazán formázd, letakarva pihentesd.`);event('shape',addMin(bake,-45),'Tepsibe nyújtás',15,'Olajozott tepsiben finoman nyújtsd. Ha visszaugrik, tarts szünetet.');event('panRest',addMin(bake,-30),'Pihenő a tepsiben',30,'Letakarva, a feltétek előkészítésével; a sütés kezdete rögzített.',false)}
 if(c.profile==='round') event('roll',addMin(bake,-15),'Sodrófás nyújtás és feltétezés',15,'A bucikat lisztezett munkalapon, sodrófával nyújtsd egyenletesen vékony, kb. 30 cm-es koronggá (220 g-os bucinál kiindulás). Ha visszaugrik, pihentesd; ne erőltesd. A megadott idő az első pizza előkészítésére vonatkozik.');
 event('preheat',addMin(bake,-60),'Sütő előmelegítése',5,'A sütő használati útmutatója szerint; kő/acél átmelegedésére hagyj elegendő időt.');
 event('bake',bake,'Sütés kezdete',0,p.pan?'Feltétezés és sütés a saját sütődben kipróbált hőfokon; figyeld az alj és a teteje színét.':c.profile==='round'?'Az első vékony római pizza sütése a saját sütődben kipróbált beállítással. A további pizzák sorban készülnek; külön sütési ütemezés még nincs.':'Nyújtás és feltétezés; a peremet kíméld. Sütés a sütődben kipróbált beállítással.');
 events.sort((a,b)=>a.time-b.time);
 return {events,foldMode,longDirect,amounts:a,cold,mix,yeast:c.method==='poolish'?yeast(a.poolishFlour,c.temp,c.style):c.method==='biga'?a.prefermentFlour*c.bigaYeastPct/100:directYeast,totalHours:(bake-start)/3600000};
}
function validateProcedure(c){
 const range=(name,value,min,max)=>{if(!Number.isFinite(value)||value<min||value>max)throw new Error(`${name}: ${min}–${max} közötti értéket adj meg.`)};
 if(c.method==='direct'&&c.directVariant==='long'){
  range('Hosszú első fermentáció ideje',c.bulkHours,2,24);
  range('Első fermentáció környezete',c.bulkTemp,16,24);
  range('ADY az összlisztre vetítve (saját receptből)',c.longYeastPct,.01,1);
 }
 if(c.method==='biga'){
  range('Előtészta lisztaránya',c.poolishPct,5,70);
  range('Biga hidratációja',c.bigaHydration,40,50);
  range('Biga tervezett érlelési ideje',c.bigaHours,8,24);
  range('Biga környezete',c.bigaTemp,16,20);
  range('ADY a biga lisztjére vetítve (saját receptből)',c.bigaYeastPct,.01,2);
 }
}
function g(n,d=1){return Number(n.toFixed(d)).toLocaleString('hu-HU',{maximumFractionDigits:d})}
if(typeof module!=='undefined') module.exports={PIZZA_PROFILES,doughAmounts,recipePlan};
