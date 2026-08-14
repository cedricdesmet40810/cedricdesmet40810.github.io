import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = process.env.SHOT_OUT || './.shots';
mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:4321';
const pages = process.argv[2]
  ? [process.argv[2]]
  : ['/', '/oplossingen/', '/oplossingen/ai-chatbots/', '/ons-werk/', '/over-ons/', '/contact/', '/blog/'];

const widths = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
];

const browser = await chromium.launch();

for (const [label, w, h] of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  for (const path of pages) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // scroll-reveals afdwingen zodat niets onzichtbaar op de foto staat
    await page.evaluate(() =>
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'))
    );
    await page.waitForTimeout(250);

    const name = (path === '/' ? 'home' : path.replace(/\//g, '-').replace(/^-|-$/g, '')) + `.${label}.png`;
    await page.screenshot({ path: `${OUT}/${name}`, fullPage: true });

    // overflow en afgeknipte koppen opsporen
    const issues = await page.evaluate(() => {
      const out = [];
      const docW = document.documentElement.clientWidth;
      document.querySelectorAll('h1,h2,h3,h4,p,li,a,span,div').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (r.right > docW + 1 || r.left < -1) {
          const t = (el.textContent || '').trim().slice(0, 55);
          if (t) out.push({ kind: 'overflow', tag: el.tagName, cls: el.className?.toString?.().slice(0, 40), text: t, right: Math.round(r.right), docW });
        }
        // tekst die buiten zijn eigen doos valt
        if (/^H[1-4]$/.test(el.tagName) && el.scrollWidth > el.clientWidth + 2) {
          out.push({ kind: 'clipped', tag: el.tagName, text: (el.textContent || '').trim().slice(0, 55), scrollW: el.scrollWidth, clientW: el.clientWidth });
        }
      });
      return out;
    });
    if (issues.length) {
      console.log(`\n### ${path}  [${label} ${w}px]`);
      const seen = new Set();
      for (const i of issues) {
        const k = i.kind + i.text;
        if (seen.has(k)) continue;
        seen.add(k);
        console.log('  ', JSON.stringify(i));
      }
    }
  }
  await ctx.close();
}

await browser.close();
console.log('\nklaar →', OUT);
