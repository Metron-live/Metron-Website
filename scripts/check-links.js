const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const files = [];
const failures = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.html')) files.push(target);
  }
}

function idsIn(file) {
  return new Set([...fs.readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
}

walk(root);
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const localIds = idsIn(file);
  for (const match of html.matchAll(/\b(?:href|src|poster|action)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(reference)) {
      if (/^https?:/i.test(reference)) try { new URL(reference); } catch { failures.push(`${path.relative(root, file)}: invalid URL ${reference}`); }
      continue;
    }
    if (reference.startsWith('#')) {
      if (reference.length > 1 && !localIds.has(decodeURIComponent(reference.slice(1)))) failures.push(`${path.relative(root, file)}: missing ${reference}`);
      continue;
    }
    const [resource, fragment = ''] = reference.split('#', 2);
    const decoded = decodeURIComponent(resource.split('?', 1)[0]);
    const target = decoded.startsWith('/') ? path.join(root, decoded) : path.resolve(path.dirname(file), decoded);
    const candidates = [target, `${target}.html`, path.join(target, 'index.html')];
    const existing = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!target.startsWith(root + path.sep) || !existing) failures.push(`${path.relative(root, file)}: missing ${reference}`);
    else if (fragment && existing.endsWith('.html') && !idsIn(existing).has(decodeURIComponent(fragment))) failures.push(`${path.relative(root, file)}: missing #${fragment} in ${path.relative(root, existing)}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`Checked links and assets in ${files.length} built HTML files.`);
