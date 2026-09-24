# Cloud Agent handoff (canonical state)

**Read this file first** on every new Cloud Agent run for `MonMonMars/New-APP01`.

Last updated: 2026-09-24 (after **#198**; full QA reference in `docs/QA_AND_VERIFICATION.md`).

## Where all “data and files” live

| What | Location |
|------|----------|
| **All app source code** | GitHub **`main`** — https://github.com/MonMonMars/New-APP01 |
| **Cloud bootstrap** | `.cursor/environment.json` (`npm ci`, demo on port 8090) |
| **Product spec** | `docs/SPARK_APP_DOCUMENT.md` |
| **QA / smoke scripts** | `docs/QA_AND_VERIFICATION.md` |
| **Live demo URL** | `PUBLIC_PREVIEW.md` (tunnel often offline — prefer Vercel; see `docs/DEMO_DEPLOY.md`) |
| **PR triage history** | `docs/PR_TRIAGE.md` |
| **Agent chat history** | **Not portable** — old Cursor agent threads cannot be merged. This doc replaces them. |

There is nothing to copy out of old agent VMs except what is already committed on GitHub.

## What landed on `main` (2026-09-23 arc)

| PR | Summary |
|----|---------|
| **#175–#180** | Integration: Show me, map OSM basemap, admin gate, Pulse refresh, map privacy list (no avatar pins on map) |
| **#181–#188** | i18n CI, demo accounts refresh, Pulse captions beside thumbnails |

## Recent on `main`

| PR | Summary |
|----|---------|
| **#191** | **#189** Pulse like reload + **#190** map pin privacy + `MapAreaMatches` browse grid |
| **#192** | Map area people count aligned with search pool; Tokyo map smoke + Browse grid |
| **#193** | CI + `verify:ci-smoke` include Tokyo map Browse flow |
| **#194** | Pulse mini-window Playwright scroll + View profile / View photos labels |
| **#195** | `check-mini-window` in GitHub CI + `verify:ci-smoke` |
| **#196** | `docs/DEMO_DEPLOY.md` + `npm run verify:remote-smoke` |
| **#197** | README + handoff refresh + build ID in `PUBLIC_PREVIEW.md` |
| **#198** | `docs/APP_FLOW.md` + README map copy (OSM, pin icons, Browse matches) |

Superseded drafts — see **`docs/PR_TRIAGE.md`**.

## Infrastructure

1. **`main` carries the full Spark/Expo app** (SDK 57).
2. **CI** — `npm run verify:ci` (typecheck, `validate:profiles`, `build:web:demo`). GitHub Actions then runs **`npm run verify:ci-smoke`** (5 Playwright scripts) against `dist` on `:8090`.
3. **Environment build** — https://cursor.com/dashboard/cloud-agents/environments/e/a3b86124-af8c-11f1-bf4b-42ffb4d10ea7

## Known CI gotcha

`validate-i18n-keys.ts` fails if UI uses `t('…')` keys missing from **`src/i18n/en.ts`** and **`src/i18n/zh-TW.ts`**.

## Default commands

```bash
npm ci
npm run verify:ci              # typecheck + validators + build demo
npm run demo                   # localhost:8090
npm run demo:tunnel            # public Cloudflare URL (update PUBLIC_PREVIEW.md)
npm run verify:ci-smoke        # same 5 scripts as GitHub CI (demo on :8090)
npm run verify:extended        # full Playwright QA (local only)
DEMO_URL=https://… npm run verify:remote-smoke   # after Vercel deploy
```

Manual checklists (map privacy, Pulse like swap, build ID): **`docs/QA_AND_VERIFICATION.md`**.

## First message for a **new** Cloud Agent (copy-paste)

```
Read docs/CLOUD_AGENT_HANDOFF.md and PUBLIC_PREVIEW.md first.

Confirm checkout is main with package.json and .cursor/environment.json.
Run npm run verify:ci. Start npm run demo (or demo:tunnel) and give me a working share link.

Then ask what feature or QA issue I want next.
```

## Owner

Mon — designer; prefers iterating in code. Expo SDK **57** — see https://docs.expo.dev/versions/v57.0.0/
