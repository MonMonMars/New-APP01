# Spark web demo — deploy checklist

Use this when the Cloudflare tunnel is offline or you want a **stable URL** for Mon / QA.

## Recommended: Vercel

| Setting | Value |
|---------|--------|
| Repository | `MonMonMars/New-APP01` |
| Production branch | `main` |
| Framework preset | Other (or None) |
| Install command | `npm ci` |
| Build command | `npm run build:web:demo` |
| Output directory | `dist` |
| Root directory | `.` (repo root) |

**Environment variables:**

| Variable | Required for |
|----------|----------------|
| *(none)* | Guest demo — map tiles, local AsyncStorage |
| `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Cloud sign-in, sync, magic link, password reset on **this deploy URL** |

When Supabase is enabled on Vercel, add your deployment URL to Supabase **Redirect URLs** (see [`BACKEND_SETUP.md`](./BACKEND_SETUP.md)). Magic links and password reset emails must point at the same origin users open in the browser.

**Auto deploy:** enable “Production deployments” on push to `main` so every merge gets a fresh build id.

Repo root **`vercel.json`** provides:

- SPA rewrite → `index.html`
- `/_expo/static/*` → long cache, immutable
- All other paths → `no-cache` HTML (matches `serve.json`)
- Security headers (CSP, frame deny, etc.)

### After deploy — automated smoke

```bash
DEMO_URL=https://YOUR-APP.vercel.app npm run verify:remote-smoke
```

This runs the **same six Playwright scripts as GitHub CI** (onboarding, Pulse routing, Pulse like swap, mini-window, privacy footer, Tokyo map + Browse matches).

**Build ID:** Profile → Privacy controls → footer must show the commit you deployed. Compare with `git rev-parse --short HEAD` on `main`.

### Manual QA (detailed)

Full step tables: **[QA_AND_VERIFICATION.md](./QA_AND_VERIFICATION.md)**.

**Minimum (2 minutes):**

1. Continue without account → onboarding → Pulse logo → **Leave Spark**.
2. **Discover tools → Map** → **Places** → type **Tokyo** → select → confirm **pin icons** (no faces on map) and people count → **Browse matches** → open someone → profile sheet.
3. Back to **Pulse** → like then unlike a **disguised** or **social** card → avatar + text beside it should **change**, then revert on unlike.

## Alternative: Netlify

| Setting | Value |
|---------|--------|
| Build command | `npm run build:web:demo` |
| Publish directory | `dist` |

Add a `_redirects` or netlify.toml SPA rule if needed (`/* /index.html 200`). Prefer Vercel — **`vercel.json` is already committed**.

## Local (agent / dev)

```bash
npm ci
npm run verify:ci
npm run build:web:demo
npx serve -s -l 8090 -c serve.json dist
npm run verify:ci-smoke
# optional full pass:
npm run verify:extended
```

**Expo dev server (`npm run web`)** is not the shipping demo — always test **`build:web:demo`** output.

## Not for private-repo public demo

| Method | Issue |
|--------|--------|
| **GitHub Pages** | Workflow uses `build:web:pages` + `/New-APP01` base path; repo is **private** unless Pro/public — see `.github/workflows/deploy-web.yml` |
| **Quick Cloudflare tunnel** | `npm run demo:tunnel` — URL dies when cloud VM sleeps; update `PUBLIC_PREVIEW.md` after each session |
| **loca.lt** | Unreliable from cloud agents |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Old UI after deploy | Hard refresh / incognito; check build id in Privacy footer |
| Map watermark “API key required” | Wrong tile host — must be OSM.org (see `validate-map-basemap.mjs`) |
| Tokyo shows 0 people | Pan map; tap **Search this area**; widen radius chip |
| Browse matches missing | Switch search mode to **People**; ensure count &gt; 0 |
| Pulse like doesn’t swap face | Hard refresh; confirm build includes **#191+** |

## Related docs

- **[QA_AND_VERIFICATION.md](./QA_AND_VERIFICATION.md)** — all scripts + manual checklists
- **[PUBLIC_PREVIEW.md](../PUBLIC_PREVIEW.md)** — canonical demo link notes
- **[CLOUD_AGENT_HANDOFF.md](./CLOUD_AGENT_HANDOFF.md)** — agent bootstrap
