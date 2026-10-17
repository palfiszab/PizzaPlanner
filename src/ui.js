const $=id=>document.getElementById(id);
function pad(n){return String(n).padStart(2,'0')}
function localValue(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
function fmt(d){return new Intl.DateTimeFormat(PizzaText.locale,{year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit'}).format(d)}
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
 $('timingHelp').textContent=PizzaText.t('timing.'+mode);
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
 $('methodNote').textContent=method==='biga'?PizzaText.t("m001"):longDirect?PizzaText.t("m002"):PizzaText.t("m003");

 $('profileNote').textContent=p.note;
 const changed=+ $('hydration').value!==p.hydration||+$('saltPct').value!==p.salt||+$('oil').value!==p.oil||$('foldMode').value!==p.foldDefault||$('method').value!==p.methods[0]||longDirect;
 $('customNote').textContent=changed?PizzaText.t("m004"):PizzaText.t("m005", [p.hydration, p.salt, p.oil]);
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
  throw new Error(PizzaText.t("m006", [document.querySelector('label[for="'+input.id+'"]').textContent]));
 }
}
function calc({languageChange=false}={}){
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
  if(running) rebuildQueue(PizzaText.t("m007"),languageChange);
  $('startReminders').disabled=false;$('exportCalendar').disabled=false;
 }catch(error){
  current=null;$('results').replaceChildren();text($('results'),'p',error.message,'card warning');$('eventChoices').replaceChildren();
  stopReminders(PizzaText.t("m008"));$('startReminders').disabled=true;$('exportCalendar').disabled=true;
 }
}
function render(wins){
 const root=$('results'),a=current.amounts,c=current.c;root.replaceChildren();const card=text(root,'div','','card');
 text(card,'h2',PizzaText.t("m009"));
 if(c.method==='biga'||current.longDirect)text(card,'p',PizzaText.t("m010"),'note');
 text(card,'p',current.longDirect?PizzaText.t("m011"):current.foldMode==='lamination'?PizzaText.t("m012"):current.foldMode==='two'?PizzaText.t("m013"):PizzaText.t("m014"),'note');
 text(card,'p',PizzaText.t("m019", [PIZZA_PROFILES[c.profile].name, c.method==='poolish'?PizzaText.t("m015"):c.method==='biga'?PizzaText.t("m016"):current.longDirect?PizzaText.t("m017"):PizzaText.t("m018"), g(current.totalHours), g(current.cold)]),'ok');
 if(current.start<new Date())text(card,'p',PizzaText.t("m020"),'note');
 if(c.method==='biga')text(card,'p',PizzaText.t("m021", [g(a.prefermentFlour), g(a.prefermentWater), g(c.bigaYeastPct,2), g(a.finalFlour), g(a.finalWater), g(c.bigaHours), g(c.bigaTemp)]),'note');
 const summary=text(card,'div','','summary');
 for(const [label,value] of [[PizzaText.t("m022"),`${g(a.flour)} g`],[PizzaText.t("m023"),`${g(a.water)} g`],[PizzaText.t("m024"),`${g(a.salt)} g`],[PizzaText.t("m025"),`${g(a.oil)} g`],[PizzaText.t("m026"),`${g(current.yeast,2)} g`],[PizzaText.t("m027"),`${g(a.total+current.yeast)} g`]]){
  const cell=text(summary,'div','');text(cell,'span',label,'pill');text(cell,'strong',value);
 }
 if(c.quantity!=='flour')text(card,'p',PIZZA_PROFILES[c.profile].pan?PizzaText.t("m028", [c.count, c.width, c.length, g(a.total/c.count)]):PizzaText.t("m029", [c.count, g(a.total/c.count)]),'note');
 if(c.quantity==='pan')text(card,'p',PizzaText.t("m030", [g(c.density,2)]),'note');
 if(c.temp>=26)text(card,'p',PizzaText.t("m031"),'warning');
 const wrap=text(card,'div','','table-wrap'),table=text(wrap,'table',''),head=text(table,'thead',''),hr=text(head,'tr','');
 for(const label of [PizzaText.t("m032"),PizzaText.t("m033"),PizzaText.t("m034")])text(hr,'th',label);
 const body=text(table,'tbody','');
 for(const e of current.events){
  const row=text(body,'tr','');text(row,'td',fmt(e.time));text(row,'td',e.label);text(row,'td',e.detail+(e.active&&e.minutes?PizzaText.t("m035", [e.minutes]):''));
  if(e.active&&wins.length&&!wins.some(w=>e.time>=w.s&&addMin(e.time,e.minutes)<=w.e))text(card,'p',PizzaText.t("m036", [e.label, fmt(e.time), e.minutes]),'warning');
 }
}
function renderChoices(){
 const box=$('eventChoices');box.replaceChildren();
 for(const e of current.events.filter(e=>e.active)){
  const label=text(box,'label','','check'),input=document.createElement('input');input.type='checkbox';input.checked=choices.get(e.id)!==false;
  input.disabled=+e.time<=Date.now();input.addEventListener('change',()=>{choices.set(e.id,input.checked);if(running)rebuildQueue(PizzaText.t("m037"));});
  label.append(input);text(label,'span',e.label+(input.disabled?PizzaText.t("m038"):''));
 }
}
function stopReminders(message=PizzaText.t("m039")){
 running=false;if(timer!==null)clearInterval(timer);timer=null;queue=[];seen.clear();$('stopReminders').disabled=true;$('reminderStatus').textContent=message;$('nextReminder').textContent='';
}
function rebuildQueue(message,preserveSeen=false){
 queue=reminderQueue(current.events,selectedIds(),+$('lead').value,Date.now());if(!preserveSeen)seen=new Set();
 if(!queue.length){stopReminders(PizzaText.t("m040"));return}
 $('reminderStatus').textContent=message;tick();
}
function tick(){
 if(!running)return;
 const {due,missed}=dueReminders(queue,Date.now(),seen);
 for(const item of due)announce(item.label,item.event.detail);
 if(missed.length)text($('alerts'),'p',PizzaText.t("m041", [missed.length]));
 const next=queue.find(item=>!seen.has(item.key));
 $('nextReminder').textContent=next?PizzaText.t("m042", [next.label, fmt(new Date(next.at)), Math.max(0,Math.ceil((next.at-Date.now())/60000))]):PizzaText.t("m043");
 if(!next){running=false;clearInterval(timer);timer=null;$('stopReminders').disabled=true;$('reminderStatus').textContent=PizzaText.t("m043");}
}
function announce(label,detail,withSound=true){
 text($('alerts'),'p',PizzaText.t('alert',[label,detail]));
 while($('alerts').children.length>10)$('alerts').firstElementChild.remove();
 if('Notification'in window&&Notification.permission==='granted')try{new Notification('PizzaPlanner',{body:label,tag:'pizzaplanner-step'})}catch{ $('notificationStatus').textContent=PizzaText.t("m044");}
 if(withSound)playSound();
}
function playSound(){
 if($('sound').checked&&audio)try{const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);gain.gain.value=.08;osc.frequency.value=660;osc.start();osc.stop(audio.currentTime+.4)}catch{}
}
function notificationState(){
 $('notificationStatus').textContent=!('Notification'in window)?PizzaText.t("m045"):!window.isSecureContext?PizzaText.t("m046"):Notification.permission==='granted'?PizzaText.t("m047"):Notification.permission==='denied'?PizzaText.t("m048"):PizzaText.t("m049");
}
$('notifications').addEventListener('click',async()=>{
 if('Notification'in window&&window.isSecureContext&&Notification.permission==='default')try{await Notification.requestPermission()}catch{}
 notificationState();
});
async function prepareAudio(){
 if($('sound').checked)try{
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(Audio){audio=audio||new Audio();await audio.resume()}
  else $('reminderStatus').textContent=PizzaText.t("m050");
 }catch{}
}
$('sound').addEventListener('change',prepareAudio);
$('testAlert').addEventListener('click',async()=>{
 // A suspended audio context must never delay the visible or system alert.
 const ready=prepareAudio();
 announce(PizzaText.t('test.title'),PizzaText.t('test.detail'),false);
 await ready;
 playSound();
});
$('startReminders').addEventListener('click',()=>{
 if(!current)return;
 prepareAudio();
 stopReminders();running=true;rebuildQueue(PizzaText.t("m051"));
 if(running){$('stopReminders').disabled=false;timer=setInterval(tick,1000)}
});
$('stopReminders').addEventListener('click',()=>stopReminders());
$('lead').addEventListener('change',()=>{if(running)rebuildQueue(PizzaText.t("m052"))});
$('exportCalendar').addEventListener('click',()=>{
 if(!current)return;
 if(!reminderQueue(current.events,selectedIds(),0,Date.now()).length){$('reminderStatus').textContent=PizzaText.t("m053");return}
 const data=calendarText(current.events,selectedIds(),+$('lead').value,new Date(),calendarId),url=URL.createObjectURL(new Blob([data],{type:'text/calendar;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='PizzaPlanner-v05-dev.ics';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('reminderStatus').textContent=PizzaText.t("m054");
});
$('profile').addEventListener('change',resetProfile);$('resetProfile').addEventListener('click',resetProfile);$('calc').addEventListener('click',calc);
for(const input of document.querySelectorAll('input,select,textarea'))if(!['profile','lead','sound','language'].includes(input.id))input.addEventListener('change',calc);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
const now=new Date();now.setSeconds(0,0);$('startDate').value=localValue(now);$('bakeDate').value=localValue(addMin(now,36*60));$('style').value='normal';
function translatePage(){
 document.documentElement.lang=PizzaText.language;
 for(const el of document.querySelectorAll('[data-i18n]'))el.textContent=PizzaText.t(el.dataset.i18n);
 for(const el of document.querySelectorAll('[data-i18n-placeholder]'))el.placeholder=PizzaText.t(el.dataset.i18nPlaceholder);
 $('language').value=PizzaText.language;
}
$('language').addEventListener('change',()=>{
 const wasRunning=running,status=$('reminderStatus').textContent,alerts=Array.from($('alerts').children).map(el=>({el,value:el.textContent}));
 if(!PizzaText.setLanguage($('language').value))return;
 translatePage();notificationState();calc({languageChange:true});
 if(current&&wasRunning===running)$('reminderStatus').textContent=PizzaText.retranslate(status);
 for(const {el,value} of alerts)el.textContent=PizzaText.retranslate(value);
});
translatePage();notificationState();calc();
