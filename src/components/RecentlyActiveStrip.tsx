import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { EmberStatusChips } from './EmberStatusChips';

type RecentlyActiveStripProps = {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
};

export function RecentlyActiveStrip({ profiles, onSelect }: RecentlyActiveStripProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (profiles.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <View style={[styles.liveDot, { backgroundColor: colors.like }]} />
          <Text style={[styles.title, { color: colors.text }]}>{t('discoverHub.recentlyActive')}</Text>
        </View>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t('discoverHub.recentlyActiveEmpty')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={[styles.liveDot, { backgroundColor: colors.like }]} />
        <Text style={[styles.title, { color: colors.text }]}>{t('discoverHub.recentlyActive')}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {profiles.map((profile) => (
          <AnimatedPressable
            key={profile.id}
            style={styles.item}
            onPress={() => onSelect(profile)}
            accessibilityRole="button"
            accessibilityLabel={t('discoverHub.viewProfileA11y', { name: profile.name })}
          >
            <View style={[styles.ring, { borderColor: colors.like }]}>
              <Image source={{ uri: profile.photos[0] }} style={styles.avatar} />
            </View>
            <Text style={[styles.name, { color: colors.textMuted }]} numberOfLines={1}>
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
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  item: {
    alignItems: 'center',
    width: 64,
  },
  ring: {
    padding: 2,
    borderRadius: 32,
    borderWidth: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  name: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    maxWidth: 64,
    textAlign: 'center',
  },
  chips: {
    marginTop: 2,
    maxWidth: 64,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
});
