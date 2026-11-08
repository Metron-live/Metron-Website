const assert = require('node:assert/strict');
const crypto = require('node:crypto');
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
  .replace(/&rarr;/g, '→')
  .replace(/\s+/g, ' ')
  .trim();

const TITLE = "The World's Smartest Personal Trainer";
const API_BASE = 'https://api.metron.live/api/v1/launch-reservations';

function count(text, phrase) {
  return text.toLowerCase().split(phrase.toLowerCase()).length - 1;
}

function section(id) {
  const match = html.match(new RegExp(`<section[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/section>`, 'i'));
  assert.ok(match, `missing #${id} section`);
  return match[1];
}

function meta(property) {
  const match = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content="([^"]+)"[^>]*>`, 'i'));
  return match && match[1];
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

// Page and share titles use the exact approved promise.
assert.equal(html.match(/<title>([^<]+)<\/title>/i)[1], TITLE);
assert.equal(meta('og:title'), TITLE);
assert.match(meta('og:description'), /world's smartest personal trainer/i);
assert.match(meta('og:description'), /best free workout tracker/i);

// The approved media handoff is unavailable on this machine. Never substitute
// an older asset. When explicit approved sources are supplied, compare bytes.
const approvedVideo = process.env.APPROVED_OG_VIDEO;
const approvedImage = process.env.APPROVED_OG_IMAGE;
if (approvedVideo || approvedImage) {
  assert.ok(approvedVideo && approvedImage, 'both approved OG source paths are required');
  const publishedVideo = path.join(root, 'brand/brand preview/og-preview.mp4');
  const publishedImage = path.join(root, 'brand/brand preview/og-preview.png');
  assert.equal(sha256(publishedVideo), sha256(approvedVideo), 'OG video bytes changed');
  assert.equal(sha256(publishedImage), sha256(approvedImage), 'OG poster bytes changed');
  assert.equal(fs.statSync(publishedVideo).size, 3439906, 'approved OG video size changed');
} else {
  assert.equal(meta('og:video'), null);
  assert.equal(meta('og:image'), null);
  assert.match(html, /TODO\(approved-og-handoff\)/);
  assert.match(html, /no substitute asset is published/i);
}

// The hero starts with product and audience, never an origin story.
const hero = section('hero');
assert.match(hero, /<h1[^>]*>The world's smartest personal trainer\.<\/h1>/i);
assert.match(hero, /Plus the best free workout tracker\./i);
assert.match(hero, /serious self-coached athletes/i);
assert.doesNotMatch(hero, /founder(?:'s)? story|why (?:we|i) (?:built|founded)/i);
assert.ok(count(visibleText, "world's smartest personal trainer") >= 3);
assert.ok(count(visibleText, 'best free workout tracker') >= 3);
const main = html.match(/<main>([\s\S]*?)<\/main>/i);
assert.ok(main, 'missing main landmark');
assert.match(main[1], /<section[^>]+id="hero"/i);
assert.match(main[1], /<section[^>]+class="closing-quote reveal"/i);

// The free-year reservation and standard launch offer stay distinct.
assert.ok(count(visibleText, '30 days') >= 2);
assert.ok(count(visibleText, 'no card') >= 3);
assert.ok(count(visibleText, 'tracker, logging, and history remain free') >= 1);
assert.match(visibleText, /free tracker, logging, and history remain available/i);
assert.ok(count(visibleText, 'full coach free for the first year') >= 2);
assert.match(visibleText, /full Metron coach free for the first year/i);
assert.match(visibleText, /Welcome to the Metron family\./);
assert.match(visibleText, /journey to greatness\./);

// Launch scope, athlete language, and concrete product loop.
assert.match(visibleText, /Train → Log → Learn → Adapt/);
assert.match(visibleText, /lift, run, ride, or practice/i);
assert.match(visibleText, /Metron launches with Training only/i);
assert.match(visibleText, /strength, endurance, and sport-specific athletic preparation/i);
assert.doesNotMatch(visibleText, /\brugby\b/i);
assert.doesNotMatch(visibleText, /\bteam(?:s)?\b/i);

for (const proof of [
  'goals, workout history, injuries, available equipment, and schedule',
  'mix with, not take over, the music',
  'exercise history, weekly volume, workout streaks, and e1RM trends',
  'verified recovery signals from Apple Health'
]) {
  assert.match(visibleText, new RegExp(proof.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
}
assert.match(visibleText, /two interfaces to the same shared actions/i);
assert.match(visibleText, /Endurance and sport-specific athletic preparation live inside Training/i);

// Future work is honest, specific, and never marketed as live.
const future = section('modular-future');
assert.match(future, /Coming later\. Not launch features\./i);
for (const later of ['Injury mode', 'vacation mode', 'technical-skill coaching', 'video form analysis', 'SmartRest', 'Watch experience']) {
  assert.match(future, new RegExp(later, 'i'));
}

// Unsupported positioning and fabricated proof stay out of marketing copy.
for (const forbidden of [
  '23%', 'James R.', 'Sarah K.', 'Marcus T.', 'Cole M.', 'Alex P.',
  'competitive powerlifter', '2:58 marathoner', 'nutrition', 'supplement',
  'seven pillars', 'testimonial'
]) {
  assert.equal(visibleText.toLowerCase().includes(forbidden.toLowerCase()), false, `forbidden claim found: ${forbidden}`);
}
assert.doesNotMatch(visibleText, /\b\d+(?:\.\d+)?%\b/, 'unsupported percentage claim found');
assert.equal(visibleText.includes('—'), false, 'marketing copy contains an em dash');
for (const unverifiedIntegration of ['Garmin', 'WHOOP', 'Oura', 'Strava', 'Fitbit']) {
  assert.doesNotMatch(visibleText, new RegExp(`\\b${unverifiedIntegration}\\b`, 'i'));
}

// Inclusive quote, professional FAQ typography, and exact platform question.
assert.match(visibleText, /It is a shame for one to grow old without seeing the beauty and strength of which the body is capable/);
assert.match(visibleText, /What platforms is Metron available on\?/);
assert.match(html, /\.faq-question,\s*\.faq-answer\s*{\s*font-family:\s*'Cardo'/);

// Plain-language trust promises match the linked privacy policies.
assert.match(visibleText, /use your contact only to verify the reservation and send launch updates/i);
assert.match(visibleText, /Health data is used with your permission to personalize training/i);
assert.match(visibleText, /not sold or shared with advertisers, data brokers, or information resellers/i);
assert.match(html, /href="\/privacy\.html"/);
assert.match(html, /href="\/health-data-privacy\.html"/);

// Brand typography remains disciplined.
assert.equal(html.includes('Cormorant'), false);
assert.match(html, /h1, h2, h3, h4\s*{\s*font-family:\s*'Cardo'/);
assert.match(html, /\.btn\s*{[\s\S]*?font-family:\s*'Inter'/);
for (const match of html.matchAll(/([^{}]+)\{[^{}]*font-family:\s*'Space Grotesk'/g)) {
  assert.match(match[1], /logo|hero-kicker/i, `Space Grotesk used outside a wordmark: ${match[1].trim()}`);
}

// Forms are phone-first, also accept email, and post to a visible API contract.
for (const formId of ['hero-form', 'beta-form']) {
  const form = html.match(new RegExp(`<form[^>]+id=["']${formId}["'][^>]*>([\\s\\S]*?)<\\/form>`, 'i'));
  assert.ok(form, `missing #${formId}`);
  assert.match(form[0], new RegExp(`action=["']${API_BASE}/request["']`, 'i'));
  assert.match(form[0], /method="post"/i);
  assert.match(form[1], /type="tel"/i);
  assert.match(form[1], /autocomplete="tel"/i);
  assert.match(form[1], /aria-describedby="[^"]+"/i);
  assert.match(form[0], /data-source="(?:hero|reservation-section)"/i);
  assert.match(form[1], /<label[^>]+for=/i);
  assert.match(form[1], /<button[^>]+type="submit"/i);
  assert.match(form[1], /data-contact-toggle[^>]*>Use email instead</i);
}
assert.match(html, /const RESERVATION_API_BASE =/);
assert.match(html, /request: `\$\{RESERVATION_API_BASE\}\/request`/);
assert.match(html, /verify: `\$\{RESERVATION_API_BASE\}\/verify`/);
assert.match(html, /\[state\.kind\]: state\.destination,[\s\S]*?consent: true/);
assert.match(html, /data\.status !== 'verified' \|\| data\.one_year_free_eligible !== true/);
assert.match(html, /mailto:\$\{WAITLIST_EMAIL\}/);
assert.match(html, /Join the email waitlist/);
assert.doesNotMatch(html, /\.netlify\/functions\/beta-signup/);
assert.ok(count(html, 'role="status"') >= 4);
assert.ok(count(html, 'role="alert"') >= 2);

// Expandable controls expose state and matching relationships.
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

// IDs are unique and in-page links and local resources resolve.
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'duplicate HTML id');
const idSet = new Set(ids);
for (const match of html.matchAll(/href="#([^"]*)"/g)) {
  assert.notEqual(match[1], '', 'dead href="#" link');
  assert.ok(idSet.has(match[1]), `unresolved in-page link: #${match[1]}`);
}
const markupOnly = html
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '');
for (const match of markupOnly.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const reference = match[1];
  if (/^(?:https?:|mailto:|tel:)/i.test(reference)) continue;
  const clean = decodeURIComponent(reference.split('?')[0]);
  if (clean === '/') continue;
  const target = path.join(root, clean.replace(/^\//, ''));
  assert.equal(fs.existsSync(target), true, `missing local resource: ${reference}`);
}

console.log('site contract: ok');
