import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLegalUiStrings } from '../content/legal';
import { isDemoPurchases } from '../services/purchases';
import { useOptionalAdmin } from '../context/AdminContext';
import { useAppLocale } from '../hooks/useAppLocale';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { AnimatedPressable } from './AnimatedPressable';

type PurchaseConfirmSheetProps = {
  visible: boolean;
  title: string;
  description: string;
  price: string;
  quantity?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  confirmLoading?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  onOpenSubscriptionTerms?: () => void;
};

export function PurchaseConfirmSheet({
  visible,
  title,
  description,
  price,
  quantity,
  icon = 'bag-outline',
  iconColor,
  confirmLoading = false,
  errorMessage = null,
  onConfirm,
  onClose,
  onOpenSubscriptionTerms,
}: PurchaseConfirmSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { locale } = useAppLocale();
  const { t } = useTranslation();
  const legalUi = getLegalUiStrings(locale);
  const accent = iconColor ?? colors.gradientEnd;
  const showDemoBillingHints = useOptionalAdmin()?.showDemoBillingHints ?? false;
  const demoNote = isDemoPurchases() ? t('payments.demoNote') : legalUi.purchaseDemoNote;
  const purchaseFooter =
    isDemoPurchases() && !showDemoBillingHints
      ? legalUi.purchaseAutoRenew
      : `${demoNote} ${legalUi.purchaseAutoRenew}`;

  const maxSheetHeight = Dimensions.get('window').height * 0.9 - insets.top;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={[
          styles.backdrop,
          modalFill,
          { paddingTop: insets.top + spacing.sm, paddingBottom: spacing.sm },
        ]}
      >
        <ScrollView
          style={{ maxHeight: maxSheetHeight, width: '100%' }}
          contentContainerStyle={styles.sheetScroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                paddingBottom: insets.bottom + spacing.md,
              },
            ]}
          >
          <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
            <Ionicons name={icon} size={28} color={accent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
          {quantity ? (
            <Text style={[styles.quantity, { color: accent }]}>{quantity}</Text>
          ) : null}
          <Text style={[styles.price, { color: colors.text }]}>{price}</Text>
          {errorMessage ? (
            <Text style={[styles.error, { color: '#ef4444' }]}>{errorMessage}</Text>
          ) : null}
          <Text style={[styles.legal, { color: colors.textMuted }]}>
            {purchaseFooter}
            {onOpenSubscriptionTerms ? (
              <>
                {' '}
                <Text style={[styles.legalLink, { color: accent }]} onPress={onOpenSubscriptionTerms}>
                  {legalUi.subscriptionTermsLink}
                </Text>
              </>
            ) : null}
          </Text>
          <AnimatedPressable
            style={[
              styles.confirmButton,
              { backgroundColor: colors.gradientEnd, opacity: confirmLoading ? 0.7 : 1 },
            ]}
            disabled={confirmLoading}
            onPress={() => void onConfirm()}
          >
            {confirmLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>{t('payments.confirmPurchase')}</Text>
            )}
          </AnimatedPressable>
          <AnimatedPressable style={styles.cancelButton} onPress={onClose} disabled={confirmLoading}>
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>{t('common.cancel')}</Text>
          </AnimatedPressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.card + 8,
    borderTopRightRadius: radii.card + 8,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  quantity: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  error: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  legal: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  legalLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  confirmButton: {
    width: '100%',
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelButton: {
    paddingVertical: spacing.sm,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
