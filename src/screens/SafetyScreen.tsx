import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { colors, radii, spacing } from '../theme';

type SafetyScreenProps = {
  onClose: () => void;
};

const tips = [
  {
    icon: 'location' as const,
    title: 'Meet in public',
    body: 'First dates should be in busy, public places. Tell a friend where you are going.',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'Trust your instincts',
    body: 'If something feels off, leave. You can unmatch and report anytime.',
  },
  {
    icon: 'lock-closed' as const,
    title: 'Protect personal info',
    body: 'Don\'t share your address, workplace, or financial details in early chats.',
  },
  {
    icon: 'videocam' as const,
    title: 'Video chat first',
    body: 'A quick video call before meeting helps verify who you\'re talking to.',
  },
];

const resources = [
  {
    label: 'Report a profile',
    icon: 'flag-outline' as const,
    message: 'Open any profile or chat, tap the menu, and choose Report. We review every report within 24 hours.',
  },
  {
    label: 'Block someone',
    icon: 'hand-left-outline' as const,
    message: 'Blocking removes them from your deck and chats immediately. You can unblock from Profile → Safety.',
  },
  {
    label: 'Safety tips & FAQ',
    icon: 'book-outline' as const,
    message: 'Meet in public, tell a friend your plans, and trust your instincts. Full FAQ at spark.app/safety (demo).',
  },
  {
    label: 'Contact support',
    icon: 'mail-outline' as const,
    message: 'Email support@spark.app — demo builds show this confirmation only.',
  },
];

export function SafetyScreen({ onClose }: SafetyScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Safety Center</Text>
        <DisguiseModeButton />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark" size={32} color={colors.like} />
          <Text style={styles.bannerTitle}>Your safety matters</Text>
          <Text style={styles.bannerBody}>
            Spark is built with safety in mind. Review these tips before your first date.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Safety tips</Text>
        {tips.map((tip) => (
          <View key={tip.title} style={styles.tipCard}>
            <Ionicons name={tip.icon} size={24} color={colors.gradientEnd} />
            <View style={styles.tipText}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipBody}>{tip.body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Quick actions</Text>
        {resources.map((item) => (
          <Pressable
            key={item.label}
            style={styles.resourceRow}
            onPress={() => Alert.alert(item.label, item.message)}
          >
            <Ionicons name={item.icon} size={22} color={colors.textMuted} />
            <Text style={styles.resourceLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  banner: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  bannerBody: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipText: {
    flex: 1,
  },
  tipTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  tipBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2E',
  },
  resourceLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
});
