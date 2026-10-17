# Fermentációs eljárások — források és döntések

Állapot: 2026-10-17, v0.5 fejlesztési példány. Kizárólag aktív szárított élesztő (ADY). A dokumentum nem új, validált pizzarecept: azt rögzíti, melyik állításhoz van szakmai forrás, és hol van projektfeltételezés vagy még hiányzó adat.

## Ellenőrzött anyagok

### 1. Piergiorgio Giorilli: La mia pizza, Gribaudo, 2018

A felhasználó által rendelkezésre bocsátott EPUB releváns szakaszait közvetlenül ellenőriztük. Fejezetek: Il metodo diretto a lunga fermentazione; La biga; Il poolish; Pizza a impasto diretto lungo; Pizza con metodo indiretto; Pizza con poolish. Az EPUB belső horgonyai nem tekinthetők automatikusan a nyomtatott kiadás oldalszámainak.

- A hosszú direkt az egyetlen főtésztás keverést követő hosszabb első fermentációval különül el. A konkrét recept hosszú, hűvös első érlelést követő osztást és hideg tárolást mutat be.
- A szilárd bigánál 40–50%-os vízarányt és kontrollált, hűvös érlelési környezetet tárgyal; rövid keverést hangsúlyoz.
- A poolish egyenlő tömegű lisztből és vízből készül, az adagolást a környezettel és idővel együtt kezeli.
- A vizsgált konkrét bigás pizzarecept kovászt és préselt élesztőt is tartalmaz. Ezt nem másoljuk át az ADY-változatba.
- A préselt élesztő adagjait és táblázatait nem konvertáljuk automatikusan ADY-ra. A kovászos és vegyes változatok nem kerülnek a programba.
- A könyv emészthetőségre vagy egészségre vonatkozó állításait nem vettük át a programba: ilyen állítást nem alapozunk egyetlen receptkönyvre.

### 2. King Arthur Baking: Preferment

[Elsődleges szakmai referencia](https://www.kingarthurbaking.com/pro/reference/preferment)

A bigát és poolisht előtésztaként tárgyalja, a poolish egyenlő liszt–víz tömegét, a só nélküli előtésztákat, valamint az idő, hőmérséklet és élesztőmennyiség összefüggését hangsúlyozza. A biga elnevezést az olasz szilárd változatnál tágabban használja. Ez terminológiai eltérés, nem ok arra, hogy a program 45%-os bigáját 100%-osra változtassuk.

A forrás nem igazolja a program új bigaváltozatának pontos ADY-adagját vagy érettségi idejét.

### 3. Breville: The Custom Loaf kézikönyv, bigás recept

[Gyártói kézikönyv](https://assets.breville.com/BBM800/BBM800_USCM_IB_I26_LR.pdf)

A biga hozzávalói között kifejezetten aktív szárított élesztőt ad meg. Ez közvetlen példa az ADY-s biga alkalmazására, de kenyérsütőgépes kenyérre vonatkozik. A mennyiségeket, hidratációt és érlelési időt nem emeljük át pizzareceptként.

### 4. King Arthur Baking: Ciabatta oktatási munkafüzet

[Oktatási anyag](https://shop.kingarthurbaking.com/content/class-pdfs/Ciabatta_November2024.pdf)

Fontos belső eltérés: az összesített bevásárlólista instant vagy aktív szárított élesztőt nevez meg, a részletes bigarecept viszont instantot ír. A biga hidratációja is eltér a Giorilli-féle szilárd változattól. Ezért az összesített listát nem tekintjük pontos ADY-biga adagolási bizonyítéknak.

### 5. Fleischmann’s: Yeast 101; King Arthur: Which yeast to use?

[Gyártói ADY-útmutató](https://www.fleischmannsyeast.com/baking-basics/yeast-101)

[King Arthur élesztő-útmutató](https://www.kingarthurbaking.com/blog/2016/01/29/yeast-use)

Az ADY előkészítését a konkrét termék gyártói útmutatója alapján kell végezni. A rehidratáláshoz használt víz része a recept vizének; nem adható hozzá a hidratáción felül. A rehidratáló víz és a későbbi érlelési környezet hőmérséklete két külön adat. Nem vezetünk be instant/friss/kovászos választót.

## Mit építettünk be?

| Rész | Forrással alátámasztható alap | Programban hozott döntés | Még nem igazolt |
|---|---|---|---|
| Hosszú direkt | Hosszabb első fermentáció, majd további munkafázisok | Külön direkt-változat, kézzel megadott idő és környezeti hőmérséklet, utána állapotellenőrzés és hideg szakasz | Adott ADY-adaghoz és liszthez szükséges pontos idő |
| Biga | Szilárd előtészta, külön keverés és érlelés; ADY használatára is van gyártói példa | 45%-os vízarány szerkezeti kezdőérték; kézi idő/hőmérséklet és ADY-adag; állapotellenőrzés a főtészta előtt | Komplett pizzarecept, ADY-adag és érettségi előrejelzés |
| Poolish | Egyenlő liszt/víz; idő és hőmérséklet számít | Korábbi működés megőrizve | Korábbi ADY-becslés kalibrálása |

A biga mezői 18 óra / 18 °C, a hosszú direkt mezői 16 óra / 16 °C tervezési kezdőértékkel indulnak, a könyvben ismertetett szerkezeti minták alapján. Ez nem ADY-ra ellenőrzött ajánlás. A felhasználónak a saját receptje alapján kell módosítania őket. A hőmérsékletet a program nem állítja be és nem méri, az időt nem számolja át automatikusan a hőmérséklet változásából.

Az új ADY-adagmezők üresek. Saját receptből megadott érték nélkül nincs új bigás vagy hosszú direkt terv. Nincs friss élesztőből való átváltás és nincs új, automatikusan ajánlott ADY-adag. A tesztekben szereplő százalékok kizárólag szintetikus ellenőrző bemenetek.

## Idők pontos jelentése

- Biga: 15 perc tervezett bekeverés, utána a megadott számú óra érlelés, majd 5 perc állapotellenőrzés, ezután főtészta. Az aktív percek projektbecslések.
- Hosszú direkt: az első fermentáció ideje a só/olaj bedolgozásának végétől az állapotellenőrzés kezdetéig tart. A korai hajtogatásokat és pihenőket nem adjuk hozzá újra ehhez az időhöz. Az utolsó hajtogatás utáni fennmaradó idő egyetlen szakaszként jelenik meg.
- A teljes kezdés–sütés intervallum továbbra is rögzíthető; a fennmaradó idő a hidegérlelésé. Ha a szakaszok nem férnek bele, nem készül érvényes terv.
- A biga és hosszú direkt környezeti hőmérséklete külön mező, nem azonos automatikusan a szobahőmérséklettel. A megfelelő környezet biztosítása a felhasználó feladata.
- A program jelenlegi határai (például biga 8–24 óra, 16–20 °C; hidegérlelés 1–48 óra) támogatott bemeneti/tervezési korlátok, nem univerzális szakmai vagy élelmiszerbiztonsági határértékek.

## Következő szakmai ellenőrzés

Konkrét ADY-termékkel, liszttel, mért környezeti és tésztahőmérséklettel, adaggal és megfigyelt érési időkkel végzett próbák szükségesek, mielőtt új automatikus adagolási ajánlást adnánk. Az ADY-biga jelenleg kézi receptadatokból dolgozó időtervező; nem kész, validált alaprecept.
