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
};

export function ProfileCard({
  profile,
  index,
  activeIndex,
  translateX,
}: ProfileCardProps) {
  const isTop = index === activeIndex;

  const cardStyle = useAnimatedStyle(() => {
    if (!translateX || !isTop) {
      const offset = index - activeIndex;
      const scale = 1 - offset * 0.04;
      const translateY = offset * 10;
      return {
        transform: [{ scale }, { translateY }],
        opacity: offset > 2 ? 0 : 1,
      };
    }

    const rotate = interpolate(
      translateX.value,
      [-220, 0, 220],
      [-12, 0, 12],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStampStyle = useAnimatedStyle(() => {
    if (!translateX || !isTop) {
      return { opacity: 0 };
    }

    const opacity = interpolate(
      translateX.value,
      [40, 120],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return { opacity };
  });

  const nopeStampStyle = useAnimatedStyle(() => {
    if (!translateX || !isTop) {
      return { opacity: 0 };
    }

    const opacity = interpolate(
      translateX.value,
      [-120, -40],
      [1, 0],
      Extrapolation.CLAMP,
    );

    return { opacity };
  });

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.gradient}
      />

      <Animated.View style={[styles.stamp, styles.likeStamp, likeStampStyle]}>
        <Text style={styles.stampText}>LIKE</Text>
      </Animated.View>

      <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStampStyle]}>
        <Text style={styles.stampText}>NOPE</Text>
      </Animated.View>

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
  stamp: {
    position: 'absolute',
    top: 48,
    borderWidth: 4,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  likeStamp: {
    left: spacing.lg,
    borderColor: colors.like,
    transform: [{ rotate: '-18deg' }],
  },
  nopeStamp: {
    right: spacing.lg,
    borderColor: colors.nope,
    transform: [{ rotate: '18deg' }],
  },
  stampText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
