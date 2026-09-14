import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';

type HeldProfilesRowProps = {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
  onRemove: (profileId: string) => void;
};

/** LoveJack-inspired Hold — bookmark without liking or passing. */
export function HeldProfilesRow({ profiles, onSelect, onRemove }: HeldProfilesRowProps) {
  const { colors } = useTheme();

  if (profiles.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Ionicons name="bookmark" size={15} color={colors.gradientEnd} />
        <Text style={[styles.title, { color: colors.text }]}>On Hold</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Saved for later</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {profiles.map((profile) => (
          <View key={profile.id} style={styles.cardWrap}>
            <Pressable
              style={[styles.card, { borderColor: colors.border }]}
              onPress={() => onSelect(profile)}
            >
              <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {profile.name}
              </Text>
            </Pressable>
            <Pressable style={styles.remove} onPress={() => onRemove(profile.id)}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  row: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  cardWrap: {
    position: 'relative',
  },
  card: {
    width: 72,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.card,
    padding: 4,
  },
  photo: {
    width: 64,
    height: 80,
    borderRadius: radii.card - 4,
  },
  name: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    maxWidth: 68,
  },
  remove: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
