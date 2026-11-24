const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.join(root, '.github', 'review-assets', 'pr-6');

async function capture(page, { source, size, file, title }) {
  const data = fs.readFileSync(path.join(root, source)).toString('base64');
  await page.setViewportSize({ width: Math.max(280, size + 96), height: size + 112 });
  await page.setContent(`<!doctype html><style>
    * { box-sizing: border-box; }
    body { margin: 0; font: 14px system-ui, sans-serif; color: #171717; background: #f5f5f5; }
    main { width: max-content; min-width: 240px; margin: 24px; padding: 20px; border: 1px solid #d4d4d4; border-radius: 12px; background: white; }
    p { margin: 0 0 14px; font-weight: 600; }
    .checker { display: grid; place-items: center; width: ${size}px; height: ${size}px; background-color: #eee; background-image: linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%); background-size: 16px 16px; background-position: 0 0,0 8px,8px -8px,-8px 0; }
    img { display: block; width: ${size}px; height: ${size}px; }
  </style><main><p>${title} · ${size} × ${size}px</p><div class="checker"><img src="data:image/png;base64,${data}" alt=""></div></main>`);
  await page.locator('main').screenshot({ path: path.join(output, file) });
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await capture(page, { source: 'favicon-32x32.png', size: 32, file: 'favicon-32px.png', title: 'Browser favicon' });
  await capture(page, { source: 'apple-touch-icon.png', size: 180, file: 'apple-touch-icon-180px.png', title: 'Apple touch icon' });
  await browser.close();
  console.log(`Captured favicon review assets in ${path.relative(root, output)}/`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
