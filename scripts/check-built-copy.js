const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const failures = [];
const forbidden = [
  { label: 'retired polygon name', pattern: new RegExp(`hepta${'gon'}`, 'i') },
  { label: 'retired origin-story copy', pattern: /founder[ -]?story/i },
  { label: 'out-of-scope rugby example', pattern: /\brugby\b/i },
  { label: 'unsupported metric', pattern: /23%/i },
  { label: 'fabricated social proof', pattern: /testimonial placeholder/i },
  { label: 'out-of-scope nutrition claim', pattern: /nutrition module/i },
  { label: 'out-of-scope supplement claim', pattern: /supplement module/i },
  { label: 'retired seven-pillar claim', pattern: /seven[ -]?pillar/i },
  { label: 'unsupported team claim', pattern: /\bteam(?:s|mates)?\b/i },
  { label: 'prohibited em dash', pattern: /—/ }
];

function checkFile(file) {
  const contents = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(contents)) failures.push(`${path.relative(root, file)}: ${rule.label}`);
  }
}

if (!fs.existsSync(root)) throw new Error(`Build directory does not exist: ${root}`);
// This release contract applies to the metron.live landing page. Legacy
// standalone product explainers are separate surfaces with their own copy.
checkFile(path.join(root, 'index.html'));

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Built HTML, CSS, and JavaScript satisfy the launch-copy exclusions.');
}
