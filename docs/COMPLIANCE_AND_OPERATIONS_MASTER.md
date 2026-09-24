# Spark / Pulse — compliance & operations master checklist

**Audience:** Mon (design/product), engineers, operators, and counsel reviewing launch readiness.  
**Last updated:** 24 September 2026  
**Not legal advice** — policies below are product copies; engage qualified lawyers before public launch in each market.

This page is the **single index** for login, security, payments, disclaimers, and legal documents. Detailed specs stay in linked files; checkboxes here track **protocol** (what the app does) and **operator** work (what you must configure in Supabase, Stripe, stores, and Vercel).

---

## 1. Legal documents & disclaimers

### 1.1 Canonical files (English + 繁體中文)

Full markdown copies: [`docs/legal/`](./legal/README.md). In-app summaries: `src/content/legal/` (same content, localized).

| ID | Document | English | 繁體中文 | Typical entry in app |
|----|----------|---------|----------|----------------------|
| `terms` | Terms of Service | [TERMS_OF_SERVICE.md](./legal/TERMS_OF_SERVICE.md) | [TERMS_OF_SERVICE.zh-TW.md](./legal/TERMS_OF_SERVICE.zh-TW.md) | Safety → Terms |
| `privacy` | Privacy Policy | [PRIVACY_POLICY.md](./legal/PRIVACY_POLICY.md) | [PRIVACY_POLICY.zh-TW.md](./legal/PRIVACY_POLICY.zh-TW.md) | Safety → Privacy |
| `community` | Community Guidelines | [COMMUNITY_GUIDELINES.md](./legal/COMMUNITY_GUIDELINES.md) | [COMMUNITY_GUIDELINES.zh-TW.md](./legal/COMMUNITY_GUIDELINES.zh-TW.md) | Safety → Community |
| `disguise` | Disguise Mode Policy | [DISGUISE_MODE_POLICY.md](./legal/DISGUISE_MODE_POLICY.md) | [DISGUISE_MODE_POLICY.zh-TW.md](./legal/DISGUISE_MODE_POLICY.zh-TW.md) | Safety → Disguise |
| `verification` | Trust & Verification | [TRUST_AND_VERIFICATION_POLICY.md](./legal/TRUST_AND_VERIFICATION_POLICY.md) | [TRUST_AND_VERIFICATION_POLICY.zh-TW.md](./legal/TRUST_AND_VERIFICATION_POLICY.zh-TW.md) | Safety → Verification |
| `cookies` | Cookie Policy | [COOKIE_POLICY.md](./legal/COOKIE_POLICY.md) | [COOKIE_POLICY.zh-TW.md](./legal/COOKIE_POLICY.zh-TW.md) | Privacy → Cookies |
| `subscription` | Subscription Terms | [SUBSCRIPTION_TERMS.md](./legal/SUBSCRIPTION_TERMS.md) | [SUBSCRIPTION_TERMS.zh-TW.md](./legal/SUBSCRIPTION_TERMS.zh-TW.md) | Spark+ / Shop confirm |
| `safety` | Safety Disclaimer | [SAFETY_DISCLAIMER.md](./legal/SAFETY_DISCLAIMER.md) | [SAFETY_DISCLAIMER.zh-TW.md](./legal/SAFETY_DISCLAIMER.zh-TW.md) | Safety → Safety |

**Entity (as stated in legal pack):** Spark Labs Ltd. · 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom.

### 1.2 User agreement protocol (when users must accept or see policy)

| Moment | What the user sees | Documents involved |
|--------|-------------------|-------------------|
| **Onboarding welcome** | Must accept bundle to continue | Terms, Privacy, Community Guidelines, Disguise Mode Policy, Safety Disclaimer |
| **First Pulse / disguise** | Disguise policy modal (summary) | Disguise Mode Policy |
| **Photo / identity verification** | Checkbox before capture | Trust & Verification Policy |
| **Web visit** | Cookie banner | Cookie Policy + Privacy Policy (Essential only / Accept) |
| **Spark+ or Shop purchase** | Confirm sheet footer + link | Subscription Terms (+ auto-renew / billing copy from legal UI strings) |
| **Safety Center / Privacy** | Full list of policies | All of the above |

