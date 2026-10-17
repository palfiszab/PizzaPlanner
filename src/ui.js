const $=id=>document.getElementById(id);
const DAY_NAMES=['vasárnap','hétfő','kedd','szerda','csütörtök','péntek','szombat'];
function pad(n){return String(n).padStart(2,'0')}
function localValue(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
function fmt(d){return new Intl.DateTimeFormat(PizzaMessages.locale,{year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit'}).format(d)}
function subMin(d,m){return addMin(d,-m)}
function text(parent,tag,value,className){const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;parent.append(el);return el}
let current=null, running=false, queue=[], seen=new Set(), timer=null, audio=null;
const choices=new Map();
let calendarId='plan-'+Date.now().toString(36);
function selectedIds(){return new Set(current?current.events.filter(e=>e.active&&choices.get(e.id)!==false).map(e=>e.id):[])}
function configuration(){
 const hours=(new Date($('bakeDate').value)-new Date($('startDate').value))/3600000;
 return {directVariant:$('directVariant').value,bigaHydration:+$('bigaHydration').value,bigaHours:+$('bigaHours').value,bigaTemp:+$('bigaTemp').value,bigaYeastPct:$('bigaYeastPct').value.trim()?+$('bigaYeastPct').value:NaN,bulkHours:+$('bulkHours').value,bulkTemp:+$('bulkTemp').value,longYeastPct:$('longYeastPct').value.trim()?+$('longYeastPct').value:NaN,foldMode:$('foldMode').value,profile:$('profile').value,method:$('method').value,quantity:$('quantity').value,count:+$('count').value,ballWeight:+$('ballWeight').value,width:+$('width').value,length:+$('length').value,density:+$('density').value,flour:+$('flourTotal').value,poolishPct:+$('poolishPct').value,hydration:+$('hydration').value,salt:+$('saltPct').value,oil:+$('oil').value,yeastPct:+$('yeastPct').value,temp:+$('roomTemp').value,fridge:+$('fridgeTemp').value,flourType:$('flourType').value,style:$('mode').value==='both'?(hours>=48?'long':hours>=36?'normal':'fast'):$('style').value};
}
function field(id,visible){$(id).disabled=!visible;$(id).parentElement.hidden=!visible}
function syncFields(){
 const c=configuration(),p=PIZZA_PROFILES[c.profile],mode=$('mode').value;
 $('style').disabled=mode==='both';$('startDate').disabled=mode==='bake';$('bakeDate').disabled=mode==='start';
 $('timingHelp').textContent=PizzaMessages.hu[mode];
 for(const opt of $('method').options) opt.disabled=!p.methods.includes(opt.value);
 for(const opt of $('quantity').options) opt.disabled=opt.value===(p.pan?'pieces':'pan');
 if(!p.methods.includes(c.method)) $('method').value=p.methods[0];
 if((p.pan&&c.quantity==='pieces')||(!p.pan&&c.quantity==='pan')) $('quantity').value=p.pan?'pan':'pieces';
 const quantity=$('quantity').value;
 field('flourTotal',quantity==='flour');field('count',quantity!=='flour'||p.pan);field('ballWeight',quantity==='pieces');
 for(const id of ['width','length','density'])field(id,quantity==='pan');
 const method=$('method').value,longDirect=method==='direct'&&$('directVariant').value==='long';
 field('directVariant',method==='direct');
 field('poolishPct',['poolish','biga'].includes(method));field('yeastPct',method==='direct'&&!longDirect);
 for(const id of ['bigaHydration','bigaHours','bigaTemp','bigaYeastPct'])field(id,method==='biga');
 for(const id of ['bulkHours','bulkTemp','longYeastPct'])field(id,longDirect);
 $('methodNote').textContent=method==='biga'?'Kísérleti ADY-biga időterv. Az adagolást saját, ADY-val kipróbált receptből add meg. A 45% víz / 18 óra / 18 °C szerkezeti kiindulópont, nem validált ADY-pizzarecept. A megadott környezetet külön biztosítani kell.':longDirect?'Hosszú direkt változat: az első fermentáció a só bedolgozása után kezdődik, a korai hajtogatásokkal együtt számítjuk; utána bucizás (kerek pizzánál), majd hidegérlelés. Az ADY-adagot saját receptből add meg.':'Kizárólag aktív szárított élesztő (ADY). A meglévő adagolás kísérleti becslés.';

 $('profileNote').textContent=p.note;
 const changed=+ $('hydration').value!==p.hydration||+$('saltPct').value!==p.salt||+$('oil').value!==p.oil||$('foldMode').value!==p.foldDefault||$('method').value!==p.methods[0]||longDirect;
 $('customNote').textContent=changed?'Egyéni receptbeállítások; eltérnek a profil alapértékeitől.':`Profil alapértékei: ${p.hydration}% víz, ${p.salt}% só, ${p.oil} g olaj / kg liszt. Szabadon módosíthatók.`;
}
function resetProfile(){
 const p=PIZZA_PROFILES[$('profile').value];
 $('hydration').value=p.hydration;$('saltPct').value=p.salt;$('oil').value=p.oil;
 $('method').value=p.methods[0];$('poolishPct').value=50;
 $('directVariant').value='standard';
 $('foldMode').value=p.foldDefault;
 $('flourType').value=p.pan?'strong':'00';
 $('quantity').value=p.pan?'pan':$('profile').value==='legacy'?'flour':'pieces';
 $('count').value=p.pan?1:4;
 $('ballWeight').value=p.ballWeight??250;
 calc();
}
function validate(){
 for(const input of document.querySelectorAll('input[type="number"]'))if(!input.disabled&&(!input.value.trim()||!Number.isFinite(+input.value)||!input.checkValidity())){
  throw new Error(`${document.querySelector('label[for="'+input.id+'"]').textContent}: ellenőrizd a megadott értéket.`);
 }
}
function calc(){
 syncFields();
 try{
  validate();const c=configuration(),mode=$('mode').value;
  let start=new Date($('startDate').value),bake=new Date($('bakeDate').value);
  if(mode==='start')bake=addMin(start,TOTAL_HOURS[c.style]*60);
  if(mode==='bake')start=subMin(bake,TOTAL_HOURS[c.style]*60);
  const result=recipePlan(start,bake,c),wins=parseAvailability($('availability').value,new Date());
  if(mode==='start')$('bakeDate').value=localValue(bake);
  if(mode==='bake')$('startDate').value=localValue(start);
  current={...result,c,start,bake};render(wins);renderChoices();
  if(running) rebuildQueue('A jelzések az aktuális tervre frissültek.');
  $('startReminders').disabled=false;$('exportCalendar').disabled=false;
 }catch(error){
  current=null;$('results').replaceChildren();text($('results'),'p',error.message,'card warning');$('eventChoices').replaceChildren();
  stopReminders('Hibás vagy hiányos terv: az emlékeztetők leálltak.');$('startReminders').disabled=true;$('exportCalendar').disabled=true;
 }
}
function render(wins){
 const root=$('results'),a=current.amounts,c=current.c;root.replaceChildren();const card=text(root,'div','','card');
 text(card,'h2','A tervezett munkamenet');
 if(c.method==='biga'||current.longDirect)text(card,'p','Kísérleti időterv, saját receptből megadott ADY-adaggal. Az érési időpontok tervezett munkakezdések, nem érettségi ígéretek.','note');
 text(card,'p',current.longDirect?'Hosszú első fermentáció: a hajtogatások és pihenők a megadott teljes első érlelési idő részei.':current.foldMode==='lamination'?'Két laminálás – kézi nyújtás és összehajtás · 20 / 25 / 30 perces pihenők. A második a tészta állapota szerint kihagyható.':current.foldMode==='two'?'Két kíméletes hajtogatás · 20 / 25 / 30 perces pihenők. A második hajtogatás a tészta állapota szerint kihagyható.':'Hajtogatás nélküli eljárás · 30 perc pihenő a só bedolgozása után.','note');
 text(card,'p',`${PIZZA_PROFILES[c.profile].name} · ${c.method==='poolish'?'Poolish':c.method==='biga'?'Kísérleti ADY-biga':current.longDirect?'Hosszú fermentációs direkt':'Direkt'} · Teljes idő: ${g(current.totalHours)} óra · Hidegérlelés: ${g(current.cold)} óra`,'ok');
 if(current.start<new Date())text(card,'p','A megadott kezdési időpont már elmúlt. A terv ettől az időponttól mutatja a munkafázisokat.','note');
 if(c.method==='biga')text(card,'p',`Biga: ${g(a.prefermentFlour)} g liszt + ${g(a.prefermentWater)} g víz, ${g(c.bigaYeastPct,2)}% ADY a biga lisztjére. Főtésztához még ${g(a.finalFlour)} g liszt és ${g(a.finalWater)} g víz. ${g(c.bigaHours)} óra tervezett érlelés, ${g(c.bigaTemp)} °C-os környezetben.`,'note');
 const summary=text(card,'div','','summary');
 for(const [label,value] of [['Liszt',`${g(a.flour)} g`],['Víz',`${g(a.water)} g`],['Só',`${g(a.salt)} g`],['Olaj',`${g(a.oil)} g`],['Élesztő (ADY)',`${g(current.yeast,2)} g`],['Teljes tészta',`${g(a.total+current.yeast)} g`]]){
  const cell=text(summary,'div','');text(cell,'span',label,'pill');text(cell,'strong',value);
 }
 if(c.quantity!=='flour')text(card,'p',PIZZA_PROFILES[c.profile].pan?`${c.count} tepsi · ${c.width} × ${c.length} cm · ${g(a.total/c.count)} g/tepsi, az élesztő kis tömegén felül.`:`${c.count} pizza · ${g(a.total/c.count)} g/buci, az élesztő kis tömegén felül.`,'note');
 if(c.quantity==='pan')text(card,'p',`A ${g(c.density,2)} g/cm² tésztaterhelés módosítható kiinduló érték; nem stílusminősítési szabály.`,'note');
 if(c.temp>=26)text(card,'p','Meleg szobában a tészta gyorsabban fejlődhet; ellenőrizd az állapotát.','warning');
 const wrap=text(card,'div','','table-wrap'),table=text(wrap,'table',''),head=text(table,'thead',''),hr=text(head,'tr','');
 for(const label of ['Idő','Lépés','Részlet'])text(hr,'th',label);
 const body=text(table,'tbody','');
 for(const e of current.events){
  const row=text(body,'tr','');text(row,'td',fmt(e.time));text(row,'td',e.label);text(row,'td',e.detail+(e.active&&e.minutes?` Tervezett munka: ${e.minutes} perc.`:''));
  if(e.active&&wins.length&&!wins.some(w=>e.time>=w.s&&addMin(e.time,e.minutes)<=w.e))text(card,'p',`${e.label}: ${fmt(e.time)} (${e.minutes} perc) nem fér a szabad idősávokba.`,'warning');
 }
}
function renderChoices(){
 const box=$('eventChoices');box.replaceChildren();
 for(const e of current.events.filter(e=>e.active)){
  const label=text(box,'label','','check'),input=document.createElement('input');input.type='checkbox';input.checked=choices.get(e.id)!==false;
  input.disabled=+e.time<=Date.now();input.addEventListener('change',()=>{choices.set(e.id,input.checked);if(running)rebuildQueue('A kijelölt jelzések frissültek.');});
  label.append(input);text(label,'span',e.label+(input.disabled?' (elmúlt)':''));
 }
}
function stopReminders(message='Az emlékeztetők leállítva.'){
 running=false;if(timer!==null)clearInterval(timer);timer=null;queue=[];seen.clear();$('stopReminders').disabled=true;$('reminderStatus').textContent=message;$('nextReminder').textContent='';
}
function rebuildQueue(message){
 queue=reminderQueue(current.events,selectedIds(),+$('lead').value,Date.now());seen=new Set();
 if(!queue.length){stopReminders('Nincs kijelölt jövőbeli munkafázis.');return}
 $('reminderStatus').textContent=message;tick();
}
function tick(){
 if(!running)return;
 const {due,missed}=dueReminders(queue,Date.now(),seen);
 for(const item of due)announce(item.label,item.event.detail);
 if(missed.length)text($('alerts'),'p',`${missed.length} jelzés időpontja elmúlt, amíg a böngésző nem futott aktívan. Ellenőrizd az idővonalat.`);
 const next=queue.find(item=>!seen.has(item.key));
 $('nextReminder').textContent=next?`Következő: ${next.label} · ${fmt(new Date(next.at))} · ${Math.max(0,Math.ceil((next.at-Date.now())/60000))} perc múlva`:'Minden beállított jelzés lezajlott.';
 if(!next){running=false;clearInterval(timer);timer=null;$('stopReminders').disabled=true;$('reminderStatus').textContent='Minden beállított jelzés lezajlott.';}
}
function announce(label,detail){
 text($('alerts'),'p',`${label} — ${detail}`);
 while($('alerts').children.length>10)$('alerts').firstElementChild.remove();
 if('Notification'in window&&Notification.permission==='granted')try{new Notification('PizzaPlanner',{body:label,tag:'pizzaplanner-step'})}catch{ $('notificationStatus').textContent='A rendszerértesítés ezen a böngészőn nem támogatott; az oldalon megjelent a jelzés.';}
 if($('sound').checked&&audio)try{const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);gain.gain.value=.08;osc.frequency.value=660;osc.start();osc.stop(audio.currentTime+.4)}catch{}
}
function notificationState(){
 $('notificationStatus').textContent=!('Notification'in window)?'Ez a böngésző nem támogat rendszerértesítést.':!window.isSecureContext?'Rendszerértesítéshez nyisd meg a közzétett HTTPS-oldalt.':Notification.permission==='granted'?'Rendszerértesítés engedélyezve. Mobilon az oldalon belüli jelzésre vagy a naptárra támaszkodj.':Notification.permission==='denied'?'A böngészőértesítés letiltva. Az oldalon belüli jelzés és a naptárexport használható.':'A rendszerértesítés külön engedélyezhető; az oldalon belüli jelzés enélkül is működik.';
}
$('notifications').addEventListener('click',async()=>{
 if('Notification'in window&&window.isSecureContext&&Notification.permission==='default')try{await Notification.requestPermission()}catch{}
 notificationState();
});
function prepareAudio(){
 if($('sound').checked)try{
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(Audio){audio=audio||new Audio();audio.resume().catch(()=>{})}
  else $('reminderStatus').textContent='Hangjelzés nem támogatott; a szöveges jelzések használhatók.';
 }catch{}
}
$('sound').addEventListener('change',prepareAudio);
$('startReminders').addEventListener('click',()=>{
 if(!current)return;
 prepareAudio();
 stopReminders();running=true;rebuildQueue('Emlékeztetők futnak ezen a megnyitott oldalon.');
 if(running){$('stopReminders').disabled=false;timer=setInterval(tick,1000)}
});
$('stopReminders').addEventListener('click',()=>stopReminders());
$('lead').addEventListener('change',()=>{if(running)rebuildQueue('Az előjelzés frissült.')});
$('exportCalendar').addEventListener('click',()=>{
 if(!current)return;
 if(!reminderQueue(current.events,selectedIds(),0,Date.now()).length){$('reminderStatus').textContent='Nincs kijelölt jövőbeli esemény az exporthoz.';return}
 const data=calendarText(current.events,selectedIds(),+$('lead').value,new Date(),calendarId),url=URL.createObjectURL(new Blob([data],{type:'text/calendar;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='PizzaPlanner-v05-dev.ics';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('reminderStatus').textContent='A naptárfájl elkészült. Importáld a naptáradba, és ellenőrizd az eseményekhez tartozó értesítéseket.';
});
$('profile').addEventListener('change',resetProfile);$('resetProfile').addEventListener('click',resetProfile);$('calc').addEventListener('click',calc);
for(const input of document.querySelectorAll('input,select,textarea'))if(!['profile','lead','sound'].includes(input.id))input.addEventListener('change',calc);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
const now=new Date();now.setSeconds(0,0);$('startDate').value=localValue(now);$('bakeDate').value=localValue(addMin(now,36*60));$('style').value='normal';
notificationState();calc();
