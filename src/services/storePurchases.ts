import { Platform } from 'react-native';

import { PRODUCT_CATALOG } from '../constants/products';

export function listStoreProductSkus(): string[] {
  return Object.values(PRODUCT_CATALOG).map((product) => product.storeProductId);
}
import {
  PurchaseErrorCode,
  PurchaseProductId,
  PurchaseRestoreResult,
  PurchaseResult,
} from '../types/purchases';

function failure(code: PurchaseErrorCode, message: string): PurchaseResult {
  return { ok: false, code, message };
}

function revenueCatConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim());
}

function storeSetupMessage(): string {
  if (!revenueCatConfigured()) {
    return 'Set EXPO_PUBLIC_REVENUECAT_API_KEY and install react-native-purchases in a native build to enable store billing.';
  }
  if (Platform.OS === 'web') {
    return 'In-app purchases are not available on web. Use the iOS or Android app.';
  }
  return 'Store billing is configured in env but the RevenueCat native SDK is not linked yet. Add react-native-purchases and run a prebuild.';
}

/** Placeholder for RevenueCat / native IAP — returns actionable errors until SDK is linked. */
export async function purchaseStoreProduct(productId: PurchaseProductId): Promise<PurchaseResult> {
  const product = PRODUCT_CATALOG[productId];
  if (!product) {
    return failure('product_unavailable', 'This product is not available.');
  }

  void product.storeProductId;
  return failure('store_unavailable', storeSetupMessage());
}

export async function restoreStorePurchases(): Promise<PurchaseRestoreResult> {
  return {
    ok: false,
    restoredSubscriptions: 0,
    reason: 'store_unavailable',
    message: storeSetupMessage(),
  };
}
