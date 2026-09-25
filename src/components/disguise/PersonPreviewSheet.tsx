import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { getEmberLocationLabel, getEmberRelationshipLabel } from '../../i18n/labels';
import { buildReporterPhotoUrls } from '../../utils/disguiseReporterPhotos';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { usePulseContextSection } from '../../hooks/usePulseContextSection';
import { webClass } from '../../motion/webMotion';
import {
  explicitReporterProfileId,
  pulseFeedPostIdFromReporter,
  resolveExplicitDatingProfile,
} from '../../utils/resolveDisguiseProfile';
import { MatchToast } from '../MatchToast';
import { EmberStatusChips } from '../EmberStatusChips';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';
import { FadeSlideIn } from '../motion/FadeSlideIn';
import { AnimatedPressable } from '../AnimatedPressable';
import { ContentTypeIcon, PROFILE_THUMB_ICON_SIZE } from './ContentTypeIcon';
import { DisguiseMiniDismissStat, MiniDismissKind } from './DisguiseMiniDismissStat';
import { DisguiseMiniPhotoPager } from './DisguiseMiniPhotoPager';
import { DisguiseMiniSparkBar } from './DisguiseMiniSparkBar';

const MINI_DISMISS_MS = 280;

type PersonPreviewSheetProps = {
  visible: boolean;
  reporter: NewsReporter | null;
  onClose: () => void;
  initialPhotoIndex?: number;
};

