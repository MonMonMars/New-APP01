# Spark — Public Web Preview

Try the app in **any browser** (phone, laptop, tablet).

## Live preview (Cloudflare)

**https://comm-giving-cricket-matter.trycloudflare.com**

_Last updated: Sep 14, 2026 — fullscreen card + super-like branch_

> This link forwards to the Expo web dev server in the cloud workspace.  
> Tunnels are **temporary** — if the link stops working, ask to regenerate it.

### How to test v0.5 features

1. **Almost full-screen photos** — Discover: card fills ~90%+ of viewport; chrome overlaid on photo.
2. **52 discover profiles + seeded state** — 4 pre-matches, 5 pending likes, 6 incoming likes.
3. **Spark Rose super-like** — center rose button → full-screen celebration → Chat now / Continue search.
4. **Super Match** — rose Priya (`11`), Riley (`29`), or Aaliyah (`34`).
5. **Standouts / Recently active** — horizontal rows above deck.
6. **Explore** — compass button → category stacks.
7. **Search more people** + **expand location** + **fake map** (map icon top-left).

### Sound & effects

- Click anywhere on the page first (browser autoplay rule), then like/pass/rose for sound.
- Rose = pitched-up chime + massive particle celebration.

---

## Run locally

```bash
git clone https://github.com/MonMonMars/New-APP01.git
cd New-APP01
git checkout cursor/fullscreen-card-fix-7b60
npm install
npm run web
```

Open http://localhost:8081

## Backend setup

See [`BACKEND_SETUP.md`](./BACKEND_SETUP.md) for Supabase configuration.

## Phone (best experience)

```bash
npm start
```

Scan the QR code with **Expo Go** — drag, haptics, photo upload, and notifications work best on a real device.
