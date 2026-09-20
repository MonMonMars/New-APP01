import { Platform } from 'react-native';

import { PurchaseProductId } from '../types/purchases';
import { invokePaymentFunction } from './paymentApi';
import { getMagicLinkRedirectTo } from './supabaseAuthCallback';

export async function requestPurchaseApproval(options: {
  productId: PurchaseProductId;
  idempotencyKey: string;
  totpCode?: string;
}): Promise<{ ok: true; approvalId: string } | { ok: false; error: string; code?: string }> {
  const result = await invokePaymentFunction<{ approvalId: string }>('purchase-approve', {
    productId: options.productId,
    idempotencyKey: options.idempotencyKey,
    totpCode: options.totpCode,
  });
  if (!result.ok) {
    return { ok: false, error: result.error, code: result.code };
  }
  return { ok: true, approvalId: result.data.approvalId };
}

function checkoutRedirectUrls(): { successUrl: string; cancelUrl: string } {
  const appendCheckoutParam = (base: string, outcome: 'success' | 'cancel') => {
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}checkout=${outcome}`;
  };

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const base = `${window.location.origin}${window.location.pathname}`;
    return {
      successUrl: appendCheckoutParam(base, 'success'),
      cancelUrl: appendCheckoutParam(base, 'cancel'),
    };
  }
  const redirect = getMagicLinkRedirectTo() ?? 'spark://payments/return';
  return {
    successUrl: appendCheckoutParam(redirect, 'success'),
    cancelUrl: appendCheckoutParam(redirect, 'cancel'),
  };
}

export async function beginStripeCheckout(options: {
  productId: PurchaseProductId;
  approvalId: string;
}): Promise<{ ok: true; url: string; sessionId: string } | { ok: false; error: string }> {
  const { successUrl, cancelUrl } = checkoutRedirectUrls();
  const result = await invokePaymentFunction<{ url: string; sessionId: string }>('create-stripe-checkout', {
    productId: options.productId,
    approvalId: options.approvalId,
    successUrl,
    cancelUrl,
  });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true, url: result.data.url, sessionId: result.data.sessionId };
}
