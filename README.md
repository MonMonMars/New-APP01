# Spark — Dating App (iOS-first)

A dating app prototype built with **Expo + React Native + TypeScript**.

> **Not legal advice.** See [Legal notes](#legal-notes-tinder-swipe-ui) before shipping to the App Store.

## Features

- Profile card deck with subtle stack depth (one card visible at a time)
- **Drag-to-target** interaction — drag the photo card to corner drop zones:
  - **Trash** (bottom-left) to pass / reject
  - **Heart** (bottom-right) to like
- Drop zones highlight and scale when the card is nearby
- Match modal on mutual-like simulation
- iOS-first layout with dark Spark branding

## Interaction

1. A single profile card is shown from the deck.
2. **Drag** the card with your finger — it follows freely.
3. Drop it on the **trash** target (lower-left) to pass, or the **heart** target (lower-right) to like.
4. If released outside both zones, the card springs back to center.
5. On like, a random match may trigger the match modal.

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
  components/   # Drag deck, cards, drop targets, match modal
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

This app uses **drag-to-target** (trash / heart corners) rather than horizontal swipe-left/right, which is a more distinctive interaction pattern.

## Next steps

- [ ] Auth (Apple Sign-In)
- [ ] Real backend + profiles (Supabase / Firebase)
- [ ] Chat screen
- [ ] Push notifications for matches
- [ ] Android build when ready (`npm run android`)
