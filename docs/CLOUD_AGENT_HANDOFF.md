# Cloud Agent handoff (canonical state)

**Read this file first** on every new Cloud Agent run for `MonMonMars/New-APP01`.

Last updated: 2026-09-22 (integration branch for PRs #147–#154: `cursor/integrate-prs-147-154-2e8c`).

## Where all “data and files” live

| What | Location |
|------|----------|
| **All app source code** | GitHub **`main`** — https://github.com/MonMonMars/New-APP01 |
| **Cloud bootstrap** | `.cursor/environment.json` (`npm ci`, demo on port 8090) |
| **Product spec** | `docs/SPARK_APP_DOCUMENT.md` |
| **Live demo URL** | `PUBLIC_PREVIEW.md` (tunnel URLs change; always read that file) |
| **Agent chat history** | **Not portable** — old Cursor agent threads cannot be merged. This doc replaces them. |

There is nothing to copy out of old agent VMs except what is already committed on GitHub.

## Infrastructure fixes already done

1. **`main` was empty** → fixed by merging **PR #155** (full Spark/Expo app on `main`).
2. **Repo is public** — GitHub Actions CI runs without paid Actions block.
3. **CI** — `verify` job passes on `main` (Playwright smoke + `npm run build:web:demo`).
4. **Environment build** — succeeded from `main` with `npm ci` (596 packages). Dashboard: https://cursor.com/dashboard/cloud-agents/environments/e/a3b86124-af8c-11f1-bf4b-42ffb4d10ea7

## Old agent sessions — do **not** continue

These mobile/cloud threads are stuck (queue full, errors, or pre-`main` empty checkout). **Archive mentally; start fresh.**

| Name | Why abandon |
|------|-------------|
| Agent operational issues | Pre-handoff debugging; use new agent + this doc |
| Real-time VRM conversation | `amoji_engine_02` — errored, Queued 8 |
| Cantonese voice / Sakura Face / Amoji-engine voice | Unable to complete |
| Any agent still on empty `main` before 2026-09-22 | No `package.json` in workspace |

## Draft PRs #147–#154 (integrated 2026-09-22)

These eight drafts were stacked on a pre-`main` history (merge-base = initial commit only). They are **combined in one PR** from branch **`cursor/integrate-prs-147-154-2e8c`** (tip content from `cursor/fix-info-boost-buttons-7b60`, which already includes #153 scam detector + #154 layout). After merge to `main`, close #147–#154 as superseded.

| PR | Topic |
|----|--------|
| #147 | Pulse reload, taps, ads, badges |
| #148 | Grey reload overlay |
| #149 | Show me filter + demo profile copy |
| #150 | Unique news/sponsor cards |
| #151 | Bundled AI demo portraits |
| #152 | Admin panel / staff accounts |
| #153 | Scam detector + customer protection |
| #154 | Discover layout + scam UI polish |

`main` is the integration branch for **new** agents unless the user names a specific PR branch.

## Default commands

```bash
npm ci
npm run verify:ci          # typecheck + build demo
npm run demo               # localhost:8090
npm run demo:tunnel        # public Cloudflare URL (update PUBLIC_PREVIEW.md)
```

## First message for a **new** Cloud Agent (copy-paste)

```
Read docs/CLOUD_AGENT_HANDOFF.md and PUBLIC_PREVIEW.md first.

Confirm checkout is main with package.json and .cursor/environment.json.
Run npm run verify:ci. Start npm run demo (or demo:tunnel) and give me a working share link.

Then ask me which open draft PR (#147–#154) to merge or implement next.
```

## Owner

Mon — designer; prefers iterating in code. Expo SDK **57** — see https://docs.expo.dev/versions/v57.0.0/
