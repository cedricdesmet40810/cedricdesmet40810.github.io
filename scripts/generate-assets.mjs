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
import { SITE } from '../src/config.js';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = resolve(root, 'public');
mkdirSync(pub, { recursive: true });

const font = (p) => readFileSync(resolve(root, 'node_modules', p));

// satori leest ttf/otf/woff — geen woff2. Vandaar de statische varianten.
const hanken = font('@fontsource/hanken-grotesk/files/hanken-grotesk-latin-400-normal.woff');
const hankenBold = font(
  '@fontsource/hanken-grotesk/files/hanken-grotesk-latin-600-normal.woff'
);

// Merkkleuren, gelijk aan global.css
const TEAL = '#174C46';
const CLAY = '#D2691E';
const SAND = '#F5F7F6';

/* ------------------------------------------------------------ og-image --- */

const scene = `data:image/jpeg;base64,${readFileSync(resolve(pub, 'hero-thuiswerk.jpg')).toString('base64')}`;
const text = (children, style) => ({ type: 'div', props: { children, style } });
const ogTree = {
  type: 'div',
  props: {
    style: { width: 1200, height: 630, display: 'flex', padding: 48, gap: 40, background: SAND, color: '#172F2B', fontFamily: 'Hanken Grotesk' },
    children: [
      { type: 'div', props: { style: { width: 560, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px 0' }, children: [
        text('Auxilia', { fontSize: 38, fontWeight: 600, letterSpacing: '-.05em' }),
        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column' }, children: [
          text('AI die voor je KMO werkt', { fontSize: 78, lineHeight: 1, fontWeight: 600, letterSpacing: '-.055em', maxWidth: 530 }),
          text('Chatbots op je eigen data, apps op maat en IT-beheer voor KMO’s.', { fontSize: 24, lineHeight: 1.45, marginTop: 26, color: '#50615D', maxWidth: 500 }),
        ] } },
        text(`${new URL(SITE.url).hostname} · Kempen, België`, { fontSize: 20, color: '#50615D' }),
      ] } },
      { type: 'img', props: { src: scene, width: 504, height: 534, style: { objectFit: 'cover', objectPosition: '44% 50%', borderRadius: '120px 20px 20px 20px' } } },
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
