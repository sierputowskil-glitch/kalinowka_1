# Kalinówka — strona statyczna

Czysty HTML/CSS/JS, bez etapu budowania. Wdrożenie: wgraj całą zawartość repo na serwer plików statycznych.

## Struktura adresów (bez przekierowań)

Adresy są identyczne jak na dotychczasowej stronie WordPress (z ukośnikiem na końcu). Każdy adres to katalog z `index.html`:

- `/`, `/blog/`
- wpisy: `/kalinowka-czas-zmian-i-nowych-planow/`, `/pobieramy-sie-i-co-dalej/`, `/slub-w-plenerze/`, `/table-wedding/`, `/trendy-slubne-w-2026-roku/`, `/wesele-zero-waste/`, `/o-czym-pytac-sale/` (nowy)
- dawne podstrony, teraz z własną treścią i własnym canonical: `/kalinowka-sala-weselna-w-gdansku-{o-nas,galeria-zdjec,wesela-i-sluby-plenerowe,spotkania-firmowe-i-imprezy-integracyjne}/` oraz `/kalinowka-spotkania-firmowe-i-imprezy-integracyjne/`

Wszystkie ścieżki do zasobów są bezwzględne (`/styles.css`, `/img/...`).

## Formularz

Formularz wysyła dane do `send.php` (PHP + `mail()` na home.pl). Przed startem: wiadomości wychodzą z adresu `kontakt@kalinowka.com.pl` (`MAIL_FROM` w `send.php`) i trafiają na ten sam adres; wyślij testowe zapytanie i sprawdź, czy dotarło na `kontakt@kalinowka.com.pl` (także w spamie). `.htaccess` zawiera nagłówki bezpieczeństwa (CSP, HSTS), przekierowanie http→https i cache — wymaga Apache z mod_headers/mod_rewrite.

Przed publikacją uzupełnij w `polityka-prywatnosci/index.html` pole `[UZUPEŁNIJ: ...]` (dane administratora, NIP) i poproś prawnika o przejrzenie dokumentu.

## Wdrożenie / SEO

- Serwer ma zwracać `404.html` dla nieistniejących adresów (kod 404) i działać po HTTPS.
- Po uruchomieniu dodaj witrynę w Google Search Console, wyślij `sitemap.xml` i sprawdź dane Google Business Profile (NAP: ul. Potokowa 15 f, 501 743 517).
- Opinie z Google są wpisane statycznie w `index.html` (sekcja `#opinie`); ocena 4,5 / 454 opinie pochodzi z wizytówki Google (stan na 07.10.2026). Nie dodawaj schema `Review`/`aggregateRating` — Google nie honoruje ich dla własnych opinii firmy.
- Zdjęcia są w WebP; JPG zostały tylko tam, gdzie służą jako `og:image`/schema.

## Google Search Console — kroki po wdrożeniu

1. Dodaj usługę typu **Domena** `kalinowka.com.pl` i zweryfikuj ją rekordem TXT w DNS (panel home.pl) — obejmuje http/https i www.
2. W *Mapa witryny* wyślij `https://kalinowka.com.pl/sitemap.xml` (stare podmapy WordPressa zwracają 410 i wypadną z indeksu).
3. W *Inspekcja adresu URL* zgłoś do indeksowania: `/`, `/blog/` i 5 stron ofertowych.
4. Po 1–2 tygodniach sprawdź raporty *Strony* (Nie zindeksowano — 404/410 dla starych kategorii i tagów jest oczekiwane) i *Wygląd w wyszukiwarce*.
5. W Google Business Profile ustaw stronę WWW na `https://kalinowka.com.pl/`, link rezerwacji na `https://kalinowka.com.pl/#termin` i uzupełnij godziny otwarcia.

## Analityka (GA4)

`consent.js` ładuje Google Analytics 4 dopiero po zgodzie użytkownika (baner + link „Ustawienia cookies” w stopce). Identyfikator strumienia (`G-ZS6QPXRBFM`) jest ustawiony w stałej `GA_ID` na początku `consent.js`; pusta wartość wyłącza analitykę i baner (wtedy trzeba też poprawić pkt 6 polityki prywatności). Zdarzenie `generate_lead` jest wysyłane po udanym wysłaniu formularza (oznacz je w GA4 jako zdarzenie kluczowe).

## Podstrony ofertowe i formularze

- Strona główna (`index.html` + `app.js`) ma własny formularz; podstrony ofertowe (wesela, rodzinne, firmowe) używają `blog.js` + `form.js` i wysyłają dane do `/send.php`. Typy wydarzeń i pole `source` (adres strony zapytania) są walidowane po stronie PHP — nowe wartości trzeba dodać w `send.php`.
- Oferta nie obejmuje konferencji ani szkoleń; nie dodawać ich w treściach, SEO ani danych strukturalnych.
- Informacje o drugim, mniejszym obiekcie są celowo ogólne (brak pojemności i zdjęć) do czasu potwierdzenia przez właściciela.
