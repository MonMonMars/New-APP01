# Spark — Backend Setup (Supabase)

Spark ships with a **Supabase integration** that syncs auth, profiles, matches, likes, and messages. When Supabase env vars are unset, the app falls back to **AsyncStorage** only (fully offline prototype mode).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Copy your **Project URL** and **anon public key** from Settings → API.

## 2. Run the schema

Open the SQL Editor and paste the contents of [`supabase-schema.sql`](./supabase-schema.sql). Run it once.

Then run [`supabase-security-migration.sql`](./supabase-security-migration.sql) in the same SQL Editor. It adds `security_reports`, `security_audit_events`, and the `user_state.is_spark_plus` client guard trigger.

## 3. Configure environment variables

Create a `.env` file in the project root (or set in EAS secrets):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Restart Expo after adding env vars:

```bash
npm start
```

## 4. Auth providers

| Method | Status | Notes |
|--------|--------|-------|
| **Apple Sign-In** | iOS native + Supabase | Real on **iOS** via `expo-apple-authentication` → `signInWithIdToken`; **web production** hides the Apple button (no fake stub). Preview/dev web may use a local stub when Supabase is off. |
| **Google OAuth** | Supabase | `signInWithGoogleOAuth()` — enable Google in Dashboard; same redirect URLs as magic link |
| **WeChat / QQ** | Supabase (CN) | Custom OAuth providers for mainland account region; enable in Dashboard and register redirect URLs |
| **Magic link email** | Supabase | `signInWithMagicLink()` in `src/services/supabase.ts` |
| **Phone SMS** | Supabase + SMS provider | `sendPhoneLoginOtp` / `verifyPhoneLoginOtp` in `supabaseAuthExtended.ts`; without Supabase, dev demo code `123456` only |

Enable providers in Supabase Dashboard → **Authentication → Providers**.

### Redirect URLs (magic link, sign-up confirm, password reset, OAuth)

Supabase **Authentication → URL configuration**:

1. **Site URL** — your primary web demo origin (e.g. `https://new-app01.vercel.app` or `http://localhost:8090` for local `npm run demo`).
2. **Redirect URLs** — add **every** origin users open the app from (exact path the app uses; trailing slash optional but be consistent).

The app sets `emailRedirectTo` / OAuth `redirectTo` via `getMagicLinkRedirectTo()` in `src/services/supabaseAuthCallback.ts`:

| Platform | Redirect value |
|----------|----------------|
| **Web** | `{origin}{pathname}` of the running page (Vercel, tunnel, or `http://localhost:8090`) |
| **Native** | `spark://auth/callback` (`app.json` scheme `spark`) |

**Register in Supabase (examples — replace with your hosts):**

| Use case | Add to Redirect URLs |
|----------|----------------------|
| Vercel production | `https://YOUR-PROJECT.vercel.app` |
| Vercel preview | `https://YOUR-PROJECT-*.vercel.app` (if your Supabase plan allows wildcards) or each preview URL |
| Local demo (`npm run demo`) | `http://localhost:8090` |
| Expo web dev | `http://localhost:8081` |
| Cloudflare quick tunnel | `https://*.trycloudflare.com` (or the exact tunnel URL each session) |
| iOS / Android | `spark://auth/callback` |

**Password reset** uses the same `redirectTo` as magic link. After the user opens the email link, the app shows **PasswordRecoveryGate** (`type=recovery` / `PASSWORD_RECOVERY`) to set a new password.

**Completion:** `recoverSupabaseAuthFromLaunchUrl()` reads hash tokens or PKCE `code`, then `window.history.replaceState` clears auth params on web.

See also [`DEMO_DEPLOY.md`](./DEMO_DEPLOY.md) when hosting the web demo on Vercel.

### Phone SMS (OTP)

**App code:** `sendPhoneLoginOtp` / `verifyPhoneLoginOtp` in `src/services/supabaseAuthExtended.ts` (E.164 normalization for US, CN, TW).

**Without Supabase:** preview builds only — fixed demo code `123456` (`src/services/demoPhoneAuth.ts`). **Production release builds block phone auth** until Supabase is configured.

**Supabase setup checklist:**

1. Dashboard → **Authentication → Providers → Phone** → enable.
2. Connect an SMS provider (common: **Twilio**, **MessageBird**, Vonage — follow Supabase docs for your region).
3. Configure **SMS template** and sender ID per provider rules (US 10DLC, CN carrier requirements, etc.).
4. Add **rate limits** in Supabase Auth settings (recommended) — the app also limits sends client-side (5 OTPs per number per 15 minutes).
5. Test with a real device on the **same deploy origin** you use for web (phone OTP does not use redirect URLs; session is created on `verifyOtp`).

**CN accounts:** UI defaults to +86 placeholders when account home market is CN (`regionalAuthProviders.ts`). Ensure your SMS provider supports mainland delivery if you ship there.

### OAuth (Google, Apple, WeChat, QQ)

**App code:** `signInWithOAuthProvider` in `src/services/supabaseAuthExtended.ts` (Google, WeChat, QQ). Apple uses native iOS token exchange in `signInWithAppleToken()` (`src/services/supabase.ts`).

