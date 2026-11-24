const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(process.argv[2] || 'dist', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const forbidden = [
  ['founder story', /founder[ -]?story/i], ['rugby', /\brugby\b/i],
  ['unsupported metric', /23%/], ['testimonial', /testimonial/i],
  ['nutrition', /\bnutrition\b/i], ['supplement', /\bsupplement/i],
  ['seven-pillar', /seven[ -]?pillar/i], ['team claim', /\bteams?\b/i],
  ['em dash', /—/]
];
const failures = forbidden.filter(([, pattern]) => pattern.test(html)).map(([label]) => label);
if (failures.length) {
  console.error(`Forbidden landing-page copy: ${failures.join(', ')}`);
  process.exitCode = 1;
} else console.log('Landing-page exclusions passed.');
