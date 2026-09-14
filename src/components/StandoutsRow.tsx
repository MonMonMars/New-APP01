import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';

type StandoutsRowProps = {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
};

export function StandoutsRow({ profiles, onSelect }: StandoutsRowProps) {
  const { colors } = useTheme();

  if (profiles.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={[styles.title, { color: colors.text }]}>Standouts</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Top Picks today</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {profiles.map((profile) => (
          <Pressable
            key={profile.id}
            style={[styles.card, { borderColor: colors.superLike }]}
            onPress={() => onSelect(profile)}
          >
            <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
            <View style={styles.badge}>
              <Ionicons name="rose" size={12} color={colors.superLike} />
            </View>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {profile.name}
            </Text>
          </Pressable>
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
    backgroundColor: 'rgba(30,195,255,0.08)',
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
});
