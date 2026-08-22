// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { SITE } from './src/config.js';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: {
    // Clean URLs: /contact/ instead of /contact.html
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  // De aanpak-pagina is opgegaan in de werkwijze-sectie op de homepage.
  // Oude links en zoekresultaten mogen daar niet op stuklopen.
  redirects: {
    '/aanpak/': '/#werkwijze',
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'nl',
        locales: { nl: 'nl-BE' },
      },
      filter: (page) => !page.includes('/bedankt/') && !page.includes('/aanpak/'),
      serialize(item) {
        const path = new URL(item.url).pathname;
        if (path === '/') item.priority = 1.0;
        else if (path.startsWith('/oplossingen/')) item.priority = 0.9;
        else if (path === '/privacy/') item.priority = 0.2;
        else item.priority = 0.8;
        item.changefreq = 'monthly';
        return item;
      },
    }),
  ],
});
