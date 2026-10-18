# PizzaPlanner v0.6 — fejlesztési példány

**Mobilbarát v0.6 fejlesztési változat.**

## Új eljárások

- **Hosszú fermentációs direkt:** a Direkt eljáráson belül külön változat. Kézzel megadott ADY-adag, első fermentációs idő és környezeti hőmérséklet. A korai tésztakezelések ebbe az időbe beleszámítanak. Kerek pizzánál ezután bucizás és hidegérlelés; tepsisnél egyben hűtés.
- **Biga – kísérleti ADY-időzítés:** nápolyi és római tepsis profilnál. Külön előtészta-vízarány, lisztarány, tervezett érlelési idő, környezet és ADY-adag; állapotellenőrzés, majd főtészta.
- **ADY-kizárólagosság:** nincs friss, instant vagy kovászos választó, nincs friss élesztős recept automatikus átváltása. Az új adagmezők szándékosan üresek, saját ADY-receptből kell kitölteni őket.

Az új részek kézi receptadatokra épülő időtervezők; nem validált ADY-pizzareceptek és nem automatikus érettségi modellek. A 18 óra/18 °C biga, illetve 16 óra/16 °C hosszú direkt kezdőértékek szerkezeti támpontok, nem kipróbált ADY-ajánlások. Pontos források, eltérések és nyitott kérdések: [docs/FERMENTATION-EVIDENCE.md](docs/FERMENTATION-EVIDENCE.md).

Az öt nyelv elkészült. Az új ADY-adagolás kalibrálása és valós sütési próbái további feladatok.

Magyar, olasz, francia, német és angol nyelven használható, telepítést nem igénylő pizzatervező. Nyisd meg az `index.html` fájlt vagy szolgáld ki statikus weboldalként. A fájlok maradjanak egy mappaszerkezetben.

## Újdonságok

- Saját poolish, nápolyi jellegű, római kerek (tonda romana) és római tepsis profil, külön munkamenettel.
- Külön hajtogatási eljárás: két kíméletes hajtogatás (20/25/30 perces pihenők) vagy hajtogatás nélkül (egyetlen 30 perces pihenő a só bedolgozása után). A nápolyi profil alapértéke is a két hajtogatásos házi változat; ez nem nápolyi követelmény.
- Direkt/poolish választás a kidolgozott profilpárosításoknál. Római tepsisnél direkt vagy kísérleti ADY-biga.
- Mennyiségek lisztből, darabszám/buciméretből vagy tepsiméretből. A tepsiterhelés módosítható.
- Profilalapértékek és egyéni arányok megkülönböztetése, visszaállítási gomb.
- Indítható/leállítható emlékeztetők, 0/5/10 perces előjelzés, munkafázisonként kapcsolható jelzések, opcionális hang és böngészőértesítés.
- Naptárexport (.ics) a kijelölt jövőbeli aktív lépésekhez, értesítési bejegyzésekkel.

## Időzítés

Kezdésből tervezve a sütés, sütésből tervezve a kezdés frissül 24/36/48 eltelt órával. Két rögzített időpontnál a választó inaktív, a tényleges időintervallum számít. A múltbeli kezdés semleges tájékoztatás, nem hiba. A dátumokat a böngésző helyi időzónájában mutatjuk.

Szabad idősávok például: `ma 18:00-22:00`, `szerda 06:30-08:00`, `2026-10-20 18:00-22:00`. A napnév mai vagy következő előfordulást jelöl. Éjfélen átnyúló sáv megadható. A program az aktív lépések teljes tervezett időtartamát ellenőrzi, de nem optimalizálja át a tervet. A sütésből csak a kezdést ellenőrzi.

## Emlékeztetők használata

1. Készíts érvényes tervet, jelöld ki a lépéseket és az előjelzést.
2. Ha hangot szeretnél, kapcsold be az indítás előtt.
3. Kattints az **Emlékeztetők indítása** gombra.
4. Opcionálisan külön engedélyezd a böngészőértesítéseket.

A jelzések csak a nyitott oldal munkamenetében futnak. Újratöltéskor újra indítandók; bezárás vagy alvó készülék mellett nem garantálhatók. A háttérlap késhet. Öt percnél régebbi jelzéseket összesítve elmulasztottként mutatunk. A jövőbeli jelzéseket tervmódosításkor cseréljük; érvénytelen tervnél leállítjuk. Nincs szerveres push vagy háttérfigyelés.

A rendszerértesítés böngészőtámogatást, engedélyt és biztonságos környezetet igényel; a közzétett HTTPS-változat ajánlott. Mobilon nincs garantált rendszerértesítés ebben a kiadásban. Az oldalon belüli jelzés engedély nélkül is működik. Hangot a böngésző vagy a rendszer némítása korlátozhatja.

