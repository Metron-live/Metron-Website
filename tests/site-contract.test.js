const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
const visibleText = (source) => source
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

test('ships the approved reservation offer without stale beta promises', () => {
  const copy = visibleText(html);
  assert.match(copy, /Take the guesswork out of greatness\./);
  assert.match(copy, /join the Metron family at launch/i);
  assert.match(copy, /Your first year is on us\./);
  assert.match(copy, /Your free year is reserved/);
  assert.doesNotMatch(copy, /TestFlight/i);
  assert.doesNotMatch(copy, /\$\d+\.99/);
  assert.doesNotMatch(copy, /redemption code[^.]*[:=][^<]+/i);
});

test('uses one phone-first, email-alternative verified API flow', () => {
  assert.match(html, /content="https:\/\/api\.metron\.live\/api\/v1\/launch-reservations"/);
  assert.match(html, /request: `\$\{reservationApiBase\}\/request`/);
  assert.match(html, /verify: `\$\{reservationApiBase\}\/verify`/);
  assert.match(html, /id="reservation-contact" name="phone" type="tel"/);
  assert.match(html, /id="reservation-email-mode"[^>]+aria-pressed="false"/);
  assert.match(html, /id="reservation-code"[^>]+autocomplete="one-time-code"/);
  assert.match(html, /id="reservation-consent"[^>]+type="checkbox" required/);
  assert.doesNotMatch(html, /id="reservation-consent"[^>]+checked/);
  assert.match(html, /href="\/terms\.html"/);
  assert.match(html, /href="\/privacy\.html#launch-reservations"/);
  assert.doesNotMatch(html, /\.netlify\/functions/);
  assert.equal(fs.existsSync(path.join(root, 'netlify.toml')), false);
  assert.equal(fs.existsSync(path.join(root, 'netlify', 'functions', 'beta-signup.js')), false);
});

test('has no dead hash links and preserves the hero choreography contract', () => {
  assert.doesNotMatch(html, /href=["']#["']/);
  assert.match(html, /<a href="#reserve" class="btn btn-primary nav__cta">Reserve Your Year<\/a>/);
  assert.match(html, /\.nav--quote-mode \.nav__links,[\s\S]*animation: logoFadeIn 900ms cubic-bezier\(0\.25, 0\.1, 0\.25, 1\) 0\.3s forwards/);
  assert.match(html, /\.video-banner__tagline-corner[\s\S]*animation: cinematicFadeIn 700ms cubic-bezier\(0\.25, 0\.1, 0\.25, 1\) 0\.9s forwards/);
  assert.match(html, /\.quote-hero__text[\s\S]*animation: cinematicFadeIn 900ms cubic-bezier\(0\.25, 0\.1, 0\.25, 1\) 1\.5s forwards/);
  assert.match(html, /sessionStorage\.getItem\('metron_hero_seen'\)/);
});

test('discloses reservation processing, Twilio, retention, and deletion', () => {
  const copy = visibleText(privacy);
  assert.match(privacy, /id="launch-reservations"/);
  assert.match(copy, /Twilio processes your phone number/);
  assert.match(copy, /verification logs available for 30 days/);
  assert.match(copy, /up to 90 days afterward/);
  assert.match(copy, /Unverified reservation attempts are deleted or de-identified within 30 days/);
  assert.match(copy, /ask us to delete a reservation at any time/);
});
