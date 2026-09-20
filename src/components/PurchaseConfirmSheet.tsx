import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLegalUiStrings } from '../content/legal';
import { isDemoPurchases } from '../services/purchases';
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
  /** When set, user must enter a 6-digit authenticator code before purchase completes. */
  requireVerificationCode?: boolean;
  verificationCode?: string;
  onVerificationCodeChange?: (code: string) => void;
  verificationHint?: string;
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
  requireVerificationCode = false,
  verificationCode = '',
  onVerificationCodeChange,
  verificationHint,
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
  const demoNote = isDemoPurchases() ? t('payments.demoNote') : legalUi.purchaseDemoNote;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, modalFill]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}>
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
          {requireVerificationCode ? (
            <>
              <Text style={[styles.verificationHint, { color: colors.textMuted }]}>
                {verificationHint ?? t('auth.paymentVerificationHint')}
              </Text>
              <TextInput
                value={verificationCode}
                onChangeText={(value) =>
                  onVerificationCodeChange?.(value.replace(/\D/g, '').slice(0, 6))
                }
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                placeholder={t('auth.mfaCodePlaceholder')}
                placeholderTextColor={colors.textMuted}
                style={[styles.verificationInput, { color: colors.text, borderColor: colors.border }]}
                maxLength={6}
              />
            </>
          ) : null}
          <Text style={[styles.legal, { color: colors.textMuted }]}>
            {demoNote} {legalUi.purchaseAutoRenew}
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
              {
                backgroundColor: colors.gradientEnd,
                opacity:
                  confirmLoading || (requireVerificationCode && verificationCode.length !== 6) ? 0.7 : 1,
              },
            ]}
            disabled={confirmLoading || (requireVerificationCode && verificationCode.length !== 6)}
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
  verificationHint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  verificationInput: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 20,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.md,
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
