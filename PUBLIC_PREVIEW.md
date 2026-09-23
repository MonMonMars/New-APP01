# Spark — Live Demo

## Demo link (verified working)

**https://hair-fallen-oklahoma-hamburg.trycloudflare.com**

- **Demo build:** `main` + **#162** + preview **#163** (map pan/zoom) + **#164** (Pulse IG/YT refresh)
- **Build ID:** `f1d1d8d-20260923T001919Z` (HTML comment `spark-demo-build:` or Profile → **Privacy controls** → footer)
- **Verified:** 2026-09-23 00:19 UTC — tunnel HTTP 200 + `verify-demo-link` PASS
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
5. **Discover tools → Map** — drag/pinch the map; **Places → Tokyo** → **Search this area**
6. **Pulse Home** — pull down at top or tap **Home** twice at top → “Updated just now”
7. **Profile → Privacy controls → Language** for 繁體中文

---

## Why previous links failed

| Link | Problem |
|------|---------|
| `loca.lt` tunnels | Time out / unreliable from this environment |
| `monmonmars.github.io/New-APP01/` | Repo is **private** — GitHub Pages needs Pro or a public repo (returns 404) |
| Old Cloudflare URLs | **Dead** when workspace restarts — run `npm run demo:tunnel` for a fresh URL |
| GitHub Pages paths on tunnel root | Use `build:web:demo` + `serve.json`, not `build:web:pages` |

---

## Permanent demo (recommended)

Private repo → use **Vercel** or **Netlify** (free, stable URL, auto-deploy on push).

### Vercel

1. [vercel.com/new](https://vercel.com/new) → Import `MonMonMars/New-APP01`
2. Branch: **`main`**
3. Build: `npm run build:web:demo` · Output: `dist` (build ID stamp + SPA 404 fallback)
4. Deploy → stable URL like `https://new-app01.vercel.app`

`vercel.json` includes the same cache header split as `serve.json`.

### GitHub Pages (public repo or GitHub Pro only)

Push to **`main`** — workflow deploys `gh-pages` branch (see `.github/workflows/deploy-web.yml`).

---

## Local verify

```bash
npm install
npm run verify:ci
npm run build:web:demo
npx serve -c serve.json -l 8090 dist
npm run verify:extended
```

Full product reference: [`docs/SPARK_APP_DOCUMENT.md`](docs/SPARK_APP_DOCUMENT.md)
