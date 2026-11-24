const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { expect, test } = require('@playwright/test');

const sourceRoot = path.resolve(__dirname, '..');
const root = path.join(sourceRoot, 'dist');
const types = { '.css': 'text/css', '.html': 'text/html', '.ico': 'image/x-icon', '.jpg': 'image/jpeg', '.js': 'text/javascript', '.mp4': 'video/mp4', '.png': 'image/png', '.svg': 'image/svg+xml' };
let server;
let origin;

test.beforeAll(async () => {
  if (!fs.existsSync(path.join(root, 'index.html'))) {
    throw new Error('Missing dist/index.html. Run `npm run build` before the Playwright smoke test.');
  }
  server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : /^\/r\/[^/]+\/?$/.test(pathname) ? '404.html' : pathname.replace(/^\//, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => new Promise((resolve) => server.close(resolve)));

test('renders the required hero and reservation form', async ({ page }) => {
  await page.goto(origin);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText("The world's smartest personal trainer.");
  await expect(page.locator('#reservation-form')).toBeVisible();
  await expect(page.locator('#reservation-contact')).toBeVisible();
  await expect(page.locator('#marketing-consent')).toBeVisible();
  await expect(page.locator('.consent-field')).toContainText('Text me my download link at launch. Msg & data rates may apply. Reply STOP to opt out.');
  await expect(page.locator('#verification-form')).toBeHidden();
});

test('requires launch-message consent before contacting the API', async ({ page }) => {
  let requestCount = 0;
  page.on('request', (request) => {
    if (request.url().startsWith('https://api.metron.live/launch/reservations/')) requestCount += 1;
  });
  await page.goto(origin);

  await page.locator('#reservation-contact').fill('+14155550123');
  await page.locator('#reservation-submit').click();

  await expect(page.locator('#marketing-consent')).toBeFocused();
  await expect(page.locator('#verification-form')).toBeHidden();
  expect(requestCount).toBe(0);
});

test('completes the live two-step SMS reservation flow', async ({ page }) => {
  const requests = [];
  await page.route('https://api.metron.live/launch/reservations/**', async (route) => {
    const request = route.request();
    requests.push({ url: request.url(), method: request.method(), body: request.postDataJSON() });
    const status = request.url().endsWith('/start') ? 'pending' : 'reserved';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status }) });
  });
  await page.goto(origin);

  await page.locator('#reservation-contact').fill('+14155550123');
  await page.locator('#marketing-consent').check();
  await page.locator('#reservation-submit').click();
  await expect(page.locator('#verification-form')).toBeVisible();
  await expect(page.locator('#reservation-status')).toContainText('text message');
  await page.locator('#verification-code').fill('123456');
  await page.locator('#verification-submit').click();
  await expect(page.locator('#reservation-status')).toHaveText('Reservation confirmed.');
  await expect(page.locator('#reservation-message')).toContainText('first year of the full Metron coach is reserved free');

  expect(requests).toEqual([
    {
      url: 'https://api.metron.live/launch/reservations/start',
      method: 'POST',
      body: { contact: '+14155550123', channel: 'sms', consent_marketing: true }
    },
    {
      url: 'https://api.metron.live/launch/reservations/check',
      method: 'POST',
      body: { contact: '+14155550123', code: '123456' }
    }
  ]);
});

test('captures a referral route for 30 days and sends it with the reservation', async ({ page }) => {
  const requests = [];
  await page.route('https://api.metron.live/referrals/ABC2345', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ first_name: 'Maya' }) });
  });
  await page.route('https://api.metron.live/launch/reservations/**', async (route) => {
    const request = route.request();
    requests.push({ url: request.url(), body: request.postDataJSON() });
    const status = request.url().endsWith('/start') ? 'pending' : 'reserved';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status }) });
  });

  await page.goto(`${origin}/r/abc2345`);
  await expect.poll(() => page.url()).toBe(`${origin}/#reserve`);
  await expect(page.locator('#referral-invite')).toHaveText('Invited by Maya');
  await expect(page.locator('#referral-invite')).toBeVisible();

  const [cookie] = await page.context().cookies(origin);
  expect(cookie.name).toBe('metron_ref');
  expect(cookie.value).toBe('ABC2345');
  expect(cookie.sameSite).toBe('Lax');
  expect(cookie.expires).toBeGreaterThan(Date.now() / 1000 + (29 * 24 * 60 * 60));
  expect(cookie.expires).toBeLessThan(Date.now() / 1000 + (31 * 24 * 60 * 60));

  await page.locator('#reservation-contact').fill('+14155550123');
  await page.locator('#marketing-consent').check();
  await page.locator('#reservation-submit').click();
  await page.locator('#verification-code').fill('123456');
  await page.locator('#verification-submit').click();

  expect(requests).toEqual([
    {
      url: 'https://api.metron.live/launch/reservations/start',
      body: { contact: '+14155550123', channel: 'sms', consent_marketing: true, ref: 'ABC2345' }
    },
    {
      url: 'https://api.metron.live/launch/reservations/check',
      body: { contact: '+14155550123', code: '123456', ref: 'ABC2345' }
    }
  ]);
});

