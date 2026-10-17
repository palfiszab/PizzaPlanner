// Translation runtime, shared by the browser and calculation tests.
var PizzaI18n=(()=>{
 const catalogs=typeof module!=='undefined'?require('./locales.js'):PizzaCatalog;
 const locales={hu:'hu-HU',en:'en-GB',it:'it-IT',fr:'fr-FR',de:'de-DE'};
 let language='hu';
 try{const saved=globalThis.localStorage?.getItem('pizzaplanner.language');if(locales[saved])language=saved}catch{}
 const records=new Map();
 function format(record){
  const template=catalogs[language][record.key]??catalogs.hu[record.key]??record.key;
  return template.replace(/\{(\d+)\}/g,(_,index)=>{
   const arg=record.args[+index];
   if(arg&&typeof arg==='object'&&arg.record)return format(arg.record);
   return typeof arg==='number'?new Intl.NumberFormat(locales[language],{maximumFractionDigits:4}).format(arg):String(arg??'');
  });
 }
 function t(key,args=[]){
  const record={key,args:args.map(arg=>typeof arg==='string'&&records.has(arg)?{record:records.get(arg)}:arg)};
  const result=format(record);records.set(result,record);
  if(records.size>3000)records.delete(records.keys().next().value);
  return result;
 }
 return {t,catalogs,get language(){return language},get locale(){return locales[language]},
  setLanguage(next){if(!Object.hasOwn(locales,next))return false;language=next;try{globalThis.localStorage?.setItem('pizzaplanner.language',next)}catch{}return true},
  retranslate(value){const record=records.get(value);return record?format(record):value}
 };
})();
if(typeof module!=='undefined')module.exports=PizzaI18n;