**Redirect URLs:** OAuth uses the same `redirectTo` as magic link (`getMagicLinkRedirectTo()`). Every production web host (Vercel, custom domain, tunnel used for QA) must appear in Supabase **Redirect URLs** or the browser returns with `auth` errors.

| Provider | Supabase setup | Spark behavior |
|----------|----------------|----------------|
| **Google** | Enable Google; add OAuth client ID/secret from Google Cloud Console; authorized redirect = Supabase callback URL | Web redirects in-tab; native opens system browser via `Linking` |
| **Apple** | Enable Apple; configure Services ID, key, and team ID for **Sign in with Apple** | **iOS app only** for native flow; web release builds do not show Apple until a real web Apple JS flow is implemented |
| **WeChat** | Enable custom WeChat provider (Supabase docs / partner setup); register app ID and secret | Shown when account region is **CN** (`regionalSocialAuthProviders`) |
| **QQ** | Enable custom QQ provider similarly | CN region only |

**Without Supabase:** Google / WeChat / QQ fall back to local demo IDs in **preview** builds only (`isProductionBuild()` blocks OAuth in release).

**Mainland checklist:**

1. Enable WeChat and QQ in Supabase; confirm redirect URLs include your CN-facing web origin and `spark://auth/callback`.
2. Use SMS provider that delivers +86 OTP (see Phone SMS above).
3. QA: complete OAuth in WeChat/QQ app or embedded browser, return to Spark, tap **I finished sign-in — refresh** if the session poll has not fired yet.

## 5. What syncs

When configured, `AppContext` calls `syncToSupabase()` after state changes:

- `profiles` — name, bio, photos, prompts, social flags
- `user_preferences` — distance, age, show-me, passport city, filters, `preferences_extra` (map search, spark section, locale, advanced filters)
- `user_state` — passed/liked/blocked IDs, Spark+, pause flag
- `matches` + `conversations` — full thread data (including `voiceUrl` on voice messages)
- **Storage** — `profile-photos` and `voice-notes` buckets (see schema)

On boot, if a Supabase session exists, `loadFromSupabase()` hydrates local state.

## 6. Without Supabase

No env vars? Everything works exactly as before — AsyncStorage persistence only. Perfect for demos and stakeholder previews.

## 7. Edge Functions (security)

Templates live under `supabase/functions/`. Deploy with the [Supabase CLI](https://supabase.com/docs/guides/functions) linked to your project.

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy delete-account
supabase functions deploy openai-disguise-proxy
supabase secrets set OPENAI_API_KEY=sk-...
```

| Function | Secrets / env | App wiring |
|----------|----------------|------------|
| **`delete-account`** | `SUPABASE_SERVICE_ROLE_KEY` (auto in hosted functions) | `deleteAccountViaEdgeFunction()` in Privacy / Profile |
| **`openai-disguise-proxy`** | `OPENAI_API_KEY` | `generateDisguiseAdImage()` — JWT required; **no** `EXPO_PUBLIC_OPENAI_API_KEY` in production builds |

**Verify:** Sign in on a Vercel or local web build with Supabase env vars → Pulse → generate disguise ad. Without a session, the app falls back to the local compositor. Account delete should return `{ ok: true }` and sign the user out.

See [`security/SECURITY.md`](./security/SECURITY.md) for the full control list.

## 8. Payments (Stripe web + store IAP)

**Schema:** [`supabase-payments-migration.sql`](./supabase-payments-migration.sql) — `purchase_approvals`, `purchase_ledger`, `profiles.stripe_customer_id`, `grant_spark_plus_entitlement()`.

**Edge Functions:**

```bash
supabase functions deploy purchase-approve
supabase functions deploy create-stripe-checkout
supabase functions deploy create-stripe-portal
supabase functions deploy stripe-webhook --no-verify-jwt
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_spark_plus_monthly=price_...
```

Point Stripe webhook to `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook` for `checkout.session.completed`.

**App env (web card checkout):** `EXPO_PUBLIC_WEB_PAYMENTS_ENABLED=true` plus Supabase URL/anon key. Store mode: `EXPO_PUBLIC_PURCHASES_MODE=store` and `EXPO_PUBLIC_REVENUECAT_API_KEY` — see [`IAP.md`](./IAP.md).

## 9. Production checklist

- [ ] Enable RLS policies (included in schema)
- [ ] Run `supabase-security-migration.sql`
- [ ] Deploy Edge Functions (`delete-account`, `openai-disguise-proxy`)
- [ ] Set up Apple Sign-In service ID + redirect URLs
- [ ] Configure email templates for magic links
- [ ] Add server-side matchmaking (currently client-side demo)
- [x] Wire real-time subscriptions for chat (`src/services/realtimeChat.ts`, `useCloudConversation`)
- [x] Store photos in Supabase Storage (`src/services/cloudStorage.ts` — graceful fallback to local URIs when unconfigured)
- [x] Disguise AI via server proxy when Supabase is configured (`src/services/disguiseImageGeneration.ts`)
- [ ] Run `supabase-payments-migration.sql` + deploy payment Edge Functions when enabling Stripe web checkout
