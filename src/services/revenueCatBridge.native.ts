import { Platform } from 'react-native';

import { PRODUCT_CATALOG } from '../constants/products';
import {
  grantForProduct,
  productIdForStoreSku,
  subscriptionExpiry,
} from './productGrants';
import {
  PurchaseErrorCode,
  PurchaseProductId,
  PurchaseProvider,
  PurchaseRestoreResult,
  PurchaseResult,
  PurchaseTransaction,
} from '../types/purchases';
import { SparkPlusPlan } from '../types/subscription';

const SPARK_PLUS_ENTITLEMENT = 'spark_plus';

type PurchasesModule = {
  configure: (options: { apiKey: string; appUserID?: string }) => void;
  logIn: (appUserId: string) => Promise<unknown>;
  purchaseStoreProduct: (options: {
    product: { identifier: string };
  }) => Promise<{
    customerInfo: {
      originalAppUserId: string;
      entitlements: { active: Record<string, { expirationDate?: string | null; productIdentifier: string }> };
    };
    productIdentifier?: string;
  }>;
  restorePurchases: () => Promise<{
    entitlements: { active: Record<string, { expirationDate?: string | null; productIdentifier: string }> };
  }>;
};

let purchasesModule: PurchasesModule | null | undefined;
let configured = false;

function loadPurchasesModule(): PurchasesModule | null {
  if (purchasesModule !== undefined) {
    return purchasesModule;
  }
  try {
    // Optional native dependency — installed for store builds per docs/IAP.md
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    purchasesModule = require('react-native-purchases').default as PurchasesModule;
  } catch {
    purchasesModule = null;
  }
  return purchasesModule;
}

function revenueCatApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim();
  return key || null;
}

export function isNativeStoreBillingLinked(): boolean {
  return Boolean(revenueCatApiKey() && loadPurchasesModule());
}

export function storeSetupMessage(): string {
  if (!revenueCatApiKey()) {
    return 'Set EXPO_PUBLIC_REVENUECAT_API_KEY and install react-native-purchases in a native build to enable store billing.';
  }
  if (!loadPurchasesModule()) {
    return 'Install react-native-purchases, run expo prebuild, and rebuild the iOS or Android app.';
  }
  return 'Store billing could not start. Check your RevenueCat API key and product setup.';
}

function failure(code: PurchaseErrorCode, message: string): PurchaseResult {
  return { ok: false, code, message };
}

function providerForPlatform(): PurchaseProvider {
  switch (Platform.OS) {
    case 'ios':
      return 'app_store';
    case 'android':
      return 'play_store';
    default:
      return 'demo';
  }
}

function createTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function planFromProductId(productId: PurchaseProductId): SparkPlusPlan {
  const product = PRODUCT_CATALOG[productId];
  return product.plan ?? 'monthly';
}

export async function configureStorePurchases(appUserId?: string | null): Promise<boolean> {
  const Purchases = loadPurchasesModule();
  const apiKey = revenueCatApiKey();
  if (!Purchases || !apiKey) {
    return false;
  }
  if (configured) {
    if (appUserId) {
      try {
        await Purchases.logIn(appUserId);
      } catch {
        // Anonymous restore still works; login is best-effort.
      }
    }
    return true;
  }
  try {
    Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });
    configured = true;
    return true;
  } catch {
    return false;
  }
}

function purchaseErrorResult(error: unknown): PurchaseResult {
  const err = error as { userCancelled?: boolean; code?: string; message?: string };
  if (err.userCancelled) {
    return failure('cancelled', 'Purchase was cancelled.');
  }
  if (err.code === 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR') {
    return failure('product_unavailable', 'This product is not available in the store.');
  }
  if (err.code === 'NETWORK_ERROR') {
    return failure('network', 'Network error — check your connection and try again.');
  }
  return failure('payment_failed', err.message ?? 'Purchase failed. Try again later.');
}

export async function purchaseViaNativeStore(
  productId: PurchaseProductId,
  storeSku: string,
): Promise<PurchaseResult | null> {
  const ready = await configureStorePurchases();
  const Purchases = loadPurchasesModule();
  if (!ready || !Purchases) {
    return null;
  }

  const product = PRODUCT_CATALOG[productId];
  if (!product) {
    return failure('product_unavailable', 'This product is not available.');
  }

  try {
    const { customerInfo, productIdentifier } = await Purchases.purchaseStoreProduct({
      product: { identifier: storeSku },
    });

    const resolvedSku = productIdentifier ?? storeSku;
    const resolvedProductId = productIdForStoreSku(resolvedSku) ?? productId;
    const grant = grantForProduct(resolvedProductId);

    const entitlement = customerInfo.entitlements.active[SPARK_PLUS_ENTITLEMENT];
    if (entitlement?.expirationDate && grant.sparkPlus) {
      grant.sparkPlus.expiresAt = entitlement.expirationDate;
    }

    const purchasedAt = new Date().toISOString();
    const transaction: PurchaseTransaction = {
      id: createTransactionId(),
      productId: resolvedProductId,
      purchasedAt,
      provider: providerForPlatform(),
      expiresAt: grant.sparkPlus?.expiresAt ?? null,
      receiptToken: customerInfo.originalAppUserId ?? `rc_${resolvedSku}_${Date.now()}`,
    };

    return { ok: true, transaction, grant };
  } catch (error) {
    return purchaseErrorResult(error);
  }
}

export async function restoreViaNativeStore(): Promise<PurchaseRestoreResult | null> {
  const ready = await configureStorePurchases();
  const Purchases = loadPurchasesModule();
  if (!ready || !Purchases) {
    return null;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const entitlement = customerInfo.entitlements.active[SPARK_PLUS_ENTITLEMENT];

    if (!entitlement) {
      return {
        ok: false,
        restoredSubscriptions: 0,
        reason: 'none_found',
        message: 'No active Spark+ subscription found for this account.',
      };
    }

    const productId =
      productIdForStoreSku(entitlement.productIdentifier) ?? ('spark_plus_monthly' as PurchaseProductId);
    const plan = planFromProductId(productId);
    const expiresAt = entitlement.expirationDate ?? subscriptionExpiry(plan);

    return {
      ok: true,
      restoredSubscriptions: 1,
      message: 'Spark+ subscription restored.',
      grant: { sparkPlus: { plan, expiresAt } },
    };
  } catch (error) {
    const err = error as { message?: string };
    return {
      ok: false,
      restoredSubscriptions: 0,
      reason: 'store_unavailable',
      message: err.message ?? storeSetupMessage(),
    };
  }
}
