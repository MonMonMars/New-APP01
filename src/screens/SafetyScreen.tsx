import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { legalDocumentLinks, LegalDocumentId } from '../content/legalDocuments';
import { colors, radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

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
    message: 'Blocking removes them from your deck and chats immediately. Blocked profiles stay hidden for the rest of this session.',
  },
  {
    label: 'Safety tips & FAQ',
    icon: 'book-outline' as const,
    message: 'Meet in public, tell a friend your plans, and trust your instincts. Full FAQ at spark.app/safety.',
  },
  {
    label: 'Contact support',
    icon: 'mail-outline' as const,
    message: 'Email support@spark.app — we typically reply within one business day.',
  },
  {
    label: 'Trust & Verification Policy',
    icon: 'shield-checkmark-outline' as const,
    action: 'verification-policy' as const,
  },
  {
    label: 'Security settings',
    icon: 'lock-closed-outline' as const,
    action: 'security-settings' as const,
  },
];

const legalDocIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'document-text-outline': 'document-text-outline',
  'lock-closed-outline': 'lock-closed-outline',
  'people-outline': 'people-outline',
  'eye-off-outline': 'eye-off-outline',
  'shield-checkmark-outline': 'shield-checkmark-outline',
};

export function SafetyScreen({ onClose }: SafetyScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
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

        <Text style={styles.sectionTitle}>Legal & policies</Text>
        <Text style={styles.legalIntro}>
          Read our terms, privacy policy, and disguise-mode rules. Full bilingual text is in docs/legal/
          in the repository.
        </Text>
        {legalDocumentLinks.map((item) => (
          <AnimatedPressable
            key={item.id}
            style={styles.resourceRow}
            onPress={() => {
              if (item.id === 'verification') {
                navigation.getParent()?.navigate('VerificationPolicy');
                return;
              }
              navigation.getParent()?.navigate('LegalDocument', { documentId: item.id as LegalDocumentId });
            }}
          >
            <Ionicons
              name={legalDocIconMap[item.icon] ?? 'document-outline'}
              size={22}
              color={colors.textMuted}
            />
            <View style={styles.legalLabelWrap}>
              <Text style={styles.resourceLabel}>{item.label}</Text>
              <Text style={styles.legalLabelZh}>{item.labelZh}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </AnimatedPressable>
        ))}

        <Text style={styles.sectionTitle}>Quick actions</Text>
        {resources.map((item) => (
          <AnimatedPressable
            key={item.label}
            style={styles.resourceRow}
            onPress={() => {
              if ('action' in item && item.action === 'verification-policy') {
                navigation.getParent()?.navigate('VerificationPolicy');
                return;
              }
              if ('action' in item && item.action === 'security-settings') {
                navigation.getParent()?.navigate('SecuritySettings');
                return;
              }
              if ('message' in item && item.message) {
                Alert.alert(item.label, item.message);
              }
            }}
          >
            <Ionicons name={item.icon} size={22} color={colors.textMuted} />
            <Text style={styles.resourceLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </AnimatedPressable>
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
  legalIntro: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  legalLabelWrap: {
    flex: 1,
  },
  legalLabelZh: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
