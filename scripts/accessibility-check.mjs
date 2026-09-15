import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base = process.env.TEST_URL || 'http://127.0.0.1:4323';
const paths = ['/', '/oplossingen/', '/oplossingen/ai-chatbots/', '/oplossingen/apps-op-maat/', '/oplossingen/ai-integratie/', '/oplossingen/kostenbesparing/', '/oplossingen/it-beheer/', '/ons-werk/', '/over-ons/', '/contact/', '/privacy/', '/bedankt/', '/404/'];
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
let failures = 0;
const scan = async label => {
  await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))));
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  if (violations.length) {
    failures += violations.length;
    console.log(JSON.stringify({ label, violations: violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, reason: n.failureSummary })) })) }, null, 2));
  } else console.log(`PASS ${label}`);
};
for (const width of [390, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const path of paths) {
    await page.goto(base + path);
    await page.evaluate(() => document.fonts.ready);
    await scan(`${path} ${width}px`);
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base);
await page.getByRole('button', { name: 'Menu openen' }).click();
await scan('Open mobile menu');
await page.goto(base + '/contact/');
const configuredEndpoint = await page.locator('#contactformulier').getAttribute('data-endpoint');
await page.getByRole('button', { name: configuredEndpoint ? 'Verstuur je vraag' : 'Open je e-mail', exact: true }).click();
await scan('Contact form with errors');
console.log(`${failures} accessibility violations.`);
await browser.close();
if (failures) process.exitCode = 1;
