const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const entries = [
  'index.html', 'privacy.html', 'health-data-privacy.html', 'terms.html',
  'support.html', 'CNAME', 'favicon.ico', 'favicon-16x16.png',
  'favicon-32x32.png', 'favicon-192x192.png', 'favicon-512x512.png',
  'apple-touch-icon.png', 'images', 'videos', 'brand', 'arete', 'onboarding',
  'rebalance'
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const entry of entries) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) throw new Error(`Missing build input: ${entry}`);
  fs.cpSync(source, path.join(output, entry), { recursive: true });
}

console.log(`Built ${entries.length} static entries in dist/`);
