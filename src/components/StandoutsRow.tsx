import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { EmberStatusChips } from './EmberStatusChips';

type StandoutsRowProps = {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
};

export function StandoutsRow({ profiles, onSelect }: StandoutsRowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (profiles.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Ionicons name="star" size={16} color={colors.superLike} />
          <Text style={[styles.title, { color: colors.text }]}>{t('discoverHub.standouts')}</Text>
        </View>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t('discoverHub.standoutsEmpty')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Ionicons name="star" size={16} color={colors.superLike} />
        <Text style={[styles.title, { color: colors.text }]}>{t('discoverHub.standouts')}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('discoverHub.standoutsToday')}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {profiles.map((profile) => (
          <AnimatedPressable
            key={profile.id}
            style={[styles.card, { borderColor: colors.superLike, backgroundColor: `${colors.superLike}14` }]}
            onPress={() => onSelect(profile)}
            accessibilityRole="button"
            accessibilityLabel={t('discoverHub.viewProfileA11y', { name: profile.name })}
          >
            <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
            <View style={styles.badge}>
              <Ionicons name="rose" size={12} color={colors.superLike} />
            </View>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {profile.name}
            </Text>
            <View style={styles.chips}>
              <EmberStatusChips profile={profile} compact />
            </View>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  row: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    width: 88,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radii.card,
    padding: 4,
    backgroundColor: 'transparent',
  },
  photo: {
    width: 76,
    height: 96,
    borderRadius: radii.card - 4,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    maxWidth: 80,
  },
  chips: {
    marginTop: 4,
    maxWidth: 80,
    alignItems: 'center',
  },
});
