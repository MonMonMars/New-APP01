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

## Product catalog

| In-app id | Store SKU (example) |
|-----------|---------------------|
| `spark_plus_weekly` | `com.spark.dating.spark_plus.weekly` |
| `spark_plus_monthly` | `com.spark.dating.spark_plus.monthly` |
| `spark_plus_annual` | `com.spark.dating.spark_plus.annual` |
| `boost_1` / `boost_3` | `com.spark.dating.boost.*` |
| `spark_notes_1` / `spark_notes_5` | `com.spark.dating.spark_notes.*` |
