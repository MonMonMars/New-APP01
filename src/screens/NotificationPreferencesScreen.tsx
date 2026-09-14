import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
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
  const { notificationPreferences, updateNotificationPreferences } = useApp();

  const toggle = (key: keyof NotificationPreferences) => (value: boolean) => {
    updateNotificationPreferences({ ...notificationPreferences, [key]: value });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <DisguiseModeButton />
      </View>

      <Text style={[styles.section, { color: colors.textMuted }]}>Push notifications</Text>

      <ToggleRow
        icon="heart"
        label="New matches"
        description="When someone likes you back"
        value={notificationPreferences.matches}
        onToggle={toggle('matches')}
      />
      <ToggleRow
        icon="chatbubble"
        label="Messages"
        description="When you receive a new message"
        value={notificationPreferences.messages}
        onToggle={toggle('messages')}
      />
      <ToggleRow
        icon="star"
        label="Likes"
        description="When someone likes your profile"
        value={notificationPreferences.likes}
        onToggle={toggle('likes')}
      />

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        On web, push notifications are limited. Use a real device for the full experience.
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
