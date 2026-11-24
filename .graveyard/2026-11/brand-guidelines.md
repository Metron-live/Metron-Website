# Metron Brand Guidelines

> Last updated: January 2026

---

## Logo

The Metron logo consists of two elements: the **M icon** (Sharp M) and the **wordmark** (Space Grotesk Bold).

### Versions

| Version | Use Case |
|---------|----------|
| **Horizontal** | Primary logo. Website header, marketing materials, presentations. |
| **Stacked** | Square spaces, social profiles, app splash screens. |
| **Icon only** | Favicon, app icon, small UI placements, social avatars. |
| **Wordmark only** | When icon doesn't fit or for text-heavy contexts. |

### Variations

| Variation | File | When to Use |
|-----------|------|-------------|
| **Medium** | `icon-medium-*.svg` | App icons, favicons, small placements. More compact, holds shape at tiny sizes. |
| **Wide** | `icon-wide-*.svg` | Full logo lockups, marketing. More presence, better for larger displays. |

**Recommendation:** Use **Wide** for the horizontal logo, **Medium** for standalone icons.

---

## Clear Space

Maintain clear space around the logo equal to the height of the "M" icon on all sides. No other elements should enter this zone.

```
    ┌─────────────────────────┐
    │                         │
    │    [M]  Metron          │
    │                         │
    └─────────────────────────┘
         ↑ Clear space = icon height
```

### Minimum Sizes

| Format | Minimum Width |
|--------|---------------|
| Horizontal logo | 120px |
| Stacked logo | 80px |
| Icon only | 16px |

Below these sizes, the logo loses legibility.

---

## Color Palette

### Primary Colors

| Color | HEX | RGB | Use |
|-------|-----|-----|-----|
| **Black** | `#1a1a1a` | 26, 26, 26 | Primary text, logo on light backgrounds |
| **Off-White** | `#FAFAF8` | 250, 250, 248 | Background, logo on dark backgrounds |

### Accent Color

| Color | HEX | RGB | Use |
|-------|-----|-----|-----|
| **Coral** | `#E8734A` | 232, 115, 74 | App icon, buttons, CTAs, highlights |

### Supporting Colors

| Color | HEX | RGB | Use |
|-------|-----|-----|-----|
| **Text Secondary** | `#666666` | 102, 102, 102 | Secondary text, captions |
| **Border** | `#E8E8E6` | 232, 232, 230 | Dividers, card borders |
| **Border Dark** | `#CCCCCC` | 204, 204, 204 | Hover states, emphasis |

### Logo Color Usage

| Background | Logo Color |
|------------|------------|
| Light (#FAFAF8, white) | Black (#1a1a1a) |
| Dark (#1a1a1a, black) | White (#FAFAF8) |
| Photography/busy backgrounds | White with subtle shadow, or use solid color block behind logo |
| App icon | Coral background (#E8734A) + White icon |

---

## Typography

### Primary Typeface

**Space Grotesk** — Used for logo wordmark, headlines, and display text.

- Weights: Medium (500), Semi-Bold (600), Bold (700)
- Source: [Google Fonts](https://fonts.google.com/specimen/Space+Grotesk)

### Secondary Typeface

**Inter** — Used for body text, UI elements, and long-form content.

- Weights: Regular (400), Medium (500), Semi-Bold (600)
- Source: [Google Fonts](https://fonts.google.com/specimen/Inter)

### Type Hierarchy

| Element | Font | Weight | Size (web) |
|---------|------|--------|------------|
| H1 | Space Grotesk | 700 | 48–64px |
| H2 | Space Grotesk | 700 | 32–40px |
| H3 | Space Grotesk | 600 | 24–28px |
| Body | Inter | 400 | 16–18px |
| Caption | Inter | 500 | 14px |
| Button | Inter | 600 | 16px |

---

## Incorrect Usage

Do not:

- ❌ Stretch or distort the logo
- ❌ Rotate the logo
- ❌ Add drop shadows or effects
- ❌ Use colors other than black, white, or coral
- ❌ Place on busy backgrounds without sufficient contrast
- ❌ Recreate the logo in a different font
- ❌ Rearrange the icon and wordmark
- ❌ Use the old teal accent color (#0D9488) — deprecated

---

## File Formats

| Format | Use Case |
|--------|----------|
| **SVG** | Web, digital, anywhere scalable graphics are supported. Preferred format. |
| **PNG** | Documents, presentations, email signatures. Export at 2x for retina. |
| **ICO** | Favicon (favicon.ico) |
| **PDF** | Print materials |

### File Naming Convention

```
icon-{variation}-{color}.svg
appicon-{variation}-{color}.svg

Examples:
icon-medium-black.svg
icon-wide-coral.svg
appicon-medium-coral.svg
```

---

## App Icon

The app icon uses a **coral background** with the **white M icon** centered.

| Platform | Size | File |
|----------|------|------|
| iOS App Store | 1024×1024 | Export from `appicon-medium-coral.svg` |
| iOS Home Screen | 180×180 | Export from `appicon-medium-coral.svg` |
| Android | 512×512 | Export from `appicon-medium-coral.svg` |
| Favicon | 32×32, 16×16 | Export from `icon-medium-coral.svg` |

For iOS, the icon will be automatically masked with rounded corners. For Android, provide both square and round variants if needed.

---

## Quick Reference

```
Primary Black:    #1a1a1a
Off-White:        #FAFAF8
Coral Accent:     #E8734A

Headline Font:    Space Grotesk Bold
Body Font:        Inter Regular

Logo clear space: 1× icon height
Min logo width:   120px (horizontal), 80px (stacked), 16px (icon)
```

---

## Assets

All logo files are located in `/brand/`:

```
brand/
├── icon-medium-black.svg
├── icon-medium-white.svg
├── icon-medium-coral.svg
├── icon-wide-black.svg
├── icon-wide-white.svg
├── icon-wide-coral.svg
├── appicon-medium-coral.svg
├── appicon-wide-coral.svg
├── brand-guidelines.md
└── brand-preview.html
```

---

## Contact

Questions about brand usage? Reach out to the team.