**Language:** Settings → Privacy controls → App language, or **EN | 繁中** on legal screens.

### 1.3 Contact & disclosure (replace before production)

| Purpose | Email (placeholder in repo) |
|---------|----------------------------|
| Legal | legal@spark.app |
| Privacy / DPO | privacy@spark.app |
| Support / Safety | support@spark.app |
| Security vulnerabilities | security@spark.app |

### 1.4 Legal / counsel checklist (pre-launch)

- [ ] Counsel review of all eight policies for HK, TW, UK/EU, US (as applicable)
- [ ] Register data controller / DPO where required
- [ ] Replace placeholder emails and entity details if different from Spark Labs Ltd.
- [ ] App Store / Play **privacy nutrition labels** and **subscription disclosure** aligned with Privacy + Subscription Terms
- [ ] Stripe Checkout and Customer Portal terms linked to Subscription Terms
- [ ] Age gate (18+) consistent with Terms and onboarding copy
- [ ] Record retention and deletion aligned with Privacy Policy + `delete-account` Edge Function

---

## 2. Login & identity protocol

**Deep dive:** [`BACKEND_SETUP.md`](./BACKEND_SETUP.md) · **Roadmap:** [`AUTH_AND_PAYMENTS_ROADMAP.md`](./AUTH_AND_PAYMENTS_ROADMAP.md) Steps 1–4.

### 2.1 Sign-in methods (by configuration)

