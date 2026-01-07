# Metron Landing Page

Landing page for [metron.live](https://metron.live) — AI-powered fitness intelligence platform.

## Overview

Metron connects your wearables, workouts, and nutrition to deliver personalized training and meal plans that adapt daily to how your body is actually performing.

## Tech Stack

- **Frontend**: Static HTML/CSS/JS
- **Fonts**: Space Grotesk (headings), Inter (body)
- **Form Handling**: Formspree (email collection)
- **Hosting**: GitHub Pages / Vercel / Netlify

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Metron-live/metron-landing.git
cd metron-landing
```

### 2. Set up Formspree

1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form
3. Copy your form ID
4. Replace `YOUR_FORM_ID` in `index.html` with your actual form ID (appears twice)

```html
<!-- Find these lines and replace YOUR_FORM_ID -->
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

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

## Email Collection

Emails submitted through the forms are collected via Formspree. You can:
- View submissions in the Formspree dashboard
- Export to CSV
- Set up integrations with Airtable, Google Sheets, Slack, etc.

## Local Development

Just open `index.html` in your browser. No build step required.

For live reload during development:
```bash
npx live-server
```

## License

© 2026 Metron. All rights reserved.
