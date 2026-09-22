# Cloud Agent handoff (canonical state)

**Read this file first** on every new Cloud Agent run for `MonMonMars/New-APP01`.

Last updated: 2026-09-22 (after **PR #157** merged to `main`; superseded drafts **#147–#154** closed).

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
2. **Feature stack #147–#154** → integrated via **PR #157** (Pulse reload/UX, admin, scam detector, discover layout, AI demo portraits).
3. **Repo is public** — GitHub Actions CI runs without paid Actions block.
4. **CI** — `verify` job passes on `main` (Playwright smoke + `npm run build:web:demo`).
5. **Environment build** — succeeded from `main` with `npm ci`. Dashboard: https://cursor.com/dashboard/cloud-agents/environments/e/a3b86124-af8c-11f1-bf4b-42ffb4d10ea7

## Old agent sessions — do **not** continue

These mobile/cloud threads are stuck (queue full, errors, or pre-`main` empty checkout). **Archive mentally; start fresh.**

| Name | Why abandon |
|------|-------------|
| Agent operational issues | Pre-handoff debugging; use new agent + this doc |
| Real-time VRM conversation | `amoji_engine_02` — errored, Queued 8 |
| Cantonese voice / Sakura Face / Amoji-engine voice | Unable to complete |
| Any agent still on empty `main` before 2026-09-22 | No `package.json` in workspace |
| Draft PRs **#147–#154** | **Closed** — superseded by #157 on `main` |

## Legacy drafts (#1–#139, #147–#154)

**Closed 2026-09-22** — all superseded by `main` (#155, #157). See **`docs/PR_TRIAGE.md`** for the one-by-one method. New features: branch from `main`, do not reopen old `cursor/*-7b60` lines.

GitHub Pages deploy workflow runs on **`main`** pushes only (see `.github/workflows/deploy-web.yml`).

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

Then ask what feature or open draft PR I want next.
```

## Owner

Mon — designer; prefers iterating in code. Expo SDK **57** — see https://docs.expo.dev/versions/v57.0.0/
