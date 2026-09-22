import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEFAULT_DEMO_ADMIN_EMAIL } from '../../admin/adminLocalAllowlist';
import { getAdminDemoPin } from '../../admin/adminAllowlist';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { radii, spacing } from '../../theme';

type Props = {
  onClose: () => void;
};

export function AdminLoginScreen({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { signInAdmin, adminSession } = useAdmin();
  const pinRequired = Boolean(getAdminDemoPin());
  const [email, setEmail] = useState(DEFAULT_DEMO_ADMIN_EMAIL);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (adminSession) {
    return null;
  }

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    const result = await signInAdmin(email, pinRequired ? pin : undefined);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ? t(result.error) : t('admin.signInFailed'));
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader title={t('admin.title')} leftIcon="close" onLeftPress={onClose} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]}>{t('admin.staffSignIn')}</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>{t('admin.signInHint')}</Text>
        <Text style={[styles.demoHint, { color: colors.gradientEnd }]}>{t('admin.defaultAccountHint')}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder={t('admin.emailPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        />
        {pinRequired ? (
          <TextInput
            secureTextEntry
            keyboardType="number-pad"
            placeholder={t('admin.pinPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={pin}
            onChangeText={setPin}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AnimatedPressable
          style={[styles.button, { backgroundColor: colors.gradientEnd }]}
          onPress={() => void handleSignIn()}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.buttonText}>{t('admin.continue')}</Text>
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 14, lineHeight: 20 },
  demoHint: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  error: { color: '#e74c3c', fontSize: 13, fontWeight: '600' },
  button: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: { fontWeight: '800', fontSize: 16, color: '#111' },
});
