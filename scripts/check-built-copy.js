const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const checkedExtensions = new Set(['.css', '.html', '.js']);
const failures = [];
const forbidden = [
  { label: 'retired polygon name', pattern: new RegExp(`hepta${'gon'}`, 'i') },
  { label: 'retired annual-free offer', pattern: /free[ -]?year/i },
  { label: 'retired alternate annual offer', pattern: new RegExp(`founding[ -]?${'year'}`, 'i') },
  { label: 'retired origin-story copy', pattern: /founder[ -]?story/i }
];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (checkedExtensions.has(path.extname(entry.name).toLowerCase())) checkFile(target);
  }
}

function checkFile(file) {
  const contents = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(contents)) failures.push(`${path.relative(root, file)}: ${rule.label}`);
  }
}

if (!fs.existsSync(root)) throw new Error(`Build directory does not exist: ${root}`);
walk(root);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Built HTML, CSS, and JavaScript contain no retired launch copy or shape references.');
}
