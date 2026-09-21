# Spark — Live Demo

## Demo link (verified working)

**https://divisions-shadow-specialties-touring.trycloudflare.com**

- **Built from branch:** `cursor/world-map-touch-search-7b60` (world map search, finger pan/zoom, Pulse top refresh)
- **Build ID:** `441b1cc-20260921T232412Z` (HTML comment `spark-demo-build:` or Profile → **Privacy controls** → footer)
- **Verified:** 2026-09-21 23:25 UTC — `verify:all`, map world search (Tokyo), pulse refresh PASS
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
5. **Discover tools → Map** — drag/pinch the map; **Places → Tokyo** → search this area
6. **Profile → Privacy controls → Language** to switch 繁體中文

---

## Why previous links failed

| Link | Problem |
|------|---------|
| `loca.lt` tunnels | Time out / unreliable from this environment |
| `monmonmars.github.io/New-APP01/` | Repo is **private** — GitHub Pages needs Pro or a public repo (returns 404) |
| Old Cloudflare URLs | **Dead** — workspace restarted; use the current link above |
| GitHub Pages paths on tunnel root | Were serving a **GitHub Pages build** (`/New-APP01/` paths) → blank white screen |

**Fix applied:** tunnel demos use `npm run build:web:demo` + `serve -c serve.json` (root paths), not `build:web:pages`.

---

## Permanent demo (recommended)

Private repo → use **Vercel** or **Netlify** (free, stable URL, auto-deploy on push).

### Vercel

1. [vercel.com/new](https://vercel.com/new) → Import `MonMonMars/New-APP01`
2. Branch: `cursor/world-map-touch-search-7b60` (or `main`)
3. Build: `npm run build:web` · Output: `dist`
4. Deploy → stable URL like `https://new-app01.vercel.app`

`vercel.json` includes the same cache header split as `serve.json`.

### GitHub Pages (public repo or GitHub Pro only)

Push to a branch listed in `.github/workflows/deploy-web.yml`, enable Pages from `gh-pages` branch.

---

## Local verify

```bash
npm run build:web:demo
npx serve -c serve.json -l 8090 dist
npm run verify:extended
```
