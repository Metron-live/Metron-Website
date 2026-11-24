const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const failures = [];
const forbidden = [
  { label: 'rugby example', pattern: /rugby/i },
  { label: 'em dash', pattern: /—/ },
  { label: 'audio cue', pattern: /audio[ -]?cue/i },
  { label: 'live coaching', pattern: /live coaching/i },
  { label: 'founder story', pattern: /founder[ -]?story/i },
  { label: 'retired generic loop copy', pattern: /Four connected steps turn each lift/i },
  { label: 'retired generic interface copy', pattern: /Ask Arete\. Or use the screen built for the job\./i },
  { label: 'retired generic tracker copy', pattern: /The tracker stays free\. The coach earns its place\./i },
  { label: 'internal screen reference', pattern: /already backed by Metron's training and PR screens/i },
  { label: 'dated price', pattern: /\$\d|\b(?:19|20)\d{2}\b/ },
  { label: 'retired trial length', pattern: /90 days/i }
];

function checkFile(file) {
  const contents = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(contents)) failures.push(`${path.relative(root, file)}: ${rule.label}`);
  }
}

if (!fs.existsSync(root)) throw new Error(`Build directory does not exist: ${root}`);
const homepage = path.join(root, 'index.html');
checkFile(homepage);
const homepageContents = fs.readFileSync(homepage, 'utf8');
const trainerClaimCount = (homepageContents.match(/world's smartest personal trainer/gi) || []).length;
if (trainerClaimCount !== 1) failures.push(`index.html: expected one trainer comparison, found ${trainerClaimCount}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Built homepage copy matches the positioning and forbidden-copy contract.');
}
