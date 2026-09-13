# Spark — Dating App (iOS-first)

A Tinder-style swipe dating app prototype built with **Expo + React Native + TypeScript**.

> **Not legal advice.** See [Legal notes](#legal-notes-tinder-swipe-ui) before shipping to the App Store.

## Features

- Swipeable profile card stack (drag left/right or use action buttons)
- LIKE / NOPE stamps while swiping
- Bottom action bar (nope, super-like, like)
- Match modal on mutual-like simulation
- iOS-first layout with dark UI

## Run on iPhone (easiest)

1. Install dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npm start
```

3. On your iPhone, install **Expo Go** from the App Store.
4. Scan the QR code from the terminal (same Wi‑Fi network).

## Run iOS Simulator (Mac + Xcode required)

```bash
npm run ios
```

Requires macOS with Xcode and the iOS Simulator installed.

## Project structure

```
src/
  components/   # Swipe deck, cards, actions, match modal
  data/         # Mock profiles
  screens/      # Discover screen
  theme.ts      # Colors and spacing
```

## Legal notes (Tinder / swipe UI)

**Can you copy Tinder’s swipe UI?** There is real IP risk — not a simple yes/no.

| Protection | What Match Group / Tinder holds |
|---|---|
| Utility patents | e.g. [US9733811B2](https://patents.google.com/patent/US9733811B2) — matching via swipe gestures on profile cards (active through ~2029) |
| Design patent | e.g. US D798,314 — specific card-stack swipe interface look |
| Trademark | Registered **“swipe”** mark for dating app software |

**What that means for you:**

- **Learning / personal prototype** — building something similar in this repo is fine for practice.
- **App Store launch** — copying Tinder’s exact UI, interaction flow, and branding increases infringement risk. Match has sued competitors (e.g. Bumble) over overlapping patterns.
- **Safer path** — use your own name, colors, icons, and distinctive flows; consider a patent attorney for a freedom-to-operate review before monetizing.

Many dating apps use card swiping, but **how close** you get to Tinder’s patented workflow and visual design matters.

## Next steps

- [ ] Auth (Apple Sign-In)
- [ ] Real backend + profiles (Supabase / Firebase)
- [ ] Chat screen
- [ ] Push notifications for matches
- [ ] Android build when ready (`npm run android`)
