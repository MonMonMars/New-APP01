# Spark — Live Demo

## Demo link (verified working)

**https://cage-rid-properties-bailey.trycloudflare.com**

- **Built from branch:** `cursor/complete-app-7b60` (full stack: auth, map, Pulse, admin, live news)
- **Build ID:** `6af9699-20260920T174425Z` (HTML comment `spark-demo-build:` or Profile → **Privacy controls** → footer)
- **Verified:** 2026-09-20 23:56 UTC — `verify-demo-link` PASS 9/9 on public tunnel
- **Temporary:** Cloudflare quick tunnel — expires when the cloud workspace sleeps.

### If you still see an old demo (browser cache)

1. **Check build ID** — Profile → **Privacy controls** → scroll to footer: `App version 1.0.0 · <build-id>`. It must match the **Build ID** line above.
2. **Hard refresh** — Chrome/Edge: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac). Safari: hold **Reload** → **Empty Caches and Reload**.
3. **Incognito / private window** — fastest way to bypass a stale tab.
4. **View page source** on the demo URL — first lines in `<head>` should include `<!-- spark-demo-build: … -->` and `Cache-Control` meta tags.

Server-side (already applied on each `npm run build:web:demo`):

- `dist/index.html` — `Cache-Control` / `Pragma` / `Expires` meta tags + build timestamp comment
- `serve.json` — `no-store` for HTML; `immutable` long cache for hashed `_expo/static/**` only

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
| Old Cloudflare URLs (e.g. `formerly-para-school-logs`, `proportion-julie-reflected-had`) | **Dead** — workspace restarted; use the current link above |
| GitHub Pages paths on tunnel root | Were serving a **GitHub Pages build** (`/New-APP01/` paths) → blank white screen |

**Fix applied:** tunnel demos use `npm run build:web:demo` + `serve -c serve.json` (root paths), not `build:web:pages`.

---

## Permanent demo (recommended)

Private repo → use **Vercel** or **Netlify** (free, stable URL, auto-deploy on push).

### Vercel

1. [vercel.com/new](https://vercel.com/new) → Import `MonMonMars/New-APP01`
2. Branch: `cursor/app-i18n-7b60` (or `main`)
3. Build: `npm run build:web` · Output: `dist`
4. Deploy → stable URL like `https://new-app01.vercel.app`

`vercel.json` includes the same cache header split as `serve.json`.

### GitHub Pages (public repo or GitHub Pro only)

**URL:** `https://monmonmars.github.io/New-APP01/`

Uses `npm run build:web:pages` (base path `/New-APP01`). Enable at [repo Pages settings](https://github.com/MonMonMars/New-APP01/settings/pages) → `gh-pages` branch.

---

## Run locally

```bash
git clone https://github.com/MonMonMars/New-APP01.git
cd New-APP01
git checkout cursor/demo-cache-bust-7b60
npm install
npm run demo          # http://localhost:8090 (build:web:demo + serve.json)
npm run demo:tunnel   # Cloudflare public URL (install cloudflared)
```

Phone (best UX): `npm start` → Expo Go
