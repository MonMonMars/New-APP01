import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { emberLocationLine, emberRelationshipLabel } from '../../types/profile';
import { buildReporterPhotoUrls } from '../../utils/disguiseReporterPhotos';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { resolveReporterSparkProfile } from '../../utils/resolveDisguiseProfile';
import { MatchToast } from '../MatchToast';
import { EmberStatusChips } from '../EmberStatusChips';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';
import { FadeSlideIn } from '../motion/FadeSlideIn';
import { AnimatedPressable } from '../AnimatedPressable';
import { ContentTypeIcon } from './ContentTypeIcon';
import { DisguiseMiniPhotoPager } from './DisguiseMiniPhotoPager';
import { DisguiseMiniSparkBar } from './DisguiseMiniSparkBar';

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

  useEffect(() => {
    if (visible) {
      setPhotoIndex(initialPhotoIndex);
      setMatchToastName(null);
    }
  }, [visible, initialPhotoIndex, reporter?.id]);

  const linkedProfile = reporter ? resolveReporterSparkProfile(reporter) : null;

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
  const worldName = disguiseWorldMeta(preferences.sparkSection).unlockLabel;
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
    if (!linkedProfile || liked) {
      return;
    }
    if (!guardLikeLimit()) {
      return;
    }
    const match = likeProfile(linkedProfile);
    if (match) {
      notifyMatch(linkedProfile.name);
    }
  };

  const handleUnlike = () => {
    if (!linkedProfile) {
      return;
    }
    unlikeProfile(linkedProfile.id);
  };

  const handleSuperLike = () => {
    if (!linkedProfile) {
      return;
    }
    if (superLiked) {
      unlikeProfile(linkedProfile.id);
      return;
    }
    if (!guardLikeLimit()) {
      return;
    }
    const match = superLikeProfile(linkedProfile);
    if (match) {
      notifyMatch(linkedProfile.name);
    }
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
      <AnimatedOverlay visible={visible} onClose={onClose} variant="center">
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginTop: insets.top * 0.1,
              width: Math.min(360, windowWidth - 32),
              maxHeight: windowHeight - insets.top - insets.bottom - 48,
            },
          ]}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardInner}
          >
          <FadeSlideIn replayKey={visible} index={0}>
            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: `${colors.heartRed}22` }]}>
                <ContentTypeIcon kind="profile" size={14} />
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
              <Text style={[styles.quote, { color: colors.text }]} numberOfLines={3}>
                &ldquo;{trimmedQuote}&rdquo;
              </Text>
            </FadeSlideIn>
          ) : null}

          {linkedProfile?.bio ? (
            <FadeSlideIn replayKey={visible} index={2}>
              <Text style={[styles.bio, { color: colors.textMuted }]} numberOfLines={2}>
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
          </ScrollView>
        </View>
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
    maxWidth: 360,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    zIndex: 2,
  },
  cardInner: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  headerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
  },
  meta: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  quote: {
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  bio: {
    fontSize: 11,
    lineHeight: 15,
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
