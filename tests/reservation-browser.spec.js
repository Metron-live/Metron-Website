const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const productionApi = 'https://api.metron.live/api/v1/launch-reservations';
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

let server;
let origin;
let capturedRequests;
let reservationApiUnavailable;

if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) {
  test.use({
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
  });
}

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

test.beforeAll(async () => {
  capturedRequests = [];
  reservationApiUnavailable = false;
  server = http.createServer((request, response) => {
    const url = new URL(request.url, origin || 'http://127.0.0.1');
    if (url.pathname.startsWith('/api/v1/launch-reservations/')) {
      let rawBody = '';
      request.setEncoding('utf8');
      request.on('data', (chunk) => { rawBody += chunk; });
      request.on('end', () => {
        const body = JSON.parse(rawBody || '{}');
        capturedRequests.push({ path: url.pathname, body });
        if (reservationApiUnavailable) {
          json(response, 404, { detail: 'Reservation API not deployed' });
        } else if (url.pathname.endsWith('/request')) {
          json(response, 200, { status: 'pending' });
        } else {
          json(response, 200, { status: 'verified', one_year_free_eligible: true });
        }
      });
      return;
    }

    const relative = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    let body = fs.readFileSync(file);
    if (relative === 'index.html') {
      const localApi = `${origin}/api/v1/launch-reservations`;
      body = Buffer.from(body.toString('utf8').replaceAll(productionApi, localApi));
    }
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(file)] || 'application/octet-stream' });
    response.end(body);
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test.beforeEach(() => {
  capturedRequests = [];
  reservationApiUnavailable = false;
});

test('phone reservation posts to configured request and verify endpoints', async ({ page }) => {
  await page.goto(origin, { waitUntil: 'domcontentloaded' });

  const config = await page.evaluate(() => window.MetronReservationConfig);
  expect(config.apiBase).toBe(`${origin}/api/v1/launch-reservations`);

  await page.locator('#hero-contact').fill('+1 415 555 0123');
  await page.locator('#hero-submit').click();
  await expect(page.locator('#hero-contact')).toHaveAttribute('placeholder', 'Verification code');
  expect(capturedRequests[0]).toEqual({
    path: '/api/v1/launch-reservations/request',
    body: expect.objectContaining({
      phone: '+1 415 555 0123',
      consent: true,
      source: 'hero',
      campaign: 'founding-year'
    })
  });

  await page.locator('#hero-contact').fill('123456');
  await page.locator('#hero-submit').click();
  await expect(page.locator('#hero-success')).toBeVisible();
  expect(capturedRequests[1]).toEqual({
    path: '/api/v1/launch-reservations/verify',
    body: { phone: '+1 415 555 0123', code: '123456' }
  });
});

test('email option uses the same verified reservation contract', async ({ page }) => {
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.locator('#beta-form [data-contact-toggle]').click();
  await expect(page.locator('#beta-contact')).toHaveAttribute('type', 'email');
  await page.locator('#beta-contact').fill('athlete@example.com');
  await page.locator('#beta-submit').click();
  await expect(page.locator('#beta-contact')).toHaveAttribute('placeholder', 'Verification code');
  expect(capturedRequests[0].path).toBe('/api/v1/launch-reservations/request');
  expect(capturedRequests[0].body.email).toBe('athlete@example.com');
});

test('unavailable backend exposes a working email waitlist fallback', async ({ page }) => {
  reservationApiUnavailable = true;
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.locator('#beta-contact').fill('+1 415 555 0123');
  await page.locator('#beta-submit').click();

  await expect(page.locator('#beta-contact')).toHaveAttribute('type', 'email');
  await expect(page.locator('#beta-fallback')).toBeVisible();
  await expect(page.locator('#beta-fallback a')).toHaveAttribute('href', /^mailto:beta@metron\.live/);
  expect(capturedRequests[0].path).toBe('/api/v1/launch-reservations/request');

  await page.locator('#beta-contact').fill('athlete@example.com');
  await page.locator('#beta-submit').click();
  expect(capturedRequests[1]).toEqual({
    path: '/api/v1/launch-reservations/request',
    body: expect.objectContaining({ email: 'athlete@example.com', consent: true })
  });
  await expect(page.locator('#beta-fallback a')).toBeVisible();
});

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 }
]) {
  test(`${viewport.name} layout keeps the hero and reservation in bounds`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#hero-title')).toBeVisible();
    await expect(page.locator('#hero-form')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
