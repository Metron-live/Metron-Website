# Metron Landing Page

Landing page for [metron.live](https://metron.live): the performance staff that serious self-coached athletes never had, plus a free best-in-class workout tracker.

## Overview

Metron helps serious self-coached athletes plan training, log every set, learn
from completed work and adapt to readiness. The website checks whether phone
reservations are available before displaying that form and otherwise opens a
prefilled email waitlist message. The offer is a free founding year with a
30-day full-coach trial, while workout logging and history stay free.

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

The browser first probes `HEAD /start`. It shows the phone-first form only after
a successful response and otherwise shows the email waitlist. The probe times
out after four seconds so a stalled endpoint cannot leave both forms hidden. A phone
reservation starts verification with `POST /start`:

```json
{"contact":"+14155550123","channel":"sms","consent_marketing":true}
```

`channel` is `sms`. The required checkbox supplies `consent_marketing: true`.
After a successful
`{"status":"pending"}` response, the browser verifies the code with
`POST /check`:

```json
{"contact":"+14155550123","code":"123456"}
```

The reservation is complete only after the exact `{"status":"reserved"}`
response. Likewise, the start response must be exactly `{"status":"pending"}`;
the browser does not infer success from the HTTP status alone or accept
undocumented response fields.

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

Phone numbers are verified by the reservation API when it is available. When
it is unavailable, the fallback opens a prefilled email to `beta@metron.live`.
The page never stores contact details in browser storage.

## Validation

```bash
npm ci
npm run build
npm run check:links
npm run check:copy
npm run test:contract
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
