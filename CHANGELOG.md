# Változások

## 0.5.0-dev — 2026-10-17

- Önálló fejlesztési ág; a main ágon megmarad a v0.4 commit.
- Hosszú első fermentációs direkt változat, kézi ADY-adaggal, idővel és környezettel.
- Biga időtervező a nápolyi és tepsis profilban, külön liszt/víz mérleggel és kizárólag kézzel megadott ADY-adaggal.
- Új állapotellenőrzési lépések, emlékeztetők és naptárexport.
- Nincs automatikus átváltás más élesztőtípusról, nincs validált új ADY-adagolási ajánlás.
- Többforrásos szakmai jegyzet, a könyv és az ADY-specifikus bizonyítékok határainak megkülönböztetésével.


## 0.4.0 — 2026-10-17

- Új római kerek (tonda romana) profil, direkt eljárással, 220 g-os alapbucival, külön sodrófás végső nyújtási lépéssel és emlékeztetővel.
- Külön laminálási és kíméletes hajtogatási választás; a laminálás munkalapon végzett kézi nyújtás–összehajtás.

- Pontosítás: külön választható hajtogatási eljárás minden profilban; a nápolyi profilban is két hajtogatásos alapérték, kötelezőség állítása nélkül.
- A „finom laminálás” elnevezés helyett kíméletes hajtogatás. Hajtogatás nélkül egyetlen 30 perces pihenő; megszűnt a fölöslegesen kettéválasztott 20+30 perc.


- Saját poolish, nápolyi jellegű és római tepsis profilok, külön munkamenettel és forrásjegyzettel.
- Direkt/poolish eljárás, mennyiségtervezés darabszámra vagy tepsiméretre.
- Indítható/leállítható, lépésenként választható emlékeztetők, előjelzés és opcionális hang/rendszerértesítés.
- Tervváltozáskor új jelzéssor, érvénytelen tervnél leállítás; múltbeli lépések kihagyása.
- UTF-8, UTC-időpontokat és riasztásokat tartalmazó naptárexport; importált események nem frissülnek automatikusan.
- A múltbeli kezdés semleges tájékoztatás.
- A római kerek, biga, kovász és teljes többnyelvűség későbbi kiadás.


## 0.3.0 — 2026-10-17

- Pontos 24/36/48 órás teljes tervezési idő, automatikusan frissülő számított időponttal.
- Két rögzített időpont ellenőrzése: inaktív időtartam-választó, számítás a tényleges időintervallumból.
- Hibás mennyiségek és időpontok esetén a terv helyett hibaüzenet.
- A visszatartott víz nem lépheti túl a rendelkezésre álló főtésztavizet.
- Dátumot is tartalmazó idővonal; múltbeli kezdés jelzése.
- Szigorú idősáv-értelmezés, ISO-dátumok, éjfélen átnyúló és összeérő ablakok.
- Aktív munkafázisok teljes időigényének ellenőrzése; sütésnél csak a kezdés ellenőrzött.
- Külön stíluslap, számítási motor, felületi kód és kezdeti magyar üzenetkatalógus.

### Korlátok

Az idősávok még nem optimalizálják a tervet. A hűtőhőmérséklet tájékoztató adat.
Az érési idők és az élesztőadagok a v0.2 becslései, nem validált fermentációs modell.
Az 1–48 órás hidegérlelési határ a prototípus tervezési korlátja, nem élelmiszerbiztonsági vagy érettségi garancia.
A felület még magyar; a teljes fordítási katalógus kialakítása későbbi feladat.

- Kifejező időtartamnevek: Gyors – 24 óra, Stabil – 36 óra, Hosszú – 48 óra.

- A laminálás és pihenő önálló szakasz: laminálásonként 5 perc aktív munka; pihenők: 20 perc az első előtt, 25 perc a két laminálás között, 30 perc a bucizás előtt.
