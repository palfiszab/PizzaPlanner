
const $ = id => document.getElementById(id);
const DAY_NAMES = ['vasárnap','hétfő','kedd','szerda','csütörtök','péntek','szombat'];
const DAY_SHORT = ['Vas','Hét','Kedd','Sze','Csüt','Pén','Szo'];
function pad(n){return String(n).padStart(2,'0')}
function localValue(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
function fmt(d){return new Intl.DateTimeFormat(PizzaMessages.locale,{year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit'}).format(d)}
function addMin(d,m){return new Date(d.getTime()+m*60000)}
function subMin(d,m){return addMin(d,-m)}
function round2(n){return Math.round(n*100)/100}

function getNumbers(){
  const flourTotal=+$('flourTotal').value, poolishFlour=+$('poolishFlour').value;
  const hydration=+$('hydration').value/100, saltPct=+$('saltPct').value/100;
  const poolishWater=poolishFlour, finalFlour=flourTotal-poolishFlour, totalWater=Math.round(flourTotal*hydration), finalWater=totalWater-poolishWater;
  return {flourTotal,poolishFlour,poolishWater,finalFlour,totalWater,finalWater,salt:Math.round(flourTotal*saltPct),oil:Math.round(flourTotal/1000*(+$('oil').value))};
}
function effectiveStyle(){
  if($('mode').value!=='both') return $('style').value;
  const hours=(new Date($('bakeDate').value)-new Date($('startDate').value))/3600000;
  return hours>=48?'long':hours>=36?'normal':'fast';
}
function options(){return {temp:+$('roomTemp').value,style:effectiveStyle(),fixedInterval:$('mode').value==='both',flourType:$('flourType').value}}
function buildFromBake(bake){return plan(subMin(bake,TOTAL_HOURS[$('style').value]*60),bake,options())}
function buildFromStart(start){return plan(start,addMin(start,TOTAL_HOURS[$('style').value]*60),options())}
function parseAvailability(text, anchor){
  const out=[]; if(!text.trim()) return out;
  const lines=text.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  for(const line of lines){
    const m=line.toLowerCase().match(/^(\d{4}-\d{2}-\d{2}|holnapután|holnap|ma|hétfő|kedd|szerda|csütörtök|péntek|szombat|vasárnap)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})$/);
    if(!m) throw new Error(`Nem értelmezhető idősáv a(z) ${lines.indexOf(line)+1}. sorban.`);
    let date=new Date(anchor); date.setSeconds(0,0);
    if(/^\d{4}/.test(m[1])) { date=new Date(m[1]+'T00:00'); if(isNaN(date)||localValue(date).slice(0,10)!==m[1]) throw new Error('Érvénytelen dátum az idősávban.'); }
    else if(m[1]==='holnap') date.setDate(date.getDate()+1);
    else if(m[1]==='holnapután') date.setDate(date.getDate()+2);
    else if(m[1] !== 'ma'){
      const target=DAY_NAMES.indexOf(m[1]); let delta=(target-date.getDay()+7)%7; if(delta===0 && date.getHours()>23) delta=7; date.setDate(date.getDate()+delta);
    }
    const [sh,sm]=m[2].split(':').map(Number), [eh,em]=m[3].split(':').map(Number);
    if(sh>23||eh>23||sm>59||em>59||(sh===eh&&sm===em)) throw new Error('Az idősávban 00:00–23:59 közötti, eltérő időpontokat adj meg.');
    const s=new Date(date), e=new Date(date); s.setHours(sh,sm,0,0); e.setHours(eh,em,0,0); if(e<=s) e.setDate(e.getDate()+1);
    out.push({s,e});
  }
  out.sort((a,b)=>a.s-b.s);
  return out.reduce((merged,w)=>{const last=merged[merged.length-1]; if(last&&w.s<=last.e) last.e=new Date(Math.max(+last.e,+w.e)); else merged.push(w); return merged},[]);
}
function availabilityNotes(tl){
  const wins=parseAvailability($('availability').value,new Date()); if(!wins.length) return [];
  const checks=[['Poolish indítása',tl.poolish,15],['Dagasztás',tl.mix,30],['Só + olaj',tl.salt,15],['1. laminálás',tl.lam1,5],['2. laminálás (ha szükséges)',tl.lam2,5],['Bucizás',tl.ball,15],['Hűtőbe helyezés',tl.fridgeIn,5],['Kivétel',tl.out,5],['Sütés kezdete',tl.bake,0]];
  return checks.filter(([,t,m])=>!wins.some(w=>t>=w.s&&addMin(t,m)<=w.e)).map(([name,t,m])=>`${name}: ${fmt(t)} (${m} perc) nem fér bele a szabad idősávokba.`);
}
function render(tl, modeNote){
  const n=getNumbers(), temp=+$('roomTemp').value, style=effectiveStyle();
  const y=yeast(n.poolishFlour,temp,style);
  const {saltWater,firstWater}=waterSplit(n.finalWater);
  const warnings=[];
  if(n.finalWater<0) warnings.push('A poolish vízmennyisége több, mint a teljes célvíz. Csökkentsd a poolish lisztet vagy emeld a hidratációt.');
  if(temp>=26) warnings.push('26 °C körül a poolish gyorsan túléretté válhat. Ha korábban csúcson van, kezdj dagasztani hamarabb.');
  if($('flourType').value==='durum') warnings.push('Durum/durumos lisztnél a poolish kevésbé látványosan emelkedhet; a buborék és az illat fontosabb jel.');
  const pastStartNote=tl.poolish<new Date() ? '<p class="note">A megadott kezdési időpont már elmúlt. A terv ettől az időponttól mutatja a munkafázisokat.</p>' : '';
  warnings.push(...availabilityNotes(tl));
  modeNote+=` Teljes idő: ${round2((tl.bake-tl.poolish)/3600000)} óra; poolish: ${round2((tl.mix-tl.poolish)/3600000)} óra; hidegérlelés: ${round2((tl.out-tl.fridgeIn)/3600000)} óra.`;
  const rows=[
    [tl.poolish,'Poolish indítása',`${n.poolishFlour} g liszt + ${n.poolishWater} ml víz + ${round2(y).toFixed(2)} g aktív szárított élesztő. Lazán fedve.`],
    [tl.mix,'Dagasztás',`Poolish + ${n.finalFlour} g liszt + kb. ${firstWater} ml víz. Extra élesztő alapból nem kell.`],
    [tl.salt,'Só + olaj',`${n.salt} g só kb. ${saltWater} ml visszatartott vízzel hozzáadva. Utána ${n.oil} g olaj, ha használod.`],
    [tl.rest,'Pihenő',`Letakarva ${(tl.lam1-tl.rest)/60000} perc.`],
    [tl.lam1,'1. finom laminálás','Kb. 5 perc. Csak szerkezetigazítás, nem vékonyra húzás.'],
    [tl.restAfterLam1,'Pihenő',`Letakarva ${(tl.lam2-tl.restAfterLam1)/60000} perc. Ha még feszes vagy visszaugrik, pihentesd tovább; ne erőltesd a nyújtást.`],
    [tl.lam2,'2. finom laminálás','Kb. 5 perc. Csak ha szükséges és a tészta engedi; egyébként hagyd ki.'],
    [tl.restAfterLam2,'Pihenő formázás előtt',`Letakarva ${(tl.ball-tl.restAfterLam2)/60000} perc a bucizásig. Ha a második laminálást kihagyod, ezt az időt is pihenéssel töltsd.`],
    [tl.ball,'Bucizás','200–220 g-os bucik, nem túl szorosra.'],
    [tl.fridgeIn,'Hűtő',`Lezárt dobozban ${$('fridgeTemp').value} °C körül.`],
    [tl.out,'Kivétel a hűtőből','30–40 percig zárva hagyd, utána akklimatizáció.'],
    [tl.bake,'Sütés','Nyújtás középről kifelé; a peremet ne nyomd ki.']
  ];
  $('results').innerHTML=`<div class="card"><p class="ok">${modeNote}</p>${pastStartNote}<div class="summary"><div><span class="pill">összliszt</span><strong>${n.flourTotal} g</strong></div><div><span class="pill">összvíz</span><strong>${n.totalWater} ml</strong></div><div><span class="pill">főtészta víz</span><strong>${n.finalWater} ml</strong></div><div><span class="pill">só</span><strong>${n.salt} g</strong></div><div><span class="pill">olaj</span><strong>${n.oil} g</strong></div><div><span class="pill">poolish élesztő</span><strong>${round2(y).toFixed(2)} g</strong></div></div>${warnings.length?`<p class="warning">${warnings.join('<br>')}</p>`:''}<div class="table-wrap"><table><thead><tr><th>Idő</th><th>Lépés</th><th>Részlet</th></tr></thead><tbody>${rows.map(([time,step,detail])=>`<tr><td>${fmt(time)}</td><td><strong>${step}</strong></td><td>${detail}</td></tr>`).join('')}</tbody></table></div><p class="note">Megjegyzés: a só oldóvize mindig a teljes vízmennyiség része, nem plusz víz. A szabad idősávok ellenőrzése még egyszerű prototípus-logika.</p></div>`;
}
function validate(){
  for(const input of document.querySelectorAll('input[type="number"]')){
    if(!input.value.trim()||!Number.isFinite(+input.value)||!input.checkValidity()) throw new Error(`${document.querySelector('label[for="'+input.id+'"]').textContent}: adj meg a megengedett tartományba eső értéket.`);
  }
  const n=getNumbers();
  if(n.poolishFlour>=n.flourTotal) throw new Error('A poolish lisztje legyen kevesebb az összes lisztnél.');
  waterSplit(n.finalWater);
}
function calc(){
  const mode=$('mode').value;
  $('style').disabled=mode==='both';
  $('startDate').disabled=mode==='bake'; $('bakeDate').disabled=mode==='start';
  $('timingHelp').textContent=PizzaMessages.hu[mode];
  try{
    validate();
    const start=new Date($('startDate').value), bake=new Date($('bakeDate').value);
    let tl;
    if(mode==='bake') {tl=buildFromBake(bake); $('startDate').value=localValue(tl.poolish);}
    else if(mode==='start') {tl=buildFromStart(start); $('bakeDate').value=localValue(tl.bake);}
    else tl=plan(start,bake,options());
    render(tl,PizzaMessages.hu[mode]);
  }catch(error){
    $('results').replaceChildren();
    const box=document.createElement('div'); box.className='card warning'; box.setAttribute('role','alert'); box.textContent=error.message; $('results').append(box);
  }
}
function defaults(){
  const now=new Date(); now.setSeconds(0,0); $('startDate').value=localValue(now);
  $('bakeDate').value=localValue(addMin(now,36*60));
}
$('calc').addEventListener('click',calc);
for(const input of document.querySelectorAll('input,select,textarea')) input.addEventListener('change',calc);
defaults(); calc();
