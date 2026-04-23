# Metron Website — Restructure Copy

Copy for new and rewritten sections. Section order defined in CLAUDE.md.
Each block below specifies eyebrow, headline, body, and any bullets.
Do not paraphrase. Use this copy verbatim.

---

## 2. Problem (promoted to full-bleed section, right after hero)

**Eyebrow:** The problem
**Headline:** You're tracking everything. Nothing's talking.

**Body:**
You slept four hours. You ran ten miles yesterday. This morning your training app wants intervals. Your nutrition app has no idea you trained fasted. Your recovery score is red. Your coach app tells you to push.

Five apps. Five answers. Zero coordination.

The data exists. Nothing reads all of it.

---

## 3. Transition line (own section, black background, centered, Cardo italic, large)

> There had to be a better way.

---

## 4. Introducing Metron (sits right before integrations marquee)

**Eyebrow:** The solution
**Headline:** One coach. All your data. Every night.

**Body:**
Metron pulls your sleep, recovery, training, and nutrition into a single model — then rewrites tomorrow's plan while you sleep. No manual input. No conflicting advice. One plan, adapting to you, every morning.

---

## 5. Magic moment (new section — shell only, animation built separately)

**Eyebrow:** While you sleep
**Headline:** Metron is working.

**Body:**
11:47 PM — Whoop logs recovery at 42%.
2:13 AM — Apple Health confirms four hours of sleep.
4:30 AM — Metron rewrites tomorrow: strength session becomes mobility, protein target drops 20g, cardio moves to Thursday.
7:00 AM — your plan is ready. You didn't do anything.

---

## 6. Three engines — build out 02 and 03 to match 01's layout

### Engine 02 — Adaptation Engine

**Headline:** Adaptation Engine

**Body:**
Every night, eight data streams. One adjusted plan by morning. Metron reads your overnight recovery, yesterday's training load, nutrition adherence, and sleep quality — then rewrites tomorrow before your alarm.

**Bullets:**
- Nightly rewrite based on recovery state
- Adjusts intensity, volume, and nutrition together
- Explains every change in plain language

### Engine 03 — Arete AI Coach

**Headline:** Arete AI Coach

**Body:**
Name comes from the Greek *aretē* — excellence, virtue, living up to your potential. Ask Arete anything. It has your full history, your current plan, and your real-time data. Not generic advice — your answer, for your body, right now.

**Bullets:**
- Remembers every conversation
- Sees your wearable data in real time
- Powered by Claude, trained on your plan

---

## 9. Proof — add two more testimonials alongside the existing James R.

### Testimonial 2 (endurance athlete — placeholder, replace with real quote when available)

"I've been marathon training for six years. No coach I've ever worked with adjusted my taper week the way Metron did — it caught a recovery dip I hadn't even noticed yet and cut my Tuesday session before I hurt myself."

— Sarah K., 2:58 marathoner

### Testimonial 3 (general fitness — placeholder, replace with real quote when available)

"I'm not a competitive athlete. I just want to train smart around a busy job and two kids. Metron is the first thing that actually accounts for the fact that I slept like garbage because the baby was up."

— Marcus T., recreational lifter

---

## 10. CTA — restore email capture, keep App Store badge as secondary

**Eyebrow:** Coming Soon
**Headline:** Stop Guessing. Start Adapting.

**Body:**
Launching on the App Store. Be the first to know.

**Bullet list (keep existing):**
- Complete 12-week plan built from your data
- Daily workout & nutrition adjustments
- Unlimited Arete AI conversations
- All integrations included

**Primary CTA:** email capture form — single input, placeholder "your@email.com", button "Notify me" (Inter font per type rules). Form posts to whatever endpoint is wired up separately; if none, store in a list or use Formspree-style endpoint TBD.

**Secondary CTA:** Apple "Download on the App Store" badge, marked "Coming Soon" as it is currently.

---

## Deletions

- Remove the animated stats counter block entirely (0 integrations, 0 workouts, 0 adaptation timeframes, 0 to build your plan).
- The integrations logo marquee currently duplicates in the DOM — keep only one pass.
