import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { useOptionalAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { isNativeStoreBillingLinked } from '../services/storePurchases';
import { radii, spacing } from '../theme';

export function PurchasesModeNotice() {
  const { purchasesMode } = useApp();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const admin = useOptionalAdmin();
  const showDemoHints = admin?.showDemoBillingHints ?? false;

  if (purchasesMode !== 'store' && !showDemoHints) {
    return null;
  }

  if (purchasesMode === 'store') {
    const revenueCatKeySet = Boolean(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim());
    const billingLinked = isNativeStoreBillingLinked();
    const messageKey = billingLinked
      ? 'payments.storeModeReady'
      : revenueCatKeySet
        ? 'payments.storeModeHint'
        : 'payments.storeModeMissingKey';
    return (
      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="storefront-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.text, { color: colors.textMuted }]}>{t(messageKey)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="flask-outline" size={18} color={colors.gradientEnd} />
      <Text style={[styles.text, { color: colors.textMuted }]}>{t('payments.demoModeHint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
