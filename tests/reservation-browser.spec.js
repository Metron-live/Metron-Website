const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { expect, test } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const types = { '.css': 'text/css', '.html': 'text/html', '.ico': 'image/x-icon', '.jpg': 'image/jpeg', '.js': 'text/javascript', '.mp4': 'video/mp4', '.png': 'image/png', '.svg': 'image/svg+xml' };
let server;
let origin;

test.beforeAll(async () => {
  server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
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

test('shows email fallback and opens a populated mailto when the endpoint is unreachable', async ({ page }) => {
  await page.route('https://api.metron.live/api/v1/launch-reservations/request', (route) => route.abort('failed'));
  await page.addInitScript(() => {
    window.__capturedMailto = '';
    document.addEventListener('click', (event) => {
      const link = event.target.closest?.('a[href^="mailto:"]');
      if (!link) return;
      event.preventDefault();
      window.__capturedMailto = link.href;
    }, true);
  });
  await page.goto(origin);

  await expect(page.locator('#waitlist-form')).toBeVisible();
  await expect(page.locator('#phone-form')).toBeHidden();
  await expect(page.locator('#reservation-status')).toContainText('unavailable');
  await page.locator('#waitlist-email').fill('athlete@example.com');
  await page.locator('#waitlist-submit').click();
  await expect.poll(() => page.evaluate(() => window.__capturedMailto)).toMatch(/^mailto:beta@metron\.live\?/);
  await expect.poll(() => page.evaluate(() => window.__capturedMailto)).toContain('athlete%40example.com');
});

test('shows and submits the phone-first form only after a successful HEAD probe', async ({ page }) => {
  const requests = [];
  await page.route('https://api.metron.live/api/v1/launch-reservations/request', async (route) => {
    const request = route.request();
    requests.push({ method: request.method(), body: request.postDataJSON?.() });
    if (request.method() === 'HEAD') {
      await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.goto(origin);

  await expect(page.locator('#phone-form')).toBeVisible();
  await expect(page.locator('#waitlist-form')).toBeHidden();
  await page.locator('#phone-contact').fill('+1 415 555 0123');
  await page.locator('#phone-submit').click();
  await expect(page.locator('#reservation-message')).toContainText('Check your phone');
  expect(requests.map((request) => request.method)).toEqual(['HEAD', 'POST']);
  expect(requests[1].body).toMatchObject({ phone: '+1 415 555 0123', consent: true, source: 'website-hero' });
});

test('interpolates the nav across 120px and lets the next section peek into the first fold', async ({ page }) => {
  await page.route('https://api.metron.live/api/v1/launch-reservations/request', (route) => route.abort('failed'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin);
  const nav = page.locator('#site-nav');
  await expect(nav).toHaveAttribute('data-scroll-progress', '0.000');

  const firstFold = await page.evaluate(() => ({ heroBottom: document.querySelector('.hero').getBoundingClientRect().bottom, problemTop: document.querySelector('#problem').getBoundingClientRect().top, nextLineBottom: document.querySelector('#problem .section__label').getBoundingClientRect().bottom, viewport: innerHeight }));
  expect(firstFold.heroBottom).toBeLessThan(firstFold.viewport);
  expect(firstFold.problemTop).toBeLessThan(firstFold.viewport);
  expect(firstFold.nextLineBottom).toBeLessThan(firstFold.viewport);

  await page.evaluate(() => scrollTo(0, 60));
  await expect.poll(() => nav.getAttribute('data-scroll-progress')).toBe('0.500');
  const midpoint = await nav.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(midpoint).toMatch(/rgba\(255, 255, 255, 0\.5\)/);

  await page.evaluate(() => scrollTo(0, 200));
  await expect.poll(() => nav.getAttribute('data-scroll-progress')).toBe('1.000');
  await expect(nav).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('text=Get the App').first()).toBeVisible();
  expect(await page.locator('[class*="heptagon"], [id*="heptagon"]').count()).toBe(0);
});

test('keeps the hero and fallback usable on a phone viewport', async ({ page }) => {
  await page.route('https://api.metron.live/api/v1/launch-reservations/request', (route) => route.abort('failed'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('#waitlist-form')).toBeVisible();
  const bounds = await page.locator('#waitlist-form').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
});
