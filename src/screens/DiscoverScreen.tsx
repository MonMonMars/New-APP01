import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DailyBatchIndicator } from '../components/DailyBatchIndicator';
import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
import { LikeLimitModal } from '../components/LikeLimitModal';
import { MatchModal } from '../components/MatchModal';
import { MatchToast } from '../components/MatchToast';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { SwipeDeck, SwipeDeckHandle } from '../components/SwipeDeck';
import { WaitingForMatchModal } from '../components/WaitingForMatchModal';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../theme';
import { Profile } from '../types/profile';

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const {
    discoverQueue,
    likedIds,
    passedIds,
    preferences,
    updatePreferences,
    passProfile,
    likeProfile,
    getConversationIdForProfile,
    canLike,
    remainingLikes,
    isSparkPlus,
    user,
    blockProfile,
    reportProfile,
  } = useApp();

  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [waitingProfile, setWaitingProfile] = useState<Profile | null>(null);
  const [showWaiting, setShowWaiting] = useState(false);
  const [detailProfile, setDetailProfile] = useState<Profile | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showLikeLimit, setShowLikeLimit] = useState(false);
  const [toastProfileName, setToastProfileName] = useState<string | null>(null);
  const [showMatchToast, setShowMatchToast] = useState(false);

  const handleSwipe = useCallback(
    (profile: Profile, direction: 'left' | 'right') => {
      if (direction === 'left') {
        passProfile(profile);
        return;
      }

      if (!canLike) {
        setShowLikeLimit(true);
        return;
      }

      const match = likeProfile(profile);
      if (match) {
        setMatchProfile(profile);
        setShowMatch(true);
        setToastProfileName(profile.name);
        setShowMatchToast(true);
        return;
      }

      setWaitingProfile(profile);
      setShowWaiting(true);
    },
    [canLike, likeProfile, passProfile],
  );

  const handleFindMorePeople = useCallback(() => {
    setShowWaiting(false);
    setWaitingProfile(null);
  }, []);

  const handleCloseMatch = useCallback(() => {
    setShowMatch(false);
    setMatchProfile(null);
  }, []);

  const handleOpenChat = useCallback(() => {
    if (!matchProfile) {
      return;
    }
    const conversationId = getConversationIdForProfile(matchProfile.id);
    setShowMatch(false);
    setMatchProfile(null);
    navigation.getParent()?.navigate('Chat', { conversationId });
  }, [getConversationIdForProfile, matchProfile, navigation]);

  const handleWidenFilters = useCallback(() => {
    updatePreferences({
      ...preferences,
      maxDistanceMiles: Math.min(preferences.maxDistanceMiles + 10, 100),
      maxAge: Math.min(preferences.maxAge + 5, 55),
    });
  }, [preferences, updatePreferences]);

  const handleBlockDetail = useCallback(
    (profileId: string) => {
      blockProfile(profileId);
      setDetailProfile(null);
      Alert.alert('Blocked', 'You will no longer see this profile.');
    },
    [blockProfile],
  );

  const handleReportDetail = useCallback(
    (profileId: string) => {
      reportProfile(profileId);
      setDetailProfile(null);
      Alert.alert('Report submitted', 'Thanks for helping keep Spark safe.');
    },
    [reportProfile],
  );

  const dismissMatchToast = useCallback(() => {
    setShowMatchToast(false);
    setToastProfileName(null);
  }, []);

  const currentProfile = discoverQueue[0] ?? null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        showLogo
        rightIcon="options-outline"
        onRightPress={() => setShowPreferences(true)}
      />

      <DailyBatchIndicator
        remaining={discoverQueue.length}
        total={discoverQueue.length + likedIds.size + passedIds.size}
      />

      {!isSparkPlus && (
        <Pressable
          style={[styles.limitBanner, !canLike && styles.limitBannerExhausted]}
          onPress={() => {
            if (!canLike) {
              setShowLikeLimit(true);
            }
          }}
        >
          <Text style={styles.limitBannerText}>
            {remainingLikes === 0
              ? 'Out of likes today — tap to upgrade'
              : `${remainingLikes} of 10 likes left today`}
          </Text>
        </Pressable>
      )}

      <View style={styles.deckArea}>
        {discoverQueue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌍</Text>
            <Text style={styles.emptyTitle}>No more people nearby</Text>
            <Text style={styles.emptySubtitle}>
              You&apos;ve seen everyone in your area. Widen filters or check back later.
            </Text>
            <Pressable style={styles.primaryButton} onPress={handleWidenFilters}>
              <Text style={styles.primaryButtonText}>Widen filters</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setShowPreferences(true)}>
              <Text style={styles.secondaryButtonText}>Discovery settings</Text>
            </Pressable>
          </View>
        ) : (
          <SwipeDeck
            ref={deckRef}
            profiles={discoverQueue}
            onSwipe={handleSwipe}
            onEmpty={() => undefined}
            canLike={canLike}
            onLikeBlocked={() => setShowLikeLimit(true)}
          />
        )}
      </View>

      {currentProfile && (
        <Pressable style={styles.infoPill} onPress={() => setDetailProfile(currentProfile)}>
          <Text style={styles.infoPillText}>View full profile</Text>
        </Pressable>
      )}

      <MatchToast
        visible={showMatchToast}
        profileName={toastProfileName}
        onDismiss={dismissMatchToast}
      />

      <MatchModal
        visible={showMatch}
        profile={matchProfile}
        userPhoto={user.photos[0]}
        onClose={handleCloseMatch}
        onMessage={handleOpenChat}
      />

      <WaitingForMatchModal
        visible={showWaiting}
        profile={waitingProfile}
        onFindMorePeople={handleFindMorePeople}
      />

      <LikeLimitModal
        visible={showLikeLimit}
        onClose={() => setShowLikeLimit(false)}
        onUpgrade={() => {
          setShowLikeLimit(false);
          navigation.getParent()?.navigate('SparkPlus');
        }}
      />

      <ProfileDetailSheet
        profile={detailProfile}
        visible={detailProfile !== null}
        onClose={() => setDetailProfile(null)}
        onBlock={handleBlockDetail}
        onReport={handleReportDetail}
      />

      <DiscoveryPreferencesSheet
        visible={showPreferences}
        preferences={preferences}
        onClose={() => setShowPreferences(false)}
        onChange={updatePreferences}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  limitBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  limitBannerExhausted: {
    borderWidth: 1,
    borderColor: colors.gradientEnd,
  },
  limitBannerText: {
    color: colors.gradientEnd,
    fontSize: 13,
    fontWeight: '700',
  },
  deckArea: {
    flex: 1,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  primaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.gradientEnd,
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
  },
  primaryButtonText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  infoPill: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoPillText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
