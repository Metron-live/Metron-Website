# Metron Website — Claude Code Context

Single-file site: everything lives in `index.html` (CSS + JS inline).
Served from GitHub Pages via a separate repo; this repo is staging.
Local path: /Users/rentamac/Metron-Website-main/

## Brand

**Product**: Metron — the world's smartest personal trainer, built on a best-in-class workout tracker that remains free.
**Launch offer**: 30-day full coach trial, no card required; tracking, logging, and history remain free afterward.
**AI coach name**: Arete.
**Launch foundation**: Training, including strength, endurance, and sport-specific athletic preparation.
**Future architecture**: Optional pillars may be enabled individually later; do not present broader pillars or future modes as live.

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

- 0.0s: video montage starts, all text elements at opacity 0.3 baseline
- 0.3s: logo + Metron wordmark + nav items + mega triggers fade to full opacity (900ms duration)
- 0.9s: "Performance, democratized." + sub fade to full opacity (700ms duration)
- 1.5s: Socrates quote + attribution fade to full opacity (900ms duration)
- 2.2s: rotating heptagon scroll cue appears (500ms duration)

Total sequence: ~2.7s. Text readable from 0.3s.

sessionStorage flag `metron_hero_seen`: first visit plays full sequence, repeat visits in same session skip animations entirely (body class `.hero-skip-intro`).

Video clip order (11 clips, crossfade ~34s loop):
cyclist → surfer → sprinter → boy athlete → basketball girl → dribbler → female boxer → punching bag (flipped right) → ballet → soccer (shifted left) → sandbag

## Logo assets

- `/images/m-cropped.png` — the M
- `/images/metron-cropped.png` — the wordmark
- Exact splash-page ratio: M is 1.18× taller than wordmark. Preserve this.
- Nav logo: white filter over video, amber tint on scroll.

## Section order

1. Hero: trainer promise, free tracker promise, and phone-first reservation
2. Problem
3. Four connected product-proof loops
4. Arete chat and dedicated screens as shared interfaces
5. Free tracker vs full coach
6. Modular future, with later capabilities labeled clearly
7. Phone-first free-year reservation
8. FAQ
9. Aristotle quote + footer

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

## Mega menu navigation

Metron nav is moving to a Harvey-style mega-menu pattern for two items: Platform and Athletes. Compare and FAQ remain simple anchor links. "Get the App" stays as the CTA button.

Nav structure:
Logo · · · Platform ▾ · Athletes ▾ · Compare · FAQ · [Get the App]

Product dropdown — left column (text items, Cardo, stacked vertically, ~48px gap):
- Overview — trainer plus free tracker
- Build — sport- and goal-specific training
- Coach & log — live guidance and set logging
- Learn & adapt — verified analytics and Apple Health recovery
- Modular future — later expansion, clearly labeled

Platform dropdown — right column (featured):
Title: The Heptagon
Body: Seven pillars. One score. Every day.
Visual: animated rotating heptagon (reuse hero scroll-cue component scaled up) on black marble background

Training dropdown — left column:
- Endurance
- Strength
- Athletic preparation
- Coming later

Do not publish placeholder testimonials, unsupported metrics, or unverified integration claims.

Visual spec for the mega menu:
- Panel: full viewport width, slides down from nav, black marble background (images/black-marble.jpg)
- Panel height: ~540px desktop
- Panel entrance: 200ms ease-out, fade + 8px translateY
- Active nav item: amber hairline underneath, caret flips to ▲
- Caret glyph: small rotating heptagon (match hero scroll cue, smaller)
- Left column items: Cardo medium 18px title, Cardo regular 14px description at 70% white opacity
- Featured right column: Cardo medium 24px title, Cardo regular 16px body
- Hover state on items: subtle amber tint on title, smooth 150ms
- On scroll: nav background becomes marble (existing behavior), panel still opens on black marble
- Behavior: hover opens, mouseleave closes after 150ms, click also toggles, ESC closes, click outside closes
- Mobile: keep existing hamburger. In mobile menu, show Platform and Athletes as expandable accordions with left-column items only (no featured column)
