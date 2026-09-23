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
import {
  discoverDotsRightInset,
  discoverInfoButtonRightInset,
  DISCOVER_INFO_BUTTON_SIZE,
  DISCOVER_INFO_ICON_SIZE,
  DISCOVER_INFO_TOP,
  discoverLeftBadgeTop,
  discoverPhotoTapBottomInset,
  discoverPhotoTapTopInset,
  discoverProfileMetaBottom,
} from '../constants/discoverLayout';
import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { getEmberLocationLabel, getEmberRelationshipLabel, getInterestLabel } from '../i18n/labels';
import {
  emberVisiblePhotoCount,
  Profile,
} from '../types/profile';
import { resolveDemoPortraitUri } from '../utils/resolveDemoPortraitUri';
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
  const { t, locale } = useTranslation();
  const isTop = index === activeIndex;
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoCount = profile.photos.length;
  const emberStatus = getEmberRelationshipLabel(locale, profile.relationshipStatus);
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
        source={{ uri: resolveDemoPortraitUri(profile.photos[photoIndex]) }}
        style={styles.photo}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.35, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />
      {isTop && passDim && (
        <Animated.View style={[styles.passDimOverlay, passDimStyle]} pointerEvents="none" />
      )}

      {profile.spotlight && isTop && (
        <View
          style={[
            styles.leftBadge,
            { backgroundColor: colors.heartRed, top: discoverLeftBadgeTop(profile, 'crush') },
          ]}
        >
          <Text style={styles.leftBadgeText} numberOfLines={1} ellipsizeMode="tail">
            {t('discover.crushBadge')}
          </Text>
        </View>
      )}

      {profile.mostCompatible && isTop && (
        <View
          style={[
            styles.leftBadge,
            {
              backgroundColor: colors.boost,
              top: discoverLeftBadgeTop(profile, 'compatible'),
            },
          ]}
        >
          <Text style={styles.leftBadgeText} numberOfLines={1} ellipsizeMode="tail">
            {t('discover.mostCompatibleBadge')}
          </Text>
        </View>
      )}

      {profile.hasVideo && isTop && <VideoProfileOverlay visible profile={profile} />}

      {isTop && photoCount > 1 && (
        <>
          <View
            style={[
              styles.dots,
              { right: spacing.md + discoverDotsRightInset(compact) },
            ]}
          >
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
            <View
              style={[
                styles.privateBadge,
                { top: discoverLeftBadgeTop(profile, 'private') },
              ]}
            >
              <Ionicons name="lock-closed" size={11} color={colors.ember} />
              <Text style={styles.privateBadgeText} numberOfLines={1} ellipsizeMode="tail">
                {t('discover.privatePhotos')}
              </Text>
            </View>
          ) : null}
          <View
            style={[
              styles.tapZones,
              {
                bottom: discoverPhotoTapBottomInset(compact, {
                  emberChipRow: Boolean(emberStatus && compact),
                }),
              },
            ]}
            pointerEvents="box-none"
          >
            <AnimatedPressable style={styles.tapZone} onPress={() => goToPhoto('left')} />
            <AnimatedPressable style={styles.tapZone} onPress={() => goToPhoto('right')} />
          </View>
        </>
      )}

      {isTop && onOpenDetail ? (
        <AnimatedPressable
          style={[
            styles.infoButton,
            { right: discoverInfoButtonRightInset(compact) },
          ]}
          onPress={onOpenDetail}
          hitSlop={10}
          accessibilityLabel={t('profileDetail.openDetails')}
        >
          <Ionicons name="information-circle" size={DISCOVER_INFO_ICON_SIZE} color={colors.text} />
        </AnimatedPressable>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[
          styles.info,
          compact && styles.infoCompact,
          compact ? { bottom: discoverProfileMetaBottom(true) } : null,
        ]}
      >
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, compact && styles.nameCompact, styles.nameFlex]}
            numberOfLines={compact ? 1 : 2}
            ellipsizeMode="tail"
          >
            {profile.name}, {profile.age}
          </Text>
          <AiPersonaBadge profile={profile} compact />
          <VerificationBadges
            photoVerified={profile.photoVerified ?? profile.verified}
            personVerified={profile.personVerified ?? profile.verified}
            size="sm"
          />
          {emberStatus && !compact ? (
            <View style={styles.discreetChipWrap}>
              <EmberStatusChips profile={profile} compact />
            </View>
          ) : null}
        </View>
        {emberStatus && compact ? (
          <View style={styles.emberChipRow}>
            <EmberStatusChips profile={profile} compact />
          </View>
        ) : null}
        {profile.job && (
          <Text
            style={[styles.job, compact && styles.jobCompact]}
            numberOfLines={compact ? 1 : undefined}
          >
            {profile.job}
          </Text>
        )}
        <Text
          style={[styles.distance, compact && styles.distanceCompact]}
          numberOfLines={compact ? 1 : undefined}
        >
          {emberStatus
            ? getEmberLocationLabel(locale, profile)
            : `${profile.city ? `${profile.city} · ` : ''}${t('likes.milesAway', { n: profile.distanceMiles })}`}
        </Text>
        {!compact && (
          <>
            <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
            <View style={styles.tags}>
              {profile.interests.slice(0, 3).map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{getInterestLabel(locale, interest)}</Text>
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
  leftBadge: {
    position: 'absolute',
    left: spacing.md,
    maxWidth: '72%',
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    zIndex: 6,
  },
  leftBadgeText: {
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
    top: DISCOVER_INFO_TOP,
    left: spacing.md,
    flexDirection: 'row',
    gap: 4,
    zIndex: 8,
    pointerEvents: 'none',
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
    left: spacing.md,
    maxWidth: '55%',
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
    position: 'absolute',
    left: 0,
    right: 0,
    top: discoverPhotoTapTopInset(),
    flexDirection: 'row',
    zIndex: 4,
  },
  tapZone: {
    flex: 1,
  },
  infoButton: {
    position: 'absolute',
    top: DISCOVER_INFO_TOP,
    width: DISCOVER_INFO_BUTTON_SIZE,
    height: DISCOVER_INFO_BUTTON_SIZE,
    borderRadius: DISCOVER_INFO_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 24,
    elevation: 24,
  },
  info: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
  },
  infoCompact: {
    left: spacing.sm + 4,
    right: spacing.sm + 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    maxWidth: '100%',
  },
  name: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '700',
  },
  nameCompact: {
    fontSize: 24,
  },
  nameFlex: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  discreetChipWrap: {
    maxWidth: '100%',
  },
  emberChipRow: {
    marginTop: spacing.xs,
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
