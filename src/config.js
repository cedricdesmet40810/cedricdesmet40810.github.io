/**
 * Eén plek voor alles wat per omgeving of per klant kan wijzigen.
 * Pas dit aan voor je live gaat.
 */
export const SITE = {
  url: 'https://www.auxilia-ai.be',
  name: 'Auxilia',
  legalName: 'Auxilia',
  tagline: "AI en IT voor KMO's",
  // Max ~155 tekens voor de zoekresultatenpagina
  description:
    "Auxilia bouwt AI-chatbots op je eigen data, apps op maat en automatisaties voor KMO's. Eén aanspreekpunt voor AI en IT. Vaste prijs, vaste deadline.",
  locale: 'nl_BE',
  lang: 'nl-BE',
  email: 'hallo@auxilia-ai.be',
  phone: '+32 479 64 47 12',
  region: 'Vlaanderen',
  addressLocality: 'Kempen',
  addressCountry: 'BE',
  vat: 'BE 1038.962.149',
  companyNumber: '1038.962.149',
  founded: '2026',
  // Vul in zodra de kanalen live staan; lege waarden vallen automatisch weg.
  social: {
    linkedin: 'https://www.linkedin.com/company/auxilia-be',
  },
  // Boekingslink (Cal.com, Calendly, Google Appointments ...).
  // Leeg laten = de knoppen sturen naar /contact/.
  bookingUrl: '',
  // Endpoint voor het contactformulier (Formspree, Web3Forms, eigen API ...).
  // Leeg laten = het formulier valt terug op een mailto-link.
  formEndpoint: '',
};

export const NAV = [
  { label: 'Oplossingen', href: '/oplossingen/' },
  { label: 'Ons werk', href: '/ons-werk/' },
  { label: 'Over ons', href: '/over-ons/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact', href: '/contact/' },
];

/** De vijf diensten. Eén bron voor de navigatie, de hub, de kaarten en de schema-markup. */
export const SERVICES = [
  {
    slug: 'ai-chatbots',
    title: 'AI-chatbots op je eigen data',
    short: 'AI-chatbots',
    nav: 'Chatbot op je eigen data',
    excerpt:
      'Een assistent die antwoordt uit jouw documenten, prijzen en procedures in plaats van uit het internet.',
    icon: 'chat',
    beeld: '/opl-chatbots.jpg',
  },
  {
    slug: 'apps-op-maat',
    title: 'Apps en tools op maat',
    short: 'Apps op maat',
    nav: 'App op maat',
    excerpt:
      'Software gebouwd rond hoe jij werkt, in plaats van een pakket waar je je aan aanpast.',
    icon: 'app',
    beeld: '/opl-apps.jpg',
  },
  {
    slug: 'ai-integratie',
    title: 'AI integreren in je bedrijf',
    short: 'AI-integratie',
    nav: 'AI in je bedrijf',
    excerpt:
      'AI die meedraait in de systemen die je vandaag al gebruikt, en een team dat ermee overweg kan.',
    icon: 'flow',
    beeld: '/opl-integratie.jpg',
  },
  {
    slug: 'kostenbesparing',
    title: 'Kosten besparen met AI',
    short: 'Kostenbesparing',
    nav: 'Kosten besparen',
    excerpt:
      'We rekenen door waar AI je geld oplevert, en waar het je alleen maar tijd kost.',
    icon: 'chart',
    beeld: '/opl-kosten.jpg',
  },
  {
    slug: 'it-beheer',
    title: 'IT-beheer en ondersteuning',
    short: 'IT-beheer',
    nav: 'IT-beheer',
    excerpt:
      'Eén aanspreekpunt voor je werkplekken, licenties, back-ups en beveiliging.',
    icon: 'shield',
    beeld: '/opl-it-beheer.jpg',
  },
];
