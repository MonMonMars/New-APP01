import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEGAL_ENTITY } from '../constants/legalEntity';
import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type SecurityProtocolsScreenProps = {
  onClose: () => void;
};

const protocols = [
  {
    icon: 'key-outline' as const,
    title: 'Strong app lock',
    body:
      'Use Face ID, Touch ID, or a 4–6 digit PIN before leaving Pulse. Failed attempts lock out for 5 minutes after 5 tries.',
  },
  {
    icon: 'eye-off-outline' as const,
    title: 'Disguise by default',
    body:
      'Pulse hides dating UI on your lock screen and in the app switcher. Enable auto-disguise when you background the app.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Encrypted local storage',
    body:
      'PIN hashes and sensitive chat data use device secure storage. Messages are obfuscated on disk — never share your device passcode.',
  },
  {
    icon: 'camera-outline' as const,
    title: 'Screenshot protection',
    body:
      'On iOS and Android, Spark blocks screenshots and screen recording on dating screens. Web previews cannot enforce this — use native apps for sensitive sessions.',
  },
  {
    icon: 'warning-outline' as const,
    title: 'Report suspicious activity',
    body:
      'Block and report profiles from any card or chat. We log abuse reports for review. Email security@spark.app for urgent safety issues.',
  },
  {
    icon: 'link-outline' as const,
    title: 'Never share login links',
    body:
      'Spark will never ask for your password in chat. Ignore messages with external login links, gift-card scams, or requests to move to encrypted apps immediately.',
  },
  {
    icon: 'cloud-offline-outline' as const,
    title: 'No client-side API keys',
    body:
      'Production builds proxy AI and payment calls through our backend. Never paste API keys into the app or share debug builds publicly.',
  },
  {
    icon: 'refresh-outline' as const,
    title: 'Session timeout',
    body:
      'After 5 minutes in the background, Spark re-locks and returns to Pulse. Short timeouts reduce risk if your phone is unattended.',
  },
];

export function SecurityProtocolsScreen({ onClose }: SecurityProtocolsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>Security protocols</Text>
        <DisguiseModeButton />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: colors.surface }]}>
          <Ionicons name="lock-closed" size={28} color={colors.gradientEnd} />
          <Text style={[styles.bannerTitle, { color: colors.text }]}>Stay safe from hackers</Text>
          <Text style={[styles.bannerBody, { color: colors.textMuted }]}>
            Spark layers device security, disguise mode, and abuse reporting to reduce phishing,
            shoulder-surfing, and account takeover risk.
          </Text>
        </View>

        {protocols.map((item) => (
          <View
            key={item.title}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name={item.icon} size={22} color={colors.gradientEnd} />
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardBody, { color: colors.textMuted }]}>{item.body}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Security contact: {LEGAL_ENTITY.securityEmail} · Include screenshots and profile IDs when
          reporting abuse.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  banner: {
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', marginTop: spacing.sm },
  bannerBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: spacing.sm },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardBody: { fontSize: 13, lineHeight: 19 },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.md },
});
