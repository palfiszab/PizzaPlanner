# PizzaPlanner v0.4

Magyar nyelvű, telepítés nélkül használható pizzatervező. Nyisd meg az `index.html` fájlt vagy szolgáld ki statikus weboldalként. A fájlok maradjanak egy mappaszerkezetben.

## Újdonságok

- Saját poolish, nápolyi jellegű, római kerek (tonda romana) és római tepsis profil, külön munkamenettel.
- Külön hajtogatási eljárás: két kíméletes hajtogatás (20/25/30 perces pihenők) vagy hajtogatás nélkül (egyetlen 30 perces pihenő a só bedolgozása után). A nápolyi profil alapértéke is a két hajtogatásos házi változat; ez nem nápolyi követelmény.
- Direkt/poolish választás a kidolgozott profilpárosításoknál. Római tepsisnél csak direkt.
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

A felület magyar. A meglévő üzenetkatalógus és nyelvi dátumformázás megmaradt; az öt teljes nyelv a következő fejlesztési szakasz.

## Ellenőrzés

Node.js 18 vagy újabb, külső csomag nélkül:

```
node tests/planner.test.cjs
node tests/v04.test.cjs
node tests/ui.test.cjs
```

A felületi teszt elszigetelt DOM-modellel ellenőrzi az eseménykezelőket. Nem helyettesít valódi böngészős, hang- és rendszerértesítési próbát.

MIT-licenc.

A római kerek profil direkt eljárást és alapértelmezetten 220 g-os bucikat használ; a sütés előtti sodrófás nyújtás külön lépés és külön emlékeztető. A laminálás (munkalapon végzett kézi lapra nyújtás és összehajtás) külön választható a kíméletes hajtogatástól. Saját poolish és nápolyi profilnál laminálás az alapérték, rómaiaknál kíméletes hajtogatás.
