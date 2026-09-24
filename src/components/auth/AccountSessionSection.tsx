import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type AccountSessionSectionProps = {
  /** Called after sign-out or switch-account (e.g. close modal screen). */
  onSessionChanged?: () => void;
};

function sessionStatusKey(
  isAuthenticated: boolean,
  isSupabaseEnabled: boolean,
  userId: string | null,
): 'guest' | 'local' | 'cloud' | 'anonymous' {
  if (!isAuthenticated || !userId) {
    return 'anonymous';
  }
  if (userId.startsWith('demo-') || userId.startsWith('demo-email-') || userId.startsWith('demo-phone-')) {
    return 'guest';
  }
  if (isSupabaseEnabled) {
    return 'cloud';
  }
  return 'local';
}

export function AccountSessionSection({ onSessionChanged }: AccountSessionSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isAuthenticated, isSupabaseEnabled, userId, signOut, restartCloudSignIn } = useApp();

  const status = sessionStatusKey(isAuthenticated, isSupabaseEnabled, userId);
  const statusHint =
    status === 'cloud'
      ? t('privacy.accountStatusCloud')
      : status === 'guest'
        ? t('privacy.accountStatusGuest')
        : status === 'local'
          ? t('privacy.accountStatusLocal')
          : t('privacy.accountStatusAnonymous');

  const confirmSignOut = () => {
    Alert.alert(t('profile.signOutTitle'), t('profile.signOutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOutConfirm'),
        style: 'destructive',
        onPress: () => {
          void signOut().then(() => onSessionChanged?.());
        },
      },
    ]);
  };

  const confirmSwitchAccount = () => {
    Alert.alert(t('privacy.switchAccountTitle'), t('privacy.switchAccountBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('privacy.switchAccountConfirm'),
        onPress: () => {
          restartCloudSignIn();
          onSessionChanged?.();
        },
      },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.section, { color: colors.textMuted }]}>{t('privacy.accountSignIn')}</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.statusRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="person-circle-outline" size={22} color={colors.gradientEnd} />
          <Text style={[styles.statusText, { color: colors.textMuted }]}>{statusHint}</Text>
        </View>
        {(isAuthenticated || userId) && (
          <AnimatedPressable
            style={[styles.actionRow, { borderBottomColor: colors.border }]}
            onPress={confirmSignOut}
            accessibilityRole="button"
            accessibilityLabel={t('profile.signOut')}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.text} />
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{t('profile.signOut')}</Text>
              <Text style={[styles.actionHint, { color: colors.textMuted }]}>{t('privacy.signOutHint')}</Text>
            </View>
          </AnimatedPressable>
        )}
        <AnimatedPressable
          style={styles.actionRow}
          onPress={confirmSwitchAccount}
          accessibilityRole="button"
          accessibilityLabel={t('privacy.switchAccount')}
        >
          <Ionicons name="swap-horizontal-outline" size={22} color={colors.gradientEnd} />
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>{t('privacy.switchAccount')}</Text>
            <Text style={[styles.actionHint, { color: colors.textMuted }]}>
              {t('privacy.switchAccountHint')}
            </Text>
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  section: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusText: { flex: 1, fontSize: 14, lineHeight: 20 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700' },
  actionHint: { fontSize: 12, lineHeight: 17, marginTop: 2 },
});
