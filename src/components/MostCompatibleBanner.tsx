import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type MostCompatibleBannerProps = {
  profile: Profile;
  score: number;
  onPress: () => void;
};

export function MostCompatibleBanner({ profile, score, onPress }: MostCompatibleBannerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <AnimatedPressable
      style={[styles.banner, { backgroundColor: 'rgba(26, 26, 28, 0.88)', borderColor: colors.gradientEnd }]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Text style={[styles.label, { color: colors.gradientEnd }]}>{t('discover.mostCompatibleBadge')}</Text>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {t('discoverHub.matchScore', { name: profile.name, score })}
        </Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('discoverHub.mostCompatibleHint')}</Text>
      </View>
      <Image source={{ uri: profile.photos[0] }} style={styles.avatar} />
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  hint: {
    fontSize: 11,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
