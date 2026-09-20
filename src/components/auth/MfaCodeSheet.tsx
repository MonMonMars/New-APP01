import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { radii, spacing } from '../../theme';
import { modalFill } from '../../theme/modalFill';
import { AnimatedPressable } from '../AnimatedPressable';

type MfaCodeSheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  code: string;
  onChangeCode: (value: string) => void;
  loading?: boolean;
  errorMessage?: string | null;
  onSubmit: () => void;
  onClose: () => void;
};

export function MfaCodeSheet({
  visible,
  title,
  subtitle,
  code,
  onChangeCode,
  loading = false,
  errorMessage = null,
  onSubmit,
  onClose,
}: MfaCodeSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, modalFill]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={[styles.iconWrap, { backgroundColor: `${colors.gradientEnd}22` }]}>
            <Ionicons name="shield-checkmark-outline" size={28} color={colors.gradientEnd} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
          <TextInput
            value={code}
            onChangeText={(value) => onChangeCode(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            placeholder={t('auth.mfaCodePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            maxLength={6}
          />
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <AnimatedPressable
            style={[styles.confirmButton, { backgroundColor: colors.gradientEnd, opacity: code.length === 6 && !loading ? 1 : 0.5 }]}
            disabled={code.length !== 6 || loading}
            onPress={onSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#111" />
            ) : (
              <Text style={styles.confirmText}>{t('auth.mfaVerify')}</Text>
            )}
          </AnimatedPressable>
          <AnimatedPressable onPress={onClose} style={styles.cancelButton}>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  input: {
    marginTop: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
  },
  confirmButton: {
    marginTop: spacing.sm,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmText: {
    fontWeight: '800',
    color: '#111',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
