const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { expect, test } = require('@playwright/test');

const root = path.resolve(__dirname, '..', 'dist');
let server;
let origin;

test.beforeAll(async () => {
  server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, pathname === '/' ? 'index.html' : pathname.replace(/^\//, ''));
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return response.writeHead(404).end('Not found');
    response.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => new Promise((resolve) => server.close(resolve)));

test('posts the phone-first two-step reservation contract', async ({ page }) => {
  const requests = [];
  await page.route('https://api.metron.live/launch/reservations/**', async (route) => {
    const request = route.request();
    requests.push({ url: request.url(), method: request.method(), body: request.postDataJSON() });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: request.url().endsWith('/start') ? 'pending' : 'reserved' }) });
  });
  await page.goto(origin);
  await page.locator('#contact').fill('+14155550123');
  await page.locator('#consent').check();
  await page.locator('#send-code').click();
  await expect(page.locator('#code-step')).toBeVisible();
  await page.locator('#code').fill('123456');
  await page.locator('#verify-code').click();
  await expect(page.locator('#form-status')).toHaveText('You are reserved. We will see you at launch.');
  expect(requests).toEqual([
    { url: 'https://api.metron.live/launch/reservations/start', method: 'POST', body: { contact: '+14155550123' } },
    { url: 'https://api.metron.live/launch/reservations/check', method: 'POST', body: { contact: '+14155550123', code: '123456', consent_marketing: true } }
  ]);
});

test('supports email verification and degrades to email waitlist', async ({ page }) => {
  let requestBody;
  await page.route('https://api.metron.live/launch/reservations/start', async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ detail: 'Temporarily unavailable.' }) });
  });
  await page.goto(origin);
  await page.getByRole('tab', { name: 'Email' }).click();
  await page.locator('#contact').fill('athlete@example.com');
  await page.locator('#consent').check();
  await page.locator('#send-code').click();
  await expect(page.locator('#fallback')).toBeVisible();
  await expect(page.locator('#fallback-link')).toHaveAttribute('href', /mailto:hello@metron\.live/);
  expect(requestBody).toEqual({ contact: 'athlete@example.com' });
});

test('uses a clear waitlist fallback when the API cannot be reached', async ({ page }) => {
  await page.route('https://api.metron.live/launch/reservations/start', (route) => route.abort('connectionrefused'));
  await page.goto(origin);
  await page.locator('#contact').fill('+14155550123');
  await page.locator('#consent').check();
  await page.locator('#send-code').click();

  await expect(page.locator('#form-status')).toHaveText('The reservation service is temporarily unavailable. You can still join by email.');
  await expect(page.locator('#fallback')).toBeVisible();
  await expect(page.locator('#fallback-link')).toHaveAttribute('href', /^mailto:hello@metron\.live/);
});

test('offers an email waitlist when JavaScript is unavailable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(origin);
  const fallback = page.getByRole('link', { name: 'Join by email' });
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute('href', 'mailto:hello@metron.live?subject=Metron%20launch%20waitlist');
  await context.close();
});

test('keeps the reservation form inside a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("The world's smartest personal trainer.");
  const bounds = await page.locator('#reserve-form').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
});
