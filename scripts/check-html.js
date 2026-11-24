const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const failures = [];
const files = [];
const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.html')) files.push(target);
  }
}

function validate(file) {
  const relative = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');
  const stack = [];
  const ids = new Set();
  const markup = source.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  if (!/^<!doctype html>/i.test(source.trimStart())) failures.push(`${relative}: missing HTML5 doctype`);
  if (!/<html\b[^>]*\blang="[^"]+"/i.test(source)) failures.push(`${relative}: missing language`);
  if (!/<meta\b[^>]*\bcharset="utf-8"/i.test(source)) failures.push(`${relative}: missing UTF-8 charset`);
  if (!/<title>[^<]+<\/title>/i.test(source)) failures.push(`${relative}: missing title`);
  for (const match of source.matchAll(/\bid="([^"]+)"/gi)) {
    if (ids.has(match[1])) failures.push(`${relative}: duplicate id ${match[1]}`);
    ids.add(match[1]);
  }
  for (const match of markup.matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi)) {
    const token = match[0];
    const name = match[1].toLowerCase();
    if (token.startsWith('</')) {
      const open = stack.pop();
      if (open !== name) failures.push(`${relative}: closing </${name}> does not match <${open || 'none'}>`);
    } else if (!voidElements.has(name) && !token.endsWith('/>')) stack.push(name);
  }
  if (stack.length) failures.push(`${relative}: unclosed ${stack.join(', ')}`);
}

walk(root);
files.forEach(validate);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`Validated ${files.length} built HTML files.`);
