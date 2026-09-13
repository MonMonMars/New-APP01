# Spark — Dating App (iOS-first)

A dating app prototype inspired by **Tinder**, **Bumble**, and **Hinge** — built with Expo + React Native + TypeScript.

> See [`docs/SPARK_APP_DOCUMENT.md`](docs/SPARK_APP_DOCUMENT.md) for the full product & technical reference.

## Features

### Onboarding
- Apple Sign-In stub (real on iOS, demo on web)
- House rules, location, relationship intent
- Profile setup with **photo upload** (expo-image-picker)
- Full onboarding persisted locally

### Discovery (Spark differentiator)
- One profile card at a time
- **Drag to trash** (bottom-left, white) to pass
- **Drag to heart** (bottom-right, red) to like
- **Spark Note** — send a message with your like (Hinge-style)
- **Rewind** last pass (Spark+)
- **Boost** banner when profile is boosted
- Full profile sheet with Hinge-style prompts
- Report (reason picker) and block

### Main tabs
| Tab | Highlights |
|-----|------------|
| **Discover** | Drag targets, daily like limit, spark notes, rewind |
| **Likes** | Blurred grid → Spark+ reveals names/photos |
| **Matches** | New matches row, expiry, your turn |
| **Profile** | Edit profile + photos, Boost, Spark+, notifications |

### Chat
- Icebreaker prompts (Bumble-style)
- Unmatch with confirm dialog
- Report / block safety menu

### Premium (Spark+)
- See who likes you (unblur grid)
- Unlimited likes
- Unlimited Spark Notes
- Rewind last pass
- Boost profile (30 min)

### Persistence & notifications
- **AsyncStorage** — matches, chats, likes, passes, boost, Spark+, photos survive restart
- **Push notification stub** — permission prompt + local notification on match
- Hydration loading gate on app boot

## Run

```bash
npm install
npm start          # Expo Go on iPhone (scan QR)
npm run web        # Browser preview at localhost:8081
npm run ios        # Mac + Xcode simulator
npx tsc --noEmit   # Type check
```

### Try in your browser (public link)

See [`docs/PUBLIC_PREVIEW.md`](docs/PUBLIC_PREVIEW.md) for the latest live demo URL.

## Project structure

```
src/
  context/         # App state + AsyncStorage persistence
  navigation/      # React Navigation (stack + tabs)
  screens/         # Discover, Likes, Matches, Profile, Chat, Onboarding
  components/      # Swipe deck, modals, photo carousel, boost, spark note
  data/            # Mock profiles & conversations
  utils/           # Persistence, notifications, photo picker, Apple auth
docs/
  SPARK_APP_DOCUMENT.md    # Full product & technical reference
  PUBLIC_PREVIEW.md        # Live browser demo links
```

## Legal note

Tinder holds patents and trademarks on swipe-based matching. Spark uses **drag-to-target** (trash/heart) instead of swipe-left/right. See docs before App Store launch.
