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

console.log('Verified the built privacy SMS disclosure and reservation-form link.');
