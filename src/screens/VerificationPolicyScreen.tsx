import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocaleToggle } from '../components/legal/LocaleToggle';
import {
  getVerificationHowItWorksSteps,
  getVerificationPolicyEffective,
  getVerificationPolicySections,
  getVerificationPolicyTitle,
} from '../content/verificationPolicy';
import { useAppLocale } from '../hooks/useAppLocale';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type VerificationPolicyScreenProps = {
  onClose: () => void;
};

export function VerificationPolicyScreen({ onClose }: VerificationPolicyScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { locale } = useAppLocale();
  const title = getVerificationPolicyTitle(locale);
  const effective = getVerificationPolicyEffective(locale);
  const steps = getVerificationHowItWorksSteps(locale);
  const sections = getVerificationPolicySections(locale);
  const howToLabel = locale === 'zh-TW' ? '如何取得驗證' : 'How to get verified';
  const legalLabel = locale === 'zh-TW' ? '法律政策' : 'Legal policy';
  const footer =
    locale === 'zh-TW'
      ? '問題或申訴：support@spark.app — 主旨請包含「Verification」。'
      : 'Questions or appeals: support@spark.app — include "Verification" in the subject line.';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {locale === 'zh-TW' ? '驗證政策' : 'Verification policy'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LocaleToggle />

        <View style={[styles.hero, { backgroundColor: colors.surface }]}>
          <Ionicons name="shield-checkmark" size={32} color={colors.superLike} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.effective, { color: colors.textMuted }]}>{effective}</Text>
        </View>

        <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>{howToLabel}</Text>
        {steps.map((item) => (
          <View key={item.step} style={[styles.stepCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.stepBadge, { backgroundColor: colors.gradientEnd }]}>
              <Text style={styles.stepNum}>{item.step}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.stepBody, { color: colors.textMuted }]}>{item.body}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>{legalLabel}</Text>
        {sections.map((section) => (
          <View key={section.id} style={[styles.policyBlock, { borderColor: colors.border }]}>
            <Text style={[styles.policyTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.policyBody, { color: colors.textMuted }]}>{section.body}</Text>
          </View>
        ))}

        <Text style={[styles.footer, { color: colors.textMuted }]}>{footer}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  hero: {
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  effective: {
    fontSize: 13,
    marginTop: spacing.xs,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  stepCard: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  stepBody: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  policyBlock: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  policyBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
