import { Platform } from 'react-native';

import { PRODUCT_CATALOG } from '../constants/products';
import {
  PurchaseErrorCode,
  PurchaseProductId,
  PurchaseRestoreResult,
  PurchaseResult,
} from '../types/purchases';

import {
  configureStorePurchases,
  isNativeStoreBillingLinked,
  purchaseViaNativeStore,
  restoreViaNativeStore,
  storeSetupMessage,
} from './revenueCatBridge';

export { listStoreProductSkus } from './storeProductSkus';
export { configureStorePurchases, isNativeStoreBillingLinked };

function failure(code: PurchaseErrorCode, message: string): PurchaseResult {
  return { ok: false, code, message };
}

function webOrUnavailableMessage(): string {
  if (Platform.OS === 'web') {
    return 'In-app purchases are not available on web. Use the iOS or Android app.';
  }
  return storeSetupMessage();
}

/** RevenueCat / native IAP when SDK + API key are present; otherwise actionable errors. */
export async function purchaseStoreProduct(productId: PurchaseProductId): Promise<PurchaseResult> {
  const product = PRODUCT_CATALOG[productId];
  if (!product) {
    return failure('product_unavailable', 'This product is not available.');
  }

  const nativeResult = await purchaseViaNativeStore(productId, product.storeProductId);
  if (nativeResult) {
    return nativeResult;
  }

  return failure('store_unavailable', webOrUnavailableMessage());
}

export async function restoreStorePurchases(): Promise<PurchaseRestoreResult> {
  const nativeResult = await restoreViaNativeStore();
  if (nativeResult) {
    return nativeResult;
  }

  return {
    ok: false,
    restoredSubscriptions: 0,
    reason: 'store_unavailable',
    message: webOrUnavailableMessage(),
  };
}
