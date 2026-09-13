import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
  onPhotoTap?: (side: 'left' | 'right') => void;
};

export function ProfileCard({
  profile,
  index,
  activeIndex,
  translateX,
  translateY,
  scale,
  onPhotoTap,
}: ProfileCardProps) {
  const isTop = index === activeIndex;
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoCount = profile.photos.length;

  useEffect(() => {
    setPhotoIndex(0);
  }, [profile.id]);

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

  const goToPhoto = (side: 'left' | 'right') => {
    if (photoCount <= 1) {
      return;
    }
    setPhotoIndex((current) => {
      if (side === 'left') {
        return current === 0 ? photoCount - 1 : current - 1;
      }
      return current === photoCount - 1 ? 0 : current + 1;
    });
    onPhotoTap?.(side);
  };

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <Image
        source={{ uri: profile.photos[photoIndex] }}
        style={styles.photo}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.35, 1]}
        style={styles.gradient}
      />

      {isTop && photoCount > 1 && (
        <>
          <View style={styles.dots}>
            {profile.photos.map((_, dotIndex) => (
              <View
                key={`${profile.id}-dot-${dotIndex}`}
                style={[styles.dot, dotIndex === photoIndex && styles.dotActive]}
              />
            ))}
          </View>
          <View style={styles.tapZones}>
            <Pressable style={styles.tapZone} onPress={() => goToPhoto('left')} />
            <Pressable style={styles.tapZone} onPress={() => goToPhoto('right')} />
          </View>
        </>
      )}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {profile.name}, {profile.age}
          </Text>
          {profile.verified && (
            <Ionicons name="checkmark-circle" size={20} color={colors.superLike} />
          )}
        </View>
        {profile.job && <Text style={styles.job}>{profile.job}</Text>}
        <Text style={styles.distance}>{profile.distanceMiles} miles away</Text>
        <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
        <View style={styles.tags}>
          {profile.interests.slice(0, 3).map((interest) => (
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
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  dots: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: colors.text,
  },
  tapZones: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  info: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  job: {
    color: colors.text,
    fontSize: 15,
    marginTop: spacing.xs,
    opacity: 0.9,
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
