const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const htmlFiles = [];
const failures = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.html')) htmlFiles.push(target);
  }
}

function resolveLocal(from, reference) {
  const withoutQuery = reference.split(/[?#]/, 1)[0];
  if (!withoutQuery) return from;
  const decoded = decodeURIComponent(withoutQuery);
  return decoded.startsWith('/') ? path.join(root, decoded) : path.resolve(path.dirname(from), decoded);
}

if (!fs.existsSync(root)) throw new Error(`Build directory does not exist: ${root}`);
walk(root);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/\b(?:href|src|poster|action)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(reference)) {
      if (/^https?:/i.test(reference)) {
        try { new URL(reference); } catch { failures.push(`${path.relative(root, file)}: invalid URL ${reference}`); }
      }
      continue;
    }
    if (reference.startsWith('#')) {
      const id = decodeURIComponent(reference.slice(1));
      if (id && !ids.has(id)) failures.push(`${path.relative(root, file)}: missing fragment ${reference}`);
      continue;
    }
    const target = resolveLocal(file, reference);
    const candidates = [target, `${target}.html`, path.join(target, 'index.html')];
    if (!target.startsWith(root + path.sep) || !candidates.some((candidate) => fs.existsSync(candidate))) {
      failures.push(`${path.relative(root, file)}: missing local target ${reference}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked local links and assets in ${htmlFiles.length} built HTML files.`);
}
