# Profilok és szakmai alapok — v0.4

A profilok házi, kísérleti adaptációk. A pontos százalékok és időablakok projektalapértékek; nem minősítési szabályok és nem validált fermentációs modell. A hűtőhőmérséklet egyelőre tájékoztató adat.

| Profil | Víz | Só | Olaj / kg liszt | Eljárás és munkamenet |
|---|---:|---:|---:|---|
| Saját poolish (v0.3) | 61% | 3% | 8 g | Poolish; választható választható két kíméletes hajtogatás, a második opcionális; bucizott hidegérlelés |
| Nápolyi jellegű | 62% | 2,8% | 0 g | Direkt, poolish vagy kísérleti ADY-biga; választható laminálás/hajtogatás; bucizott hidegérlelés |
| Római tepsis | 75% | 2,5% | 25 g | Direkt vagy kísérleti ADY-biga; választható két kíméletes hajtogatás, a második opcionális; egyben hidegérlelés, majd osztás, tepsibe nyújtás |

A v0.5 fejlesztési példány a bigát kísérleti, kézi ADY-receptadatokból dolgozó időtervezőként adja hozzá a nápolyi és római tepsis profilhoz. Kovász továbbra sincs. Részletes forrásértékelés: [FERMENTATION-EVIDENCE.md](FERMENTATION-EVIDENCE.md).

## Ellenőrzött források (2026-10-17)

