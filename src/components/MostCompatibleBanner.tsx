import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';

type MostCompatibleBannerProps = {
  profile: Profile;
  score: number;
  onPress: () => void;
};

export function MostCompatibleBanner({ profile, score, onPress }: MostCompatibleBannerProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.banner, { backgroundColor: 'rgba(26, 26, 28, 0.88)', borderColor: colors.gradientEnd }]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Text style={[styles.label, { color: colors.gradientEnd }]}>Most Compatible</Text>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {profile.name} · {score}% match
        </Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Tap to view today&apos;s top pick</Text>
      </View>
      <Image source={{ uri: profile.photos[0] }} style={styles.avatar} />
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
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
