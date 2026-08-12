# Auxilia — website

Statische site in [Astro](https://astro.build). Geen framework op de client,
geen externe verzoeken: alles wordt als HTML uitgeleverd en de lettertypes staan
mee in de build. Dat houdt de laadtijd laag en de AVG-kant simpel.

## Aan de slag

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # bouwt naar dist/
npm run preview  # bekijkt dist/ lokaal
npm run assets   # hergenereert og-image, favicon-pngs en logo
```

## Voor je live gaat

Alles wat per omgeving verschilt, staat in **`src/config.js`**. Je hoeft nergens
anders te zoeken.

| Instelling | Wat je moet doen |
| --- | --- |
| `SITE.url` | Zet de definitieve domeinnaam. Bepaalt canonical-URL's, sitemap en social cards. |
| `SITE.bookingUrl` | Link naar Cal.com, Calendly of Google Appointments. **Leeg = alle "Plan een kennismaking"-knoppen gaan naar `/contact/`.** |
| `SITE.formEndpoint` | Endpoint van het contactformulier (Formspree, Web3Forms, eigen API). **Leeg = het formulier valt terug op een voorbereide mailto.** |
| `SITE.email`, `SITE.vat`, … | Bedrijfsgegevens. Komen automatisch in de footer, de contactpagina en de schema-markup. |
| `SITE.social.linkedin` | Leeg laten verbergt de link overal. |

Vergeet ook niet:

- `public/robots.txt` — de sitemap-URL staat er hard in.
- De datum bovenaan `src/pages/privacy.astro` bij elke aanpassing.
- De portretten op `/over-ons/` zijn nog initialen. Vervang ze pas door échte
  documentaire foto's (natuurlijk licht, aan het werk, niet poserend) — geen
  stockbeeld met robots of blauwe netwerken.

## Structuur

```
src/
  config.js              alle bedrijfsgegevens, navigatie en dienstenlijst
  styles/global.css      het volledige designsysteem (tokens uit de brand extract)
  components/
    Seo.astro            canonical, OG/Twitter, JSON-LD graph
    Header/Footer        navigatie met uitklapmenu en mobiele lade
    ContactForm.astro    validatie, spamval, fetch- of mailto-verzending
    ChatDemo.astro       merk-eigen beeld i.p.v. stockfoto
    Faq.astro            <details>-accordeon, werkt zonder JavaScript
    Icon.astro           de volledige icoonset, 24×24 lijn
  layouts/
    BaseLayout.astro     head, header, footer, scroll-animatie
    ServiceLayout.astro  gedeeld skelet van de vijf dienstpagina's
  pages/                 elke route
  content/blog/          artikels in Markdown
scripts/
  generate-assets.mjs    og-image en app-iconen (npm run assets)
```

## SEO

Wat er per pagina automatisch goed staat:

- unieke `<title>` (≤ 60 tekens) en `meta description` (± 150 tekens);
- `<link rel="canonical">` en `hreflang` `nl-BE`;
- Open Graph + Twitter card met een gegenereerde afbeelding van 1200×630;
- JSON-LD `@graph` met `Organization`/`ProfessionalService`, `WebSite`,
  `WebPage` en waar van toepassing `Service`, `FAQPage`, `BlogPosting` en
  `BreadcrumbList`;
- `sitemap-index.xml` met prioriteiten per sectie, gegenereerd bij elke build;
- precies één `<h1>` per pagina en een logische kopstructuur.

Na het aanpassen van teksten: `npm run build` en controleer de output met de
[Rich Results Test](https://search.google.com/test/rich-results).

## Nieuw blogartikel

Zet een `.md`-bestand in `src/content/blog/`. De bestandsnaam wordt de URL.

```yaml
---
title: 'De titel zoals hij op de pagina staat'
metaTitle: 'Kortere variant voor Google' # optioneel
description: 'Max 165 tekens, dit staat in de zoekresultaten.'
date: 2026-08-05
tag: 'Aan de slag'
readingTime: 6
draft: false
---
```

Concepten (`draft: true`) verschijnen niet in de lijst, de sitemap of de
schema-markup.

## Toon

Nederlands, je-vorm, korte zinnen. Noem het werk, niet de technologie: "offertes
die zichzelf opmaken", niet "LLM-gedreven documentgeneratie". Elk cijfer krijgt
een zin die uitlegt waar het vandaan komt. Eerlijk zijn over wat níet lukt wekt
meer vertrouwen dan alles beloven.

## Deployen

De build is volledig statisch, dus alles wat `dist/` kan serveren werkt:
Netlify, Vercel, Cloudflare Pages of gewone webhosting.

- Build command: `npm run build`
- Publish directory: `dist`

Zet daarna in Google Search Console de sitemap op
`https://www.auxilia-ai.be/sitemap-index.xml`.
