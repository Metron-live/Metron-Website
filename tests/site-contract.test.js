const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const visible = html.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('locks the Oct 24 launch copy contract', () => {
  assert.match(html, /<title>The World's Smartest Personal Trainer<\/title>/);
  assert.match(html, /property="og:title" content="The World's Smartest Personal Trainer"/);
  assert.match(visible, /The world's smartest personal trainer\./);
  assert.match(visible, /best free workout tracker/i);
  assert.match(visible, /serious self-coached athletes/i);
  assert.match(visible, /Train\. Log\. Learn\. Adapt\./);
  assert.match(visible, /It is a shame for one to grow old without seeing the beauty and strength of which the body is capable\./);
  assert.match(visible, /What platforms is Metron available on\?/);
});

test('uses a configured two-step reservation API and mail fallback', () => {
  assert.match(html, /content="https:\/\/api\.metron\.live\/launch\/reservations"/);
  assert.match(html, /action="https:\/\/api\.metron\.live\/launch\/reservations\/start" method="post"/);
  assert.match(html, /data-check-action="https:\/\/api\.metron\.live\/launch\/reservations\/check"/);
  assert.match(html, /request\(RESERVATION_START_ENDPOINT, \{ contact: pendingContact \}\)/);
  assert.match(html, /request\(RESERVATION_CHECK_ENDPOINT, \{ contact: pendingContact, code: code\.value\.trim\(\), consent_marketing: true \}\)/);
  assert.match(html, /catch \(_\) \{\s*throw new Error\(SERVICE_UNAVAILABLE_MESSAGE\);\s*\}/);
  assert.match(html, /The reservation service is temporarily unavailable\. You can still join by email\./);
  assert.match(visible, /I agree to receive Metron launch news and product updates\. I can unsubscribe at any time\./);
  assert.match(html, /mailto:hello@metron\.live\?subject=Metron%20launch%20waitlist/);
  assert.match(html, /<noscript>[\s\S]*Join by email[\s\S]*<\/noscript>/);
});

test('does not publish unverified OG media or retired claims', () => {
  assert.match(html, /TODO\(approved-handoff\)/);
  assert.doesNotMatch(html, /property="og:(?:image|video)/);
  for (const pattern of [/founder[ -]?story/i, /\brugby\b/i, /23%/, /testimonial/i, /\bnutrition\b/i, /\bsupplement/i, /seven[ -]?pillar/i, /—/]) assert.doesNotMatch(visible, pattern);
});
