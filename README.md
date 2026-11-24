# Metron Website

The static GitHub Pages site for [metron.live](https://metron.live).

## Overview

Metron launches as a free workout tracker and personal trainer for serious, self-coached athletes. The landing page explains the Train, Log, Learn, Adapt loop and offers a verified first-year launch reservation.

## Tech Stack

- **Frontend**: Static HTML, CSS, and JavaScript
- **Fonts**: Cardo for editorial copy, Inter for controls, Space Grotesk for the wordmark
- **Reservation API**: `https://api.metron.live/launch/reservations`
- **Hosting**: GitHub Pages

The reservation form posts to `/start`, confirms the six-digit code through `/check`, and exposes an email waitlist fallback for HTTP or network failures. The browser contract tests intercept these configured production URLs, so the test suite never creates a live reservation.

## Setup

### Local development

```bash
git clone https://github.com/Metron-live/Metron-Website.git
cd Metron-Website
npm ci
npm test
```

`npm test` builds `dist/`, validates the HTML, checks local links and assets, enforces the launch copy contract, and exercises the reservation flow in Chromium.

To serve the built site locally:

```bash
npm run build
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`.

### Deployment

Changes ship through a pull request. The website check workflow must pass before merge. GitHub Pages serves the `main` branch through the domain in `CNAME`.

## File Structure

```
Metron-Website/
├── index.html              # Main landing page
├── privacy.html            # Privacy Policy
├── terms.html              # Terms of Service
├── health-data-privacy.html # Consumer Health Data Privacy
├── scripts/                # Build and static validation
├── tests/                  # Copy and reservation flow contracts
└── README.md
```

## Open Graph handoff

The approved portrait MP4 and representative-frame PNG must be copied byte-for-byte from the approved handoff. Do not substitute or recompress these files. Until that handoff is available, `index.html` intentionally contains a TODO and publishes no `og:image` or `og:video` tags.

## License

© 2026 Metron. All rights reserved.
