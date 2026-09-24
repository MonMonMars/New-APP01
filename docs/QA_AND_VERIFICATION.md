# QA and verification reference

Complete guide for agents, CI, and Mon before sharing a demo URL.

## npm scripts (quick index)

| Command | When to use |
|---------|-------------|
| `npm run verify:ci` | **CI gate** — TypeScript, profile/i18n/map validators, `build:web:demo` |
| `npm run verify:ci-smoke` | Same **5 Playwright scripts as GitHub CI** (serve `dist` on `:8090` first) |
| `DEMO_URL=https://… npm run verify:remote-smoke` | Post-deploy smoke against Vercel/Netlify |
| `npm run verify:extended` | Full release QA (~10+ Playwright flows; local `:8090`) |
| `npm run validate:profiles` | Validators only (no build) |

## GitHub CI (`.github/workflows/ci.yml`)

On every push/PR to `main` or `cursor/**`:

1. `npm ci` → `tsc --noEmit` → `validate:profiles` → `build:web:demo`
2. Serve `dist` on port **8090**
3. Playwright (in order):
   - **`verify-demo-link.mjs`** — HTTP 200, onboarding → Spark discover → Pulse tab, no console errors
   - **`check-pulse-link-routing.mjs`** — News/ad/social taps open correct sheets; profile avatars open mini-window; caption beside thumb
   - **`check-mini-window.mjs`** — Open mini-window from feed; photo swipe; like/pass/super-like toasts; sheet closes
   - **`check-privacy-version-footer.mjs`** — Privacy screen shows build id (no raw i18n keys)
   - **`check-map-world-search.mjs`** — Discover Hub → Map → Places → Tokyo → people count → **Browse matches** → “Matches in this area” grid

## Map discover (privacy UX) — manual checklist

**Entry:** Spark → Discover tools (header) → **Map**, or Discover Hub → Map tile.

| Step | Expected |
|------|----------|
| Map basemap | **OpenStreetMap** tiles (`tile.openstreetmap.org`) — no “API key required” watermark |
| People on map | **Location pin icons only** — never profile photos on the map |
| Meta pill | `{radius} · {count} people` updates while panning |
| Places → Tokyo | Map jumps; people count increases (demo pool scattered in radius) |
| **Search this area** | Commits search; discover **deck pool** uses `mapSearchLat` / `mapSearchLng` |
| **Browse {n} matches** | Opens **MapAreaMatches** — 2-column grid with photos |
| Tap grid card | **ProfileDetailSheet** — like, pass, hold, block, report |
| Radius chips | 25 / 50 / 100 / 250 / Any — ring + pool update |

**Code paths:** `ExpandSearchMap` (`ExpandLocationSheet.tsx`), `MapAreaMatchesScreen`, `SearchMapView` (`pinMarkerStyle="icon"`), `profilesForMapViewport`, `searchMapAt` in `AppContext`.

## Pulse feed — manual checklist

| Step | Expected |
|------|----------|
| Captions | Intro text **beside** profile thumbnails on disguised/news/social cards (`FeedPersonThumbnail` + `profileIntroCaption`) |
| Like/unlike (disguised or social card) | **Profile photo + beside-text swap** in place (post like → `mergeSparkLikesWithPulsePostLikes` + `filterActionedDisguiseFeed`) |
| News headline tap | Article sheet — not dating mini-window |
| Social body / comments | Comment sheet — not mini-window for generic social tap |
| Pull to refresh | “Updated just now” / refresh indicator (see `check-pulse-feed-refresh.mjs` in extended) |

**Code paths:** `useDisguiseFeedItems`, `togglePulseLike` + `pulseSocial.likedPostIds`, `DisguisedProfileCard` / `SocialPostCard` `PulseProfileSwap` keys.

## Spark discover — smoke path

1. Continue without account → finish onboarding (defaults OK).
2. Pulse logo → **Leave Spark** (or eye-off) → Spark tabs.
3. Drag or tap heart/trash on discover card; optional Discover tools → preferences.

## Build ID

- Stamped in `dist/index.html` as `<!-- spark-demo-build: … -->` via `scripts/prepare-demo-dist.sh`.
- In-app: **Profile → Privacy controls** → footer `App version 1.0.0 · <build-id>`.
- Must match deployed commit when debugging cache issues.

## Deploy + remote smoke

See **[DEMO_DEPLOY.md](./DEMO_DEPLOY.md)** for Vercel import settings. After deploy:

```bash
DEMO_URL=https://your-deployment.vercel.app npm run verify:remote-smoke
```

## Extended-only scripts (not in CI smoke)

Included in `npm run verify:extended`:

- `check-pulse-features.mjs`, `check-pulse-feed-refresh.mjs`
- `verify-compact-mini.mjs`, `verify-female-pulse.mjs`, `verify-leave-spark-news.mjs`
- `verify-disguise-ux.mjs`, `verify-world-picker.mjs`
- `verify:all` subset: mini-window, activity preview, Spark/Ember pulse buttons

Run locally when changing Pulse layout, disguise navigation, or world picker.
