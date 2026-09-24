# Auth, security & payments — step-by-step roadmap

Working plan for moving Spark from **demo-ready** to **production-ready** auth and billing. Check off steps as PRs land.

## Step 1 — Account session UX

- [x] **Sign out** and **Use another account** in Privacy controls + Security settings (`AccountSessionSection`)
- [ ] Optional: same entry on Spark **Profile** tab
- [ ] Persist `signOut` immediately (verify AsyncStorage after sign-out)

## Step 2 — Email auth hardening

- [ ] Document Vercel redirect URLs in `BACKEND_SETUP.md` (replace stale GitHub Pages URLs)
- [ ] Magic-link “waiting” UX polish + resend cooldown
- [ ] Password recovery tested on web deploy

## Step 3 — Phone SMS auth

- [ ] Supabase phone provider checklist (Twilio / MessageBird)
- [ ] Remove demo `123456` hint in production builds when Supabase on
- [ ] Rate-limit copy for OTP resend

## Step 4 — OAuth & Apple

- [ ] Google / Apple redirect URLs for production web
- [ ] Apple on web: real Sign in with Apple JS or hide stub on web release
- [ ] WeChat / QQ provider notes for CN builds

## Step 5 — Security backend

- [ ] Apply `docs/supabase-security-migration.sql`
- [ ] Deploy Edge Functions: `delete-account`, `openai-disguise-proxy`
- [ ] Wire disguise AI to proxy (no client OpenAI key)

## Step 6 — Payments

- [ ] Add `react-native-purchases` + RevenueCat for iOS/Android store mode
- [ ] Implement Supabase functions: `purchase-approve`, `create-stripe-checkout`, `purchase_ledger` schema
- [ ] Purchase step-up UI (TOTP) on Spark+ / shop when MFA required
- [ ] Stripe Customer Portal link for web manage subscription

## Step 7 — Trust & safety (server)

- [ ] Moderation queue for `security_reports`
- [ ] Shared scam quarantine (not only AsyncStorage)

---

**Reference audit:** Cloud Agent conversation (Sep 2026) — login, email/phone, anti-abuse, payments inventory.

**Related docs:** [`BACKEND_SETUP.md`](./BACKEND_SETUP.md), [`security/SECURITY.md`](./security/SECURITY.md), [`IAP.md`](./IAP.md), [`QA_AND_VERIFICATION.md`](./QA_AND_VERIFICATION.md)
