import { Linking, Platform } from 'react-native';

import { PRODUCT_CATALOG } from '../constants/products';
import {
  EntitlementGrant,
  PaymentMethodKind,
  PurchaseErrorCode,
  PurchaseProductId,
  PurchaseResult,
} from '../types/purchases';
import { purchaseProduct as runLocalPurchaseProduct } from './purchases';
import { getSupabaseClient } from './supabase';
import {
  createPurchaseIdempotencyKey,
  isDemoPurchaseBlockedInProduction,
  runPurchaseDoubleAuthorization,
} from './paymentSecurity';
import type { AccountRegionContext } from '../types/accountRegion';
import { resolvePaymentRail } from './paymentRails';
import { beginStripeCheckout, requestPurchaseApproval } from './stripePayments';
import { isSupabaseConfigured } from './supabase';

function failure(code: PurchaseErrorCode, message: string, checkoutUrl?: string): PurchaseResult {
  return { ok: false, code, message, checkoutUrl };
}

export async function purchaseProductSecure(options: {
  productId: PurchaseProductId;
  userId: string | null;
  verificationCode?: string;
  verificationCodeConfirm?: string;
  paymentMethod?: PaymentMethodKind;
  requireCloudStepUp: boolean;
  accountRegion: AccountRegionContext;
}): Promise<PurchaseResult> {
  const product = PRODUCT_CATALOG[options.productId];
  if (!product) {
    return failure('product_unavailable', 'This product is not available.');
  }

  if (isDemoPurchaseBlockedInProduction()) {
    return failure(
      'store_unavailable',
      'Demo billing is disabled in production. Enable store or web payments.',
    );
  }

  if (isSupabaseConfigured() && !options.userId) {
    return failure('store_unavailable', 'Sign in to complete a secure purchase.');
  }

  void options.requireCloudStepUp;

  const stepUp = await runPurchaseDoubleAuthorization({
    userId: options.userId,
    verificationCode: options.verificationCode,
    verificationCodeConfirm: options.verificationCodeConfirm,
  });
  if (!stepUp.ok) {
    return failure(stepUp.code, stepUp.message);
  }

  const rail = resolvePaymentRail(options.paymentMethod ?? 'platform_default', options.accountRegion);

  if (rail === 'stripe_checkout' && !options.accountRegion.stripeWebCheckout) {
    return failure(
      'store_unavailable',
      'Web card checkout is not available for your account region. Use the iOS or Android app.',
    );
  }
  const idempotencyKey = createPurchaseIdempotencyKey(options.userId, options.productId);

  let approvalId: string | undefined;
  if (isSupabaseConfigured() && options.userId) {
    const approval = await requestPurchaseApproval({
      productId: options.productId,
      idempotencyKey,
      totpCode: stepUp.totpCode,
    });
    if (!approval.ok) {
      const code =
        approval.code === 'verification_required'
          ? 'verification_required'
          : approval.code === 'verification_failed'
            ? 'verification_failed'
            : 'approval_failed';
      return failure(code, approval.error);
    }
    approvalId = approval.approvalId;
  }

  if (rail === 'stripe_checkout') {
    if (!approvalId) {
      return failure('store_unavailable', 'Sign in to pay securely on the web.');
    }
    const checkout = await beginStripeCheckout({
      productId: options.productId,
      approvalId,
    });
    if (!checkout.ok) {
      return failure('payment_failed', checkout.error);
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.assign(checkout.url);
      return failure('checkout_redirect', 'Redirecting to secure checkout…', checkout.url);
    }

    const canOpen = await Linking.canOpenURL(checkout.url);
    if (canOpen) {
      await Linking.openURL(checkout.url);
    }
    return failure('checkout_redirect', 'Complete payment in the browser.', checkout.url);
  }

  const result = await runLocalPurchaseProduct(options.productId);
  if (result.ok && isSupabaseConfigured() && options.userId && approvalId) {
    void logStorePurchaseAudit(options.userId, options.productId, approvalId, result.grant);
  }
  return result;
}

async function logStorePurchaseAudit(
  userId: string,
  productId: PurchaseProductId,
  approvalId: string,
  grant: EntitlementGrant,
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    return;
  }
  try {
    await client.from('purchase_ledger').insert({
      user_id: userId,
      product_id: productId,
      provider: Platform.OS === 'ios' ? 'app_store' : Platform.OS === 'android' ? 'play_store' : 'demo',
      status: 'completed',
      grant,
      external_id: `native_${approvalId}`,
      idempotency_key: approvalId,
    });
  } catch {
    // Ledger table may not exist until migration — purchase still valid locally.
  }
}
