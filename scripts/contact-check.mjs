import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.TEST_URL || 'http://127.0.0.1:4323';
const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  let response = { success: 'false', message: 'Unable to submit form' };
  // Intercept every provider request so this check cannot send real emails.
  await context.route('https://formsubmit.co/**', async route => {
    requests.push(route.request());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
  });
  await page.goto(base + '/contact/');
  assert.equal(await page.locator('form').getAttribute('action'), 'https://formsubmit.co/cedric@auxilia-ai.be');
  await page.locator('[name="naam"]').fill('Website test');
  await page.locator('[name="email"]').fill('visitor@example.com');
  await page.locator('[name="bedrijf"]').fill('Testbedrijf');
  await page.locator('[name="telefoon"]').fill('0470 12 34 56');
  await page.locator('[name="onderwerp"]').selectOption('AI-chatbots');
  await page.locator('[name="bericht"]').fill('Dit bericht blijft binnen de lokale browsertest.');
  await page.locator('[name="akkoord"]').check();
  for (const failure of [
    { success: 'false', message: 'Unable to submit form' },
    { success: false, message: 'Unable to submit form' },
    { success: 'true', message: 'This form needs Activation. We have sent you an email.' },
    {},
  ]) {
    response = failure;
    await page.getByRole('button', { name: 'Verstuur je vraag', exact: true }).click();
    await page.locator('[data-status][data-tone="fout"]').waitFor({ state: 'visible', timeout: 5000 });
    assert.equal(await page.locator('[name="bericht"]').inputValue(), 'Dit bericht blijft binnen de lokale browsertest.');
    assert.equal(await page.locator('[data-submit]').isEnabled(), true);
  }
  assert.equal(requests[0].url(), 'https://formsubmit.co/ajax/cedric@auxilia-ai.be');
  const payload = requests[0].postDataJSON();
  assert.equal(payload.email, 'visitor@example.com', 'The visitor address must be available for Reply-To');
  assert.equal(payload.naam, 'Website test');
  assert.equal(payload.bedrijf, 'Testbedrijf');
  assert.equal(payload.telefoon, '0470 12 34 56');
  assert.equal(payload.onderwerp, 'AI-chatbots');
  assert.equal(payload.bericht, 'Dit bericht blijft binnen de lokale browsertest.');
  assert.equal(payload.akkoord, 'on');
  assert.ok(payload._subject.includes('AI-chatbots'));
  console.log('PASS Provider errors preserve the message; submissions carry contact details and Reply-To');

  response = { success: 'true', message: 'The form was submitted successfully.' };
  await page.getByRole('button', { name: 'Verstuur je vraag', exact: true }).click();
  await page.locator('[data-status][data-tone="ok"]').waitFor({ state: 'visible', timeout: 5000 });
  assert.equal(await page.locator('[name="bericht"]').inputValue(), '');
  assert.equal(new URL(page.url()).pathname, '/contact/');
  console.log('PASS Successful delivery clears the form and keeps visitors on the site');

  const noJS = await browser.newContext({ javaScriptEnabled: false });
  let nativeRequest;
  await noJS.route('https://formsubmit.co/**', async route => {
    nativeRequest = route.request();
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Intercepted</p>' });
  });
  const native = await noJS.newPage();
  await native.goto(base + '/contact/');
  await native.locator('[name="naam"]').fill('Website test');
  await native.locator('[name="email"]').fill('visitor@example.com');
  await native.locator('[name="bericht"]').fill('Ook zonder JavaScript blijft verzenden mogelijk.');
  await native.locator('[name="akkoord"]').check();
  await Promise.all([
    native.waitForURL('https://formsubmit.co/**'),
    native.getByRole('button', { name: 'Verstuur je vraag', exact: true }).click(),
  ]);
  assert.equal(nativeRequest.method(), 'POST');
  assert.equal(nativeRequest.url(), 'https://formsubmit.co/cedric@auxilia-ai.be');
  const nativePayload = new URLSearchParams(nativeRequest.postData());
  assert.equal(nativePayload.get('email'), 'visitor@example.com');
  assert.equal(nativePayload.get('_honey'), '', 'Spam trap must reach the provider without JavaScript');
  assert.notEqual(nativePayload.get('_captcha'), 'false', 'Keep provider spam protection enabled');
  console.log('PASS Native form submission uses the HTML endpoint with spam protection');
} finally {
  await browser.close();
}
