import { SparkPlusPlan } from '../types/subscription';
import { PurchaseProductId } from '../types/purchases';

export type ProductKind = 'subscription' | 'consumable';

export type ProductDefinition = {
  id: PurchaseProductId;
  kind: ProductKind;
  /** App Store / Play Console product id (RevenueCat package identifier) */
  storeProductId: string;
  displayPriceUsd: number;
  /** Spark+ plan — subscriptions only */
  plan?: SparkPlusPlan;
  /** Consumable grants */
  boostCount?: number;
  sparkNoteCount?: number;
  /** Activate one boost immediately on purchase */
  activateBoostOnPurchase?: boolean;
};

/** Canonical in-app product catalog — map UI selections to store SKUs. */
export const PRODUCT_CATALOG: Record<PurchaseProductId, ProductDefinition> = {
  spark_plus_weekly: {
    id: 'spark_plus_weekly',
    kind: 'subscription',
    storeProductId: 'com.spark.dating.spark_plus.weekly',
    displayPriceUsd: 12.99,
    plan: 'weekly',
  },
  spark_plus_monthly: {
    id: 'spark_plus_monthly',
    kind: 'subscription',
    storeProductId: 'com.spark.dating.spark_plus.monthly',
    displayPriceUsd: 14.99,
    plan: 'monthly',
  },
  spark_plus_annual: {
    id: 'spark_plus_annual',
    kind: 'subscription',
    storeProductId: 'com.spark.dating.spark_plus.annual',
    displayPriceUsd: 99.99,
    plan: 'annual',
  },
  boost_1: {
    id: 'boost_1',
    kind: 'consumable',
    storeProductId: 'com.spark.dating.boost.1',
    displayPriceUsd: 3.99,
    boostCount: 1,
    activateBoostOnPurchase: true,
  },
  boost_3: {
    id: 'boost_3',
    kind: 'consumable',
    storeProductId: 'com.spark.dating.boost.3',
    displayPriceUsd: 9.99,
    boostCount: 3,
    activateBoostOnPurchase: true,
  },
  spark_notes_1: {
    id: 'spark_notes_1',
    kind: 'consumable',
    storeProductId: 'com.spark.dating.spark_notes.1',
    displayPriceUsd: 1.99,
    sparkNoteCount: 1,
  },
  spark_notes_5: {
    id: 'spark_notes_5',
    kind: 'consumable',
    storeProductId: 'com.spark.dating.spark_notes.5',
    displayPriceUsd: 4.99,
    sparkNoteCount: 5,
  },
};

/** Legacy shop pack ids → canonical product ids */
export const SHOP_PACK_TO_PRODUCT: Record<string, PurchaseProductId> = {
  'boost-1': 'boost_1',
  'boost-3': 'boost_3',
  'notes-1': 'spark_notes_1',
  'notes-5': 'spark_notes_5',
};

export function sparkPlusProductForPlan(plan: SparkPlusPlan): PurchaseProductId {
  switch (plan) {
    case 'weekly':
      return 'spark_plus_weekly';
    case 'monthly':
      return 'spark_plus_monthly';
    case 'annual':
      return 'spark_plus_annual';
    default: {
      const _exhaustive: never = plan;
      return _exhaustive;
    }
  }
}

export function formatProductPrice(usd: number): string {
  return `$${usd.toFixed(2)}`;
}
