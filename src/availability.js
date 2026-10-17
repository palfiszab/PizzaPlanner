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
