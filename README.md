# Auxilia

De Nederlandstalige website van Auxilia, gebouwd met Astro 7. Alle pagina's worden als statische HTML opgeleverd. De oorspronkelijke teksten en mascotte zijn behouden.

## Lokaal starten

Gebruik Node 24 LTS (zie `.nvmrc`), minimaal Node 22.12.

```sh
npm ci
npm run dev
```

## Bouwen en controleren

```sh
npm run check
npm run build
npm run preview -- --host 127.0.0.1 --port 4323
```

Laat de preview draaien en voer in een tweede terminal uit:

```sh
npm test
npm run test:a11y
npm audit
```

De browsertests gebruiken Playwright Chromium. Installeer de browser indien nodig met `npx playwright install chromium`. Voor een andere lokale preview-URL: `TEST_URL=http://127.0.0.1:4321 npm test`.

De controles omvatten:

- alle 13 pagina's op 360, 390, 768 en 1440 pixels;
- behoud van de oorspronkelijke tekst, vastgelegd in `tests/fixtures/content-baseline.json`;
- afbeeldingen, interne ankers, metadata en tekst die buiten het scherm valt;
- toetsenbordnavigatie, sluiten met Escape, focus in het mobiele menu;
- zichtbare inhoud zonder JavaScript;
- formuliervalidatie, gesimuleerde succesvolle/mislukte verzending en dubbele verzending;
- automatische WCAG A/AA-controles op mobiel en desktop, inclusief geopende navigatie en foutmeldingen.

De verzendtests onderscheppen lokale verzoeken. Ze versturen geen echte berichten. Een automatische toegankelijkheidscontrole vervangt geen volledige handmatige audit.

## Contact en afspraken

Bedrijfsgegevens en integraties staan in `src/config.js`.

| Instelling | Gedrag |
| --- | --- |
| `SITE.bookingUrl` | Met een URL gaan afspraakknoppen naar de kalender. Zonder URL gaan ze naar de contactpagina of het formulier. |
| `SITE.formEndpoint` | Met een endpoint verstuurt het formulier een `POST` met `FormData` en verwacht het een succesvolle HTTP-status. Zonder endpoint wordt een e-mailconcept geopend dat de bezoeker zelf verzendt. |
| `SITE.url` | Bepaalt canonical-URL's, sitemap en social cards. |
| `SITE.email`, `SITE.phone`, `SITE.vat` | Worden gedeeld door contactpagina, footer en gestructureerde gegevens. |

Momenteel zijn de boekingslink en het formulierendpoint leeg. Het formulier vermeldt daarom duidelijk dat het een e-mail opent. Voor een rechtstreeks verzonden contactformulier moet een werkend endpoint worden ingevuld en end-to-end gecontroleerd. Het endpoint moet zelf invoer valideren, misbruik beperken en foutieve verzoeken met een niet-succesvolle status beantwoorden. Een kalender of maildienst wordt niet door deze statische site aangemaakt.

## Beelden en stijl

- `src/styles/global.css`: kleuren, typografie, afstanden en gedeelde componentstijlen.
- `src/assets/`: ongewijzigde bronbestanden van de oorspronkelijke illustraties.
- `src/components/SiteImage.astro`: responsieve WebP-versies met juiste verhoudingen. De originele bestanden blijven bewaard in `public/`.
- `Header.astro`: desktopmenu en mobiele navigatie met focusbeheer.
- `PageHero.astro`, `CtaBand.astro`, `ServiceLayout.astro`: gedeelde pagina-opbouw.
- `ContactForm.astro`: validatie, e-mailconcept of endpoint, foutmeldingen en herproberen.
- `Faq.astro`: native `<details>`, ook bruikbaar zonder JavaScript.

Er wordt één lokaal gehost variabel lettertype gebruikt. De eerste afbeelding krijgt laadprioriteit; beelden verderop worden uitgesteld. Verminderde beweging wordt gerespecteerd en inhoud blijft zichtbaar als JavaScript niet beschikbaar is.

Werk social card en app-iconen bij met `npm run assets`. Het script gebruikt de bestaande mascotte, de huidige typografie en de domeinnaam uit de configuratie. Voor echte teamfoto's kunnen de bestaande initialen later worden vervangen; er zijn geen fictieve portretten toegevoegd.

## Publiceren

- Buildopdracht: `npm run build`
- Publicatiemap: `dist`
- Node-versie bij de build: 24 LTS

Publiceer `dist/` op statische hosting. Configureer de host om `404.html` met HTTP-status 404 te serveren voor onbekende pagina's. De oude URL `/aanpak/` verwijst naar `/#werkwijze`.

Controleer na publicatie HTTPS, de eigen 404-pagina, de sitemap op `/sitemap-index.xml`, het e-mailconcept of ingestelde formulierendpoint en de eventuele boekingslink. Werk bij een domeinwijziging ook `public/robots.txt` bij en genereer de social card opnieuw.

Migratiereferenties: [Astro 6](https://docs.astro.build/en/guides/upgrade-to/v6/) en [Astro 7](https://docs.astro.build/en/guides/upgrade-to/v7/). `compressHTML: true` bewaart de bestaande spaties rond inline tekst.
