# Spark — Dating App (iOS-first)

A dating app prototype inspired by **Tinder**, **Bumble**, and **Hinge** — built with Expo + React Native + TypeScript.

> See [`docs/APP_FLOW.md`](docs/APP_FLOW.md) for the full UI structure map and competitor workflow research.  
> **Live demo link:** [`docs/PUBLIC_PREVIEW.md`](docs/PUBLIC_PREVIEW.md)

## Features

### Onboarding (Tinder/Bumble pattern)
- Welcome + sign-in
- House rules
- Location permission
- Relationship intent
- Quick profile setup (persisted locally)

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
| **Profile** | Edit profile, discovery prefs, Safety & Spark+ links |

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
  APP_FLOW.md              # UI map + competitor research
  SPARK_APP_DOCUMENT.md    # Full product & technical reference
```

## Legal note

Tinder holds patents and trademarks on swipe-based matching. Spark uses **drag-to-target** (trash/heart) instead of swipe-left/right. See README legal section in prior commits before App Store launch.
