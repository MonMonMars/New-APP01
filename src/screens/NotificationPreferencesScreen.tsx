import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { NotificationPreferences } from '../types/settings';
import { spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type NotificationPreferencesScreenProps = {
  onClose: () => void;
};

type ToggleRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
};

function ToggleRow({ icon, label, description, value, onToggle }: ToggleRowProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon} size={22} color={colors.textMuted} />
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.gradientEnd }}
        thumbColor={colors.text}
      />
    </View>
  );
}

export function NotificationPreferencesScreen({ onClose }: NotificationPreferencesScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { notificationPreferences, updateNotificationPreferences, enableNotifications, notificationsEnabled } =
    useApp();

  const toggle = (key: keyof NotificationPreferences) => (value: boolean) => {
    updateNotificationPreferences({ ...notificationPreferences, [key]: value });
    if (value && !notificationsEnabled && key !== 'marketing' && key !== 'disguiseSafe') {
      void enableNotifications();
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>{t('notifications.title')}</Text>
        <DisguiseModeButton />
      </View>

      <Text style={[styles.section, { color: colors.textMuted }]}>{t('notifications.pushSection')}</Text>

      <ToggleRow
        icon="heart"
        label={t('notifications.newMatches')}
        description={t('notifications.newMatchesHint')}
        value={notificationPreferences.matches}
        onToggle={toggle('matches')}
      />
      <ToggleRow
        icon="chatbubble"
        label={t('notifications.messages')}
        description={t('notifications.messagesHint')}
        value={notificationPreferences.messages}
        onToggle={toggle('messages')}
      />
      <ToggleRow
        icon="star"
        label={t('notifications.likes')}
        description={t('notifications.likesHint')}
        value={notificationPreferences.likes}
        onToggle={toggle('likes')}
      />
      <ToggleRow
        icon="star-half"
        label={t('notifications.superLikes')}
        description={t('notifications.superLikesHint')}
        value={notificationPreferences.superLikes}
        onToggle={toggle('superLikes')}
      />
      <ToggleRow
        icon="flash"
        label={t('notifications.boosts')}
        description={t('notifications.boostsHint')}
        value={notificationPreferences.boosts}
        onToggle={toggle('boosts')}
      />

      <Text style={[styles.section, { color: colors.textMuted, marginTop: spacing.lg }]}>
        {t('notifications.disguiseSection')}
      </Text>
      <ToggleRow
        icon="eye-off-outline"
        label={t('notifications.neutralLockScreen')}
        description={t('notifications.neutralLockScreenHint')}
        value={notificationPreferences.disguiseSafe}
        onToggle={toggle('disguiseSafe')}
      />

      <Text style={[styles.section, { color: colors.textMuted, marginTop: spacing.lg }]}>
        {t('notifications.marketingSection')}
      </Text>
      <ToggleRow
        icon="megaphone-outline"
        label={t('notifications.tipsOffers')}
        description={t('notifications.tipsOffersHint')}
        value={notificationPreferences.marketing}
        onToggle={toggle('marketing')}
      />

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {t('notifications.webLimit')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  back: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xl,
  },
});
