import { translate } from '../i18n';
import { AppLocale } from '../types/locale';
import { PurchaseProductId } from '../types/purchases';

export function getProductLabel(locale: AppLocale, productId: PurchaseProductId): string {
  const map: Record<PurchaseProductId, string> = {
    spark_plus_weekly: translate(locale, 'payments.productSparkPlusWeekly'),
    spark_plus_monthly: translate(locale, 'payments.productSparkPlusMonthly'),
    spark_plus_annual: translate(locale, 'payments.productSparkPlusAnnual'),
    boost_1: translate(locale, 'payments.productBoost1'),
    boost_3: translate(locale, 'payments.productBoost3'),
    spark_notes_1: translate(locale, 'payments.productNotes1'),
    spark_notes_5: translate(locale, 'payments.productNotes5'),
  };
  return map[productId];
}
