const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const privacyHtml = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
const toVisibleText = (source) => source
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .replace(/\s+([.,;:!?])/g, '$1')
  .trim();
const visibleText = toVisibleText(html);
const privacyVisibleText = toVisibleText(privacyHtml);

const count = (value, pattern) => (value.match(pattern) || []).length;
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('positions Metron as the performance staff for self-coached athletes', () => {
  const eyebrowAt = html.indexOf('How do I train?');
  const headingAt = html.indexOf('<h1 id="hero-title">The pros get a team. You get Metron.</h1>');
  assert.ok(eyebrowAt >= 0 && eyebrowAt < headingAt, 'hero eyebrow must sit above the H1');
  assert.match(visibleText, /Metron is the strength coach, sports scientist and data analyst that athletes without a staff never had\./);
  assert.match(visibleText, /It takes the guesswork out of greatness\./);
  assert.match(visibleText, /fighting for a starting spot, training for a team, a season or a qualifier/i);
  assert.match(visibleText, /Logging is easy\. Knowing how to train is the hard part\./);
  assert.match(visibleText, /free best-in-class workout tracker/i);
  assert.equal(count(visibleText, /world's smartest personal trainer/gi), 1);
});

test('keeps the adaptation example and launch capabilities concrete', () => {
  assert.match(visibleText, /Poor sleep and a low HRV morning can turn tomorrow's heavy lower session into a lighter one, with the reason shown\./);
  assert.match(visibleText, /Each change comes with its reason\./);
  assert.match(visibleText, /Log every set fast\. Your history builds as you train, free\./);
  for (const claim of [
    'Adaptive plan',
    'Daily readiness',
    'Progression from actuals',
    'Arete text coaching',
    'Apple Health',
    'Practice awareness',
    'Competition awareness',
    'Arete coaching chat and plan changes'
  ]) assert.match(visibleText, new RegExp(claim, 'i'));

  for (const forbidden of [
    'rugby',
    'audio cue',
    'live coaching',
    'Honest product horizon',
    "already backed by Metron's training and PR screens",
    'Four connected steps turn each lift',
    'Ask Arete. Or use the screen built for the job.',
    'The tracker stays free. The coach earns its place.'
  ]) assert.doesNotMatch(visibleText, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  assert.doesNotMatch(html, /—/);
});

test('publishes one exact attributed quote', () => {
  assert.equal(count(html, /<blockquote\b/gi), 1);
  assert.match(html, /<blockquote id="closing-text">It is a shame for one to grow old without seeing the beauty and strength of which the body is capable\.<\/blockquote><cite>Socrates<\/cite>/);
  assert.doesNotMatch(html, /<q\b/i);
});

test('uses the approved social preview and metadata', () => {
  const expectedHash = '708d533d5658b26e71e7787cb327c0a25b0b54894594750afb349d3f46fdba54';
  const video = path.join(root, 'brand', 'brand preview', 'og-preview-approved.mp4');
  const poster = path.join(root, 'brand', 'brand preview', 'og-preview-approved.png');
  assert.equal(sha256(video), expectedHash);
  assert.ok(fs.existsSync(poster));
  assert.match(html, /property="og:title" content="Metron\. How do I train\?"/);
  assert.match(html, /property="og:image" content="[^"]+og-preview-approved\.png"/);
  assert.match(html, /property="og:video" content="[^"]+og-preview-approved\.mp4"/);
  assert.match(html, /property="og:video:type" content="video\/mp4"/);
  assert.match(html, /property="og:video:width" content="720"/);
  assert.match(html, /property="og:video:height" content="960"/);
  assert.match(html, /property="og:video:poster" content="[^"]+og-preview-approved\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
});

test('keeps the nav and backgrounds within the approved visual system', () => {
  assert.doesNotMatch(html, new RegExp(`hepta${'gon'}`, 'i'));
  assert.match(html, /<nav[^>]+data-scroll-progress="0"/);
  assert.match(html, /window\.scrollY \/ 120/);
  assert.match(html, /nav\.style\.setProperty\('--nav-surface-opacity', progress\.toFixed\(3\)\)/);
  assert.match(html, /--nav-fade-duration: 300ms/);
  assert.match(html, /\.nav::before \{[\s\S]*?opacity: var\(--nav-surface-opacity\)[\s\S]*?transition: opacity var\(--nav-fade-duration\) ease/);
  assert.doesNotMatch(html, /nav[^\n]*classList\.(?:add|toggle)\([^\n]*(?:scrolled|solid)/i);
  assert.match(html, /\.nav \{[\s\S]*background: transparent/);
  assert.match(html, /\.nav::before \{[\s\S]*?background: #fff url\('images\/marble\.png'\) center\/cover/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(html, /<a class="nav__cta" href="#reserve">Get the App<\/a>/);
  assert.match(html, /brand\/icon\/svg\/metron-icon-white\.svg/);
  assert.match(html, /brand\/icon\/svg\/metron-icon-black\.svg/);
  assert.doesNotMatch(html.match(/<nav[\s\S]*?<\/nav>/)[0], /m-cropped(?:-white)?\.png/);

  assert.match(html, /--hero-brightness: 1\.25/);
  assert.match(html, /\.hero__video \{[^}]*filter: brightness\(var\(--hero-brightness\)\)/);
  assert.match(html, /--font-copy: 'Cardo', serif/);
  assert.match(html, /--font-controls: 'Inter', sans-serif/);
  assert.match(html, /body \{[\s\S]*?font-family: var\(--font-copy\)/);
  assert.match(html, /\.nav \{[\s\S]*?font-family: var\(--font-copy\)/);
  assert.match(html, /h1, h2, h3 \{[^}]*font-family: var\(--font-copy\)/);

  const mainFontValues = new Set([
    'var(--font-copy)',
    'var(--font-controls)'
  ]);
  for (const match of html.matchAll(/font-family:\s*([^;}]+)/g)) {
    assert.ok(mainFontValues.has(match[1].trim()), `font family differs from main: ${match[1].trim()}`);
  }
});

test('uses the live two-step reservation contract and approved offer', () => {
  assert.match(html, /content="https:\/\/api\.metron\.live\/launch\/reservations"/);
  assert.match(html, /const startEndpoint = `\$\{apiBase\}\/start`; const checkEndpoint = `\$\{apiBase\}\/check`/);
  assert.match(html, /postJson\(startEndpoint, \{ contact: pendingContact, channel, consent_marketing: true \}\)/);
  assert.match(html, /postJson\(checkEndpoint, \{ contact: pendingContact, code: codeInput\.value\.trim\(\) \}\)/);
  assert.match(html, /payload\.status !== 'pending'/);
  assert.match(html, /payload\.status !== 'reserved'/);
  assert.match(visibleText, /Text me my download link at launch\. Msg & data rates may apply\. Reply STOP to opt out\./);
  assert.match(visibleText, /90 days free and the Founding Member price \(\$79\.99\/yr\) locked through April 30 2027\./);
  for (const legacyCopy of [
    /free[ -]?year/i,
    /founding[ -]?year/i,
    /founder[ -]?story/i
  ]) assert.doesNotMatch(visibleText, legacyCopy);
  assert.match(html, /id="reservation-contact"[^>]+aria-describedby="reservation-consent reservation-offer"/);
  assert.match(html, /id="marketing-consent"[^>]+type="checkbox" required/);
  assert.doesNotMatch(html, /method: 'HEAD'/);
  assert.doesNotMatch(html, /api\/v1\/launch-reservations/);
  assert.equal(fs.existsSync(path.join(root, 'netlify', 'functions', 'beta-signup.js')), false);
  assert.equal(fs.existsSync(path.join(root, '.graveyard', 'beta-signup.js')), true);
});

test('publishes the text-message disclosure and links it from the reservation form', () => {
  assert.match(html, /<form[^>]+id="reservation-form"[\s\S]*?<a href="\/privacy\.html#text-messages">Text messages disclosure<\/a>[\s\S]*?<\/form>/);
  assert.match(visibleText, /Text messages disclosure for message frequency, HELP instructions, and carrier terms\./);
  assert.match(privacyHtml, /<h2 id="text-messages">Text messages<\/h2>/);
  assert.match(privacyVisibleText, /Verification codes you request/);
  assert.match(privacyVisibleText, /One launch-day text message with a link to download Metron\./);
  assert.match(privacyVisibleText, /Optional product updates, but only if you separately consent/);
  assert.match(privacyVisibleText, /Message frequency varies\./);
  assert.match(privacyVisibleText, /Msg & data rates may apply\./);
  assert.match(privacyVisibleText, /Reply STOP to opt out of text messages\. Reply HELP for help or email support@metron\.live\./);
  assert.match(privacyVisibleText, /Mobile carriers are not liable for delayed or undelivered messages\./);
  assert.doesNotMatch(privacyHtml, /—/);
});

test('resolves local homepage resources and in-page links', () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), `missing target #${match[1]}`);
  for (const match of html.matchAll(/(?:src|poster)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|data:)/i.test(reference)) continue;
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(reference))), `missing local resource: ${reference}`);
  }
});
