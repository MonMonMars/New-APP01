# Spark — Backend Setup (Supabase)

Spark ships with a **Supabase integration** that syncs auth, profiles, matches, likes, and messages. When Supabase env vars are unset, the app falls back to **AsyncStorage** only (fully offline prototype mode).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Copy your **Project URL** and **anon public key** from Settings → API.

## 2. Run the schema

Open the SQL Editor and paste the contents of [`supabase-schema.sql`](./supabase-schema.sql). Run it once.

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
| **Apple Sign-In** | Supabase | iOS via `expo-apple-authentication` → `signInWithIdToken` |
| **Google** | Supabase OAuth | `signInWithGoogleOAuth()` — enable Google provider + redirect URLs |
| **WeChat** | Supabase custom OAuth | Mainland China welcome screen — `signInWithWeChatOAuth()` |
| **QQ (Tencent)** | Supabase custom OAuth | Mainland China welcome screen — `signInWithQqOAuth()` |
| **Magic link email** | Supabase | `signInWithMagicLink()` |
| **Email + password** | Supabase | Sign up / sign in tabs on onboarding welcome |
| **Phone SMS OTP** | Supabase | Enable Phone provider + SMS (Twilio/MessageBird) |
| **TOTP 2FA** | Supabase MFA | Profile → Two-factor authentication; login AAL2 gate + purchase verify |

Run [`supabase-auth-trigger.sql`](./supabase-auth-trigger.sql) after the main schema to auto-create `profiles` / prefs / state rows for new auth users.

Deploy Edge Function `delete-account` and set secrets (`SUPABASE_SERVICE_ROLE_KEY`). The app calls it on account deletion.

Enable providers in Supabase Dashboard → Authentication → Providers (Apple, Google, Email, Phone). Enable **MFA** under Authentication settings.

### Regional sign-in (account home market)

Spark picks auth buttons and tab order from **account region** (`accountCountryCode`, onboarding passport city, locale, timezone) — not live GPS. See `src/utils/accountRegion.ts` and `src/config/regionalAuthProviders.ts`.

| Region | Social buttons | Default tab |
|--------|----------------|-------------|
| **CN** (mainland) | WeChat, QQ, Apple (iOS only) — no Google | Phone → Password → Email |
| **TW / APAC** | Apple + Google (web/iOS) | Phone-first |
| **US / Americas** | Apple + Google | Email-first |
| **EU / UK** | Apple + Google | Email-first |

**Mainland China phone OTP:** users can enter an 11-digit mobile; the app normalizes to E.164 `+86…`. Configure Supabase **Phone** auth with an SMS provider that delivers in China (commonly **Tencent Cloud SMS**).

**WeChat Open Platform + QQ Connect (custom OAuth in Supabase):**

1. Register apps at [WeChat Open Platform](https://open.weixin.qq.com/) (Website / Mobile) and [QQ Connect](https://connect.qq.com/).
2. Set authorized redirect URIs to match Supabase OAuth callback URLs (same host as magic links + Supabase project callback).
3. In Supabase Dashboard → Authentication → Providers, add **custom OAuth** providers (names must match app code: `wechat`, `qq`) with authorize/token/userinfo endpoints from Tencent docs.
4. Test on web and native: `signInWithOAuth` opens the system browser; session completes via `supabaseAuthCallback.ts`.

Without Dashboard setup, WeChat/QQ buttons show provider errors in production; **demo mode** (no Supabase env) stubs WeChat/QQ sign-in locally.

**Payments:** mainland accounts use **CNY** display and **no Stripe web checkout**; WeChat Pay / Alipay rails are not wired yet — use native IAP or demo purchase flows until a CN payment integration is added.

### Magic link redirect URLs

Add these under **Authentication → URL configuration → Redirect URLs** (adjust host for your deploy):

| Platform | Redirect URL |
|----------|----------------|
| Web demo | `https://monmonmars.github.io/New-APP01/` |
| Local web | `http://localhost:8081/` |
| Native | `spark://auth/callback` |

The app sets `emailRedirectTo` to the web origin or `spark://auth/callback` and completes the session via `src/services/supabaseAuthCallback.ts` (hash tokens, PKCE `code`, and deep links).

### Password reset emails

Use the same **Redirect URLs** as magic links. The app calls `resetPasswordForEmail` with that redirect; when the user opens the link, Supabase includes `type=recovery` in the URL hash and the app shows **Choose a new password** (`PasswordRecoveryGate`) before continuing.

In Supabase Dashboard → Authentication → Email templates, customize the **Reset password** message if needed. Ensure **Email** provider is enabled.

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

## 7. Production checklist

- [ ] Enable RLS policies (included in schema)
- [ ] Set up Apple Sign-In service ID + redirect URLs
- [ ] Configure email templates for magic links and password reset
- [ ] Add server-side matchmaking (currently client-side demo)
- [ ] Wire real-time subscriptions for chat (`supabase.channel`)
- [ ] Store photos in Supabase Storage (currently URLs / local URIs)
