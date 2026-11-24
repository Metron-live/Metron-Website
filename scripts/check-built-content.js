const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');

assert.match(privacy, /<h2 id="text-messages">Text messages<\/h2>/);
assert.match(privacy, /\bSTOP\b/);
assert.match(privacy, /Msg &amp; data rates may apply/);
assert.match(
  homepage,
  /<form[^>]+id="reservation-form"[\s\S]*?<a href="\/privacy\.html#text-messages">Text messages disclosure<\/a>[\s\S]*?<\/form>/
);
assert.match(
  homepage,
  /const startBody = \{ contact: pendingContact, channel, consent_marketing: true \}[\s\S]*?postJson\(startEndpoint, startBody, 'pending'\)/
);
assert.match(
  homepage,
  /const checkBody = \{ contact: pendingContact, code: codeInput\.value\.trim\(\) \}[\s\S]*?postJson\(checkEndpoint, checkBody, 'reserved'\)/
);
assert.match(homepage, /responseKeys\.length !== 1 \|\| responseKeys\[0\] !== 'status' \|\| payload\.status !== expectedStatus/);
assert.match(homepage, /<title>The World's Smartest Personal Trainer<\/title>/);
assert.match(homepage, /Join the waitlist by email\./);

console.log('Verified built titles, reservation contract, fallback, privacy disclosure, and form link.');
