import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { emberLocationLine, emberRelationshipLabel } from '../../types/profile';
import { buildReporterPhotoUrls } from '../../utils/disguiseReporterPhotos';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { webClass } from '../../motion/webMotion';
import { resolveReporterSparkProfile } from '../../utils/resolveDisguiseProfile';
import { MatchToast } from '../MatchToast';
import { EmberStatusChips } from '../EmberStatusChips';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';
import { FadeSlideIn } from '../motion/FadeSlideIn';
import { AnimatedPressable } from '../AnimatedPressable';
import { ContentTypeIcon } from './ContentTypeIcon';
import { DisguiseMiniDismissStat, MiniDismissKind } from './DisguiseMiniDismissStat';
import { DisguiseMiniPhotoPager } from './DisguiseMiniPhotoPager';
import { DisguiseMiniSparkBar } from './DisguiseMiniSparkBar';

const MINI_DISMISS_MS = 460;

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
  } = useApp();

  const [photoIndex, setPhotoIndex] = useState(initialPhotoIndex);
  const [matchToastName, setMatchToastName] = useState<string | null>(null);
  const [dismissKind, setDismissKind] = useState<MiniDismissKind | null>(null);
  const [isDismissing, setIsDismissing] = useState(false);
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setPhotoIndex(initialPhotoIndex);
      setMatchToastName(null);
      setDismissKind(null);
      setIsDismissing(false);
      cardOpacity.value = 1;
      cardScale.value = 1;
    }
  }, [visible, initialPhotoIndex, reporter?.id, cardOpacity, cardScale]);

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
      setTimeout(() => {
        setDismissKind(null);
        setIsDismissing(false);
        cardOpacity.value = 1;
        cardScale.value = 1;
        onClose();
      }, MINI_DISMISS_MS);
    },
    [cardOpacity, cardScale, isDismissing, onClose],
  );

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const linkedProfile = reporter ? resolveReporterSparkProfile(reporter, preferences.sparkSection) : null;

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

  if (!reporter) {
    return null;
  }

  const sparkActionsEnabled = linkedProfile !== null;
  const profileId = linkedProfile?.id;
  const liked = profileId ? likedIds.has(profileId) : false;
  const superLiked = profileId ? superLikedIds.has(profileId) : false;
  const passed = profileId ? passedIds.has(profileId) : false;
  const worldMeta = useDisguiseWorld();
  const worldName = worldMeta.unlockLabel;
  const emberStatus = linkedProfile ? emberRelationshipLabel(linkedProfile.relationshipStatus) : null;

  const photoCount = displayPhotos.length;
  const trimmedQuote = reporter.quote.trim();
  const showQuote =
    trimmedQuote.length > 0 &&
    trimmedQuote !== linkedProfile?.bio?.trim() &&
    !(trimmedQuote.length > 120 && linkedProfile?.bio);

  const guardLikeLimit = (): boolean => {
    if (!canLike) {
      Alert.alert('Daily limit', 'You have used all your likes for today.');
      return false;
    }
    return true;
  };

  const notifyMatch = (name: string) => {
    setMatchToastName(name);
  };

  const handleLike = () => {
    if (!linkedProfile || liked || isDismissing) {
      return;
    }
    if (!guardLikeLimit()) {
      return;
    }
    const match = likeProfile(linkedProfile);
    if (match) {
      notifyMatch(linkedProfile.name);
    }
    dismissWithStat('like');
  };

  const handleUnlike = () => {
    if (!linkedProfile || isDismissing) {
      return;
    }
    unlikeProfile(linkedProfile.id);
    dismissWithStat('unlike');
  };

  const handleSuperLike = () => {
    if (!linkedProfile || isDismissing) {
      return;
    }
    if (superLiked) {
      unlikeProfile(linkedProfile.id);
      dismissWithStat('unlike');
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
  };

  const handlePass = () => {
    if (!linkedProfile) {
      return;
    }
    if (liked || superLiked) {
      unlikeProfile(linkedProfile.id);
    }
    passProfile(linkedProfile);
    onClose();
  };

  return (
    <>
      <AnimatedOverlay visible={visible} onClose={isDismissing ? () => {} : onClose} variant="center">
        <Animated.View
          style={[
            styles.card,
            cardAnimatedStyle,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginTop: insets.top * 0.08,
              width: Math.min(224, windowWidth - 96),
              maxHeight: Math.min(windowHeight * 0.52, 360),
            },
          ]}
          onStartShouldSetResponder={() => true}
          {...webClass('spark-sheet-in')}
        >
          {dismissKind ? <DisguiseMiniDismissStat kind={dismissKind} accent={worldMeta.accent} /> : null}
          <View style={styles.cardInner}>
          <FadeSlideIn replayKey={visible} index={0}>
            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: worldMeta.accentSoft }]}>
                <ContentTypeIcon kind="profile" size={12} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {reporter.name}
                  {linkedProfile ? `, ${linkedProfile.age}` : ''}
                </Text>
                {linkedProfile ? (
                  <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
                    {emberStatus
                      ? emberLocationLine(linkedProfile)
                      : `${linkedProfile.distanceMiles} mi away${linkedProfile.job ? ` · ${linkedProfile.job}` : ''}`}
                  </Text>
                ) : null}
              </View>
              <AnimatedPressable onPress={onClose} hitSlop={10} accessibilityLabel="Close" scaleTo={0.88}>
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
            />
          </FadeSlideIn>

          {photoCount > 1 ? (
            <FadeSlideIn replayKey={visible} index={4}>
              <Text style={[styles.photoMeta, { color: colors.textMuted }]}>
                Photo {photoIndex + 1} of {photoCount}
              </Text>
            </FadeSlideIn>
          ) : null}

          {sparkActionsEnabled ? (
            <FadeSlideIn replayKey={visible} index={5}>
              <DisguiseMiniSparkBar
                liked={liked}
                superLiked={superLiked}
                passed={passed}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onSuperLike={handleSuperLike}
                onPass={handlePass}
                disabled={isDismissing}
              />
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                {superLiked
                  ? `Super liked — saved to ${worldName}`
                  : liked
                    ? 'Saved to Likes'
                    : passed
                      ? 'Passed — hidden from deck'
                      : `Actions sync to ${worldName}`}
              </Text>
            </FadeSlideIn>
          ) : (
            <FadeSlideIn replayKey={visible} index={5}>
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                This is your sponsored profile preview.
              </Text>
            </FadeSlideIn>
          )}
          </View>
        </Animated.View>
      </AnimatedOverlay>

      <MatchToast
        visible={matchToastName !== null}
        profileName={matchToastName}
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
  },
  cardInner: {
    padding: 6,
    gap: 5,
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
  hint: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});
