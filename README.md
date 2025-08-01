# Bulletin Monitor frontend

A [Figyusz](https://figyusz.k-monitor.hu/) egy eszköz, ami rendszeresen és automatikusan átfut egyes közigazgatási nyilvántartásokat és kulcsszavak alapján küld egy e-mailes üzenetet, ha van benne releváns tartalom. A Figyusz célcsoportja civil szervezetek munkatársai, újságírók, akik szeretnének értesülni a témájukhoz kapcsolódó állami döntésekről, fejleményekről.

Ez a repo a K-Monitor Bulletin Monitor (BM) projektjéhez fejlesztett frontendet tartalmazza. Ez nyújt felületet a feliratkozáshoz és a feliratkozás
megerősítéséhez.

## Resources

Monitor backend (PHP): https://github.com/Code-for-Hungary/bmm-backend

Scraper prototype (PHP): https://github.com/Code-for-Hungary/bmm-protoscraper

Magyar Közlöny scraper (Python): https://github.com/Code-for-Hungary/bmm-kozlonyscraper

MNV szerződés scraper (Python): https://github.com/Code-for-Hungary/bmm-mnvcontractscraper

Bírósági határozatok (Python): https://github.com/Code-for-Hungary/bmm-birosagscraper

Kormany.hu/dokumentumtar (Python): https://github.com/Code-for-Hungary/bmm-kormanyscraper

Parlamenti irományok scraper (Python): https://github.com/Code-for-Hungary/bmm-parlamentscraper

## Konfigurálás

Másold config.sample.js-t config.js néven.

**API_URL** - az adott BM backend URL-je