test('ignores an unknown referral code', async ({ page }) => {
  let lookupCount = 0;
  let requestBody;
  await page.route('https://api.metron.live/referrals/ZYX9876', async (route) => {
    lookupCount += 1;
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'Not found' }) });
  });
  await page.route('https://api.metron.live/launch/reservations/start', async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'pending' }) });
  });

  await page.goto(`${origin}/r/zyx9876`);
  await expect.poll(() => page.url()).toBe(`${origin}/#reserve`);
  await expect.poll(() => lookupCount).toBe(1);
  await expect(page.locator('#referral-invite')).toBeHidden();
  expect(await page.context().cookies(origin)).toEqual([]);

  await page.locator('#reservation-contact').fill('athlete@example.com');
  await page.locator('#marketing-consent').check();
  await page.locator('#reservation-submit').click();

  expect(requestBody).toEqual({ contact: 'athlete@example.com', channel: 'email', consent_marketing: true });
});

test('selects email verification and displays API errors', async ({ page }) => {
  let requestBody;
  await page.route('https://api.metron.live/launch/reservations/start', async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ detail: 'Invalid email address.' }) });
  });
  await page.goto(origin);

  await page.locator('#reservation-contact').fill('athlete@example.com');
  await page.locator('#marketing-consent').check();
  await page.locator('#reservation-submit').click();
  await expect(page.locator('#reservation-message')).toHaveText('Invalid email address.');
  await expect(page.locator('#reservation-fallback')).toBeVisible();
  await expect(page.locator('#reservation-fallback-link')).toHaveAttribute('href', /mailto:hello@metron\.live/);
  expect(requestBody).toEqual({ contact: 'athlete@example.com', channel: 'email', consent_marketing: true });
});

test('rejects responses outside the pending and reserved schemas', async ({ page }) => {
  await page.route('https://api.metron.live/launch/reservations/start', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'reserved' }) });
  });
  await page.goto(origin);

  await page.locator('#reservation-contact').fill('+14155550123');
  await page.locator('#marketing-consent').check();
  await page.locator('#reservation-submit').click();

  await expect(page.locator('#reservation-message')).toHaveText('The verification service returned an unexpected response.');
  await expect(page.locator('#reservation-form')).toBeVisible();
  await expect(page.locator('#verification-form')).toBeHidden();

  await page.unroute('https://api.metron.live/launch/reservations/start');
  await page.route('https://api.metron.live/launch/reservations/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'pending' }) });
  });
  await page.locator('#reservation-submit').click();
  await page.locator('#verification-code').fill('123456');
  await page.locator('#verification-submit').click();

  await expect(page.locator('#reservation-message')).toHaveText('The verification service returned an unexpected response.');
  await expect(page.locator('#verification-form')).toBeVisible();
  await expect(page.locator('#reservation-status')).not.toHaveText('Reservation confirmed.');
});

test('interpolates the nav across 120px and lets the next section peek into the first fold', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin);
  const nav = page.locator('#site-nav');
  const lightLogo = page.locator('.nav__lockup--light');
  const darkLogo = page.locator('.nav__lockup--dark');
  await expect(nav).toHaveAttribute('data-scroll-progress', '0.000');
  expect(await nav.evaluate((element) => getComputedStyle(element, '::before').transitionDuration)).toBe('0.3s');
  expect(await nav.evaluate((element) => getComputedStyle(element, '::before').opacity)).toBe('0');
  expect(await nav.evaluate((element) => getComputedStyle(element, '::before').backgroundImage)).toContain('images/marble.png');
  await expect(lightLogo).toHaveCSS('opacity', '1');
  await expect(darkLogo).toHaveCSS('opacity', '0');
  await expect(page.locator('body')).toHaveCSS('font-family', 'Cardo, serif');
  await expect(nav).toHaveCSS('font-family', 'Cardo, serif');
  await expect(page.locator('#hero-title')).toHaveCSS('font-family', 'Cardo, serif');

  const firstFold = await page.evaluate(() => ({ heroBottom: document.querySelector('.hero').getBoundingClientRect().bottom, problemTop: document.querySelector('#problem').getBoundingClientRect().top, nextLineBottom: document.querySelector('#problem .section__label').getBoundingClientRect().bottom, viewport: innerHeight }));
  expect(firstFold.heroBottom).toBeLessThan(firstFold.viewport);
  expect(firstFold.problemTop).toBeLessThan(firstFold.viewport);
  expect(firstFold.nextLineBottom).toBeLessThan(firstFold.viewport);

  await page.evaluate(() => scrollTo(0, 60));
  await expect.poll(() => nav.getAttribute('data-scroll-progress')).toBe('0.500');
  await expect.poll(() => nav.evaluate((element) => getComputedStyle(element, '::before').opacity)).toBe('0.5');

  await page.evaluate(() => scrollTo(0, 48));
  await expect.poll(() => lightLogo.evaluate((element) => getComputedStyle(element).opacity)).toBe('0.5');
  await expect.poll(() => darkLogo.evaluate((element) => getComputedStyle(element).opacity)).toBe('0.5');

  await page.evaluate(() => scrollTo(0, 200));
  await expect.poll(() => nav.getAttribute('data-scroll-progress')).toBe('1.000');
  await expect.poll(() => nav.evaluate((element) => getComputedStyle(element, '::before').opacity)).toBe('1');
  await expect(page.locator('text=Get the App').first()).toBeVisible();
  const legacyShape = `[class*="hepta${'gon'}"], [id*="hepta${'gon'}"]`;
  expect(await page.locator(legacyShape).count()).toBe(0);
});

test('keeps the reservation form usable on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('#reservation-form')).toBeVisible();
  const bounds = await page.locator('#reservation-form').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
});
