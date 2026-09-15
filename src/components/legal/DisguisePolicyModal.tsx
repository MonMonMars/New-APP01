import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguisePolicyModalProps = {
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
  onOpenFullPolicy?: () => void;
};

const bullets = [
  'Pulse disguises dating activity as a news/social feed for privacy in public.',
  'Disguise does not hide your data from Spark or make you anonymous to existing matches.',
  'Do not use disguise to harass, scam, or impersonate news organisations.',
  'Sample BBC, Verge, and ad brands in Pulse are illustrations — not real affiliations.',
  'Lock your device and use app lock — disguise cannot stop screenshots or device access.',
];

export function DisguisePolicyModal({
  visible,
  onAccept,
  onCancel,
  onOpenFullPolicy,
}: DisguisePolicyModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <AnimatedPressable onPress={onCancel} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>Disguise mode policy</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.hero, { backgroundColor: colors.surface }]}>
            <Ionicons name="eye-off" size={32} color={colors.gradientEnd} />
            <Text style={[styles.heroTitle, { color: colors.text }]}>Before you open Spark</Text>
            <Text style={[styles.heroBody, { color: colors.textMuted }]}>
              You are leaving Pulse and unlocking Spark. Please confirm you understand how disguise
              mode works.
            </Text>
          </View>

          {bullets.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: colors.gradientEnd }]}>•</Text>
              <Text style={[styles.bulletText, { color: colors.textMuted }]}>{bullet}</Text>
            </View>
          ))}

          {onOpenFullPolicy ? (
            <AnimatedPressable onPress={onOpenFullPolicy} style={styles.linkWrap}>
              <Text style={[styles.link, { color: colors.gradientEnd }]}>Read full Disguise Mode Policy</Text>
            </AnimatedPressable>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, borderTopColor: colors.border }]}>
          <AnimatedPressable style={[styles.primary, { backgroundColor: colors.gradientEnd }]} onPress={onAccept}>
            <Text style={styles.primaryText}>I understand — unlock Spark</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.secondary} onPress={onCancel}>
            <Text style={[styles.secondaryText, { color: colors.textMuted }]}>Stay in Pulse</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
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
  title: { fontSize: 17, fontWeight: '800' },
  spacer: { width: 24 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  hero: {
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' },
  heroBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: spacing.sm },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  bullet: { fontSize: 16, fontWeight: '800', lineHeight: 20 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
  linkWrap: { marginTop: spacing.md, alignItems: 'center' },
  link: { fontSize: 14, fontWeight: '700' },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  primary: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondary: { alignItems: 'center', paddingVertical: spacing.sm },
  secondaryText: { fontSize: 14, fontWeight: '600' },
});
