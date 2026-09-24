# Open draft PR triage vs `main`

**Status (2026-09-24, latest):** **#195** mini-window in CI smoke · **#194** extended smoke fix · **#193–#192** map/Pulse. **No open feature PRs.**

**Status (2026-09-22):** Drafts **#1–#139** (plus **#147–#154** earlier) reviewed against current **`main`**. All were **closed as superseded** — features already live via **#155**, **#157**, and follow-ups. **No blind merges** were performed (branches share only the initial commit with `main`).

## Method (one-by-one)

1. Read PR title / theme.
2. Confirm equivalent code on `main` (grep + spot-check key modules).
3. Close draft on GitHub if superseded.
4. If something is **missing** on `main`, port only the needed files/commits (future work).

## Sample mapping (representative)

| Range | Theme | On `main`? |
|-------|--------|------------|
| #1–#12 | Early Spark prototype, discover, v0.2–v0.3 | Yes |
| #13–#14 | Web white screen, super-like UX | Yes |
| #15–#18 | Cloud, competitor UX, disguise shell | Yes |
| #21–#29 | Security, disguise UI, quiet SFX, press FX | Yes |
| #33–#39 | Phases A–D, personas, complete details | Yes |
| #41–#52 | Demo hosting, motion, chat layout, map expand | Yes |
| #53–#76 | Pulse/Harbor/Ember branding, mini-window, i18n | Yes |
| #77–#95 | Mini-window polish, demo profiles, sheets | Yes |
| #102–#114 | Passes 4–16 (chat, map, cloud, IAP scaffold) | Yes |
| #115–#133 | Pulse routing, map, unified disguise | Yes |
| #136–#139 | Live news, action bar, cache-bust demo | Yes |
| #147–#154 | Pulse reload, admin, scam, layout stack | Yes (**#157**) |

## New work

Open **new** PRs from **`main`** only. Do not reopen old `cursor/*-7b60` integration branches unless porting a specific commit with a documented gap.
