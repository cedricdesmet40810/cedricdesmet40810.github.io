import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const base = process.env.TEST_URL || 'http://127.0.0.1:4323';
const paths = ['/', '/oplossingen/', '/oplossingen/ai-chatbots/', '/oplossingen/apps-op-maat/', '/oplossingen/ai-integratie/', '/oplossingen/kostenbesparing/', '/oplossingen/it-beheer/', '/ons-werk/', '/over-ons/', '/contact/', '/privacy/', '/bedankt/', '/404/'];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const baselinePath = new URL('../tests/fixtures/content-baseline.json', import.meta.url);
const textNodes = () => {
  const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
  const text = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script,style,svg')) continue;
    const value = node.textContent.replace(/\s+/g, ' ').trim();
    if (value && !/^[→↗↓]$/.test(value)) text.push(value);
  }
  return text;
};

if (process.argv.includes('--baseline')) {
  const baseline = {};
  for (const path of paths) {
    await page.goto(base + path);
    baseline[path] = await page.evaluate(textNodes);
  }
  await writeFile(baselinePath, JSON.stringify(baseline, null, 2));
  console.log(`Recorded original text on ${paths.length} pages.`);
} else {
  const failures = [];
  const test = async (name, run) => {
    try { await run(); console.log(`PASS ${name}`); }
    catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message}`); }
  };

  await test('Main content is visible with JavaScript disabled', async () => {
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const p = await noJS.newPage();
    await p.goto(base);
    const invisible = await p.locator('main .reveal').evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).opacity === '0').length);
    assert.equal(invisible, 0, 'Content must not depend on JavaScript to become visible');
    await noJS.close();
  });

  await test('Mobile menu contains keyboard focus and restores it on Escape', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    const toggle = page.getByRole('button', { name: 'Menu openen' });
    await toggle.click();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#mobiel-menu').evaluate(el => el.contains(document.activeElement)), true, 'Tab should enter the open menu');
    await page.locator('#mobiel-menu a').last().focus();
    await page.keyboard.press('Tab');
    const focusIsContained = await page.evaluate(() => document.querySelector('#mobiel-menu').contains(document.activeElement) || document.activeElement.matches('[data-menu-toggle]'));
    assert.equal(focusIsContained, true, 'Tab must not reach the hidden page behind the menu');
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await toggle.evaluate(el => el === document.activeElement), true);
  });

  await test('Contact errors are linked to their fields', async () => {
    await page.goto(base + '/contact/');
    await page.getByRole('button', { name: 'Verstuur je vraag' }).click();
    for (const name of ['naam', 'email', 'bericht', 'akkoord']) {
      const input = page.locator(`[name="${name}"]`);
      assert.equal(await input.getAttribute('aria-invalid'), 'true');
      const id = await input.getAttribute('aria-describedby');
      assert.ok(id, `${name} needs an accessible error description`);
      assert.ok(await page.locator(`[id="${id}"]`).isVisible());
    }
  });

  await test('FAQ expands using the keyboard', async () => {
    await page.goto(base);
    const question = page.locator('.faq summary').first();
    await question.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.faq details').first().getAttribute('open'), '');
  });

  await test('Desktop solutions menu opens and closes with keyboard and outside click', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base);
    const summary = page.locator('[data-nav-disclosure] summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-nav-disclosure]').getAttribute('open'), '');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-nav-disclosure]').getAttribute('open'), null);
    assert.equal(await summary.evaluate(el => el === document.activeElement), true);
    await page.setViewportSize({ width: 1366, height: 600 });
    await summary.click();
    const lastService = page.locator('.submenu a').last();
    await lastService.focus();
    const lastBounds = await lastService.boundingBox();
    assert.ok(lastBounds.y >= 0 && lastBounds.y + lastBounds.height <= 600, 'Last service must be reachable on short screens');
    await page.locator('main h1').click();
    assert.equal(await page.locator('[data-nav-disclosure]').getAttribute('open'), null);
  });

  await test('Contact delivery handles errors, preserves input and prevents duplicate requests', async () => {
    // The entire delivery flow stays inside intercepted local test routes.
    const contactContext = await browser.newContext();
    const p = await contactContext.newPage();
    await p.route('**/contact/', async route => {
      const response = await route.fetch();
      const body = (await response.text()).replace(/\bdata-endpoint(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/, 'data-endpoint="/__test-contact"');
      await route.fulfill({ response, body });
    });
    let status = 500;
    let count = 0;
    let release;
    let requestReady;
    const ready = new Promise(resolve => { requestReady = resolve; });
    await p.route('**/__test-contact', async route => {
      count++;
      if (status === 200) await new Promise(resolve => { release = resolve; requestReady(); });
      await route.fulfill({ status, contentType: 'application/json', body: '{}' });
    });
    await p.goto(base + '/contact/');
    assert.equal(await p.locator('form').getAttribute('data-endpoint'), '/__test-contact');
    await p.locator('[name="naam"]').fill('Website test');
    await p.locator('[name="email"]').fill('test@example.com');
    await p.locator('[name="bericht"]').fill('This message is only used in an intercepted local browser test.');
    await p.locator('[name="akkoord"]').check();
    await p.getByRole('button', { name: 'Verstuur je vraag' }).click();
    await p.locator('[data-status][data-tone="fout"]').waitFor({ state: 'visible' });
    assert.equal(await p.locator('[name="naam"]').inputValue(), 'Website test');
    assert.equal(await p.locator('[data-submit]').isEnabled(), true);
    status = 200;
    await p.getByRole('button', { name: 'Verstuur je vraag' }).click();
    await ready;
    await p.waitForFunction(() => document.querySelector('[data-submit]').disabled);
    await p.locator('form').evaluate(form => form.requestSubmit());
    assert.equal(count, 2, 'Only one retry may be sent while the request is pending');
    release();
    await p.locator('[data-status][data-tone="ok"]').waitFor({ state: 'visible' });
    assert.equal(await p.locator('[name="naam"]').inputValue(), '');
    assert.equal(await p.locator('[data-submit]').isEnabled(), true);
    await contactContext.close();
  });

  if (!process.argv.includes('--regressions')) {
    const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
    const errors = [];
    const internalLinks = new Set();
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of paths) {
        await test(`${path} at ${width}px: content, links, images, layout and metadata`, async () => {
          const response = await page.goto(base + path);
          assert.ok(response.ok() || path === '/404/', 'Route should respond successfully');
          await page.evaluate(() => document.fonts.ready);
          const texts = (await page.evaluate(textNodes)).join(' ');
          for (const original of baseline[path]) assert.ok(texts.includes(original), `Missing original text: ${original}`);
          assert.equal(await page.locator('main h1').count(), 1);
          for (const hero of await page.locator('.hero__beeld,.phero__beeld').all()) assert.equal(await hero.getAttribute('loading'), 'eager');
          assert.ok(await page.title());
          assert.ok(await page.locator('meta[name="description"]').getAttribute('content'));
          assert.ok(await page.locator('link[rel="canonical"]').getAttribute('href'));
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          assert.equal(overflow, false, 'Page must fit the viewport');
          const clipped = await page.locator('main h1,main h2,main h3').evaluateAll(nodes => nodes.filter(n => n.scrollWidth > n.clientWidth + 2).map(n => n.textContent));
          assert.deepEqual(clipped, [], 'Headings must not be clipped');
          await page.locator('img').evaluateAll(async nodes => { for (const n of nodes) { n.loading = 'eager'; await n.decode().catch(() => {}); } });
          const broken = await page.locator('img').evaluateAll(nodes => nodes.filter(n => !n.complete || !n.naturalWidth).map(n => n.getAttribute('src')));
          assert.deepEqual(broken, []);
          assert.equal(await page.locator('a[href="#"]').count(), 0);
          for (const href of await page.locator('a[href^="/"]').evaluateAll(nodes => nodes.map(a => a.getAttribute('href').split('#')[0]))) internalLinks.add(href || '/');
          const invalidAnchors = await page.locator('a[href^="#"]').evaluateAll(nodes => nodes.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash));
          assert.deepEqual(invalidAnchors, []);
        });
      }
    }
    await test('Every internal page link resolves', async () => {
      for (const href of internalLinks) {
        const response = await context.request.get(base + href);
        assert.ok(response.ok(), `${href} returned ${response.status()}`);
      }
    });
    await test('Legacy approach URL reaches the process section', async () => {
      await page.goto(base + '/aanpak/');
      await page.waitForURL('**/#werkwijze');
    });
    await test('No browser exceptions', async () => assert.deepEqual(errors, []));
  }
  if (failures.length) process.exitCode = 1;
  console.log(`${failures.length} failed checks.`);
}
await browser.close();
