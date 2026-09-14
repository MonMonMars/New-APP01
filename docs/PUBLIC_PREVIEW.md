# Spark — Public Web Preview

Try the app in **any browser** — hosted on cloud, no local server required.

## Live preview (cloud)

### Primary — GitHub Pages (permanent)

**https://monmonmars.github.io/New-APP01/**

Auto-deploys on push via GitHub Actions (`build` always runs; `deploy` needs Pages enabled).

**One-time repo setup (required for deploy):**

1. Open [GitHub Pages settings](https://github.com/MonMonMars/New-APP01/settings/pages)
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. Re-run the latest [Deploy Web workflow](https://github.com/MonMonMars/New-APP01/actions/workflows/deploy-web.yml) or push to `main`

Until Pages is enabled, use the dev tunnel below.

### Dev tunnel (temporary fallback)

**https://sheets-interventions-smtp-owned.trycloudflare.com**

_Last updated: Sep 14, 2026_

> Tunnels expire when this workspace stops. Prefer GitHub Pages for stable demos.

**GitHub Pages (permanent)** — requires one-time setup:

1. [Pages settings](https://github.com/MonMonMars/New-APP01/settings/pages) → Source: **Deploy from a branch** → Branch: `gh-pages` / `/ (root)`  
   *(or Source: **GitHub Actions** if you prefer the Actions deploy job)*
2. Wait ~2 min after the deploy workflow runs on push
3. Open **https://monmonmars.github.io/New-APP01/**

The app is now built with `experiments.baseUrl: /New-APP01` so assets load correctly on GitHub Pages.

### How to test v0.5+ features

1. **Almost full-screen photos** — Discover: card fills ~90%+ of viewport.
2. **59+ profiles + seeded state** — 10 pre-matches, 10 pending likes, 14 incoming likes.
3. **Red star super-like** — drag/tap center star → celebration → Chat now / Talk later.
4. **Cloud auth** — Continue with Apple or **email magic link** (Supabase).
5. **Cloud photos** — uploads go to Supabase Storage when configured.
6. **Realtime chat** — messages sync via Supabase Realtime when configured.

### Cloud setup

See [`CLOUD_SETUP.md`](./CLOUD_SETUP.md) and [`BACKEND_SETUP.md`](./BACKEND_SETUP.md).

```bash
cp .env.example .env
# Add EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
npm run build:web
```

Deploy `dist/` to Netlify/Vercel or push to GitHub for Pages.

---

## Run locally (optional — developers only)

```bash
npm install
npm run web
```

## Phone (best experience)

```bash
npm start
```

Scan with **Expo Go** — drag, haptics, cloud push on native.
