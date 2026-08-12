// Screenshot een externe site als designreferentie.
// gebruik: node scripts/shoot-url.mjs https://example.com naam
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT =
  '/private/tmp/claude-501/-Users-cedricdesmet/ed73d84c-529b-4485-89a2-cc4257e8ade9/scratchpad/shots';
mkdirSync(OUT, { recursive: true });

const [url, name = 'ref'] = process.argv.slice(2);
const browser = await chromium.launch();

for (const [label, w, h] of [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: label === 'desktop' ? 1.5 : 2,
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  // lazy content en animaties triggeren door traag door te scrollen
  await page.evaluate(async () => {
    await new Promise((done) => {
      let y = 0;
      const step = () => {
        y += 600;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) setTimeout(step, 120);
        else {
          window.scrollTo(0, 0);
          setTimeout(done, 600);
        }
      };
      step();
    });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${name}.${label}.png`, fullPage: true });
  console.log(`✓ ${name}.${label}.png`);
  await ctx.close();
}

await browser.close();
