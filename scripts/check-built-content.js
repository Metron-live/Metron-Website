const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');

assert.match(homepage, /name="twitter:card" content="summary_large_image"/);
assert.match(homepage, /name="twitter:image" content="[^"]+og-preview-approved\.png"/);
assert.match(homepage, /name="twitter:image:alt" content="Metron performance training preview"/);
assert.match(privacy, /<h2 id="text-messages">Text messages<\/h2>/);
assert.match(privacy, /\bSTOP\b/);
assert.match(privacy, /Msg &amp; data rates may apply/);
assert.match(
  homepage,
  /<form[^>]+id="reservation-form"[\s\S]*?<a href="\/privacy\.html#text-messages">Text messages disclosure<\/a>[\s\S]*?<\/form>/
);
assert.match(
  homepage,
  /fetch\(startEndpoint, \{ method: 'HEAD', cache: 'no-store', signal: controller\.signal \}\)/
);
assert.match(homepage, /window\.setTimeout\(\(\) => controller\.abort\(\), probeTimeoutMs\)/);
assert.match(homepage, /class="reservation-panel" id="reserve" aria-busy="true"/);
assert.match(homepage, /function finishProbe\(\) \{ reservationPanel\.setAttribute\('aria-busy', 'false'\); \}/);
assert.match(
  homepage,
  /postJson\(startEndpoint, \{ contact: pendingContact, channel: 'sms', consent_marketing: true \}, 'pending'\)/
);
assert.match(
  homepage,
  /postJson\(checkEndpoint, \{ contact: pendingContact, code: codeInput\.value\.trim\(\) \}, 'reserved'\)/
);
assert.match(homepage, /responseKeys\.length !== 1 \|\| responseKeys\[0\] !== 'status' \|\| payload\.status !== expectedStatus/);

assert.match(homepage, /mailto:\$\{waitlistEmail\}\?subject=\$\{subject\}&body=\$\{body\}/);

console.log('Verified social preview metadata, the HEAD gate, reservation states, email fallback, privacy disclosure, and form link.');