- [AVPN nemzetközi szabályzat](https://www.pizzanapoletana.org/en/ricetta_pizza_napoletana): a nápolyi irány liszt–víz–só–élesztő alapja és a bucik mérete. A program hidegérleléses, illetve poolish-változatai saját adaptációk; nem állítunk AVPN-megfelelést.
- [AVPN 2022 szabályzat](https://www.pizzanapoletana.org/public/pdf/Disciplinare_AVPN_2022_en.pdf): a hozzáadott zsír mellőzésének támpontja.
- [The Perfect Loaf: Sourdough Pizza al Taglio](https://www.theperfectloaf.com/sourdough-pizza-al-taglio/): a magasabb víztartalmú, olajos tepsis tészta, hajtogatás, hidegérlelési lehetőség és tepsibe nyújtás szakmai támpontja. Az eredeti kovászos eljárás helyett itt direkt élesztős, hosszabb hidegérlelésű adaptáció szerepel. A program 75%-os víztartalma, 2,5%-os sója és ütemezése nem az eredeti recept másolata.
- [King Arthur: pizza nyújtása](https://www.kingarthurbaking.com/blog/2024/02/14/how-to-stretch-pizza-dough): ellenálló, visszaugró tésztánál további pihenő szükségessége.

## Projektben elfogadott pihenők

A felhasználó által közölt Glezer-részlet: *Kenyérsütés mesterfokon*, 28. oldal, „A sütés alapjai”: kenyértésztánál legalább 15 perc két hajtogatás között és nagyjából 30 perc az utolsó után a formázásig, legfeljebb öt hajtogatás. Az oldalt nem ellenőriztük önállóan. Ez nem pizzatésztára igazolt minimum.

A saját poolish- és a kísérleti tepsis profilban 20 perc pihenőt tervezünk az első hajtogatás előtt, 25 percet a két hajtogatás között, 30 percet az utolsó után. Az aktív műveletek külön, 5 perces becslések. A „hajtogatás” kíméletes nyújtás–visszahajtás, nem vékonyra nyújtott laminálás. A tepsis átvitel projektadaptáció, nem általános szabály. A tészta ellenállása esetén a pihenő meghosszabbítandó; a program ezt még nem érzékeli. Pontosabb vagy ellentmondó forrás esetén az értékeket felülvizsgáljuk.

## Mennyiségek és élesztő

A mennyiségszámítás a liszt + víz + só + olaj tömegére épül. Az élesztő kis tömegét a teljes tésztatömeg összesítése külön hozzáadja. A tepsiterhelés alapértéke 0,5 g/cm², szabadon módosítható házi kiindulópont.

Direkt eljárásnál az ADY (aktív szárított élesztő) alapértéke 0,1% a lisztre vetítve, kézzel módosítható. Ez nem időtartamhoz és hőmérséklethez kalibrált adagolás. Poolish-nál a korábbi prototípus becslése marad. Más élesztőtípushoz nincs automatikus átváltás.

A program 1–48 óra hidegérlelést enged: ez tervezési korlát, nem érettségi vagy élelmiszerbiztonsági garancia. A 24/36/48 óra a kezdéstől a sütés kezdetéig eltelt teljes idő. Két rögzített időpontnál a tényleges időtartam számít.

## Hajtogatási eljárás választása

A pizzatípus és a direkt/poolish eljárás mellett a hajtogatás külön választás. A saját poolish és nápolyi profilban két laminálás, a római profilokban két kíméletes hajtogatás az alapérték, 20/25/30 perces pihenőkkel. Ez nem azt jelenti, hogy a nápolyi pizza két hajtogatást követel meg: az AVPN fent hivatkozott eljárásleírása nem ír elő ilyen kötelező lépést.

Hajtogatás nélkül a só bedolgozását egyetlen 30 perces pihenő követi, majd bucizás vagy a tepsis változatnál egyben hűtés. Nincs két egymás mellé kerülő 20+30 perces szünet. A teljes kezdés–sütés idő változatlan; a hidegérlelés hossza igazodik a választott munkamenethez. A 30 perc projektalapérték, nem bizonyított pizzatészta-specifikus minimum.

## Római kerek – tonda romana

Önálló, direkt élesztős házi profil: 62,5% víz, 3,1% só, 31 g olaj/kg liszt, alapértelmezetten 220 g-os bucik. Ezek módosíthatók. A [Molino Cipolla saját receptje](https://www.molinocipolla.it/blog/recipes/pizza-tonda-alla-romana/) 1600 g liszthez 1000 g vizet, 50 g sót és 50 g olajat használ, 220 g-os adagokkal. A só és olaj arányát a felület pontosságához kerekítettük. Az ottani kelesztési eljárás és élesztőadag nincs átvéve: itt a v0.4 kísérleti 24/36/48 órás hidegérlelési modelljét, kézzel módosítható ADY-adagját használjuk.

A [Scuola Italiana Pizzaioli](https://scuolaitalianapizzaioli.it/rcblocks/la-pizza-secondo-roma-pinsa-pala-teglia-e-tonda-romana/) kifejezetten oktatja a tonda romana al mattarello változatot. Ez indokolja a végső sodrófás nyújtás lehetőségét; nem állítjuk, hogy ez az egyetlen római technika. A terv sütés előtt 15 percet hagy az első pizza nyújtására és feltétezésére, ami projektbecslés. Több pizza sütése sorban történik, részletes sütési sor nincs számolva. A római tepsis profil továbbra is kézi nyújtást használ.

## Laminálás és hajtogatás pontosítása

A munkalapon széles, vékony lappá történő kézi nyújtás és összehajtás önálló laminálási eljárásként választható. A saját poolish és nápolyi profilban ez az alapérték. A tálban vagy kisebb nyújtásokkal végzett erősítés külön, kíméletes hajtogatási opció; a két római profilban ez az alapérték. Hajtogatás/laminálás nélkül továbbra is egyetlen 30 perces pihenő következik a só bedolgozása után. A két műveletes változatokban a pihenők 20/25/30 percesek.

A [Challenger Breadware laminálási útmutatója](https://challengerbreadware.com/bread-techniques/lamination-fold/) közvetlenül leírja a munkalapon végzett kézi lapra nyújtást és összehajtást. Kenyértésztás technikai támpont, nem pizzastílus-előírás. A sütés előtti sodrófás formázás külön munkafázis, nem ezt a laminálást helyettesíti.

Olasz tankönyvi támpont: Giorilli–Lipetskaia, Panificando…, a kiadó által közzétett [tartalomjegyzékben](https://staticmy.zanichelli.it/catalogo/assets/9788808899378_02_IND.pdf) a 128. oldalon La laminazione e la piegatura fejezet szerepel. A fejezet teljes szövegét nem ellenőriztük; konkrét technikai állítást nem alapozunk pusztán a címére.
