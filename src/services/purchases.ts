import { Platform } from 'react-native';

import { PRODUCT_CATALOG } from '../constants/products';
import {
  EntitlementGrant,
  PurchaseErrorCode,
  PurchaseProductId,
  PurchaseProvider,
  PurchaseRestoreResult,
  PurchaseResult,
  PurchaseTransaction,
} from '../types/purchases';
import { SparkPlusPlan } from '../types/subscription';

import {
  appendPurchaseTransaction,
  findActiveSubscription,
  loadPurchaseHistory,
} from './purchaseHistory';

export type PurchasesMode = 'demo' | 'store';

const PURCHASES_MODE: PurchasesMode =
  process.env.EXPO_PUBLIC_PURCHASES_MODE === 'store' ? 'store' : 'demo';

const DEMO_PROCESSING_MS = 1400;

function createTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createReceiptToken(productId: PurchaseProductId): string {
  return `demo_${productId}_${Date.now()}`;
}

function providerForPlatform(): PurchaseProvider {
  if (PURCHASES_MODE === 'demo') {
    return 'demo';
  }
  switch (Platform.OS) {
    case 'ios':
      return 'app_store';
    case 'android':
      return 'play_store';
    default:
      return 'demo';
  }
}

function subscriptionExpiry(plan: SparkPlusPlan, from = Date.now()): string {
  const days = plan === 'weekly' ? 7 : plan === 'monthly' ? 30 : 365;
  return new Date(from + days * 24 * 60 * 60 * 1000).toISOString();
}

function grantForProduct(productId: PurchaseProductId): EntitlementGrant {
  const product = PRODUCT_CATALOG[productId];

  if (product.kind === 'subscription' && product.plan) {
    const expiresAt = subscriptionExpiry(product.plan);
    return { sparkPlus: { plan: product.plan, expiresAt } };
  }

  const grant: EntitlementGrant = {};

  if (product.boostCount) {
    const toActivate = product.activateBoostOnPurchase ? 1 : 0;
    const toInventory = Math.max(0, product.boostCount - toActivate);
    if (toInventory > 0) {
      grant.bonusBoosts = toInventory;
    }
    if (toActivate > 0) {
      grant.activateBoost = true;
    }
  }

  if (product.sparkNoteCount) {
    grant.bonusSparkNotes = product.sparkNoteCount;
  }

  return grant;
}

async function simulateStoreDelay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, DEMO_PROCESSING_MS));
}

function failure(code: PurchaseErrorCode, message: string): PurchaseResult {
  return { ok: false, code, message };
}

/**
 * Demo purchase — records a local transaction and returns entitlements.
 * Store mode returns `store_unavailable` until RevenueCat / native IAP is wired.
 */
export async function purchaseProduct(productId: PurchaseProductId): Promise<PurchaseResult> {
  const product = PRODUCT_CATALOG[productId];
  if (!product) {
    return failure('product_unavailable', 'This product is not available.');
  }

  if (PURCHASES_MODE === 'store') {
    return failure(
      'store_unavailable',
      'In-app purchases require a production build with App Store or Google Play billing configured.',
    );
  }

  await simulateStoreDelay();

  const grant = grantForProduct(productId);
  const purchasedAt = new Date().toISOString();
  const transaction: PurchaseTransaction = {
    id: createTransactionId(),
    productId,
    purchasedAt,
    provider: providerForPlatform(),
    expiresAt: grant.sparkPlus?.expiresAt ?? null,
    receiptToken: createReceiptToken(productId),
  };

  await appendPurchaseTransaction(transaction);

  return { ok: true, transaction, grant };
}

/** Restore active Spark+ subscription from local purchase history (demo) or store (future). */
export async function restorePurchases(): Promise<PurchaseRestoreResult> {
  if (PURCHASES_MODE === 'store') {
    return {
      ok: false,
      restoredSubscriptions: 0,
      message: 'Restore requires a production build with store billing configured.',
    };
  }

  await simulateStoreDelay();

  const history = await loadPurchaseHistory();
  const active = findActiveSubscription(history);

  if (!active) {
    return {
      ok: false,
      restoredSubscriptions: 0,
      message: 'No active Spark+ subscription found for this account.',
    };
  }

  const product = PRODUCT_CATALOG[active.productId];
  const plan = product.plan ?? 'monthly';
  const grant: EntitlementGrant = {
    sparkPlus: {
      plan,
      expiresAt: active.expiresAt ?? subscriptionExpiry(plan),
    },
  };

  return {
    ok: true,
    restoredSubscriptions: 1,
    message: 'Spark+ subscription restored.',
    grant,
  };
}

export function getPurchasesMode(): PurchasesMode {
  return PURCHASES_MODE;
}

export function isDemoPurchases(): boolean {
  return PURCHASES_MODE === 'demo';
}

export async function getActiveSubscriptionFromHistory(): Promise<EntitlementGrant | null> {
  const history = await loadPurchaseHistory();
  const active = findActiveSubscription(history);
  if (!active) {
    return null;
  }
  const product = PRODUCT_CATALOG[active.productId];
  if (!product.plan) {
    return null;
  }
  return {
    sparkPlus: {
      plan: product.plan,
      expiresAt: active.expiresAt ?? subscriptionExpiry(product.plan),
    },
  };
}

/** Deep link to platform subscription management. */
export function getManageSubscriptionsUrl(): string | null {
  switch (Platform.OS) {
    case 'ios':
      return 'https://apps.apple.com/account/subscriptions';
    case 'android':
      return 'https://play.google.com/store/account/subscriptions';
    default:
      return null;
  }
}
