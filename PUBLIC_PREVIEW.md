# Spark — Live Demo

## Demo link (open now)

**https://royalty-load-richardson-creativity.trycloudflare.com**

_Last updated: Sep 16, 2026 — Phase D: rewind, GIFs, profile views, message reactions_

> Tunnel links expire when the cloud workspace stops. If this 404s, ask for a fresh link.

---

## Quick start

1. Open the link in **Chrome or Safari**
2. Tap **Skip sign-in (demo mode)** if prompted
3. Complete onboarding (or accept defaults)
4. You land in **Pulse** disguise mode (news & social feed) — the default
5. In Spark, tap the **Emergency** logo (top left, semi-transparent) → instant Pulse disguise
6. To return: **hold the Pulse logo and drag right** to unlock Spark

---

## What to try

### Pulse disguise mode — default
- News cards: reporter avatars + in-app article reader (BBC, Verge — free)
- Sponsored ads open **in-app** landing sheets (optional external CTA)
- **Trending** → tap a topic → filtered home feed
- Social: upvote, comment, share · Activity alerts open in-app
- **Profile** → AI disguise ad image · menu rows respond
- Header search → Trending · bell → Activity

### Spark safe mode
- **20 new profiles** (Riley, Marcus, Priya, Felix, Zoe…) — swipe deck + likes + instant matches
- **Smart demo replies** — matches respond with personality-aware messages (optional Groq LLM via `EXPO_PUBLIC_GROQ_API_KEY`)
- **Phase B** — Incognito (Spark+ · Privacy controls), voice prompts (profile + chat), date check-in (chat menu)
- **Phase C** — Advanced filters (intent + shared interests, Spark+), AI profile coach, post-3rd-match Spark+ upsell, boost banner on Discover
- **Phase D** — Rewind last pass (Discover, Spark+), GIF picker in chat, who viewed you (Profile), long-press message reactions, active-now badge in chat
- **Discover** — clean home: emergency logo + card deck + rewind button + three bottom targets only
- **Profile → Discover tools** — map, explore, filters, standouts, held profiles, etc.
- Drag cards to heart/trash/star zones
- **Video** badge on profiles → preview sheet
- **Likes** (Spark+) → tap card → Like/Pass → instant match-back
- **Chat** → tap header for profile · GIF in composer extras · long-press message to react · vibe game in composer
- **Profile** → who viewed you card (Spark+ unlocks names)
- **Map** → tap preview card for full profile
- **Map**, **Explore**, **Matches**, **Profile**
- Spark+, Shop, Safety, Notifications — eye-off returns to Pulse

### Sound
- Click anywhere on the page first (browser autoplay), then like/pass/rose for sound

---

## Run locally

```bash
git clone https://github.com/MonMonMars/New-APP01.git
cd New-APP01
git checkout cursor/complete-app-details-7b60
npm install
npm run demo
# → http://localhost:8090

# Public URL from your machine:
npm run demo:tunnel
```

Phone (best UX): `npm start` → Expo Go

---

## Permanent hosting (GitHub Pages)

**https://monmonmars.github.io/New-APP01/** — enable Pages in repo settings:

1. https://github.com/MonMonMars/New-APP01/settings/pages
2. Source → **Deploy from a branch** → branch **`gh-pages`** → **`/ (root)`** → Save

_Note: private repos need GitHub Pro/Team for Pages, or make the repo public._
