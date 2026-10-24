# Metron Landing Page

Landing page for [metron.live](https://metron.live) — the world's smartest personal trainer, built on a best-in-class workout tracker that remains free.

## Overview

Metron builds, coaches, tracks, and adapts training. The website also accepts phone-first founding reservations for a free first year of the full coach.

## Tech Stack

- **Frontend**: Static HTML/CSS/JS
- **Fonts**: Cardo (headings and body), Inter (numbers and buttons), Space Grotesk (Metron wordmark only)
- **Form Handling**: Netlify Function + Resend (phone reservation notification)
- **Hosting**: GitHub Pages / Vercel / Netlify

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Metron-live/metron-landing.git
cd metron-landing
```

### 2. Configure reservations

Set `RESEND_API_KEY` in Netlify. Reservations are sent to `beta@metron.live` by
default; set `SIGNUP_NOTIFICATION_EMAIL` to route them to another approved
inbox. The browser posts only the submitted phone number and page source to
`/.netlify/functions/beta-signup`.

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

Phone numbers are validated in the Netlify function and sent to the configured
reservation inbox through Resend. The page displays success only after Resend
accepts the notification request.

## Local Development

Just open `index.html` in your browser. No build step required.

For live reload during development:
```bash
npx live-server
```

## License

© 2026 Metron. All rights reserved.
