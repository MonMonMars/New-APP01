# Spark — Public Web Preview

Try the app in **any browser** (phone, laptop, tablet) using these links.

## Live preview (Cloudflare)

**https://news-boxed-finish-log.trycloudflare.com**

> This link works outside Cursor. It forwards to the dev server running in the cloud workspace.  
> Tunnels are **temporary** — if the link stops working, ask to regenerate it.

### How to test new features

1. **Onboarding** — tap "Continue with Apple" → complete rules, location, intent, profile.
2. **Photo upload** — on profile step, tap "Add photos" to pick from library (web: file picker).
3. **Discover** — drag card to white trash (pass) or red heart (like).
4. **Spark Note** — tap "Spark Note" below deck → send a message with your like.
5. **Match demo** — like **Mia** → full-screen celebration → open chat.
6. **Spark+** — Likes tab → tap blurred card → subscribe → names revealed.
7. **Boost** — Profile tab → tap "Boost" → golden banner on Discover.
8. **Unmatch** — open Mia chat → ⋮ menu → Unmatch → confirm.
9. **Report** — profile detail or chat → Report → pick reason → confirmation.
10. **Persistence** — refresh browser — onboarding state, matches, and likes survive.
11. **Rewind** — subscribe Spark+ → pass someone → tap "Rewind" on Discover.
12. **Notifications** — Profile → Notifications → enable (native only; stub on web).

### Sound & effects

- Click anywhere on the page first (browser autoplay rule), then like/pass for sound.
- Trash = dark vignette + whoosh; Heart = red burst + chime.

---

## Run locally on your machine

```bash
git clone https://github.com/MonMonMars/New-APP01.git
cd New-APP01
git checkout cursor/complete-all-features-7b60
npm install
npm run web
```

Open http://localhost:8081

## Phone (best experience)

```bash
npm start
```

Scan the QR code with **Expo Go** — drag, haptics, photo upload, and notifications work best on a real device.