A naptárfájlt importáld a saját naptáradba, és ellenőrizd az értesítéseket: egyes naptárak figyelmen kívül hagyhatják az importált riasztásokat. A weboldal nem frissíti a korábbi importot. Tervmódosításkor töröld a régi importált eseményeket, majd importáld az új fájlt. A múltbeli események és az elmúlt előjelzések nem kerülnek exportálásra.

## Szakmai korlátok

A profilok kísérleti házi adaptációk, nem minősített receptek. Az élesztőadagolás és a hűtőhőmérséklet hatása még nem validált fermentációs modell. A tészta állapota elsődleges. A pontos források és eltérések: [docs/PROFILES.md](docs/PROFILES.md).

## Nyelvek

A jobb felső nyelvválasztó: Magyar, Italiano, Français, Deutsch, English. A választás a böngésző helyi tárhelyére kerül; ha a tárhely nem elérhető, az aktuális munkamenetben akkor is működik. Alapértelmezés: magyar.

A mezők, profilok, részletes munkafázisok, hibaüzenetek, emlékeztetők és új naptárexportok a kiválasztott nyelvet használják. Az időpontokat és kijelzett mennyiségeket nyelvi formátumban mutatjuk; a számítás és az időzóna nem változik. Nyelvváltás nem módosítja a beírt értékeket, dátumokat, az idősávszöveget és a kijelöléseket, nem indít új időzítőt, és nem küldi újra a már kézbesített jelzéseket.

Az idősávok az öt nyelv teljes napneveit és a ma/holnap/holnapután megfelelőit is elfogadják. A magyar sorok más megjelenítési nyelven is működnek. Példák: `oggi 18:00-22:00`, `lundi 06:30-08:00`, `übermorgen 17:00-20:00`, `today 12:00-13:00`. Az ISO-dátumos alak továbbra is támogatott.

A forrásjegyzetek egyelőre magyar dokumentumok; ezt a felület linkje is jelzi. A fordításokat az asszisztens nyelvileg átnézte; külső, anyanyelvi szaklektor nem vett részt az ellenőrzésben.

### Fordítások karbantartása

`src/locales.js` tartalmazza a teljes öt nyelvű katalógust, `src/messages.js` a közös futtatókódot. Az `m...` azonosítók stabilak: új szöveghez új kulcs kell, a meglévőket nem számozzuk újra. A `{0}`, `{1}` stb. helyőrzők minden fordításban azonos készletet alkotnak. A katalógus és a dinamikus események ellenőrzése: `node tests/i18n.test.cjs`.


## Ellenőrzés

Node.js 18 vagy újabb, külső csomag nélkül:

```
node tests/planner.test.cjs
node tests/v04.test.cjs
node tests/v05.test.cjs
node tests/i18n.test.cjs
node tests/ui.test.cjs
```

A felületi teszt elszigetelt DOM-modellel ellenőrzi az eseménykezelőket. Nem helyettesít valódi böngészős, hang- és rendszerértesítési próbát.

MIT-licenc.

A római kerek profil direkt eljárást és alapértelmezetten 220 g-os bucikat használ; a sütés előtti sodrófás nyújtás külön lépés és külön emlékeztető. A laminálás (munkalapon végzett kézi lapra nyújtás és összehajtás) külön választható a kíméletes hajtogatástól. Saját poolish és nápolyi profilnál laminálás az alapérték, rómaiaknál kíméletes hajtogatás.

### Próbajelzés

A „Próbajelzés” gomb terv nélkül is kipróbálható, és nem indít emlékeztető-időzítőt. A jelzés mindig megjelenik az oldalon. A hanghoz kapcsold be a hangjelzést; a rendszerértesítéshez előbb a külön engedélykérő gombbal adj böngészőengedélyt. A próba maga nem kér engedélyt.

Az automatizált ellenőrzés a böngésző hang- és értesítési felületét utánzattal vizsgálja. A tényleges hangot és rendszerértesítést a saját böngésződben kell kipróbálni. Részletek: [v0.5 ellenőrzési jegyzet](docs/QA-v0.5.md).

### Mobilos felület (v0.6)

600 képpont alatt egyoszlopos űrlap és lépésenkénti idővonalkártyák jelennek meg. A gombok legalább 48 képpont magasak, a jelölőnégyzetek teljes felirata érinthető. A számmezők billentyűzettípust kérnek, a dátummezők natívak maradnak. A nagyítás engedélyezett.

Kézi iPhone-próba szükséges Safariban: álló és fekvő tájolás, dátumválasztás, törtértékek bevitele, mind az öt nyelv hosszú feliratai, idővonal és emlékeztetők. A jelen változat továbbra is weboldal; az értesítési működés nem bővült.
