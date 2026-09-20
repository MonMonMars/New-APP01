# Spark — Live Demo

## Demo link (verified working)

**https://hop-dependence-rack-cosmetic.trycloudflare.com**

- **Build:** Current `cursor/complete-app-details-pass5-7b60` web export (regional auth, payments polish, pass4–5 details)
- **Verified:** 2026-09-20 — HTTP 200 on tunnel + local `:8093` serve
- **Temporary:** Cloudflare quick tunnel — expires when the cloud workspace sleeps. Hard-refresh (Cmd/Ctrl+Shift+R) if stale.

Previous tunnel (`distribution-doom-dropped-belly.trycloudflare.com`) is **offline** after workspace sleep.

### Quick start

1. Open the link in **Chrome or Safari**
2. Tap **Continue without account**
3. Complete onboarding (defaults are fine)
4. Tap the **Pulse logo** → **Leave Spark** to enter dating mode
5. **Profile → Privacy controls → Language** to switch 繁體中文

---

## Why previous links failed

| Link | Problem |
|------|---------|
| `loca.lt` tunnels | Time out / unreliable from this environment |
| `monmonmars.github.io/New-APP01/` | Repo is **private** — GitHub Pages needs Pro or a public repo (returns 404) |
| Old Cloudflare URLs | Were serving a **GitHub Pages build** (`/New-APP01/` paths) at the tunnel root → blank white screen |

**Fix applied:** tunnel demos now use `npm run build:web` (root paths), not `build:web:pages`.

---

## Permanent demo (recommended)

Private repo → use **Vercel** or **Netlify** (free, stable URL, auto-deploy on push).

### Vercel

1. [vercel.com/new](https://vercel.com/new) → Import `MonMonMars/New-APP01`
2. Branch: `cursor/app-i18n-7b60` (or `main`)
3. Build: `npm run build:web` · Output: `dist`
4. Deploy → stable URL like `https://new-app01.vercel.app`

`vercel.json` is already in the repo.

### GitHub Pages (public repo or GitHub Pro only)

**URL:** `https://monmonmars.github.io/New-APP01/`

Uses `npm run build:web:pages` (base path `/New-APP01`). Enable at [repo Pages settings](https://github.com/MonMonMars/New-APP01/settings/pages) → `gh-pages` branch.

---

## Run locally

```bash
git clone https://github.com/MonMonMars/New-APP01.git
cd New-APP01
git checkout cursor/app-i18n-7b60
npm install
npm run demo          # http://localhost:8090
npm run demo:tunnel   # Cloudflare public URL (install cloudflared)
```

Phone (best UX): `npm start` → Expo Go
