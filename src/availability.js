// Accept all supported languages independently of the selected display language.
const AVAILABILITY_DAYS=[
 ['vasarnap','sunday','domenica','dimanche','sonntag'],
 ['hetfo','monday','lunedi','lundi','montag'],
 ['kedd','tuesday','martedi','mardi','dienstag'],
 ['szerda','wednesday','mercoledi','mercredi','mittwoch'],
 ['csutortok','thursday','giovedi','jeudi','donnerstag'],
 ['pentek','friday','venerdi','vendredi','freitag'],
 ['szombat','saturday','sabato','samedi','samstag']
];
function parseAvailability(text,anchor){
 const out=[],lines=text.split(/\n/);
 for(let index=0;index<lines.length;index++){
  const line=lines[index].trim();if(!line)continue;
  const clean=line.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[’‘]/g,"'");
  const m=clean.match(/^(.+?)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})$/);
  if(!m)throw new Error(PizzaText.t('availability.line',[index+1]));
  const token=m[1];let date=new Date(anchor);date.setHours(0,0,0,0);
  if(/^\d{4}-\d{2}-\d{2}$/.test(token)){
   date=new Date(token+'T00:00');if(isNaN(date)||localValue(date).slice(0,10)!==token)throw new Error(PizzaText.t('availability.date'));
  }else{
   let offset;
   if(['ma','today','oggi',"aujourd'hui",'heute'].includes(token))offset=0;
   else if(['holnap','tomorrow','domani','demain','morgen'].includes(token))offset=1;
   else if(['holnaputan','day after tomorrow','dopodomani','apres-demain','ubermorgen'].includes(token))offset=2;
   else{const day=AVAILABILITY_DAYS.findIndex(names=>names.includes(token));if(day<0)throw new Error(PizzaText.t('availability.line',[index+1]));offset=(day-date.getDay()+7)%7}
   date.setDate(date.getDate()+offset);
  }
  const [sh,sm]=m[2].split(':').map(Number),[eh,em]=m[3].split(':').map(Number);
  if(sh>23||eh>23||sm>59||em>59||(sh===eh&&sm===em))throw new Error(PizzaText.t('availability.time'));
  const s=new Date(date),e=new Date(date);s.setHours(sh,sm,0,0);e.setHours(eh,em,0,0);if(e<=s)e.setDate(e.getDate()+1);
  out.push({s,e});
 }
 out.sort((a,b)=>a.s-b.s);
 return out.reduce((merged,w)=>{const last=merged[merged.length-1];if(last&&w.s<=last.e)last.e=new Date(Math.max(+last.e,+w.e));else merged.push(w);return merged},[]);
}
