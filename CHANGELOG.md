# Változások

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
