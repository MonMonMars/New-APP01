# Cloud Agent handoff (canonical state)

**Read this file first** on every new Cloud Agent run for `MonMonMars/New-APP01`.

Last updated: 2026-09-23 (after **#183** on `main`; integration **#175–#183**; **no open feature PRs**).

## Where all “data and files” live

| What | Location |
|------|----------|
| **All app source code** | GitHub **`main`** — https://github.com/MonMonMars/New-APP01 |
| **Cloud bootstrap** | `.cursor/environment.json` (`npm ci`, demo on port 8090) |
| **Product spec** | `docs/SPARK_APP_DOCUMENT.md` |
| **Live demo URL** | `PUBLIC_PREVIEW.md` (tunnel URLs change; always read that file) |
| **PR triage history** | `docs/PR_TRIAGE.md` |
| **Agent chat history** | **Not portable** — old Cursor agent threads cannot be merged. This doc replaces them. |

There is nothing to copy out of old agent VMs except what is already committed on GitHub.

## What landed on `main` (2026-09-23 arc)

| PR | Summary |
|----|---------|
| **#175** | Integration: Show me, Spark/Ember prefs, payment sheet, discover info, map UX, Pulse sheets, thumb/caption swaps |
| **#176+** | Map basemap → standard OSM (`tile.openstreetmap.org`); rejects osmfr/carto watermark tiles in CI |
| **#177** | Admin menu gated on staff session (`admin@spark.demo`); `validate-admin-menu-gating.mjs` |
| **#178** | YouTube-style Pulse pull-to-refresh (`PulseRefreshIndicator`, top bar, dim layer) |
| **#179** | Pulse mini-window unlike + reporter photos in preview sheet |
| **#180** | Map global search, privacy people list (no avatar pins), realistic demo portraits |

Superseded drafts **#163–#171**, **#166–#169** — closed; see **`docs/PR_TRIAGE.md`**.

## Infrastructure

1. **`main` carries the full Spark/Expo app** (SDK 57).
2. **CI** — `npm run verify:ci` (typecheck, `validate:profiles`, `build:web:demo`). Playwright smoke: `npm run verify:ci-smoke` when demo is on `:8090`.
3. **Environment build** — https://cursor.com/dashboard/cloud-agents/environments/e/a3b86124-af8c-11f1-bf4b-42ffb4d10ea7

## Known CI gotcha

`validate-i18n-keys.ts` fails if UI uses `t('…')` keys missing from **`src/i18n/en.ts`** and **`src/i18n/zh-TW.ts`**. After adding Show me / Pulse world / edit-profile toggles, ensure both locales stay in sync.

## Old agent sessions — do **not** continue

Stuck pre-`main` or superseded integration threads — **start fresh** with this doc + `PUBLIC_PREVIEW.md`.

## Default commands

```bash
npm ci
npm run verify:ci          # typecheck + validators + build demo
npm run demo               # localhost:8090
npm run demo:tunnel        # public Cloudflare URL (update PUBLIC_PREVIEW.md)
npm run verify:ci-smoke    # Playwright (demo must be running)
```

## First message for a **new** Cloud Agent (copy-paste)

```
Read docs/CLOUD_AGENT_HANDOFF.md and PUBLIC_PREVIEW.md first.

Confirm checkout is main with package.json and .cursor/environment.json.
Run npm run verify:ci. Start npm run demo (or demo:tunnel) and give me a working share link.

Then ask what feature or QA issue I want next.
```

## Owner

Mon — designer; prefers iterating in code. Expo SDK **57** — see https://docs.expo.dev/versions/v57.0.0/
