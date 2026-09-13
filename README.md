# Spark — Dating App (iOS-first)

A dating app prototype inspired by **Tinder**, **Bumble**, and **Hinge** — built with Expo + React Native + TypeScript.

> See [`docs/APP_FLOW.md`](docs/APP_FLOW.md) for the full UI structure map and competitor workflow research.

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

### Preview in Cursor

1. Start the dev server: `npm run web` (or `npx expo start --web --port 8081`)
2. Open **Simple Browser** (Command Palette → “Simple Browser: Show”)
3. Go to **http://localhost:8081**

You’ll see onboarding first — tap through to reach Discover, Likes, Matches, and Profile tabs. Drag works best on a phone via Expo Go; web is fine for layout review.

## Project structure

```
src/
  context/         # App state (likes, matches, chat)
  navigation/      # React Navigation (stack + tabs)
  screens/         # Discover, Likes, Matches, Profile, Chat, Onboarding
  components/      # Swipe deck, drop targets, modals
  data/            # Mock profiles & conversations
docs/
  APP_FLOW.md      # UI map + competitor research
```

## Legal note

Tinder holds patents and trademarks on swipe-based matching. Spark uses **drag-to-target** (trash/heart) instead of swipe-left/right. See README legal section in prior commits before App Store launch.
