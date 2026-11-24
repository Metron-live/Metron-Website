const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { expect, test } = require('@playwright/test');

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
let requests;
let responses;

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

test.beforeAll(async () => {
  server = http.createServer((request, response) => {
    const url = new URL(request.url, origin || 'http://127.0.0.1');
    if (url.pathname.startsWith('/api/v1/launch-reservations/')) {
      let raw = '';
      request.setEncoding('utf8');
      request.on('data', (chunk) => { raw += chunk; });
      request.on('end', () => {
        requests.push({ method: request.method, path: url.pathname, body: JSON.parse(raw || '{}') });
        const next = responses.shift();
        const send = () => json(response, next?.status || 200, next?.body || (url.pathname.endsWith('/request') ? { status: 'pending' } : { status: 'verified', one_year_free_eligible: true }));
        if (next?.delay) setTimeout(send, next.delay);
        else send();
      });
      return;
    }

    const relative = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404).end('Not found');
      return;
    }
    let body = fs.readFileSync(file);
    if (relative === 'index.html') body = Buffer.from(body.toString('utf8').replaceAll(productionApi, `${origin}/api/v1/launch-reservations`));
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(file)] || 'application/octet-stream' });
    response.end(body);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => new Promise((resolve) => server.close(resolve)));
test.beforeEach(() => { requests = []; responses = []; });

async function openReservation(page) {
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.locator('#reserve').evaluate((element) => element.scrollIntoView());
  await expect(page.locator('#reservation-request-form')).toBeVisible();
}

test('requires explicit consent and validates phone before the API call', async ({ page }) => {
  await openReservation(page);
  await expect(page.locator('#reservation-consent')).not.toBeChecked();
  await page.locator('#reservation-contact').fill('123');
  await page.locator('#reservation-request-submit').click();
  await expect(page.locator('#reservation-contact')).toBeFocused();
  expect(requests).toHaveLength(0);

  await page.locator('#reservation-contact').fill('+1 415 555 0123');
  await page.locator('#reservation-request-submit').click();
  await expect(page.locator('#reservation-consent')).toBeFocused();
  expect(requests).toHaveLength(0);
});

test('submits phone, verifies OTP, and confirms the family free year', async ({ page }) => {
  await openReservation(page);
  await page.locator('#reservation-contact').fill('+1 415 555 0123');
  await page.locator('#reservation-consent').check();
  await page.locator('#reservation-request-submit').click();
  await expect(page.locator('#reservation-code')).toBeFocused();
  await page.locator('#reservation-code').fill('123456');
  await page.locator('#reservation-verify-submit').click();
  await expect(page.locator('#reservation-success')).toBeVisible();
  await expect(page.locator('#reservation-success')).toContainText('Welcome to the Metron family.');
  await expect(page.locator('#reservation-success')).toContainText('Your free year is reserved.');
  expect(requests).toEqual([
    {
      method: 'POST',
      path: '/api/v1/launch-reservations/request',
      body: { phone: '+1 415 555 0123', consent: true, source: 'launch-reservation', campaign: 'founding-year' }
    },
    {
      method: 'POST',
      path: '/api/v1/launch-reservations/verify',
      body: { phone: '+1 415 555 0123', code: '123456' }
    }
  ]);
});

test('offers email as an accessible alternative through the same API', async ({ page }) => {
  await openReservation(page);
  await page.locator('#reservation-email-mode').click();
  await expect(page.locator('#reservation-email-mode')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#reservation-contact')).toHaveAttribute('type', 'email');
  await expect(page.locator('label[for="reservation-contact"]')).toHaveText('Email address');
  await page.locator('#reservation-contact').fill('athlete@example.com');
  await page.locator('#reservation-consent').check();
  await page.locator('#reservation-request-submit').click();
  await page.locator('#reservation-code').fill('654321');
  await page.locator('#reservation-verify-submit').click();
  expect(requests[0].body.email).toBe('athlete@example.com');
  expect(requests[1].body).toEqual({ email: 'athlete@example.com', code: '654321' });
});

test('shows API failure, then allows a successful retry', async ({ page }) => {
  responses.push({ status: 503, body: { detail: 'Verification is temporarily unavailable.' } });
  await openReservation(page);
  await page.locator('#reservation-contact').fill('+1 415 555 0123');
  await page.locator('#reservation-consent').check();
  await page.locator('#reservation-request-submit').click();
  await expect(page.locator('#reservation-error')).toHaveText('Verification is temporarily unavailable.');
  await expect(page.locator('#reservation-request-submit')).toBeEnabled();
  await page.locator('#reservation-request-submit').click();
  await expect(page.locator('#reservation-verify-form')).toBeVisible();
  expect(requests).toHaveLength(2);
});

test('announces and disables the control while a request is loading', async ({ page }) => {
  responses.push({ delay: 400, body: { status: 'pending' } });
  await openReservation(page);
  await page.locator('#reservation-contact').fill('+1 415 555 0123');
  await page.locator('#reservation-consent').check();
  await page.locator('#reservation-request-submit').click();
  await expect(page.locator('#reservation-request-submit')).toBeDisabled();
  await expect(page.locator('#reservation-status')).toHaveText('Sending your verification code…');
  await expect(page.locator('#reservation-request-submit .btn-loading')).toBeVisible();
  await expect(page.locator('#reservation-verify-form')).toBeVisible();
});

test('renders an existing reservation as a deduplicated success', async ({ page }) => {
  responses.push({ status: 409, body: { detail: 'Reservation already exists.' } });
  await openReservation(page);
  await page.locator('#reservation-contact').fill('+1 415 555 0123');
  await page.locator('#reservation-consent').check();
  await page.locator('#reservation-request-submit').click();
  await expect(page.locator('#reservation-success')).toContainText('already in the Metron family');
  await expect(page.locator('#reservation-success')).toContainText('free-year reservation is already confirmed');
});

test('is keyboard operable and exposes labels and live regions', async ({ page }) => {
  await openReservation(page);
  await expect(page.locator('#reservation-status')).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('#reservation-error')).toHaveAttribute('role', 'alert');
  await page.locator('#reservation-phone-mode').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#reservation-email-mode')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#reservation-contact')).toHaveAttribute('type', 'email');
});

test('the production CTA lands below the fixed navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.locator('.nav__cta').click();
  await expect(page).toHaveURL(/#reserve$/);
  const positions = await page.evaluate(() => ({
    navBottom: document.querySelector('.nav').getBoundingClientRect().bottom,
    sectionTop: document.querySelector('.beta-section').getBoundingClientRect().top
  }));
  expect(positions.sectionTop).toBeGreaterThanOrEqual(positions.navBottom - 1);
});

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 }
]) {
  test(`${viewport.name} reservation snapshot`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openReservation(page);
    await page.addStyleTag({ content: '.nav { visibility: hidden !important; } *, *::before, *::after { animation: none !important; transition: none !important; }' });
    await page.locator('.beta-section').evaluate((element) => element.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible')));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page).toHaveScreenshot(`reservation-${viewport.name}.png`, { animations: 'disabled' });
  });
}
