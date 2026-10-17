# v0.5 ellenőrzési jegyzet — 2026. október 17.

Az asszisztensi nyelvi átnézés mind az öt nyelvre kiterjedt. Javultak a direkt eljárás, a tésztaadagok, a római pizzák és az élesztő nélküli össztömeg megnevezései, valamint néhány nyelvtani és mennyiségi megfogalmazás. Külső anyanyelvi szaklektor nem vett részt. A receptértékek és időszámítási szabályok nem változtak.

Az automatizált tesztek ellenőrzik a fordítási kulcsokat és helyőrzőket, a nyelvváltáskor változatlan időpontokat és mennyiségeket, a bevitel és az emlékeztetők állapotának megőrzését, a többnyelvű szabadidősávokat és a naptárexportot. A felületi eseménykezelők izolált DOM-modellben futnak. A próbajelzés hang- és értesítési API-ja utánzattal vizsgált, beleértve a tiltott és a hiányzó értesítési támogatást.

A helyi fájl valódi böngészős megnyitását az ellenőrzést végző eszköz URL-biztonsági szabálya nem engedi. Emiatt a vizuális megjelenés, a tényleges hang és az operációs rendszer értesítése nincs ezen a körön igazolva.

Kézi próba: nyisd meg a helyi index.html fájlt, válts végig az öt nyelven, kapcsold be a hangot és kattints a Próbajelzés gombra. Engedélyezett rendszerértesítés mellett ismételd meg. Ellenőrizd a hallható jelzést, az értesítés megérkezését és a megjelenést. Az emlékeztetőkhöz az oldalnak nyitva, a gépnek ébren kell maradnia.
