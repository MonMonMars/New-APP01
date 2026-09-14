# Spark — Cloud Setup (no local servers)

Spark is designed to run on **cloud services** — no localhost required for production demos.

## Architecture

| Layer | Cloud service | Purpose |
|-------|---------------|---------|
| **Web app** | GitHub Pages / Netlify / Vercel | Static Expo web export |
| **Database & auth** | [Supabase](https://supabase.com) | Profiles, matches, messages, magic link |
| **File storage** | Supabase Storage | Profile photos (HTTPS URLs) |
| **Realtime chat** | Supabase Realtime | Live message sync |
| **Push notifications** | Expo Push Service | Match & message alerts (native) |
| **Profile images (demo)** | Unsplash CDN | Mock discover photos |
| **Mobile builds** | EAS Build (Expo cloud) | iOS TestFlight / Android APK |

## 1. Deploy web app (cloud hosting)

### GitHub Pages (recommended)

Push to `main` — the workflow `.github/workflows/deploy-web.yml` builds and deploys automatically.

**Live URL:** `https://monmonmars.github.io/New-APP01/`

### Netlify

1. Connect repo at [netlify.com](https://netlify.com)
2. Build command: `npm run build:web`
3. Publish directory: `dist`
4. Add env vars from `.env.example`

### Vercel

1. Import repo at [vercel.com](https://vercel.com)
2. Uses `vercel.json` automatically

### Manual build

```bash
npm install
npm run build:web
# Upload ./dist to any static host (S3, Cloudflare Pages, etc.)
```

## 2. Supabase backend

See [`BACKEND_SETUP.md`](./BACKEND_SETUP.md).

1. Create project at supabase.com
2. Run `docs/supabase-schema.sql` in SQL Editor
3. Enable Apple + Email auth providers
4. Create Storage bucket `profile-photos` (included in schema)
5. Set env vars:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 3. What works in cloud mode

| Feature | Without Supabase | With Supabase |
|---------|------------------|---------------|
| Web demo | ✅ GitHub Pages | ✅ + cloud sync |
| Magic link email | Demo stub | ✅ Real OTP email |
| Photo upload | Local URI | ✅ Supabase Storage URL |
| Chat sync | Local only | ✅ Realtime subscriptions |
| Push tokens | Local notification | ✅ Expo Push + DB |
| Cross-device | ❌ | ✅ |

## 4. Expo Push (native)

1. Create project at [expo.dev](https://expo.dev)
2. Add EAS project ID to `app.json` under `extra.eas.projectId`
3. Enable notifications in Profile → user token saved to `push_tokens` table

## 5. No local server needed

- **Stakeholder demos:** Use GitHub Pages URL (always on)
- **Development:** Optional `npm run web` — not required for users
- **Tunnels (cloudflared):** Deprecated for production; use static deploy instead

## 6. Environment checklist

```bash
cp .env.example .env
# Fill Supabase keys
npm run build:web
```

Deploy `dist/` or push to GitHub for automatic Pages deploy.
