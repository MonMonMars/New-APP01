# Spark web demo — deploy checklist

Use this when the Cloudflare tunnel is offline or you want a **stable URL** for Mon / QA.

## Recommended: Vercel

1. Open [vercel.com/new](https://vercel.com/new) → import **`MonMonMars/New-APP01`**.
2. **Production branch:** `main`.
3. **Build command:** `npm run build:web:demo`
4. **Output directory:** `dist`
5. **Install command:** `npm ci` (default is fine).
6. Deploy. No env vars required for the guest demo.

Repo root **`vercel.json`** already sets SPA rewrites, cache split (`/_expo/static/*` immutable, HTML no-store), and security headers.

### After deploy — smoke the live URL

Replace `https://YOUR-APP.vercel.app` with your deployment URL:

```bash
DEMO_URL=https://YOUR-APP.vercel.app npm run verify:remote-smoke
```

**Build ID:** Profile → Privacy controls → footer `App version … · <build-id>` should match the commit you deployed (`main` HEAD).

### Manual QA (2 minutes)

1. Continue without account → onboarding → Pulse logo → **Leave Spark**.
2. **Discover tools → Map** → Places → **Tokyo** → **Browse matches**.
3. Pulse feed → like/unlike disguised card → photo + caption swap.

## Local (agent / dev)

```bash
npm ci
npm run verify:ci
npm run build:web:demo
npx serve -s -l 8090 -c serve.json dist
npm run verify:ci-smoke   # against http://127.0.0.1:8090
```

## Not for private-repo public demo

- **GitHub Pages** (`deploy-web.yml`) uses `build:web:pages` and needs a **public** repo or GitHub Pro — see `PUBLIC_PREVIEW.md`.
- **Quick Cloudflare tunnel** (`npm run demo:tunnel`) — convenient but dies when the cloud VM sleeps; refresh URL in `PUBLIC_PREVIEW.md` after each session.
