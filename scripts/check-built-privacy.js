const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const indexFile = path.join(root, 'index.html');
const privacyFile = path.join(root, 'privacy.html');

if (!fs.existsSync(indexFile)) {
  throw new Error(`Built home page does not exist: ${indexFile}`);
}
if (!fs.existsSync(privacyFile)) {
  throw new Error(`Built privacy page does not exist: ${privacyFile}`);
}

const indexHtml = fs.readFileSync(indexFile, 'utf8');
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
  'Mobile carriers are not liable for delayed or undelivered messages.'
];

const reservationForm = indexHtml.match(/<form\b[^>]*\bid="reservation-form"[^>]*>[\s\S]*?<\/form>/i)?.[0] || '';
const requiredMarkup = [
  [reservationForm, 'href="/privacy.html#text-messages"', 'reservation form privacy link'],
  [html, '<h2 id="text-messages">Text messages</h2>', 'privacy section anchor']
];
const missing = [
  ...required.filter((text) => !visibleText.includes(text)).map((text) => `disclosure text: ${text}`),
  ...requiredMarkup.filter(([source, markup]) => !source.includes(markup)).map(([, , label]) => label)
];
if (missing.length) {
  console.error(missing.map((item) => `missing required SMS disclosure contract: ${item}`).join('\n'));
  process.exitCode = 1;
} else if (html.includes('—')) {
  console.error('privacy.html: em dash is not allowed');
  process.exitCode = 1;
} else {
  console.log('Built privacy page contains the complete text-message disclosure.');
}
