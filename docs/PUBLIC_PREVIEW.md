# Spark — Public Web Preview

Try the app in **any browser** (phone, laptop, tablet) using these links.

## Live preview (Cloudflare)

**https://comm-giving-cricket-matter.trycloudflare.com**

_Last updated: Sep 14, 2026 — fullscreen card fix branch_

> This link works outside Cursor. It forwards to the dev server running in the cloud workspace.  
> Tunnels are **temporary** — if the link stops working, ask to regenerate it.

### How to test Discover v0.4 features

1. **Almost full-screen photos** — Discover tab: card fills ~90%+ of viewport; header/filters/search chrome overlaid on the photo (not stacked below).
2. **Search more people** — swipe through the deck; tap **Search more people** below the card to load the next batch (6 at a time).
3. **Expand location** — tap the radius pill (“Searching within 25 mi”) or the expand icon → pick 50 / 100 / 250 / Anywhere.
4. **Fake map** — tap the **map icon** (top-left) → stylized map with pins → tap a pin → **View in deck** or **Search this area**.
5. **More fake accounts** — 36 discover profiles + 4 incoming likes for testing swipes, filters, and radius expansion.

### How to test v0.3 features

1. **Onboarding** — tap "Continue with Apple" → rules → location → intent → **gender & orientation** → profile.
2. **Discovery filters** — tap chips: Active today, New here, Has bio, Verified.
3. **Passport mode** — Discover settings (⚙️) → enable Travel mode → pick a city.
4. **Video profile** — tap play icon overlay on Ava/Mia/Leo cards → "coming soon" alert.
5. **Rewind** — subscribe Spark+ → pass someone → tap "Rewind" (animated).
6. **Chat polish** — open Mia chat → send message → see read receipts (✓✓) → typing indicator → auto-reply.
7. **Image messages** — chat composer → 📷 icon → pick a photo.
8. **Spark+ comparison** — Likes tab → Spark+ → Free vs Plus table + Restore purchases.
9. **Consumables shop** — Profile → Shop — Boosts & Notes → buy packs.
10. **Prompts editor** — Profile → Edit profile → Add prompts (up to 3 Hinge-style).
11. **Social connect** — Edit profile → Instagram / Spotify stub rows.
12. **Age verification** — Edit profile → Verify your age → 18+ badge on profile.
13. **Pause account** — Profile → Pause account toggle → hidden from deck.
14. **Delete account** — Profile → Delete account → confirm → resets to onboarding.
15. **Notification prefs** — Profile → Notifications → toggle matches/messages/likes.
16. **Dark/light mode** — Profile → Appearance → tap to cycle.
17. **Supabase** — works when `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set; otherwise AsyncStorage only.

### Sound & effects

- Click anywhere on the page first (browser autoplay rule), then like/pass for sound.
- Trash = dark vignette + whoosh; Heart = red burst + chime.

---

## Run locally on your machine

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
