import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ProfileViewsCardProps = {
  viewers: Profile[];
  totalCount: number;
  canReveal: boolean;
  onUpgrade: () => void;
};

export function ProfileViewsCard({
  viewers,
  totalCount,
  canReveal,
  onUpgrade,
}: ProfileViewsCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (totalCount === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Ionicons name="eye-outline" size={20} color={colors.gradientEnd} />
          <Text style={[styles.title, { color: colors.text }]}>{t('profileViews.title')}</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t('profileViews.empty')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={20} color={colors.gradientEnd} />
        <Text style={[styles.title, { color: colors.text }]}>{t('profileViews.title')}</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.gradientEnd }]}>
          <Text style={[styles.countText, { color: colors.text }]}>{totalCount}</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {canReveal
          ? t('profileViews.checkedOut', { count: totalCount })
          : t('profileViews.upgrade')}
      </Text>

      <View style={styles.grid}>
        {viewers.slice(0, 6).map((profile) => (
          <View key={profile.id} style={styles.viewerWrap}>
            <Image source={{ uri: profile.photos[0] }} style={styles.viewerPhoto} />
            {canReveal ? (
              <Text style={[styles.viewerName, { color: colors.text }]} numberOfLines={1}>
                {profile.name}
              </Text>
            ) : (
              <>
                <View style={styles.blurFallback} />
                <Ionicons name="lock-closed" size={14} color={colors.text} style={styles.lockIcon} />
              </>
            )}
          </View>
        ))}
      </View>

      {!canReveal && (
        <AnimatedPressable
          style={[styles.upgradeButton, { backgroundColor: colors.gradientEnd }]}
          onPress={onUpgrade}
        >
          <Ionicons name="diamond" size={16} color={colors.text} />
          <Text style={[styles.upgradeText, { color: colors.text }]}>{t('profileViews.seeWho')}</Text>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  countBadge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  viewerWrap: {
    width: 72,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 36,
  },
  viewerPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  viewerName: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    maxWidth: 72,
    textAlign: 'center',
  },
  blurFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 32,
  },
  lockIcon: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderRadius: radii.button,
    paddingVertical: spacing.sm + 2,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
