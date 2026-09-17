# Spark — Dating App (iOS-first)

A dating app prototype inspired by **Tinder**, **Bumble**, and **Hinge** — built with Expo + React Native + TypeScript.

> See [`docs/SPARK_APP_DOCUMENT.md`](docs/SPARK_APP_DOCUMENT.md) for the full product & technical reference.

## Live demo

**Latest link:** see [`PUBLIC_PREVIEW.md`](PUBLIC_PREVIEW.md) — updated after each release.

```bash
npm install
npm run demo          # http://localhost:8090
npm run demo:tunnel   # public Cloudflare URL (requires cloudflared)
```

## Two modes

| Mode | Brand | What it looks like |
|------|-------|-------------------|
| **Disguise (default)** | Pulse | News & social feed — safe in public |
| **Safe mode** | Spark | Full dating: discover, likes, matches, chat |

**Toggle:** tap the **top-left logo** (Pulse ↔ Spark). Eye-off button on Spark tabs also returns to Pulse.

## Features

### Pulse disguise mode
- News feed with reporter avatars, in-app article reader (BBC, Guardian, NPR — free sources)
- **Women:** Cosmos disguise — 星座 zodiac, tarot, entertainment feed + Cosmos tab
- **Men:** World & local news, markets, weather trending
- Sponsored ads with real client landing pages
- Social posts with news/ad overlays on photos
- AI disguise ad generator (Profile)
- Trending, Activity alerts, disguise profile

### Onboarding
- Apple Sign-In stub (real on iOS, demo on web)
- Community guidelines, region, feed interests
- Profile setup with **photo upload** (expo-image-picker)
- Lands in **Pulse** by default after onboarding

### Spark discovery
- One profile card at a time
- **Drag to trash** (pass) · **Drag to heart** (like) · **Red star** (super-like)
- Spark Note, Rewind (Spark+), Boost, profile sheet, report/block

### Main tabs (Spark)
| Tab | Highlights |
|-----|------------|
| **Discover** | Drag targets, daily like limit, spark notes, rewind |
| **Likes** | Blurred grid → Spark+ reveals (free for women) |
| **Matches** | New matches row, expiry, your turn |
| **Profile** | Edit profile + photos, Boost, Spark+, disguise toggle |

### Chat
- Icebreaker prompts, unmatch, report / block

### Free tier (gender-aware)
| Perk | Men | Women |
|------|-----|-------|
| Daily likes | 10 | **25** |
| Spark Notes | 1/day | **3/day** |
| See who likes you | Spark+ | **Free** |
| See who viewed you | Spark+ | **Free** |

### Premium (Spark+)
- Unlimited likes & notes, rewind, boost, advanced filters

### Persistence
- **AsyncStorage** — matches, chats, disguise settings survive restart

## Run

```bash
npm install
npm start          # Expo Go on iPhone (scan QR)
npm run web        # Browser preview at localhost:8081
npm run ios        # Mac + Xcode simulator
npx tsc --noEmit   # Type check
```

## Project structure

```
src/
  components/disguise/   # Pulse feed, news cards, mode toggle
  context/               # App state + AsyncStorage
  navigation/            # Spark tabs + DisguiseNavigator
  screens/               # Discover, disguise, onboarding, chat
  data/                  # Mock profiles, disguise feed
docs/
  SPARK_APP_DOCUMENT.md
  PUBLIC_PREVIEW.md
PUBLIC_PREVIEW.md        # Live demo URL (canonical)
```

## Legal note

Prototype for demonstration. Not affiliated with Tinder, Bumble, or Hinge.
