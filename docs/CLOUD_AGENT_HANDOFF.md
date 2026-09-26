# Cloud Agent handoff (canonical state)

**Read this file first** on every new Cloud Agent run for `MonMonMars/New-APP01`.

Last updated: 2026-09-26 (after **#209** auth/payments/trust handoff + Step 1 session UX; full QA in `docs/QA_AND_VERIFICATION.md`).

## Where all “data and files” live

| What | Location |
|------|----------|
| **All app source code** | GitHub **`main`** — https://github.com/MonMonMars/New-APP01 |
| **Cloud bootstrap** | `.cursor/environment.json` (`npm ci`, demo on port 8090) |
| **Product spec** | `docs/SPARK_APP_DOCUMENT.md` |
| **QA / smoke scripts** | `docs/QA_AND_VERIFICATION.md` |
| **Auth / payments roadmap** | `docs/AUTH_AND_PAYMENTS_ROADMAP.md` |
| **Compliance index** | `docs/COMPLIANCE_AND_OPERATIONS_MASTER.md` |
| **Live demo URL** | `PUBLIC_PREVIEW.md` (tunnel often offline — prefer Vercel; see `docs/DEMO_DEPLOY.md`) |
| **PR triage history** | `docs/PR_TRIAGE.md` |
| **Agent chat history** | **Not portable** — old Cursor agent threads cannot be merged. This doc replaces them. |

There is nothing to copy out of old agent VMs except what is already committed on GitHub.

## Recent on `main` (2026-09-25 handoff)

| PR | Summary |
|----|---------|
| **#202–#204** | Auth steps 1–3: sign out / email / phone |
| **#205–#209** | OAuth (4), security proxy (5), Stripe + MFA purchases (6), compliance master doc (8), trust & safety (7) |
| **#210** | Closed — integration branch superseded by #205–#209 |
| **#211–#219** | Discover/Pulse/map polish (photo bar, like label, read sheets, purchase footer, photo swipe, leave pulse, match popup, pulse refresh, map people search) |

## Earlier arc (still relevant)

| PR | Summary |
|----|---------|
| **#191–#200** | Map smoke, Pulse mini-window CI, demo deploy docs, QA reference, Pulse unlike + like-swap smoke |

Superseded drafts — see **`docs/PR_TRIAGE.md`**.

## Infrastructure

1. **`main` carries the full Spark/Expo app** (SDK 57).
2. **CI** — `npm run verify:ci` (typecheck, `validate:profiles`, `build:web:demo`). GitHub Actions then runs **`npm run verify:ci-smoke`** (6 Playwright scripts) against `dist` on `:8090`.
3. **Environment build** — https://cursor.com/dashboard/cloud-agents/environments/e/a3b86124-af8c-11f1-bf4b-42ffb4d10ea7

## Known CI gotcha

`validate-i18n-keys.ts` fails if UI uses `t('…')` keys missing from **`src/i18n/en.ts`** and **`src/i18n/zh-TW.ts`**.

## Default commands

```bash
npm ci
npm run verify:ci              # typecheck + validators + build demo
npm run demo                   # localhost:8090
npm run demo:tunnel            # public Cloudflare URL (update PUBLIC_PREVIEW.md)
npm run verify:ci-smoke        # same 6 scripts as GitHub CI (demo on :8090)
npm run verify:extended        # full Playwright QA (local only)
DEMO_URL=https://… npm run verify:remote-smoke   # after Vercel deploy
```

Manual checklists (map privacy, Pulse like swap, build ID): **`docs/QA_AND_VERIFICATION.md`**.

## Suggested next work

- **Operator QA:** Supabase migrations + Edge Functions + Stripe webhook (see `BACKEND_SETUP.md`, compliance master doc)
- **Roadmap Step 2+:** Live email/password recovery and SMS on a real Supabase project (manual checklists)

## First message for a **new** Cloud Agent (copy-paste)

```
Read docs/CLOUD_AGENT_HANDOFF.md and PUBLIC_PREVIEW.md first.

Confirm checkout is main with package.json and .cursor/environment.json.
Run npm run verify:ci. Start npm run demo (or demo:tunnel) and give me a working share link.

Then ask what feature or QA issue I want next.
```

## Owner

Mon — designer; prefers iterating in code. Expo SDK **57** — see https://docs.expo.dev/versions/v57.0.0/
