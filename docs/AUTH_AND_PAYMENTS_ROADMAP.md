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

- [x] Google / Apple redirect URLs documented in `BACKEND_SETUP.md` (shared with magic link)
- [x] Apple on web release: hide button + block non-iOS stub (`appleAuth.ts`, `regionalAuthProviders.ts`)
- [x] WeChat / QQ provider notes for CN builds in `BACKEND_SETUP.md`

## Step 5 — Security backend

- [x] Document applying `docs/supabase-security-migration.sql` in `BACKEND_SETUP.md` (run in Supabase SQL Editor after main schema)
- [x] Document deploying Edge Functions: `delete-account`, `openai-disguise-proxy` (`BACKEND_SETUP.md` §7)
- [x] Wire disguise AI to proxy when Supabase + session (`disguiseImageGeneration.ts`; prod ignores client OpenAI key)
- [ ] Operator: run migration + deploy functions on your Supabase project (manual)

## Step 6 — Payments

- [x] RevenueCat / `react-native-purchases` scaffold documented (`docs/IAP.md`, dynamic native bridge)
- [x] Supabase functions: `purchase-approve`, `create-stripe-checkout`, `create-stripe-portal`, `stripe-webhook` + `docs/supabase-payments-migration.sql`
- [x] Purchase step-up UI (TOTP) on Spark+ / shop when MFA required (`PurchaseConfirmSheet`, `usePurchaseStepUp`)
- [x] Stripe Customer Portal on web manage subscription (`openStripeCustomerPortal`, Spark+ screen)
- [ ] Operator: Stripe products, webhook URL, deploy functions, enable `EXPO_PUBLIC_WEB_PAYMENTS_ENABLED`

## Step 7 — Trust & safety (server)

- [x] Moderation queue UI for `security_reports` (`AdminModerationQueue`, moderator JWT + RLS)
- [x] Shared scam quarantine table + cloud sync (`scam_quarantine`, `trustSafety.ts`, `scamEnforcementStore`)
- [ ] Operator: run `supabase-trust-safety-migration.sql`; set `app_metadata.admin_role` on moderator Supabase users

---

**Reference audit:** Cloud Agent conversation (Sep 2026) — login, email/phone, anti-abuse, payments inventory.

**Related docs:** [`COMPLIANCE_AND_OPERATIONS_MASTER.md`](./COMPLIANCE_AND_OPERATIONS_MASTER.md) (unified checklists), [`BACKEND_SETUP.md`](./BACKEND_SETUP.md), [`security/SECURITY.md`](./security/SECURITY.md), [`IAP.md`](./IAP.md), [`QA_AND_VERIFICATION.md`](./QA_AND_VERIFICATION.md)
