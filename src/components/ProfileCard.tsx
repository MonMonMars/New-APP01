import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { colors, radii, spacing } from '../theme';
import { Profile } from '../types/profile';

type ProfileCardProps = {
  profile: Profile;
  index: number;
  activeIndex: number;
  translateX?: SharedValue<number>;
  translateY?: SharedValue<number>;
  scale?: SharedValue<number>;
};

export function ProfileCard({
  profile,
  index,
  activeIndex,
  translateX,
  translateY,
  scale,
}: ProfileCardProps) {
  const isTop = index === activeIndex;

  const cardStyle = useAnimatedStyle(() => {
    if (!translateX || !translateY || !isTop) {
      const offset = index - activeIndex;
      const stackScale = 1 - offset * 0.04;
      const stackTranslateY = offset * 10;
      return {
        transform: [{ scale: stackScale }, { translateY: stackTranslateY }],
        opacity: offset > 2 ? 0 : 1,
      };
    }

    const dragScale = scale?.value ?? 1;
    const rotate = interpolate(
      translateX.value,
      [-120, 0, 120],
      [-6, 0, 6],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: dragScale },
      ],
    };
  });

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.gradient}
      />

      <View style={styles.info}>
        <Text style={styles.name}>
          {profile.name}, {profile.age}
        </Text>
        <Text style={styles.distance}>{profile.distanceMiles} miles away</Text>
        <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
        <View style={styles.tags}>
          {profile.interests.map((interest) => (
            <View key={interest} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  info: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  distance: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  bio: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  tagText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
