// Pure scheduler: absolute timestamps avoid setTimeout's long-delay overflow.
function reminderQueue(events,selected,lead,now){
 const queue=[];
 for(const e of events) if(e.active&&selected.has(e.id)&&+e.time>now){
  if(lead>0&&+e.time-lead*60000>now) queue.push({key:e.id+':early',at:+e.time-lead*60000,label:`${lead} perc múlva: ${e.label}`,event:e});
  queue.push({key:e.id+':due',at:+e.time,label:`Eljött az ideje: ${e.label}`,event:e});
 }
 return queue.sort((a,b)=>a.at-b.at);
}
function dueReminders(queue,now,seen){
 const due=[],missed=[];
 for(const item of queue) if(item.at<=now&&!seen.has(item.key)){
  seen.add(item.key);
  (now-item.at<=5*60000?due:missed).push(item);
 }
 return {due,missed};
}
function calendarText(events,selected,lead,now=new Date(),calendarId='pizzaplanner'){
 const esc=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const utc=d=>new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PizzaPlanner//v0.4//HU','CALSCALE:GREGORIAN'];
 for(const e of events) if(e.active&&selected.has(e.id)&&+e.time>+now){
  lines.push('BEGIN:VEVENT',`UID:${calendarId}-${e.id}@pizzaplanner.local`,`DTSTAMP:${utc(now)}`,`DTSTART:${utc(e.time)}`,`DTEND:${utc(+e.time+Math.max(1,e.minutes)*60000)}`,`SUMMARY:${esc('PizzaPlanner: '+e.label)}`,`DESCRIPTION:${esc(e.detail)}`);
  for(const minutes of lead>0?[lead,0]:[0]) if(+e.time-minutes*60000>+now) lines.push('BEGIN:VALARM',`TRIGGER:-PT${minutes}M`,'ACTION:DISPLAY',`DESCRIPTION:${esc(e.label)}`,'END:VALARM');
  lines.push('END:VEVENT');
 }
 lines.push('END:VCALENDAR');
 // RFC 5545: fold at 75 octets, preserving UTF-8 codepoints.
 return lines.map(line=>{let result='',part='',bytes=0;for(const ch of line){const n=new TextEncoder().encode(ch).length;if(bytes+n>75){result+=part+'\r\n';part=' ';bytes=1}part+=ch;bytes+=n}return result+part}).join('\r\n')+'\r\n';
}
if(typeof module!=='undefined') module.exports={reminderQueue,dueReminders,calendarText};
