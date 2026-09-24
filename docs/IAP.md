# In-app purchases (Spark+ & consumables)

## Demo mode (default)

No env vars required. Purchases simulate a short delay, grant entitlements locally, and append to purchase history for restore testing.

## Store mode (production scaffold)

1. Set in `.env` or EAS secrets:

```bash
EXPO_PUBLIC_PURCHASES_MODE=store
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_...   # or goog_...
```

2. Create products in App Store Connect / Google Play Console using IDs from `src/constants/products.ts` (`storeProductId` fields).

3. Install the SDK in your native project:

```bash
npx expo install react-native-purchases
npx expo prebuild
```

4. In RevenueCat, create an entitlement **`spark_plus`** and attach your subscription products (SKUs from `listStoreProductSkus()` / `src/constants/products.ts`).

5. Purchase and restore flow lives in `src/services/revenueCatBridge.native.ts` (configured on sign-in via `configureStorePurchases`). Web and builds without the SDK show guidance in `PurchasesModeNotice`.

Optional: add `react-native-purchases` to your native project (`npx expo install react-native-purchases`). The repo loads it dynamically — web and demo builds do not require the package.

## Web Stripe checkout

1. Run [`supabase-payments-migration.sql`](./supabase-payments-migration.sql) in Supabase SQL Editor.
2. Deploy Edge Functions (see [`BACKEND_SETUP.md`](./BACKEND_SETUP.md) § Payments): `purchase-approve`, `create-stripe-checkout`, `create-stripe-portal`, `stripe-webhook`.
3. Set secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and one env per price: `STRIPE_PRICE_spark_plus_monthly`, etc.
4. In `.env` / Vercel:

```bash
EXPO_PUBLIC_WEB_PAYMENTS_ENABLED=true
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

5. Purchases with MFA enrolled require authenticator codes in the confirm sheet (double code on web).

## Product catalog

| In-app id | Store SKU (example) |
|-----------|---------------------|
| `spark_plus_weekly` | `com.spark.dating.spark_plus.weekly` |
| `spark_plus_monthly` | `com.spark.dating.spark_plus.monthly` |
| `spark_plus_annual` | `com.spark.dating.spark_plus.annual` |
| `boost_1` / `boost_3` | `com.spark.dating.boost.*` |
| `spark_notes_1` / `spark_notes_5` | `com.spark.dating.spark_notes.*` |
