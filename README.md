# Metron Landing Page

Landing page for [metron.live](https://metron.live), including the verified launch-reservation flow.

## Overview

Metron connects your wearables, workouts, and nutrition to deliver personalized training and meal plans that adapt daily to how your body is actually performing.

## Tech Stack

- **Frontend**: Static HTML/CSS/JS
- **Fonts**: Space Grotesk (headings), Inter (body)
- **Reservation API**: `POST /api/v1/launch-reservations/request` and `/verify`
- **Hosting**: GitHub Pages
- **Tests**: Node contract checks and Playwright browser/snapshot coverage

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Metron-live/metron-landing.git
cd metron-landing
```

### 2. Install and test

```bash
npm ci
npm test
```

### 3. Deploy

**GitHub Pages:**
1. Go to repo Settings → Pages
2. Set source to main branch
3. Your site will be live at `https://metron-live.github.io/metron-landing`

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

## Launch reservations

The production page defaults to phone verification and offers email as an
alternative. Both channels require explicit consent and use the same two-step
reservation API. No local or hosting-provider form function is required.

## Local Development

Just open `index.html` in your browser. No build step required.

For live reload during development:
```bash
npx live-server
```

## License

© 2026 Metron. All rights reserved.
