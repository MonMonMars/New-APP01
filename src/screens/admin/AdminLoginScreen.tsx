import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import { radii, spacing } from '../../theme';

type Props = {
  onClose: () => void;
  navigation?: NativeStackNavigationProp<AdminStackParamList, 'AdminLogin'>;
};

export function AdminLoginScreen({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { signInAdmin, adminSession } = useAdmin();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (adminSession) {
    return null;
  }

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    const result = await signInAdmin(email);
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
