# Spark — Public Web Preview

Try the app in **any browser** (phone, laptop, tablet).

## Live preview (Cloudflare)

**https://myspace-tournament-vernon-advancement.trycloudflare.com**

> This link forwards to the Expo web dev server in the cloud workspace.  
> Tunnels are **temporary** — if the link stops working, ask to regenerate it.

### How to test Discover v0.4 features

1. **Almost full-screen photos** — Discover tab: card fills most of the viewport; compact name/distance overlay above drop targets.
2. **Search more people** — swipe through the deck; tap **Search more people** below the card to load the next batch (6 at a time).
3. **Expand location** — tap the radius pill (“Searching within 25 mi”) or the expand icon → pick 50 / 100 / 250 / Anywhere.
4. **Fake map** — tap the **map icon** (top-left) → stylized map with pins → tap a pin → **View in deck** or **Search this area**.
5. **More fake accounts** — 36 discover profiles + 4 incoming likes for testing swipes, filters, and radius expansion.

### Earlier features (v0.3)

- Onboarding, discovery filters, passport mode, video profile overlay, rewind, chat polish, Spark+, consumables, prompts editor, pause/delete account, dark/light mode.

### Sound & effects

- Click anywhere on the page first (browser autoplay rule), then like/pass for sound.
- Trash = dark vignette + whoosh; Heart = red burst + chime.

---

## Run locally

```bash
git clone https://github.com/MonMonMars/New-APP01.git
cd New-APP01
git checkout cursor/discover-fullscreen-map-7b60
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
