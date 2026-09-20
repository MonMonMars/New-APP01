import { SparkPlusPlan } from './subscription';

export type PurchaseProductId =
  | 'spark_plus_weekly'
  | 'spark_plus_monthly'
  | 'spark_plus_annual'
  | 'boost_1'
  | 'boost_3'
  | 'spark_notes_1'
  | 'spark_notes_5';

export type PurchaseProvider = 'demo' | 'app_store' | 'play_store';

export type PurchaseErrorCode =
  | 'cancelled'
  | 'network'
  | 'store_unavailable'
  | 'product_unavailable'
  | 'payment_failed'
  | 'verification_required'
  | 'verification_failed'
  | 'already_owned'
  | 'unknown';

export type EntitlementGrant = {
  sparkPlus?: {
    plan: SparkPlusPlan;
    expiresAt: string;
  };
  bonusBoosts?: number;
  activateBoost?: boolean;
  bonusSparkNotes?: number;
};

export type PurchaseTransaction = {
  id: string;
  productId: PurchaseProductId;
  purchasedAt: string;
  provider: PurchaseProvider;
  /** Subscription expiry — null for consumables */
  expiresAt: string | null;
  /** Local receipt token — replace with store receipt in production */
  receiptToken: string;
};

export type PurchaseSuccess = {
  ok: true;
  transaction: PurchaseTransaction;
  grant: EntitlementGrant;
};

export type PurchaseFailure = {
  ok: false;
  code: PurchaseErrorCode;
  message: string;
};

export type PurchaseResult = PurchaseSuccess | PurchaseFailure;

export type PurchaseRestoreReason = 'store_unavailable' | 'none_found';

export type PurchaseRestoreResult = {
  ok: boolean;
  restoredSubscriptions: number;
  message: string;
  reason?: PurchaseRestoreReason;
  grant?: EntitlementGrant;
};

export type SubscriptionSnapshot = {
  isActive: boolean;
  plan: SparkPlusPlan | null;
  expiresAt: string | null;
  provider: PurchaseProvider | null;
};
