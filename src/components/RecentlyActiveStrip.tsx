import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { Profile } from '../types/profile';
import { spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type RecentlyActiveStripProps = {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
};

export function RecentlyActiveStrip({ profiles, onSelect }: RecentlyActiveStripProps) {
  const { colors } = useTheme();

  if (profiles.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <View style={styles.liveDot} />
          <Text style={[styles.title, { color: colors.text }]}>Recently active</Text>
        </View>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No one active nearby right now — check back later today.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.liveDot} />
        <Text style={[styles.title, { color: colors.text }]}>Recently active</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {profiles.map((profile) => (
          <AnimatedPressable key={profile.id} style={styles.item} onPress={() => onSelect(profile)}>
            <View style={[styles.ring, { borderColor: colors.like }]}>
              <Image source={{ uri: profile.photos[0] }} style={styles.avatar} />
            </View>
            <Text style={[styles.name, { color: colors.textMuted }]} numberOfLines={1}>
              {profile.name}
            </Text>
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
    backgroundColor: '#21D07A',
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
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
});
