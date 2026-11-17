const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const privacyFile = path.join(root, 'privacy.html');

if (!fs.existsSync(privacyFile)) {
  throw new Error(`Built privacy page does not exist: ${privacyFile}`);
}

const html = fs.readFileSync(privacyFile, 'utf8');
const visibleText = html
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const required = [
  'Verification codes you request',
  'One launch-day text message with a link to download Metron.',
  'Optional product updates, but only if you separately consent',
  'Message frequency varies.',
  'Msg & data rates may apply.',
  'Reply STOP',
  'Reply HELP',
  'Carriers are not liable for delayed or undelivered messages.'
];

const missing = required.filter((text) => !visibleText.includes(text));
if (missing.length) {
  console.error(missing.map((text) => `privacy.html: missing required disclosure text: ${text}`).join('\n'));
  process.exitCode = 1;
} else if (html.includes('—')) {
  console.error('privacy.html: em dash is not allowed');
  process.exitCode = 1;
} else {
  console.log('Built privacy page contains the complete text-message disclosure.');
}
