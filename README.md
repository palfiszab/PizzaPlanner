# PizzaPlanner

Magyar nyelvű poolish-pizzaidőzítő, v0.3.

Nyisd meg az `index.html` fájlt közvetlenül a böngészőben, vagy használd statikus weboldalként. Nincs szükség telepítésre vagy buildre.

## Tervezés

- **Kezdésből:** a kezdés rögzített, a sütés 24/36/48 eltelt órával későbbre frissül.
- **Sütésből:** a sütés rögzített, a kezdés ugyanennyivel korábbra frissül.
- **Két időpont:** mindkettő rögzített. Az időtartam-választó inaktív; a tényleges időintervallum számít. A becsléshez használt profil 36 óra alatt gyors, 36–48 óra között stabil, 48 órától hosszú. A prototípus 1–48 órás hidegérlelést enged.

A teljes idő a poolish indításától a sütés kezdetéig tart. Óraátállításkor is eltelt órákat számolunk; a kijelzés a böngésző helyi időzónáját használja.

Az idősávok csak ellenőrzésre szolgálnak. Soronként például `ma 18:00-22:00`, `szerda 06:30-08:00` vagy `2026-10-20 18:00-22:00`. A hétköznap a mai vagy következő előfordulást jelenti. Az éjfélen átnyúló sáv megengedett.

A hűtőhőmérséklet még nem módosítja az időket. A fermentációs és élesztőbecslések kísérleti jellegűek; figyeld a tészta tényleges állapotát.

## Fájlok és ellenőrzés

- `src/planner.js`: számítások, felülettől függetlenül.
- `src/ui.js`: bevitel, idősávok, megjelenítés.
- `src/messages.js`: a későbbi fordítások belépési pontja; egyelőre részleges magyar katalógus.
- `tests/planner.test.cjs`: futtatás Node.js-szel: `node tests/planner.test.cjs`.

A következő lépések: pizzaprofilok, teljes többnyelvűség, idősáv-optimalizálás és dokumentált fermentációs modell.

MIT-licenc.

## Hajtogatás és pihentetés

A só és olaj bedolgozása után 20 perc pihenő következik az első laminálásig. A laminálás tervezett aktív ideje 5 perc. Utána külön 25 perc pihenő következik a következő laminálásig, majd az utolsó után külön 30 perc a bucizásig. A második laminálás opcionális; kihagyásakor a fenntartott idő pihenés marad.

Forrásjegyzet: a felhasználó által közölt részlet Maggie Glezer *Kenyérsütés mesterfokon* című könyvének 28. oldaláról, „A sütés alapjai” fejezet: kenyértésztánál legalább 15 perc két hajtogatás között, körülbelül 30 perc az utolsó után a formázásig, legfeljebb öt hajtogatás. A könyvoldalt nem ellenőriztük önállóan. Ez kenyértésztára vonatkozó útmutatás; nem igazolt pizzatészta-specifikus minimum. A 20/25/30 perces pihenősor a projekt tervezési döntése, nem bizonyítottan optimális arány. Pontosabb vagy ellentmondó forrás esetén felülvizsgálandó. Az 5 perc aktív munka becslés; a tészta állapota elsődleges.
