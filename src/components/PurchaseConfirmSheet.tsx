import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { getLegalUiStrings } from '../content/legal';
import { purchaseConfirmDisabled, usePurchaseDoubleAuthUi } from '../hooks/usePurchaseDoubleAuthUi';
import { listAvailablePaymentMethods, regionalPaymentNoticeKey } from '../services/paymentRails';
import { isDemoPurchases } from '../services/purchases';
import { PaymentMethodKind } from '../types/purchases';
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
  verificationCode?: string;
  onVerificationCodeChange?: (code: string) => void;
  verificationCodeConfirm?: string;
  onVerificationCodeConfirmChange?: (code: string) => void;
  paymentMethod?: PaymentMethodKind;
  onPaymentMethodChange?: (method: PaymentMethodKind) => void;
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
  verificationCode = '',
  onVerificationCodeChange,
  verificationCodeConfirm = '',
  onVerificationCodeConfirmChange,
  paymentMethod = 'platform_default',
  onPaymentMethodChange,
  onConfirm,
  onClose,
  onOpenSubscriptionTerms,
}: PurchaseConfirmSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { locale } = useAppLocale();
  const { t } = useTranslation();
  const legalUi = getLegalUiStrings(locale);
  const { mfaEnabled, accountRegion } = useApp();
  const doubleAuth = usePurchaseDoubleAuthUi(mfaEnabled);
  const accent = iconColor ?? colors.gradientEnd;
  const demoNote = isDemoPurchases() ? t('payments.demoNote') : legalUi.purchaseDemoNote;
  const paymentMethods = listAvailablePaymentMethods(accountRegion);
  const showEuNotice = accountRegion.market === 'europe' || accountRegion.market === 'uk';
  const cnNoticeKey = regionalPaymentNoticeKey(accountRegion);
  const confirmDisabled = purchaseConfirmDisabled({
    confirmLoading,
    showFirstTotp: doubleAuth.showFirstTotp,
    showSecondTotp: doubleAuth.showSecondTotp,
    verificationCode,
    verificationCodeConfirm,
    webPaymentBlocked: doubleAuth.webPaymentBlocked,
  });

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
          <Text style={[styles.regionalMarket, { color: colors.textMuted }]}>
            {t('payments.accountMarketLabel', { region: accountRegion.countryCode, currency: accountRegion.currency })}
          </Text>
          {showEuNotice ? (
            <Text style={[styles.verificationHint, { color: colors.textMuted }]}>{t('payments.euConsumerNotice')}</Text>
          ) : null}
          {cnNoticeKey ? (
            <Text style={[styles.verificationHint, { color: colors.textMuted }]}>{t(cnNoticeKey)}</Text>
          ) : null}
          {errorMessage ? (
            <Text style={[styles.error, { color: '#ef4444' }]}>{errorMessage}</Text>
          ) : null}
          {paymentMethods.length > 1 && onPaymentMethodChange ? (
            <View style={styles.methodBlock}>
              <Text style={[styles.methodTitle, { color: colors.text }]}>{t('payments.paymentMethodTitle')}</Text>
              {paymentMethods.map((method) => {
                const active = paymentMethod === method.kind;
                return (
                  <AnimatedPressable
                    key={method.kind}
                    style={[
                      styles.methodRow,
                      { borderColor: colors.border, backgroundColor: active ? `${accent}18` : colors.background },
                    ]}
                    onPress={() => onPaymentMethodChange(method.kind)}
                  >
                    <Text style={[styles.methodLabel, { color: active ? accent : colors.text }]}>
                      {t(method.labelKey)}
                    </Text>
                    <Text style={[styles.methodDesc, { color: colors.textMuted }]}>{t(method.descriptionKey)}</Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          ) : null}
          {doubleAuth.webPaymentBlocked ? (
            <Text style={[styles.error, { color: '#ef4444' }]}>{t('payments.requiresMfaOrApp')}</Text>
          ) : null}
          {doubleAuth.showDoubleBiometricHint ? (
            <Text style={[styles.verificationHint, { color: colors.textMuted }]}>
              {t('payments.doubleBiometricHint')}
            </Text>
          ) : null}
          {doubleAuth.showBiometricStepTwoHint ? (
            <Text style={[styles.verificationHint, { color: colors.textMuted }]}>
              {t('payments.mfaPlusBiometricHint')}
            </Text>
          ) : null}
          {doubleAuth.showFirstTotp ? (
            <>
              <Text style={[styles.verificationHint, { color: colors.textMuted }]}>
                {t('auth.paymentVerificationHintStep1')}
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
          {doubleAuth.showSecondTotp ? (
            <>
              <Text style={[styles.verificationHint, { color: colors.textMuted }]}>
                {t('payments.secondAuthenticatorHint')}
              </Text>
              <TextInput
                value={verificationCodeConfirm}
                onChangeText={(value) =>
                  onVerificationCodeConfirmChange?.(value.replace(/\D/g, '').slice(0, 6))
                }
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                placeholder={t('payments.secondAuthenticatorPlaceholder')}
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
                opacity: confirmDisabled ? 0.7 : 1,
              },
            ]}
            disabled={confirmDisabled}
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
    marginBottom: spacing.xs,
  },
  regionalMarket: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  error: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  methodBlock: {
    width: '100%',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  methodRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    padding: spacing.sm,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  methodDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
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
