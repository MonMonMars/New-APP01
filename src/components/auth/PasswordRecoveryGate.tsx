import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { radii, spacing } from '../../theme';
import { pulseBrand } from '../../theme/pulseBrand';
import { AnimatedPressable } from '../AnimatedPressable';

type PasswordRecoveryGateProps = {
  children: React.ReactNode;
};

/** Shown after the user opens a password reset link — set a new password, then continue. */
export function PasswordRecoveryGate({ children }: PasswordRecoveryGateProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { passwordRecoveryActive, completePasswordReset, clearPasswordRecovery } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    setError(null);
    const result = await completePasswordReset(password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDone(true);
    setPassword('');
    setConfirm('');
  }, [completePasswordReset, confirm, password, t]);

  const showGate = passwordRecoveryActive || done;

  if (!showGate) {
    return <>{children}</>;
  }

  if (done) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl }]}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <Ionicons name="checkmark-circle" size={48} color={pulseBrand.accent} style={styles.centerIcon} />
          <Text style={[styles.title, { color: colors.text }]}>{t('auth.passwordResetSuccessTitle')}</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>{t('auth.passwordResetSuccessBody')}</Text>
          <AnimatedPressable
            style={[styles.button, { backgroundColor: pulseBrand.accent }]}
            onPress={() => {
              setDone(false);
              clearPasswordRecovery();
            }}
          >
            <Text style={styles.buttonText}>{t('auth.continueAfterReset')}</Text>
          </AnimatedPressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Ionicons name="key-outline" size={40} color={pulseBrand.accent} style={styles.centerIcon} />
        <Text style={[styles.title, { color: colors.text }]}>{t('auth.passwordResetTitle')}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>{t('auth.passwordResetBody')}</Text>

        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder={t('auth.newPasswordPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AnimatedPressable
          style={[styles.button, { backgroundColor: pulseBrand.accent, opacity: loading ? 0.7 : 1 }]}
          disabled={loading || password.length < 8 || confirm.length < 8}
          onPress={() => {
            void handleSubmit();
          }}
        >
          {loading ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.buttonText}>{t('auth.saveNewPassword')}</Text>
          )}
        </AnimatedPressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  centerIcon: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
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
    fontSize: 16,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    marginTop: spacing.md,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '800',
    fontSize: 16,
    color: '#111',
  },
});
