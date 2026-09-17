import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AiPersonaBadge } from './AiPersonaBadge';
import { VideoProfileOverlay } from './VideoProfileOverlay';
import { VerificationBadges } from './VerificationBadges';
import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import {
  emberLocationLine,
  emberRelationshipLabel,
  emberVisiblePhotoCount,
  Profile,
} from '../types/profile';
import { AnimatedPressable } from './AnimatedPressable';
import { EmberStatusChips } from './EmberStatusChips';

type ProfileCardProps = {
  profile: Profile;
  index: number;
  activeIndex: number;
  translateX?: SharedValue<number>;
  translateY?: SharedValue<number>;
  scale?: SharedValue<number>;
  passDim?: SharedValue<number>;
  compact?: boolean;
  onPhotoTap?: (side: 'left' | 'right') => void;
  onOpenDetail?: () => void;
};

export function ProfileCard({
  profile,
  index,
  activeIndex,
  translateX,
  translateY,
  scale,
  passDim,
  compact = false,
  onPhotoTap,
  onOpenDetail,
}: ProfileCardProps) {
  const { colors } = useTheme();
  const isTop = index === activeIndex;
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoCount = profile.photos.length;
  const emberStatus = emberRelationshipLabel(profile.relationshipStatus);
  const visiblePhotoCount = emberStatus
    ? emberVisiblePhotoCount(photoCount, profile.emberDiscretion)
    : photoCount;
  const spotlightPulse = useSharedValue(0);

  useEffect(() => {
    if (profile.spotlight && isTop) {
      spotlightPulse.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }
  }, [isTop, profile.id, profile.spotlight, spotlightPulse]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [profile.id]);

  const cardStyle = useAnimatedStyle(() => {
    if (!translateX || !translateY || !isTop) {
      const offset = index - activeIndex;
      const stackScale = 1 - offset * 0.03;
      const stackTranslateY = offset * 8;
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

  const passDimStyle = useAnimatedStyle(() => ({
    opacity: passDim?.value ?? 0,
  }));

  const spotlightStyle = useAnimatedStyle(() => {
    if (!profile.spotlight || !isTop) {
      return { opacity: 0 };
    }
    const pulse = 0.4 + spotlightPulse.value * 0.6;
    return {
      opacity: pulse,
    };
  });

  const goToPhoto = (side: 'left' | 'right') => {
    if (visiblePhotoCount <= 1) {
      return;
    }
    setPhotoIndex((current) => {
      if (side === 'left') {
        return current === 0 ? visiblePhotoCount - 1 : current - 1;
      }
      return current === visiblePhotoCount - 1 ? 0 : current + 1;
    });
    onPhotoTap?.(side);
  };

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      {profile.spotlight && isTop && (
        <Animated.View style={[styles.spotlightRing, spotlightStyle, { borderColor: colors.heartPink }]} pointerEvents="none" />
      )}
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
      {isTop && passDim && (
        <Animated.View style={[styles.passDimOverlay, passDimStyle]} pointerEvents="none" />
      )}

      {profile.mostCompatible && isTop && (
        <View style={styles.compatibleBadge}>
          <Text style={styles.compatibleBadgeText}>Most Compatible</Text>
        </View>
      )}

      {profile.spotlight && isTop && (
        <View style={[styles.crushBadge, { backgroundColor: colors.heartRed }]}>
          <Text style={styles.crushBadgeText}>Crush</Text>
        </View>
      )}

      {profile.hasVideo && isTop && <VideoProfileOverlay visible profile={profile} />}

      {isTop && onOpenDetail && (
        <AnimatedPressable style={styles.infoButton} onPress={onOpenDetail}>
          <Ionicons name="information-circle" size={28} color={colors.text} />
        </AnimatedPressable>
      )}

      {isTop && photoCount > 1 && (
        <>
          <View style={styles.dots}>
            {profile.photos.map((_, dotIndex) => {
              const locked = dotIndex >= visiblePhotoCount;
              return (
                <View
                  key={`${profile.id}-dot-${dotIndex}`}
                  style={[
                    styles.dot,
                    dotIndex === photoIndex && styles.dotActive,
                    locked && styles.dotLocked,
                  ]}
                />
              );
            })}
          </View>
          {visiblePhotoCount < photoCount ? (
            <View style={styles.privateBadge}>
              <Ionicons name="lock-closed" size={11} color={colors.ember} />
              <Text style={styles.privateBadgeText}>Private photos</Text>
            </View>
          ) : null}
          <View style={styles.tapZones}>
            <AnimatedPressable style={styles.tapZone} onPress={() => goToPhoto('left')} />
            <AnimatedPressable style={styles.tapZone} onPress={() => goToPhoto('right')} />
          </View>
        </>
      )}

      <View style={[styles.info, compact && styles.infoCompact]}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, compact && styles.nameCompact]}>
            {profile.name}, {profile.age}
          </Text>
          <AiPersonaBadge profile={profile} compact />
          <VerificationBadges
            photoVerified={profile.photoVerified ?? profile.verified}
            personVerified={profile.personVerified ?? profile.verified}
            size="sm"
          />
          {emberStatus ? (
            <View style={styles.discreetChipWrap}>
              <EmberStatusChips profile={profile} compact />
            </View>
          ) : null}
        </View>
        {profile.job && <Text style={[styles.job, compact && styles.jobCompact]}>{profile.job}</Text>}
        <Text style={[styles.distance, compact && styles.distanceCompact]}>
          {emberStatus
            ? emberLocationLine(profile)
            : `${profile.city ? `${profile.city} · ` : ''}${profile.distanceMiles} mi`}
        </Text>
        {!compact && (
          <>
            <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
            <View style={styles.tags}>
              {profile.interests.slice(0, 3).map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: palette.surface,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  spotlightRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.card,
    borderWidth: 3,
    zIndex: 5,
  },
  passDimOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 4,
  },
  compatibleBadge: {
    position: 'absolute',
    top: spacing.md + 28,
    left: spacing.md,
    backgroundColor: palette.boost,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    zIndex: 6,
  },
  compatibleBadgeText: {
    color: palette.text,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  crushBadge: {
    position: 'absolute',
    top: spacing.md + 12,
    right: spacing.md,
    backgroundColor: palette.heartRed,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    zIndex: 6,
  },
  crushBadgeText: {
    color: palette.text,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    backgroundColor: palette.text,
  },
  dotLocked: {
    backgroundColor: 'rgba(255, 176, 32, 0.55)',
  },
  privateBadge: {
    position: 'absolute',
    top: spacing.md + 14,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 15, 16, 0.72)',
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    zIndex: 6,
  },
  privateBadgeText: {
    color: palette.ember,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tapZones: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  infoButton: {
    position: 'absolute',
    bottom: spacing.lg + 8,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 7,
  },
  info: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
  },
  infoCompact: {
    bottom: spacing.lg + 52,
    left: spacing.sm + 4,
    right: spacing.sm + 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  name: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '700',
  },
  nameCompact: {
    fontSize: 24,
  },
  discreetChipWrap: {
    maxWidth: '100%',
  },
  job: {
    color: palette.text,
    fontSize: 15,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  jobCompact: {
    fontSize: 13,
  },
  distance: {
    color: palette.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  distanceCompact: {
    fontSize: 12,
  },
  bio: {
    color: palette.text,
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
    color: palette.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
