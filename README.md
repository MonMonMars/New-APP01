# Spark — Dating App (iOS-first)

A dating app prototype inspired by **Tinder**, **Bumble**, and **Hinge** — built with Expo + React Native + TypeScript.

> **Full app document:** [`docs/SPARK_APP_DOCUMENT.md`](docs/SPARK_APP_DOCUMENT.md) — product, flows, screens, monetization, and architecture.  
> See also [`docs/APP_FLOW.md`](docs/APP_FLOW.md) for the UI structure map and competitor workflow research.

## Features

### Onboarding (Tinder/Bumble pattern)
- Welcome + sign-in
- House rules
- Location permission
- Quick profile setup

### Discovery (Spark differentiator)
- One profile card at a time
- **Drag to trash** (bottom-left) to pass
- **Drag to heart** (bottom-right) to like
- Full profile sheet with Hinge-style prompts

### Main tabs
| Tab | Pattern from |
|-----|----------------|
| **Discover** | Tinder home + drag targets |
| **Likes** | Tinder Gold / Bumble Beeline blur grid |
| **Matches** | Bumble expiring ring + Hinge "Your turn" |
| **Chat** | Icebreaker prompts (Bumble-style) |
| **Profile** | Standard settings + edit |

### Chat
- Icebreaker prompts (Bumble-style)
- Message bubbles, composer

## Run

```bash
npm install
npm start          # Expo Go on iPhone (scan QR)
npm run web        # Browser preview at localhost:8081
npm run ios        # Mac + Xcode simulator
```

### Try in your browser (public link)

**https://lenses-interpreted-towns-languages.trycloudflare.com**

Works on any device outside Cursor. See [`docs/PUBLIC_PREVIEW.md`](docs/PUBLIC_PREVIEW.md) for details and how to test drag effects + sound.

### Preview in Cursor (localhost only)

`http://localhost:8081` only works inside the Cursor cloud VM — not on your personal computer unless you run the app locally.

## Project structure

```
src/
  context/         # App state (likes, matches, chat)
  navigation/      # React Navigation (stack + tabs)
  screens/         # Discover, Likes, Matches, Profile, Chat, Onboarding
  components/      # Swipe deck, drop targets, modals
  data/            # Mock profiles & conversations
docs/
  SPARK_APP_DOCUMENT.md  # Full product & technical reference
  APP_FLOW.md            # UI map + competitor research
  PRODUCT_STRATEGY.md    # GTM, monetization, metrics
  PUBLIC_PREVIEW.md      # Browser demo links
```

## Legal note

Tinder holds patents and trademarks on swipe-based matching. Spark uses **drag-to-target** (trash/heart) instead of swipe-left/right. See README legal section in prior commits before App Store launch.
