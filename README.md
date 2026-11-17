# Metron Landing Page

Landing page for [metron.live](https://metron.live): the world's smartest personal trainer, plus the best free workout tracker.

## Overview

Metron helps serious self-coached athletes move through a concrete Train, Log,
Learn, Adapt loop. The website accepts verified phone or email reservations for
90 days free and the Founding Member price ($79.99/yr) locked through April 30
2027.

## Tech Stack

- **Frontend**: Static HTML/CSS/JS
- **Fonts**: Cardo (headings and body), Inter (numbers and buttons), Space Grotesk (Metron wordmark only)
- **Form Handling**: Metron launch-reservation API with a direct email waitlist fallback
- **Hosting**: GitHub Pages / Vercel / Netlify

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Metron-live/metron-landing.git
cd metron-landing
```

### 2. Configure reservations

The production endpoint is declared once in `index.html`:

```html
<meta name="metron-reservation-api-base"
      content="https://api.metron.live/launch/reservations">
```

The browser posts a consented phone or email to `/start`, then posts the same
contact and six-digit verification code to `/check`. The form advances only
when the API returns `status: pending` and confirms only when it returns
`status: reserved`.

### 3. Deploy

**GitHub Pages:**
1. Go to repo Settings → Pages
2. Set source to main branch
3. Your site will be live at `https://metron-live.github.io/metron-landing`

**Vercel:**
```bash
npx vercel
```

**Netlify:**
- Drag and drop the folder to Netlify, or connect via Git

### 4. Custom Domain

Point your domain's DNS to your hosting provider and configure in their dashboard.

## File Structure

```
metron-landing/
├── index.html              # Main landing page
├── privacy.html            # Privacy Policy
├── terms.html              # Terms of Service
├── health-data-privacy.html # Consumer Health Data Privacy
└── README.md
```

## Reservation collection

Phone numbers and email addresses are verified by the launch-reservation API.
The API owns consent, deduplication, eligibility, rate limiting, and opt-out
state. The page never stores contact details in browser storage.

## Validation

```bash
npm ci
npm run build
npm run check:links
npm run test:smoke
```

## Local Development

Serve the repository so browser requests use HTTP. The production page remains
plain static HTML; the build command assembles the deployable `dist/` directory
for validation and hosting.

```bash
python3 -m http.server 4173
```

## License

© 2026 Metron. All rights reserved.