export function PersonPreviewSheet({
  visible,
  reporter,
  onClose,
  initialPhotoIndex = 0,
}: PersonPreviewSheetProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMatchRef = useRef<string | null>(null);
  const {
    likeProfile,
    passProfile,
    unlikeProfile,
    superLikeProfile,
    likedIds,
    superLikedIds,
    passedIds,
    canLike,
    preferences,
    pulseSocial,
    togglePulseLike,
  } = useApp();

  const [photoIndex, setPhotoIndex] = useState(initialPhotoIndex);
  const [matchToastName, setMatchToastName] = useState<string | null>(null);
  const [dismissKind, setDismissKind] = useState<MiniDismissKind | null>(null);
  const [isDismissing, setIsDismissing] = useState(false);
  const [showLikeLimitHint, setShowLikeLimitHint] = useState(false);
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const worldMeta = useDisguiseWorld();
  const pulseSection = usePulseContextSection();

  useEffect(() => {
    if (visible) {
      setPhotoIndex(initialPhotoIndex);
      setMatchToastName(null);
      pendingMatchRef.current = null;
      setDismissKind(null);
      setIsDismissing(false);
      setShowLikeLimitHint(false);
      cardOpacity.value = 1;
      cardScale.value = 1;
    }
  }, [visible, initialPhotoIndex, reporter?.id, cardOpacity, cardScale]);

  useEffect(
    () => () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    },
    [],
  );

  const dismissWithStat = useCallback(
    (kind: MiniDismissKind) => {
      if (isDismissing) {
        return;
      }
      setIsDismissing(true);
      setDismissKind(kind);
      cardOpacity.value = withTiming(0, {
        duration: MINI_DISMISS_MS - 70,
        easing: Easing.out(Easing.cubic),
      });
      cardScale.value = withTiming(0.93, {
        duration: MINI_DISMISS_MS - 70,
        easing: Easing.out(Easing.cubic),
      });
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      dismissTimerRef.current = setTimeout(() => {
        dismissTimerRef.current = null;
        setDismissKind(null);
        setIsDismissing(false);
        cardOpacity.value = 1;
        cardScale.value = 1;
        onClose();
        const matchName = pendingMatchRef.current;
        pendingMatchRef.current = null;
        if (matchName) {
          setMatchToastName(matchName);
        }
      }, MINI_DISMISS_MS);
    },
    [cardOpacity, cardScale, isDismissing, onClose],
  );

  const cardScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const cardFadeStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const linkedProfile = useMemo(() => {
    if (!reporter) {
      return null;
    }
    const profileId = explicitReporterProfileId(
      reporter.id,
      reporter.profileId,
      preferences.showMe,
      pulseSection,
    );
    const base = resolveExplicitDatingProfile(profileId, pulseSection, preferences.showMe);
    if (!base) {
      return null;
    }
    return {
      ...base,
      photos: reporter.photos.length > 0 ? reporter.photos : base.photos,
    };
  }, [preferences.showMe, pulseSection, reporter]);

  const displayPhotos = useMemo(() => {
    if (!reporter) {
      return [];
    }
    return buildReporterPhotoUrls(reporter, linkedProfile);
  }, [linkedProfile, reporter]);

  useEffect(() => {
    if (photoIndex >= displayPhotos.length && displayPhotos.length > 0) {
      setPhotoIndex(0);
    }
  }, [displayPhotos.length, photoIndex]);

  const sparkActionsEnabled = linkedProfile !== null;
  const profileId = linkedProfile?.id;
  const pulseFeedPostId = reporter ? pulseFeedPostIdFromReporter(reporter.id) : null;
  const pulsePostLiked =
    pulseFeedPostId !== null && pulseSocial.likedPostIds.includes(pulseFeedPostId);
  const sparkLiked = profileId ? likedIds.has(profileId) : false;
  const liked = sparkLiked || pulsePostLiked;
  const superLiked = profileId ? superLikedIds.has(profileId) : false;
  const passed = profileId ? passedIds.has(profileId) : false;
  const worldName = worldMeta.unlockLabel;
  const emberStatus = linkedProfile ? getEmberRelationshipLabel(locale, linkedProfile.relationshipStatus) : null;

  const photoCount = displayPhotos.length;
  const trimmedQuote = reporter?.quote.trim() ?? '';
  const showQuote =
    trimmedQuote.length > 0 &&
    trimmedQuote !== linkedProfile?.bio?.trim() &&
    !(trimmedQuote.length > 120 && linkedProfile?.bio);

  const guardLikeLimit = useCallback((): boolean => {
    if (!canLike) {
      setShowLikeLimitHint(true);
      return false;
    }
    setShowLikeLimitHint(false);
    return true;
  }, [canLike]);

  const notifyMatch = useCallback((name: string) => {
    pendingMatchRef.current = name;
  }, []);

  const handleLike = useCallback(() => {
    if (!linkedProfile || isDismissing) {
      return;
    }
    if (sparkLiked) {
      unlikeProfile(linkedProfile.id);
      if (pulsePostLiked && pulseFeedPostId) {
        togglePulseLike(pulseFeedPostId);
      }
      dismissWithStat('unlike');
      return;
    }
    if (!guardLikeLimit()) {
      return;
    }
    const match = likeProfile(linkedProfile);
    if (match) {
      notifyMatch(linkedProfile.name);
    }
    if (pulseFeedPostId && !pulsePostLiked) {
      togglePulseLike(pulseFeedPostId);
    }
    dismissWithStat('like');
  }, [
    dismissWithStat,
    guardLikeLimit,
    isDismissing,
    likeProfile,
    linkedProfile,
    notifyMatch,
    pulseFeedPostId,
    pulsePostLiked,
    sparkLiked,
    togglePulseLike,
    unlikeProfile,
  ]);

  const handleSuperLike = useCallback(() => {
    if (!linkedProfile || isDismissing) {
      return;
    }
    if (superLiked) {
      unlikeProfile(linkedProfile.id);
      dismissWithStat('super');
      return;
    }
    if (!liked && !guardLikeLimit()) {
      return;
    }
    const match = superLikeProfile(linkedProfile);
    if (match) {
      notifyMatch(linkedProfile.name);
    }
    dismissWithStat('super');
  }, [
    dismissWithStat,
    guardLikeLimit,
    isDismissing,
    liked,
    linkedProfile,
    notifyMatch,
    superLikeProfile,
    superLiked,
    unlikeProfile,
  ]);

  const handlePass = useCallback(() => {
    if (!linkedProfile || isDismissing) {
      return;
    }
    setShowLikeLimitHint(false);
    if (liked || superLiked) {
      unlikeProfile(linkedProfile.id);
    }
    passProfile(linkedProfile);
    dismissWithStat('pass');
  }, [dismissWithStat, isDismissing, liked, linkedProfile, passProfile, superLiked, unlikeProfile]);

  if (!reporter || !linkedProfile) {
    return null;
  }

  return (
    <>
      <AnimatedOverlay visible={visible} onClose={isDismissing ? () => {} : onClose} variant="center">
        <Animated.View
          style={[
            styles.card,
            cardScaleStyle,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginTop: insets.top * 0.08,
              width: Math.min(224, windowWidth - 96),
              maxHeight: Math.min(windowHeight * 0.52, 360),
            },
          ]}
          {...webClass('spark-sheet-in')}
        >
          {dismissKind ? <DisguiseMiniDismissStat kind={dismissKind} /> : null}
          <ScrollView
            style={styles.cardScroll}
            contentContainerStyle={styles.cardInner}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={cardFadeStyle}>
            <FadeSlideIn replayKey={visible} index={0}>
              <View style={styles.header}>
                <View style={[styles.headerIcon, { backgroundColor: worldMeta.accentSoft }]}>
                  <ContentTypeIcon kind="profile" size={PROFILE_THUMB_ICON_SIZE} />
                </View>
                <View style={styles.headerText}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {reporter.name}
                    {linkedProfile ? `, ${linkedProfile.age}` : ''}
                  </Text>
                  {linkedProfile ? (
                    <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
                      {emberStatus
                        ? getEmberLocationLabel(locale, linkedProfile)
                        : `${t('likes.milesAway', { n: linkedProfile.distanceMiles })}${linkedProfile.job ? ` · ${linkedProfile.job}` : ''}`}
                    </Text>
                  ) : null}
                </View>
                <AnimatedPressable
                  onPress={isDismissing ? undefined : onClose}
                  hitSlop={10}
                  accessibilityLabel={t('disguiseMiniWindow.closeA11y')}
                  scaleTo={isDismissing ? 1 : 0.88}
                >
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </AnimatedPressable>
              </View>
            </FadeSlideIn>

            {linkedProfile ? (
              <FadeSlideIn replayKey={visible} index={1}>
                <EmberStatusChips profile={linkedProfile} compact />
              </FadeSlideIn>
            ) : null}

            {showQuote ? (
              <FadeSlideIn replayKey={visible} index={2}>
                <Text style={[styles.quote, { color: colors.text }]} numberOfLines={2}>
                  &ldquo;{trimmedQuote}&rdquo;
                </Text>
              </FadeSlideIn>
            ) : null}

            {linkedProfile?.bio ? (
              <FadeSlideIn replayKey={visible} index={2}>
                <Text style={[styles.bio, { color: colors.textMuted }]} numberOfLines={1}>
                  {linkedProfile.bio}
                </Text>
              </FadeSlideIn>
            ) : !showQuote && trimmedQuote ? (
              <FadeSlideIn replayKey={visible} index={2}>
                <Text style={[styles.bio, { color: colors.textMuted }]} numberOfLines={3}>
                  {trimmedQuote}
                </Text>
              </FadeSlideIn>
            ) : null}

            <FadeSlideIn replayKey={visible} index={3}>
              <DisguiseMiniPhotoPager
                photos={displayPhotos}
                index={photoIndex}
                onIndexChange={setPhotoIndex}
                disabled={isDismissing}
              />
            </FadeSlideIn>

            {photoCount > 1 ? (
              <FadeSlideIn replayKey={visible} index={4}>
                <Text
                  style={[styles.photoMeta, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {t('disguiseMiniWindow.photoMeta', { current: photoIndex + 1, total: photoCount })}
                </Text>
              </FadeSlideIn>
            ) : null}

            {sparkActionsEnabled ? (
              <View style={styles.actionsWrap}>
                <DisguiseMiniSparkBar
                  liked={liked}
                  superLiked={superLiked}
                  passed={passed}
                  onLike={handleLike}
                  onSuperLike={handleSuperLike}
                  onPass={handlePass}
                  disabled={isDismissing}
                />
                {showLikeLimitHint ? (
                  <Text style={[styles.limitHint, { color: colors.gradientEnd }]}>
                    {t('discoverHub.likeLimitTitle')} — {t('discoverHub.likeLimitBody')}
                  </Text>
                ) : (
                  <Text style={[styles.hint, { color: colors.textMuted }]}>
                    {superLiked
                      ? t('disguiseMiniWindow.superLikedHint', { world: worldName })
                      : liked
                        ? t('disguiseMiniWindow.savedToLikes')
                        : passed
                          ? t('disguiseMiniWindow.passedHint')
                          : t('disguiseMiniWindow.actionsSync', { world: worldName })}
                  </Text>
                )}
              </View>
            ) : (
              <FadeSlideIn replayKey={visible} index={5}>
                <Text style={[styles.hint, { color: colors.textMuted }]}>
                  {t('disguiseMiniWindow.sponsoredPreview')}
                </Text>
              </FadeSlideIn>
            )}
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </AnimatedOverlay>

      <MatchToast
        visible={matchToastName !== null}
        profileName={matchToastName}
        variant="mini"
        onDismiss={() => setMatchToastName(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 224,
    borderRadius: radii.card - 4,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    zIndex: 2,
    flexDirection: 'column',
  },
  cardScroll: {
    flexShrink: 1,
    flexGrow: 0,
  },
  cardInner: {
    padding: 6,
    gap: 5,
    flexGrow: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  headerIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
  },
  meta: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  quote: {
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  bio: {
    fontSize: 10,
    lineHeight: 14,
  },
  photoMeta: {
    marginTop: spacing.xs,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsWrap: {
    marginTop: spacing.xs,
    zIndex: 6,
    gap: spacing.xs,
  },
  hint: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 0,
    paddingHorizontal: spacing.xs,
    lineHeight: 14,
  },
  limitHint: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '700',
    lineHeight: 14,
  },
});
