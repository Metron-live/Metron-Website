const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const visibleText = html
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<!--([\s\S]*?)-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');

function count(text, phrase) {
  return text.toLowerCase().split(phrase.toLowerCase()).length - 1;
}

function section(id) {
  const match = html.match(new RegExp(`<section[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/section>`, 'i'));
  assert.ok(match, `missing #${id} section`);
  return match[1];
}

// The trainer and free-tracker promises are above the fold and repeated.
const hero = section('hero');
assert.match(hero, /<h1[^>]*>The world's smartest personal trainer\.<\/h1>/i);
assert.match(hero, /best-in-class workout tracker that stays free/i);
assert.ok(count(visibleText, "world's smartest personal trainer") >= 3);
assert.ok(count(visibleText, 'best-in-class workout tracker') >= 3);
const main = html.match(/<main>([\s\S]*?)<\/main>/i);
assert.ok(main, 'missing main landmark');
assert.match(main[1], /<section[^>]+id="hero"/i);
assert.match(main[1], /<section[^>]+class="closing-quote reveal"/i);

// Offer mechanics are unambiguous wherever a visitor decides.
assert.ok(count(visibleText, '30 days') >= 2);
assert.ok(count(visibleText, 'no card') >= 3);
assert.ok(count(visibleText, 'tracker, logging, and history remain free') >= 2);
assert.ok(count(visibleText, 'full coach free for the first year') >= 2);
assert.match(visibleText, /full Metron coach free for the first year/i);
assert.match(visibleText, /Welcome to the Metron family\./);
assert.match(visibleText, /journey to greatness\./);

// No placeholder social proof, unsupported statistic, or founder-story section.
for (const forbidden of [
  '23%', 'James R.', 'Sarah K.', 'Marcus T.', 'Cole M.', 'Alex P.',
  'competitive powerlifter', '2:58 marathoner'
]) {
  assert.equal(visibleText.includes(forbidden), false, `forbidden claim found: ${forbidden}`);
}
assert.doesNotMatch(html, /<section[^>]+(?:founder|testimonial)/i);
assert.doesNotMatch(visibleText, /\b\d+(?:\.\d+)?%\b/, 'unsupported percentage claim found');
for (const unverifiedIntegration of ['Garmin', 'WHOOP', 'Oura', 'Strava', 'Fitbit']) {
  assert.doesNotMatch(visibleText, new RegExp(`\\b${unverifiedIntegration}\\b`, 'i'));
}

// Launch proof and future boundaries.
for (const proof of [
  'goals, workout history, injuries, available equipment, and schedule',
  'mix with—not take over—the music',
  'exercise history, weekly volume, workout streaks, and e1RM trends',
  'verified recovery signals from Apple Health'
]) {
  assert.match(visibleText, new RegExp(proof.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
}
assert.match(visibleText, /two interfaces to the same shared actions/i);
assert.match(visibleText, /Endurance and sport-specific athletic preparation live inside Training/i);

const future = section('modular-future');
assert.match(future, /Coming later—not launch features/i);
for (const later of ['Injury mode', 'vacation mode', 'technical-skill coaching', 'video form analysis', 'SmartRest', 'Watch experience']) {
  assert.match(future, new RegExp(later, 'i'));
}

// Lauren's FAQ wording and professional Cardo styling.
assert.match(visibleText, /What platforms is Metron available on\?/);
assert.match(html, /\.faq-question,\s*\.faq-answer\s*{\s*font-family:\s*'Cardo'/);

// Brand typography remains disciplined: no extra font family, Cardo headings,
// Inter actions, and Space Grotesk only on Metron wordmark treatments.
assert.equal(html.includes('Cormorant'), false);
assert.match(html, /h1, h2, h3, h4\s*{\s*font-family:\s*'Cardo'/);
assert.match(html, /\.btn\s*{[\s\S]*?font-family:\s*'Inter'/);
for (const match of html.matchAll(/([^{}]+)\{[^{}]*font-family:\s*'Space Grotesk'/g)) {
  assert.match(match[1], /logo|hero-kicker/i, `Space Grotesk used outside a wordmark: ${match[1].trim()}`);
}

// Forms are phone-first, labelled, and report success/errors accessibly.
for (const formId of ['hero-form', 'beta-form']) {
  const form = html.match(new RegExp(`<form[^>]+id=["']${formId}["'][^>]*>([\\s\\S]*?)<\\/form>`, 'i'));
  assert.ok(form, `missing #${formId}`);
  assert.match(form[1], /type="tel"/i);
  assert.match(form[1], /autocomplete="tel"/i);
  assert.match(form[1], /aria-describedby="[^"]+"/i);
  assert.match(form[0], /data-source="(?:hero|reservation-section)"/i);
  assert.match(form[1], /<label[^>]+for=/i);
  assert.match(form[1], /<button[^>]+type="submit"/i);
}
assert.ok(count(html, 'role="status"') >= 2);
assert.ok(count(html, 'role="alert"') >= 2);
assert.equal(count(visibleText, 'Reserve my free year'), 4, 'all reservation CTAs should use the approved label');

// Expandable controls expose matching state and relationships to assistive tech.
for (const match of html.matchAll(/<button[^>]+aria-controls="([^"]+)"[^>]*>/g)) {
  const controlledId = match[1];
  const controlled = html.match(new RegExp(`<[^>]+id=["']${controlledId}["'][^>]*>`, 'i'));
  assert.ok(controlled, `missing controlled element: #${controlledId}`);
  assert.match(controlled[0], /(?:aria-hidden="true"|\sinert(?:\s|>))/i, `#${controlledId} needs an initial hidden state`);
}
for (const match of html.matchAll(/<div class="faq-answer"[^>]+>/g)) {
  assert.match(match[0], /role="region"/i);
  assert.match(match[0], /aria-labelledby="faq-question-\d+"/i);
}
assert.match(html, /if \(e\.key !== 'ArrowDown'\) return;[\s\S]*?querySelector\('a'\)\?\.focus\(\)/);
assert.match(html, /e\.key === 'Escape'[\s\S]*?activeTrigger\.focus\(\)/);

// IDs are unique and every in-page link resolves; dead href="#" links are forbidden.
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'duplicate HTML id');
const idSet = new Set(ids);
for (const match of html.matchAll(/href="#([^"]*)"/g)) {
  assert.notEqual(match[1], '', 'dead href="#" link');
  assert.ok(idSet.has(match[1]), `unresolved in-page link: #${match[1]}`);
}

for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const reference = match[1];
  if (/^(?:https?:|mailto:|tel:)/i.test(reference)) continue;
  const clean = decodeURIComponent(reference.split('?')[0]);
  if (clean === '/') continue;
  const target = path.join(root, clean.replace(/^\//, ''));
  assert.equal(fs.existsSync(target), true, `missing local resource: ${reference}`);
}

async function testReservationFunction() {
  process.env.RESEND_API_KEY = 'test-key';
  process.env.SIGNUP_NOTIFICATION_EMAIL = 'reservations@example.com';
  const { handler } = require('../netlify/functions/beta-signup');

  const preflight = await handler({ httpMethod: 'OPTIONS' });
  assert.equal(preflight.statusCode, 200);
  assert.equal(preflight.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS');

  const wrongMethod = await handler({ httpMethod: 'GET' });
  assert.equal(wrongMethod.statusCode, 405);

  const malformed = await handler({ httpMethod: 'POST', body: '{' });
  assert.equal(malformed.statusCode, 400);

  const invalid = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ type: 'phone', value: '123' })
  });
  assert.equal(invalid.statusCode, 422);

  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200 };
  };
  const valid = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ type: 'phone', value: '+1 (415) 555-0123', source: 'hero' })
  });
  assert.equal(valid.statusCode, 200);
  assert.deepEqual(JSON.parse(valid.body), { success: true });
  assert.equal(request.url, 'https://api.resend.com/emails');
  const message = JSON.parse(request.options.body);
  assert.equal(message.to, 'reservations@example.com');
  assert.match(message.text, /\+14155550123/);
  assert.match(message.text, /founding free-year full-coach reservation/);
  assert.match(message.text, /metron\.live\/hero/);

  global.fetch = async () => ({ ok: false, status: 429 });
  const originalConsoleError = console.error;
  console.error = () => {};
  const rejected = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ type: 'phone', value: '+1 415 555 0123' })
  }).finally(() => {
    console.error = originalConsoleError;
  });
  assert.equal(rejected.statusCode, 502);
}

testReservationFunction()
  .then(() => console.log('site contract: ok'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
