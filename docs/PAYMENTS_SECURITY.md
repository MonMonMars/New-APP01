# Payments — security & multi-rail setup

Spark uses **defense in depth**: step-up auth on device, short-lived **purchase approvals** on the server, **Stripe-hosted checkout** on web (PCI scope on Stripe), and **App Store / Google Play** via RevenueCat on native.

## Rails

| Rail | When | Provider |
|------|------|----------|
| **Native store** | iOS / Android, `EXPO_PUBLIC_PURCHASES_MODE=store` | RevenueCat → Apple / Google |
| **Stripe Checkout** | Web when `EXPO_PUBLIC_WEB_PAYMENTS_ENABLED=true` | Cards, Apple Pay, Google Pay, Link |
| **Demo** | Default dev / previews | Local ledger only |

Users pick **Recommended** or an explicit method on the purchase confirmation sheet.

## Client security

- **Double authorization (every purchase)** — Two independent checks before any charge:
  - **MFA on + biometrics** — Authenticator code, then Face ID / Touch ID / device PIN.
  - **MFA on + web (no biometrics)** — Two consecutive authenticator codes (must differ).
  - **No MFA + mobile** — Two biometric prompts (identity, then confirm payment).
  - **Web without MFA/biometrics** — Blocked; user must enable 2FA or pay in the native app.
- **Rate limit** — 8 purchase attempts per 10 minutes per account (client throttle).
- **Sign-in required** — Cloud purchases require an authenticated user.
- **Production** — Demo billing is blocked when Supabase is configured and `__DEV__` is false.
- **Audit** — `purchase_attempt`, `purchase_success`, and `purchase_failed` in `security_audit_events`.

## Server (Supabase)

1. Run [`supabase-purchase-ledger.sql`](./supabase-purchase-ledger.sql).

2. Deploy Edge Functions:

```bash
supabase functions deploy purchase-approve
supabase functions deploy create-stripe-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
```

3. Secrets (Dashboard → Edge Functions):

| Secret | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Create Checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Verify webhook signatures |

4. Stripe Dashboard → Webhooks → endpoint `…/functions/v1/stripe-webhook` → events: `checkout.session.completed`, `checkout.session.expired`.

5. Web app env:

```bash
EXPO_PUBLIC_WEB_PAYMENTS_ENABLED=true
```

Redirect URLs for Checkout success/cancel match your web origin (same as auth redirects).

## Flow (web / Stripe)

1. User confirms purchase → `purchase-approve` (TOTP if MFA enrolled) → approval UUID (5 min).
2. `create-stripe-checkout` consumes approval, creates session, writes `purchase_ledger` `pending`.
3. User pays on Stripe-hosted page.
4. Webhook marks ledger `completed` with `grant` JSON; Spark+ also sets `user_state.is_spark_plus`.
5. App polls ledger / sync on load and applies entitlements once.

## Flow (native / IAP)

1. Same approval + step-up.
2. RevenueCat purchase runs on device.
3. Completed purchase logged to `purchase_ledger` when possible (audit trail).

Never store card numbers in Spark — only tokens/receipts on the store or Stripe side.
