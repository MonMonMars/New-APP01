# Spark — Public Web Preview

Try the app in **any browser** (phone, laptop, tablet).

## Live preview (Cloudflare)

**https://guests-exclude-rehabilitation-fancy.trycloudflare.com**

_Last updated: Sep 14, 2026 — white-screen fix (verified in browser)_

> This link forwards to the Expo web dev server in the cloud workspace.  
> Tunnels are **temporary** — if the link stops working, ask to regenerate it.

### How to test v0.5 features

1. **52 discover profiles + seeded state** — fresh install: 4 pre-matches, 5 pending likes, 6 incoming likes (see `profiles.ts` QA buckets).
2. **Spark Rose super-like** — tap center rose button → full-screen blue/gold celebration (~1.8s) → result modal.
3. **Super Match** — rose Priya (`11`), Riley (`29`), or Aaliyah (`34`) → “Super Match!” → Chat now.
4. **Standouts / Top Picks** — horizontal row above the deck (Hinge/Tinder pattern).
5. **Recently active strip** — green-dot activity row on Discover.
6. **Explore** — compass button → Serious daters / New members / Nearby category stacks.
7. **Likes tab** — Super Likes sent row + 6 blurred incoming likes.
8. **Matches tab** — Super Matches row + pre-seeded conversations.

### Earlier features (v0.4)

- Almost full-screen photos, batch loading (6 at a time), expand location, fake map.
- Red heart burst / trash vignette, drag-to-target discovery.

### Sound & effects

- Click anywhere on the page first (browser autoplay rule), then like/pass/rose for sound.
- Rose = pitched-up chime + massive particle celebration.

---

## Run locally

```bash
git clone https://github.com/MonMonMars/New-APP01.git
cd New-APP01
git checkout cursor/fix-white-screen-7b60
npm install
npm run web
```

Open http://localhost:8081

## Backend setup

See [`docs/BACKEND_SETUP.md`](./docs/BACKEND_SETUP.md) for Supabase configuration.

## Phone (best experience)

```bash
npm start
```

Scan the QR code with **Expo Go** — drag, haptics, photo upload, and notifications work best on a real device.
