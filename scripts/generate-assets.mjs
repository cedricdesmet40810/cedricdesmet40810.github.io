/**
 * Genereert de afbeeldingen die niet uit de site zelf komen:
 *   public/og-image.png        1200×630, voor social cards
 *   public/logo.png            512×512, voor de Organization-schema
 *   public/apple-touch-icon.png 180×180
 *   public/icon-192.png, icon-512.png
 *
 * Draai opnieuw met:  npm run assets
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = resolve(root, 'public');
mkdirSync(pub, { recursive: true });

const font = (p) => readFileSync(resolve(root, 'node_modules', p));

// satori leest ttf/otf/woff — geen woff2. Vandaar de statische varianten.
const spectral = font('@fontsource/spectral/files/spectral-latin-500-normal.woff');
const hanken = font('@fontsource/hanken-grotesk/files/hanken-grotesk-latin-400-normal.woff');
const hankenBold = font(
  '@fontsource/hanken-grotesk/files/hanken-grotesk-latin-600-normal.woff'
);

// Merkkleuren, gelijk aan global.css
const TEAL = '#0F5C5A';
const CLAY = '#D2691E';
const SAND = '#FAF7F2';

/** Het losstaande teken, als losse elementen zodat satori het kan tekenen. */
const mark = (size) => ({
  type: 'div',
  props: {
    style: {
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: 'rgba(250,247,242,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    children: {
      type: 'svg',
      props: {
        width: size * 0.66,
        height: size * 0.66,
        viewBox: '0 0 40 40',
        children: [
          {
            type: 'path',
            props: {
              d: 'M8 21 L20 10 L32 21',
              fill: 'none',
              stroke: SAND,
              strokeWidth: 4,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            },
          },
          {
            type: 'path',
            props: {
              d: 'M8 32 L20 21 L32 32',
              fill: 'none',
              stroke: CLAY,
              strokeWidth: 4,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            },
          },
        ],
      },
    },
  },
});

/* ------------------------------------------------------------ og-image --- */

const ogTree = {
  type: 'div',
  props: {
    style: {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: TEAL,
      padding: 72,
      fontFamily: 'Hanken Grotesk',
      position: 'relative',
    },
    children: [
      // Zacht licht rechtsboven, zodat het vlak niet dood aanvoelt.
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            top: -180,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: 'rgba(62,132,130,0.34)',
          },
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', gap: 20 },
          children: [
            mark(64),
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'Spectral',
                  fontSize: 44,
                  color: SAND,
                  letterSpacing: '-0.022em',
                },
                children: 'Auxilia',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column' },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'Spectral',
                  fontSize: 74,
                  lineHeight: 1.08,
                  letterSpacing: '-0.022em',
                  color: SAND,
                  maxWidth: 940,
                },
                children: 'AI die jouw bedrijf van binnen kent',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  marginTop: 26,
                  fontSize: 30,
                  lineHeight: 1.5,
                  color: 'rgba(250,247,242,0.74)',
                  maxWidth: 800,
                },
                children:
                  'Chatbots op je eigen data, apps op maat en IT-beheer voor KMO’s.',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', gap: 18 },
          children: [
            {
              type: 'div',
              props: {
                style: { width: 40, height: 4, borderRadius: 4, background: CLAY },
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: 26,
                  fontWeight: 600,
                  color: 'rgba(250,247,242,0.86)',
                  letterSpacing: '0.02em',
                },
                children: 'www.auxilia.be · Kempen, België',
              },
            },
          ],
        },
      },
    ],
  },
};

/* --------------------------------------------------------------- icoon --- */

const iconTree = (size) => ({
  type: 'div',
  props: {
    style: {
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: TEAL,
    },
    children: {
      type: 'svg',
      props: {
        width: size * 0.62,
        height: size * 0.62,
        viewBox: '0 0 40 40',
        children: [
          {
            type: 'path',
            props: {
              d: 'M8 21 L20 10 L32 21',
              fill: 'none',
              stroke: SAND,
              strokeWidth: 4.2,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            },
          },
          {
            type: 'path',
            props: {
              d: 'M8 32 L20 21 L32 32',
              fill: 'none',
              stroke: CLAY,
              strokeWidth: 4.2,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            },
          },
        ],
      },
    },
  },
});

/* --------------------------------------------------------------- bouw --- */

const fonts = [
  { name: 'Spectral', data: spectral, weight: 500, style: 'normal' },
  { name: 'Hanken Grotesk', data: hanken, weight: 400, style: 'normal' },
  { name: 'Hanken Grotesk', data: hankenBold, weight: 600, style: 'normal' },
];

async function render(tree, width, height, out) {
  const svg = await satori(tree, { width, height, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } })
    .render()
    .asPng();
  writeFileSync(resolve(pub, out), png);
  console.log(`✓ ${out}  ${width}×${height}  ${(png.length / 1024).toFixed(0)} kB`);
}

await render(ogTree, 1200, 630, 'og-image.png');
await render(iconTree(512), 512, 512, 'logo.png');
await render(iconTree(512), 512, 512, 'icon-512.png');
await render(iconTree(192), 192, 192, 'icon-192.png');
await render(iconTree(180), 180, 180, 'apple-touch-icon.png');
