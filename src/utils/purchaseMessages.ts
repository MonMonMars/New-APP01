import { translate } from '../i18n';
import { AppLocale } from '../types/locale';
import { PurchaseErrorCode, PurchaseRestoreResult } from '../types/purchases';

export function translatePurchaseError(
  locale: AppLocale,
  code: PurchaseErrorCode,
  fallback?: string,
): string {
  switch (code) {
    case 'product_unavailable':
      return translate(locale, 'payments.productUnavailable');
    case 'store_unavailable':
      return translate(locale, 'payments.storeUnavailable');
    case 'cancelled':
      return translate(locale, 'payments.cancelled');
    case 'payment_failed':
      return translate(locale, 'payments.purchaseFailed');
    case 'verification_required':
      return translate(locale, 'payments.verificationRequired');
    case 'verification_failed':
      return translate(locale, 'payments.verificationFailed');
    case 'approval_failed':
      return translate(locale, 'payments.approvalFailed');
    case 'rate_limited':
      return translate(locale, 'payments.rateLimited');
    case 'checkout_redirect':
      return translate(locale, 'payments.checkoutRedirect');
    case 'network':
    case 'already_owned':
    case 'unknown':
      return fallback ?? translate(locale, 'payments.purchaseFailed');
    default: {
      const _exhaustive: never = code;
      void _exhaustive;
      return fallback ?? translate(locale, 'payments.purchaseFailed');
    }
  }
}

export function translateRestoreMessage(locale: AppLocale, result: PurchaseRestoreResult): string {
  if (result.ok) {
    return translate(locale, 'payments.subscriptionRestored');
  }
  switch (result.reason) {
    case 'store_unavailable':
      return translate(locale, 'payments.restoreRequiresStore');
    case 'none_found':
      return translate(locale, 'payments.noSubscriptionFound');
    default: {
      const _exhaustive: never | undefined = result.reason;
      void _exhaustive;
      return result.message || translate(locale, 'payments.noSubscriptionFound');
    }
  }
}
