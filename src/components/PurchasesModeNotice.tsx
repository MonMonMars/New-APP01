import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';

export function PurchasesModeNotice() {
  const { purchasesMode } = useApp();
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (purchasesMode === 'store') {
    const revenueCatReady = Boolean(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim());
    return (
      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="storefront-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.text, { color: colors.textMuted }]}>
          {revenueCatReady ? t('payments.storeModeHint') : t('payments.storeModeMissingKey')}
        </Text>
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
