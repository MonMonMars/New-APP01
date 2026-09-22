import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type TwoFactorScreenProps = {
  onClose: () => void;
};

export function TwoFactorScreen({ onClose }: TwoFactorScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    mfaEnabled,
    refreshMfaStatus,
    startMfaEnrollment,
    completeMfaEnrollment,
    disableMfa,
    isSupabaseEnabled,
  } = useApp();

  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshMfaStatus();
  }, [refreshMfaStatus]);

  const handleStartEnroll = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const result = await startMfaEnrollment();
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setFactorId(result.factorId ?? null);
    setSecret(result.secret ?? null);
    setEnrolling(true);
  }, [startMfaEnrollment]);

  const handleConfirmEnroll = useCallback(async () => {
    if (!factorId) {
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await completeMfaEnrollment(factorId, code);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setEnrolling(false);
    setCode('');
    setFactorId(null);
    setSecret(null);
    setMessage(t('auth.mfaEnabledSuccess'));
    void refreshMfaStatus();
  }, [code, completeMfaEnrollment, factorId, refreshMfaStatus, t]);

  const handleDisable = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const result = await disableMfa();
    setBusy(false);
    setMessage(result.ok ? t('auth.mfaDisabledSuccess') : result.message);
    void refreshMfaStatus();
  }, [disableMfa, refreshMfaStatus, t]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel={t('common.close')}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>{t('auth.twoFactorTitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!isSupabaseEnabled ? (
          <Text style={[styles.body, { color: colors.textMuted }]}>{t('auth.twoFactorRequiresCloud')}</Text>
        ) : (
          <>
            <Text style={[styles.body, { color: colors.textMuted }]}>{t('auth.twoFactorBody')}</Text>
            {message ? <Text style={[styles.message, { color: colors.gradientEnd }]}>{message}</Text> : null}

            {mfaEnabled && !enrolling ? (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="shield-checkmark" size={24} color={colors.gradientEnd} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('auth.mfaActive')}</Text>
                <AnimatedPressable
                  style={[styles.dangerButton, { borderColor: colors.nope }]}
                  disabled={busy}
                  onPress={() => {
                    void handleDisable();
                  }}
                >
                  <Text style={[styles.dangerText, { color: colors.nope }]}>{t('auth.mfaDisable')}</Text>
                </AnimatedPressable>
              </View>
            ) : null}

            {!mfaEnabled && !enrolling ? (
              <AnimatedPressable
                style={[styles.primaryButton, { backgroundColor: colors.gradientEnd }]}
                disabled={busy}
                onPress={() => {
                  void handleStartEnroll();
                }}
              >
                <Text style={styles.primaryText}>{t('auth.mfaSetup')}</Text>
              </AnimatedPressable>
            ) : null}

            {enrolling ? (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('auth.mfaScanHint')}</Text>
                {secret ? (
                  <Text selectable style={[styles.secret, { color: colors.textMuted }]}>
                    {secret}
                  </Text>
                ) : null}
                <TextInput
                  value={code}
                  onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  placeholder={t('auth.mfaCodePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />
                <AnimatedPressable
                  style={[styles.primaryButton, { backgroundColor: colors.gradientEnd }]}
                  disabled={busy || code.length !== 6}
                  onPress={() => {
                    void handleConfirmEnroll();
                  }}
                >
                  <Text style={styles.primaryText}>{t('auth.mfaVerify')}</Text>
                </AnimatedPressable>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: 20, fontWeight: '800' },
  content: { padding: spacing.lg, gap: spacing.md },
  body: { fontSize: 15, lineHeight: 22 },
  message: { fontSize: 14, fontWeight: '600' },
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'stretch',
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  secret: { fontFamily: 'monospace', fontSize: 13 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 20,
    letterSpacing: 6,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryText: { color: '#111', fontWeight: '800', fontSize: 16 },
  dangerButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dangerText: { fontWeight: '700', fontSize: 15 },
});
