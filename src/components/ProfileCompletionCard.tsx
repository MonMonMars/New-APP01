import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { ProfileTip } from '../utils/profileCompletion';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ProfileCompletionCardProps = {
  score: number;
  tips: ProfileTip[];
  onEditPress: () => void;
};

/** Bumble AI Profile Guidance–inspired completion meter (rule-based). */
export function ProfileCompletionCard({ score, tips, onEditPress }: ProfileCompletionCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const incomplete = tips.filter((tip) => !tip.done);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t('profile.profileStrength')}</Text>
          <Text style={[styles.score, { color: colors.gradientEnd }]}>{t('profile.percentComplete', { score })}</Text>
        </View>
        <AnimatedPressable style={[styles.editButton, { borderColor: colors.gradientEnd }]} onPress={onEditPress}>
          <Text style={[styles.editText, { color: colors.gradientEnd }]}>{t('common.improve')}</Text>
        </AnimatedPressable>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: colors.gradientEnd }]} />
      </View>
      {incomplete.slice(0, 2).map((tip) => (
        <View key={tip.id} style={styles.tipRow}>
          <Ionicons name="bulb-outline" size={14} color={colors.gradientEnd} />
          <Text style={[styles.tipText, { color: colors.textMuted }]}>{tip.suggestion ?? tip.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
