import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type MfaLoginGateProps = {
  children: React.ReactNode;
};

/** Blocks the app until MFA (AAL2) is satisfied when the user has TOTP enrolled. */
export function MfaLoginGate({ children }: MfaLoginGateProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    mfaLoginRequired,
    verifyMfaLogin,
    refreshMfaLoginRequirement,
    isAuthenticated,
    isSupabaseEnabled,
    signOut,
  } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSupabaseEnabled && isAuthenticated) {
      void refreshMfaLoginRequirement();
    }
  }, [isAuthenticated, isSupabaseEnabled, refreshMfaLoginRequirement]);

  const handleVerify = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await verifyMfaLogin(code);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setCode('');
  }, [code, verifyMfaLogin]);

  if (!mfaLoginRequired) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.blocker, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${colors.gradientEnd}22` }]}>
        <Ionicons name="shield-checkmark-outline" size={32} color={colors.gradientEnd} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{t('auth.mfaLoginTitle')}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{t('auth.mfaLoginBody')}</Text>
      <TextInput
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        placeholder={t('auth.mfaCodePlaceholder')}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        maxLength={6}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AnimatedPressable
        style={[styles.button, { backgroundColor: colors.gradientEnd, opacity: code.length === 6 && !loading ? 1 : 0.5 }]}
        disabled={code.length !== 6 || loading}
        onPress={() => {
          void handleVerify();
        }}
      >
        {loading ? <ActivityIndicator color="#111" /> : <Text style={styles.buttonText}>{t('auth.mfaVerify')}</Text>}
      </AnimatedPressable>
      <AnimatedPressable
        style={styles.signOutLink}
        onPress={() => {
          void signOut();
        }}
      >
        <Text style={[styles.signOutText, { color: colors.textMuted }]}>{t('profile.signOut')}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  blocker: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'stretch',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  button: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '800',
    color: '#111',
    fontSize: 16,
  },
  signOutLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
