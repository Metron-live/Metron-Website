# Metron Website — Claude Code Context

Single-file site: everything lives in `index.html` (CSS + JS inline).
Served from GitHub Pages via a separate repo; this repo is staging.
Local path: /Users/rentamac/Metron-Website-main/

## Brand

**Product**: Metron — AI performance coach that reads wearable/nutrition/recovery data and rewrites the user's plan nightly.
**Tagline**: Performance, democratized.
**Sub**: For every athlete. At every level.
**AI coach name**: Arete.
**Seven pillars**: Sleep, Recovery, Training, Nutrition, Cardio, Body, Mind.

## Typography — strict

- **Space Grotesk** — ONLY the "Metron" wordmark/logo text. Nowhere else.
- **Cardo** — everything else: quotes, headlines, nav, FAQ, body copy, section titles.
- **Inter** — numbers and buttons only.

Never introduce a new font. Never use Cardo on the wordmark or Space Grotesk on body.

## Visual system

- **Marble texture** (`/images/marble.png`) on all light backgrounds: body, nav (scrolled), cards, steps.
- **Marble text fill** (`background-clip: text`) on white text over video/dark sections.
- **Amber** (#d97706-ish) is the only accent color. Used for dividers, favicons, hover states, small heptagon separators between sections.
- **Black marble** (`/images/black-marble.jpg`) available but unused — OK to use for dark sections.
- Video has a cinematic vignette overlay and parallax scroll.
- Marble dust particles drift upward over the video.

## Hero load choreography — DO NOT TOUCH

Timing is locked. Do not modify without explicit instruction:

- 0.0s: video montage starts
- 0.5s: Socrates quote fades in (left-aligned, Cardo 400, letter-spacing 0.25em, marble text fill)
- 2.0s: "Performance, democratized." + sub fade in (top right)
- 3.5s: M logo + Metron wordmark + nav tabs fade in together
- 5.0s: rotating white heptagon scroll cue appears bottom-center

Video clip order (11 clips, crossfade ~34s loop):
cyclist → surfer → sprinter → boy athlete → basketball girl → dribbler → female boxer → punching bag (flipped right) → ballet → soccer (shifted left) → sandbag

## Logo assets

- `/images/m-cropped.png` — the M
- `/images/metron-cropped.png` — the wordmark
- Exact splash-page ratio: M is 1.18× taller than wordmark. Preserve this.
- Nav logo: white filter over video, amber tint on scroll.

## Section order (current → target)

Target order after restructure:
1. Hero
2. Problem (visceral, full-bleed, promoted from current buried position)
3. Transition line
4. Introducing Metron + integrations marquee (single pass, not doubled)
5. Magic moment demo ("While you sleep, Metron is working")
6. Three engines — ALL THREE built out (currently only 01 is shown)
7. From zero to your plan in one day
8. Compare table
9. Proof (testimonials — currently one, need more)
10. CTA with email capture restored + App Store badge secondary
11. Aristotle quote + footer

## Rules of engagement

- Commit per section with descriptive messages. Never bundle unrelated changes.
- Plan mode before multi-section restructures. Get approval before executing.
- Never add JS frameworks, build steps, or external dependencies. Inline only.
- Never add new fonts, new accent colors, or new texture images without asking.
- The hero load sequence is sacred. Propose, don't modify.
- If a change affects mobile layout, verify the mobile-specific rules still hold:
  tagline order: -1 so it sits above the fold, phone at bottom.

## Key files

- `index.html` — entire site
- `videos/montage-web.mp4` — hero montage
- `brand/brand preview/og-preview.mp4` — iMessage portrait preview
- `brand/brand preview/og-preview.png` — og:image fallback
- `images/marble.png`, `images/black-marble.jpg` — textures
- `images/m-cropped.png`, `images/metron-cropped.png` — logo assets

## Out of scope (don't suggest)

- Framework migration (no React, no build step)
- CSS-in-JS or preprocessors
- Analytics, cookies, consent banners (handled separately)
- Dark mode toggle (planned but not this pass)
