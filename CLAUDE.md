# Metron Website — Claude Code Context

Single-file site: everything lives in `index.html` (CSS + JS inline).
Served from GitHub Pages via a separate repo; this repo is staging.
Local path: /Users/rentamac/Metron-Website-main/

## Brand

**Category**: The performance staff that serious self-coached athletes never had: strength coach, sports scientist, and data analyst in one system.
**Product question**: How do I train?
**Audience**: The athlete fighting for a starting spot, training for a team, a season, or a qualifier, who has no staff.
**Brand line**: Performance, democratized.
**Launch offer**: A free founding year with a 30-day full-coach trial. Tracking, logging, and history remain free.
**AI coach name**: Arete.
**Launch foundation**: Training only. Claim only the approved capabilities listed below.

## Typography — strict

- **Space Grotesk** — ONLY the "Metron" wordmark/logo text. Nowhere else.
- **Cardo** — everything else: quotes, headlines, nav, FAQ, body copy, section titles.
- **Inter** — numbers and buttons only.

Never introduce a new font. Never use Cardo on the wordmark or Space Grotesk on body.

## Visual system

- **Marble texture** (`/images/marble.png`) on all light backgrounds: body, nav (scrolled), cards, steps.
- **Marble text fill** (`background-clip: text`) on white text over video/dark sections.
- **Amber** (#d97706-ish) is the only accent color. Used for dividers, favicons, and hover states.
- **Black marble** (`/images/black-marble.jpg`) available but unused — OK to use for dark sections.
- Video has a cinematic vignette overlay and parallax scroll.
- Marble dust particles drift upward over the video.

## Hero contract

- Eyebrow: How do I train?
- H1: The pros get a team. You get Metron.
- Subhead: Metron is the strength coach, sports scientist and data analyst that athletes without a staff never had.
- Sub-line: It takes the guesswork out of greatness.
- The phone reservation form stays hidden until its HEAD probe succeeds. A failed or timed-out probe reveals the working email fallback.

sessionStorage flag `metron_hero_seen`: first visit plays full sequence, repeat visits in same session skip animations entirely (body class `.hero-skip-intro`).

Video clip order (11 clips, crossfade ~34s loop):
cyclist → surfer → sprinter → boy athlete → basketball girl → dribbler → female boxer → punching bag (flipped right) → ballet → soccer (shifted left) → sandbag

## Logo assets

- `/images/m-cropped.png` — the M
- `/images/metron-cropped.png` — the wordmark
- Exact splash-page ratio: M is 1.18× taller than wordmark. Preserve this.
- Nav logo: white filter over video, amber tint on scroll.

## Section order

1. Hero: performance-staff promise and gated phone-first reservation
2. Problem
3. Four concrete product-proof steps
4. Arete chat and dedicated screens as shared interfaces
5. Free tracker vs full coach
6. Approved training capabilities
7. Free founding year offer with a 30-day full-coach trial
8. FAQ
9. The single Socrates quote + footer

## Approved capability claims

- Training only
- Adaptive plan
- Daily readiness-based adaptation
- Progression from actuals
- Arete text coaching
- Apple Health inputs
- Practices and competitions awareness

Do not claim future integrations or publish an integration before it is ready.

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
- Approved iMessage media is pending handoff from `/Users/benshai/Downloads/Metron Large Lockup/approved handoff`. Do not publish the older `brand/brand preview/og-preview.*` files as substitutes.
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
- Overview — performance staff plus free tracker
- Build — sport- and goal-specific training
- Coach & log — text coaching and set logging
- Learn & adapt — verified analytics and Apple Health recovery
- Modular future — later expansion, clearly labeled

Platform dropdown — right column (featured):
Title: The Metron system
Body: Training now. More modules later.
Visual: product copy on a black marble background

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
- Caret glyph: a simple text caret
- Left column items: Cardo medium 18px title, Cardo regular 14px description at 70% white opacity
- Featured right column: Cardo medium 24px title, Cardo regular 16px body
- Hover state on items: subtle amber tint on title, smooth 150ms
- On scroll: nav background becomes marble (existing behavior), panel still opens on black marble
- Behavior: hover opens, mouseleave closes after 150ms, click also toggles, ESC closes, click outside closes
- Mobile: keep existing hamburger. In mobile menu, show Platform and Athletes as expandable accordions with left-column items only (no featured column)