| Method | Requires Supabase | Production behavior | Primary code |
|--------|-------------------|---------------------|--------------|
| **Guest / local demo** | No | Allowed in preview; not for real user data | `AuthWelcomePanel`, `AppContext` |
| **Magic link email** | Yes | Redirect must match registered URL | `signInWithMagicLink`, `supabaseAuthCallback.ts` |
| **Email + password** | Yes | Sign-up / sign-in / forgot password | `AuthWelcomePanel`, `PasswordRecoveryGate` |
| **Phone SMS OTP** | Yes + SMS provider | Demo code `123456` **hidden** in production builds | `supabaseAuthExtended.ts`, `demoPhoneAuth.ts` |
| **Google OAuth** | Yes | Browser return + session poll | `signInWithGoogleOAuth` |
| **Apple** | Yes (token) | **Native iOS**; web release should not fake Apple sign-in (see open PR #205) | `appleAuth.ts`, `signInWithAppleToken` |
| **WeChat / QQ** | Yes (CN) | Shown for mainland account region | `regionalAuthProviders.ts` |

### 2.2 Redirect URL protocol (email, OAuth, recovery)

1. Set Supabase **Site URL** to primary web origin (e.g. Vercel production URL).
2. Add **every** redirect origin: Vercel prod/previews, `http://localhost:8090` (demo), `spark://auth/callback` (native).
3. App sets `redirectTo` via `getMagicLinkRedirectTo()` — web uses `{origin}{pathname}`; native uses `spark://auth/callback`.
4. On return, `recoverSupabaseAuthFromLaunchUrl()` exchanges `code` or hash tokens and clears URL params on web.

### 2.3 Session & account protocol

| Action | Where in app | Behavior |
|--------|--------------|----------|
| **Sign out** | Privacy controls, Security settings | Clears session; `AccountSessionSection` |
| **Use another account** | Same | Restarts cloud sign-in flow |
| **Delete account** | Profile, Privacy | Calls `delete-account` Edge Function when Supabase configured; else local wipe |
| **MFA login gate** | After sign-in if AAL2 required | `MfaLoginGate` |
| **MFA enroll** | Security → Two-factor | TOTP via Supabase MFA |
| **Re-auth prompt** | When session lost | Copy references purchases + restore |

### 2.4 Client rate limits (auth abuse)

| Flow | Limit |
|------|--------|
| Magic link | 5 sends / 15 min per email |
| Phone OTP | 5 sends / 15 min per number |
| Phone / email resend UI | 60 s cooldown between resends |

### 2.5 Login operator checklist

- [ ] Supabase project + `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` on Vercel/EAS
- [ ] Run [`supabase-schema.sql`](./supabase-schema.sql)
- [ ] Redirect URLs registered for all deploy hosts ([`DEMO_DEPLOY.md`](./DEMO_DEPLOY.md))
- [ ] Email provider / magic link templates tested on production URL
- [ ] Phone provider enabled + live SMS test (manual)
- [ ] Google / Apple / WeChat / QQ providers enabled per market
- [ ] Password recovery E2E on live Vercel + Supabase (manual)
- [x] Sign-out on main Profile tab (`AccountSessionSection` on Spark Profile)

---

## 3. Security protocol

**Deep dive:** [`security/SECURITY.md`](./security/SECURITY.md).

### 3.1 Threat → control map (summary)

| Risk | Control |
|------|---------|
| Shoulder surfing | Pulse disguise, app lock, auto-disguise on background |
| Device theft | SecureStore session; encrypted local vault for chats |
| Lock screen leaks | Disguise-safe notification copy |
| API key theft | No OpenAI key in production builds; disguise AI via Edge proxy |
| Chat injection | `securityGuards` sanitization + length limits |
| Abuse / reports | `security_reports` + client rate limits |
| PIN brute force | 5 failures → 5 min lockout; audit events |
| Screenshots | Blocked on Spark screens (native); privacy shield in app switcher |
| Subscription fraud | DB trigger blocks client self-granting `is_spark_plus` |
| Web demo | Treat as demo-only for sensitive data; CSP headers in `vercel.json` |

### 3.2 User-facing security features (protocol)

| Feature | Settings path | Notes |
|---------|---------------|--------|
| App lock (biometric / PIN) | Safety → Security settings | Required to leave Pulse when enabled |
| Auto-disguise on background | Security / disguise prefs | Switches to Pulse cover |
| Session timeout | Security settings | Re-lock after background |
| 2FA (TOTP) | Security → Two-factor | Required for **web purchases** when enrolled |
| Report profile / post | Discover, Pulse, chat | `submitSecurityReport()` → Supabase when configured |
| Scam heuristics | Client-side + cloud | Quarantine + reports; admin moderation queue when Supabase + moderator JWT |

### 3.3 Server security migrations & Edge Functions

Run in order in Supabase SQL Editor:

1. [`supabase-schema.sql`](./supabase-schema.sql)
2. [`supabase-security-migration.sql`](./supabase-security-migration.sql) — `security_reports`, `security_audit_events`, Spark+ grant trigger
3. [`supabase-payments-migration.sql`](./supabase-payments-migration.sql) — when enabling billing
4. [`supabase-trust-safety-migration.sql`](./supabase-trust-safety-migration.sql) — moderation RLS + `scam_quarantine`

| Edge Function | Purpose | Deploy |
|---------------|---------|--------|
| `delete-account` | GDPR-style delete user + rows | `supabase functions deploy delete-account` |
| `openai-disguise-proxy` | DALL·E with JWT + rate limit | + secret `OPENAI_API_KEY` |
| `purchase-approve` | MFA-backed purchase authorization | Payments pack |
| `create-stripe-checkout` | Stripe Checkout session | + `STRIPE_*` secrets |
| `create-stripe-portal` | Manage subscription (web) | Same |
| `stripe-webhook` | Fulfill ledger + Spark+ | `--no-verify-jwt` + webhook URL |

### 3.4 Security operator checklist

- [ ] Run `supabase-security-migration.sql` on production project
- [ ] Deploy `delete-account` and `openai-disguise-proxy`; set secrets
- [ ] Confirm RLS enabled (included in schema)
- [ ] Plan private photo bucket + signed URLs (not public `profile-photos`)
- [ ] WAF / DDoS on public API
- [ ] Penetration test before public launch
- [ ] Publish `security@` contact; vulnerability disclosure process
- [x] Client: moderation queue for `security_reports` + shared scam quarantine sync (`AdminModerationQueueScreen`, `trustSafety.ts`)
- [ ] Operator: run `supabase-trust-safety-migration.sql`; grant moderators `app_metadata.admin_role`

---

## 4. Payments protocol

**Deep dive:** [`IAP.md`](./IAP.md) · **Roadmap Step 6:** [`AUTH_AND_PAYMENTS_ROADMAP.md`](./AUTH_AND_PAYMENTS_ROADMAP.md).

### 4.1 Billing modes

| Mode | Env | Who pays | Entitlements |
|------|-----|----------|--------------|
| **Demo** (default) | (none) or `EXPO_PUBLIC_PURCHASES_MODE=demo` | Simulated delay, local grant | Demo / stakeholder previews only |
| **Store (IAP)** | `EXPO_PUBLIC_PURCHASES_MODE=store` + RevenueCat key | Apple / Google via RevenueCat | Native iOS/Android builds with `react-native-purchases` |
| **Web Stripe** | `EXPO_PUBLIC_WEB_PAYMENTS_ENABLED=true` + Supabase | Card / wallet via Checkout | Ledger sync + `grant_spark_plus_entitlement` for subscriptions |

**Production rule:** With Supabase configured, **demo billing is blocked** in production builds (`isDemoPurchaseBlockedInProduction`).

### 4.2 Purchase flow protocol (secure path)

1. User selects product (Spark+ plan or Shop pack).
2. **Confirm sheet** shows price, legal footer, link to **Subscription Terms**.
3. **Step-up** (when Supabase + MFA enrolled):
   - Native + MFA: authenticator code + biometrics (or second code if no biometrics).
   - Web + MFA: **two** consecutive TOTP codes.
   - Web without MFA/biometrics: blocked — enroll 2FA or use native app.
4. **`purchase-approve`** Edge Function (when cloud): validates JWT, optional server TOTP, returns `approvalId`.
5. **Rail:**
   - **Stripe:** `create-stripe-checkout` → redirect → webhook writes `purchase_ledger` and grants Spark+ server-side.
   - **Store / demo:** local/RevenueCat purchase; ledger row when approval id present.
6. Client applies grant + syncs unapplied ledger rows (`purchaseEntitlementsSync.ts`).
7. **Restore purchases:** native RevenueCat restore + cloud ledger sync.

**Rate limit:** 8 purchase attempts / 10 min per user (client).

### 4.3 Product catalog (canonical IDs)

See [`src/constants/products.ts`](../src/constants/products.ts) and [`IAP.md`](./IAP.md).

| Product id | Type | Example store SKU |
|------------|------|-------------------|
| `spark_plus_weekly` / `monthly` / `annual` | Subscription | `com.spark.dating.spark_plus.*` |
| `boost_1`, `boost_3` | Consumable | `com.spark.dating.boost.*` |
| `spark_notes_1`, `spark_notes_5` | Consumable | `com.spark.dating.spark_notes.*` |

### 4.4 Manage subscription protocol

| Platform | Action |
|----------|--------|
| **iOS** | Opens Apple subscription management URL |
| **Android** | Opens Google Play subscriptions URL |
| **Web (Stripe enabled)** | `create-stripe-portal` → Stripe Customer Portal |

### 4.5 Payments operator checklist

**Store (IAP)**

- [ ] App Store Connect + Play Console products match `storeProductId` in code
- [ ] RevenueCat entitlement `spark_plus` linked to subscription SKUs
- [ ] `EXPO_PUBLIC_REVENUECAT_API_KEY` in EAS secrets
- [ ] `npx expo install react-native-purchases` + prebuild + TestFlight / internal testing

**Web (Stripe)**

- [ ] Run `supabase-payments-migration.sql`
- [ ] Create Stripe Products/Prices; set `STRIPE_PRICE_<product_id>` secrets
- [ ] Deploy `purchase-approve`, `create-stripe-checkout`, `create-stripe-portal`, `stripe-webhook`
- [ ] Webhook endpoint: `checkout.session.completed` → project functions URL
- [ ] Vercel: `EXPO_PUBLIC_WEB_PAYMENTS_ENABLED=true` + Supabase env
- [ ] Test: sign in → MFA → Spark+ purchase → return URL `?checkout=success` → entitlement sync

**Compliance**

- [ ] Subscription Terms and pricing shown before charge
- [ ] Restore purchases visible on Spark+ screen
- [ ] Refund/cancel path documented in Subscription Terms matches portal / store behavior

---

## 5. Unified pre-launch checklist (operator)

Use this as a single sign-off list before sharing a **production** URL (not demo/tunnel).

### 5.1 Infrastructure

- [ ] Supabase: schema + security migration (+ payments migration if billing)
- [ ] All Edge Functions deployed with secrets documented in [`BACKEND_SETUP.md`](./BACKEND_SETUP.md)
- [ ] Vercel (or host): env vars, CSP headers, production build
- [ ] Redirect URLs complete for auth

### 5.2 Product & compliance

- [ ] Legal pack reviewed by counsel; contacts updated
- [ ] Onboarding acceptance flow tested (EN + zh-TW)
- [ ] Cookie banner on web
- [ ] Purchase confirm shows Subscription Terms link

### 5.3 Auth & security QA (manual)

- [ ] Magic link on production origin
- [ ] Phone OTP with real number (if shipped)
- [ ] Sign out / delete account
- [ ] MFA enroll + purchase step-up on web
- [ ] Report user → row in `security_reports` (when migration applied)

### 5.4 Automated QA

- [ ] `npm run verify:ci` green locally or on CI
- [ ] `npm run verify:ci-smoke` or `DEMO_URL=… npm run verify:remote-smoke` after deploy  
  Details: [`QA_AND_VERIFICATION.md`](./QA_AND_VERIFICATION.md)

---

## 6. Roadmap cross-reference (auth / security / payments)

Track implementation status in [`AUTH_AND_PAYMENTS_ROADMAP.md`](./AUTH_AND_PAYMENTS_ROADMAP.md):

| Step | Topic | Doc sections above |
|------|--------|-------------------|
| 1 | Account session UX | §2.3 |
| 2 | Email auth | §2.1–2.5 |
| 3 | Phone SMS | §2.1, §2.5 |
| 4 | OAuth & Apple | §2.1, §2.5 |
| 5 | Security backend | §3.3–3.4 |
| 6 | Payments | §4 |
| 7 | Trust & safety (server) | §3.4 (open items) |

---

## 7. Related documentation index

| Document | Use when |
|----------|----------|
| [`legal/README.md`](./legal/README.md) | Full legal index & agreement flows |
| [`BACKEND_SETUP.md`](./BACKEND_SETUP.md) | Supabase, auth redirects, Edge Functions |
| [`DEMO_DEPLOY.md`](./DEMO_DEPLOY.md) | Vercel demo deploy + env |
| [`IAP.md`](./IAP.md) | Store + Stripe product setup |
| [`security/SECURITY.md`](./security/SECURITY.md) | Engineering security architecture |
| [`AUTH_AND_PAYMENTS_ROADMAP.md`](./AUTH_AND_PAYMENTS_ROADMAP.md) | Step-by-step implementation status |
| [`QA_AND_VERIFICATION.md`](./QA_AND_VERIFICATION.md) | CI and manual QA scripts |
| [`PUBLIC_PREVIEW.md`](../PUBLIC_PREVIEW.md) | Current tunnel / preview URL notes |

---

*When policies or protocols change, update this master page and bump “Last updated” at the top. Prefer linking to canonical files rather than duplicating legal text here.*
