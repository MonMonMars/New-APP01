# Auth, security & payments — step-by-step roadmap

Working plan for moving Spark from **demo-ready** to **production-ready** auth and billing. Check off steps as PRs land.

## Step 1 — Account session UX

- [x] **Sign out** and **Use another account** in Privacy controls + Security settings (`AccountSessionSection`)
- [ ] Optional: same entry on Spark **Profile** tab
- [ ] Persist `signOut` immediately (verify AsyncStorage after sign-out)

## Step 2 — Email auth hardening

- [x] Document Vercel / local / tunnel redirect URLs in `BACKEND_SETUP.md` + `DEMO_DEPLOY.md`
- [x] Magic-link waiting UI, auto session poll, 60s resend cooldown, client rate limit (5 / 15 min)
- [ ] Password recovery E2E on a live Vercel + Supabase project (manual QA checklist)

## Step 3 — Phone SMS auth

- [x] Supabase phone provider checklist in `BACKEND_SETUP.md` (Twilio / MessageBird)
- [x] Hide demo `123456` hint in **production** builds (`isProductionBuild`)
- [x] OTP resend 60s cooldown + client rate limit (5 / 15 min per number)
- [ ] Live SMS test on Supabase + real number (manual QA)

## Step 4 — OAuth & Apple

- [ ] Google / Apple redirect URLs for production web
- [ ] Apple on web: real Sign in with Apple JS or hide stub on web release
- [ ] WeChat / QQ provider notes for CN builds

## Step 5 — Security backend

- [x] Document applying `docs/supabase-security-migration.sql` in `BACKEND_SETUP.md` (run in Supabase SQL Editor after main schema)
- [x] Document deploying Edge Functions: `delete-account`, `openai-disguise-proxy` (`BACKEND_SETUP.md` §7)
- [x] Wire disguise AI to proxy when Supabase + session (`disguiseImageGeneration.ts`; prod ignores client OpenAI key)
- [ ] Operator: run migration + deploy functions on your Supabase project (manual)

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
