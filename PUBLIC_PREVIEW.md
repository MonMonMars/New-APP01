# Spark — Live Demo

## Demo links (open now)

| Link | Durability | Notes |
|------|------------|-------|
| **https://cold-keys-pick.loca.lt** | Hours (tunnel) | **Latest** — Full app i18n (EN + 繁體中文). Hard-refresh if stale. |
| **https://monmonmars.github.io/New-APP01/** | Permanent (GitHub Pages) | Deployed 2026-09-17 — i18n build on `gh-pages`. Enable Pages in repo settings if 404. |
| **https://temporary-rushing-savanna-mj6rm81.vercel.app** | ~60 min (claimable → permanent) | Previous Ember discretion build. [Claim on Vercel](https://vercel.com/claim-deployment?code=c0977a36-bcfb-453d-ba2d-ea74ad24de73) to keep forever. |

**Best long-term fix:** connect Vercel or Netlify to GitHub once (see below) — auto-deploys on every push, stable URL, works with a private repo.

---

## Permanent demo (recommended — does not expire)

Pick **one** of these. Tunnels die when the cloud workspace sleeps; these stay up.

### Option A — Vercel (best for private repos)

1. Go to [vercel.com/new](https://vercel.com/new) → **Import** `MonMonMars/New-APP01`
2. Branch: `cursor/debug-tab-bleed-7b60` (or `main`)
3. Framework: **Other** · Build: `npm run build:web` · Output: `dist`
4. Deploy → you get a stable URL like `https://new-app01.vercel.app`

`vercel.json` is already in the repo. Free tier, works with private GitHub repos.

### Option B — Netlify

1. [app.netlify.com/start](https://app.netlify.com/start) → Import from GitHub
2. Build: `npm run build:web` · Publish: `dist`
3. `netlify.toml` is already configured (SPA redirects included)

### Option C — GitHub Pages

**URL:** `https://monmonmars.github.io/New-APP01/`

The `gh-pages` branch is auto-deployed on push (see `.github/workflows/deploy-web.yml`).

**One-time enable** (repo owner):

1. [github.com/MonMonMars/New-APP01/settings/pages](https://github.com/MonMonMars/New-APP01/settings/pages)
2. Source → **Deploy from a branch** → `gh-pages` → `/ (root)` → Save

> **Note:** GitHub Pages on **private** repos requires GitHub Pro/Team, or make the repo **public** (free Pages). Use Vercel/Netlify if you want to keep the repo private.

Manual deploy from your machine:

```bash
npm run deploy:pages
```

---

## Temporary tunnel (dev / agent previews only)

Cloudflare quick tunnels expire when the workspace stops. Do not rely on these for stakeholders.

Latest verified tunnel: **https://combines-rely-occupational-witness.trycloudflare.com** (temporary only)

---

## Quick start (any host)

1. Open the demo URL in **Chrome or Safari**
2. Tap **Continue without account**
3. Complete onboarding (defaults are fine)
4. You land in **Pulse** disguise mode
5. **Tap the Pulse logo** in the header, then **Leave Spark**
6. Switch the Discover title to **Ember**, then disguise again — that cover is **Harbor** (markets), not Pulse

---

## What to try

### Pulse / Harbor disguise
- Spark → **Pulse** news cover. Ember → **Harbor** markets cover. One logo in the header.
- News cards + in-app article reader
- Trending / markets · social feed · activity alerts
- Profile → disguise ad generator

### Spark safe mode
- Tap the **Spark ▾** title to switch worlds. Ember is a married group **anyone can join**.
- Ember: **Married / Divorced**, Open / Careful / Hidden discretion, private extra photos until a match, city hidden when Hidden.
- Swipe deck · likes · instant matches · AI demo replies
- Rewind (Spark+) · GIF picker · message reactions · who viewed you
- Passport/travel filter · international profiles · date check-in
- Emergency logo → Pulse (Spark) or Harbor (Ember) disguise

---

## Run locally

```bash
git clone https://github.com/MonMonMars/New-APP01.git
cd New-APP01
git checkout cursor/debug-tab-bleed-7b60
npm install
npm run demo          # http://localhost:8090
npm run demo:tunnel   # temporary public URL
npm run deploy:pages  # push build to gh-pages branch
```

Phone (best UX): `npm start` → Expo Go
