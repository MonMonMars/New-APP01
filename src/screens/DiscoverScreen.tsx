import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DailyBatchIndicator } from '../components/DailyBatchIndicator';
import { DiscoverFilterChips } from '../components/DiscoverFilterChips';
import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
import { ExpandLocationSheet } from '../components/ExpandLocationSheet';
import { LikeLimitModal } from '../components/LikeLimitModal';
import { MatchModal } from '../components/MatchModal';
import { MatchToast } from '../components/MatchToast';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { ReportReasonSheet, type ReportReason } from '../components/ReportReasonSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { SparkNoteSheet } from '../components/SparkNoteSheet';
import { SwipeDeck, SwipeDeckHandle } from '../components/SwipeDeck';
import { WaitingForMatchModal } from '../components/WaitingForMatchModal';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatSearchRadius } from '../types/preferences';
import { DiscoverFilter } from '../types/preferences';
import { Profile } from '../types/profile';
import { spacing } from '../theme';

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const rewindAnim = useRef(new Animated.Value(0)).current;
  const {
    discoverQueue,
    discoverPoolTotal,
    hasMoreInPool,
    likedIds,
    passedIds,
    preferences,
    updatePreferences,
    toggleDiscoverFilter,
    searchMorePeople,
    expandSearchRadius,
    passProfile,
    likeProfile,
    getConversationIdForProfile,
    canLike,
    remainingLikes,
    remainingSparkNotes,
    isSparkPlus,
    isBoosted,
    canRewind,
    rewindKey,
    isPaused,
    user,
    blockProfile,
    reportProfile,
    rewindLastPass,
  } = useApp();

  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [waitingProfile, setWaitingProfile] = useState<Profile | null>(null);
  const [showWaiting, setShowWaiting] = useState(false);
  const [detailProfile, setDetailProfile] = useState<Profile | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showExpandLocation, setShowExpandLocation] = useState(false);
  const [showLikeLimit, setShowLikeLimit] = useState(false);
  const [toastProfileName, setToastProfileName] = useState<string | null>(null);
  const [showMatchToast, setShowMatchToast] = useState(false);
  const [showSparkNote, setShowSparkNote] = useState(false);
  const [sparkNoteProfile, setSparkNoteProfile] = useState<Profile | null>(null);
  const [reportProfileId, setReportProfileId] = useState<string | null>(null);
  const [reportProfileName, setReportProfileName] = useState('');

  const activeFilters = preferences.discoverFilters ?? [];
  const showSearchMore = !isPaused && discoverQueue.length > 0;

  const handleFilterToggle = useCallback(
    (filter: DiscoverFilter) => {
      toggleDiscoverFilter(filter);
    },
    [toggleDiscoverFilter],
  );

  const processLike = useCallback(
    (profile: Profile, sparkNote?: string) => {
      if (!canLike) {
        setShowLikeLimit(true);
        return;
      }

      const match = likeProfile(profile, sparkNote);
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
    [canLike, likeProfile],
  );

  const handleSwipe = useCallback(
    (profile: Profile, direction: 'left' | 'right') => {
      if (direction === 'left') {
        passProfile(profile);
        return;
      }
      processLike(profile);
    },
    [passProfile, processLike],
  );

  const handleRewind = useCallback(() => {
    Animated.sequence([
      Animated.timing(rewindAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(rewindAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    rewindLastPass();
  }, [rewindAnim, rewindLastPass]);

  const handleFindMorePeople = useCallback(() => {
    setShowWaiting(false);
    setWaitingProfile(null);
    searchMorePeople();
  }, [searchMorePeople]);

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
    const presets = [25, 50, 100, 250, 9999];
    const current = preferences.maxDistanceMiles;
    const next = presets.find((value) => value > current) ?? 9999;
    expandSearchRadius(next);
  }, [expandSearchRadius, preferences.maxDistanceMiles]);

  const openReportSheet = useCallback((profileId: string, name: string) => {
    setReportProfileId(profileId);
    setReportProfileName(name);
    setDetailProfile(null);
  }, []);

  const handleReportSubmit = useCallback(
    (reason: ReportReason) => {
      if (!reportProfileId) {
        return;
      }
      reportProfile(reportProfileId, reason);
      setReportProfileId(null);
      Alert.alert('Report submitted', `Thanks for reporting. Reason: ${reason}`);
    },
    [reportProfile, reportProfileId],
  );

  const handleBlockDetail = useCallback(
    (profileId: string) => {
      blockProfile(profileId);
      setDetailProfile(null);
      Alert.alert('Blocked', 'You will no longer see this profile.');
    },
    [blockProfile],
  );

  const dismissMatchToast = useCallback(() => {
    setShowMatchToast(false);
    setToastProfileName(null);
  }, []);

  const currentProfile = discoverQueue[0] ?? null;

  const openSparkNote = useCallback(() => {
    if (!currentProfile) {
      return;
    }
    setSparkNoteProfile(currentProfile);
    setShowSparkNote(true);
  }, [currentProfile]);

  const handleSparkNoteSend = useCallback(
    (note: string) => {
      if (!sparkNoteProfile) {
        return;
      }
      setShowSparkNote(false);
      processLike(sparkNoteProfile, note);
      setSparkNoteProfile(null);
    },
    [processLike, sparkNoteProfile],
  );

  const handleSparkNoteSkip = useCallback(() => {
    if (!sparkNoteProfile) {
      return;
    }
    setShowSparkNote(false);
    processLike(sparkNoteProfile);
    setSparkNoteProfile(null);
  }, [processLike, sparkNoteProfile]);

  const openMap = useCallback(() => {
    navigation.getParent()?.navigate('MapDiscover');
  }, [navigation]);

  const rewindScale = rewindAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.08, 1],
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader
        showLogo
        compact
        leftIcon="map-outline"
        onLeftPress={openMap}
        rightIcon="options-outline"
        onRightPress={() => setShowPreferences(true)}
      />

      <View style={styles.metaRow}>
        <Pressable
          style={[styles.radiusPill, { backgroundColor: colors.surface }]}
          onPress={() => setShowExpandLocation(true)}
        >
          <Ionicons name="location-outline" size={14} color={colors.gradientEnd} />
          <Text style={[styles.radiusText, { color: colors.textMuted }]}>
            Searching within {formatSearchRadius(preferences.maxDistanceMiles)}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
        </Pressable>

        {!isSparkPlus && (
          <Pressable
            style={[
              styles.likesPill,
              { backgroundColor: colors.surface },
              !canLike && { borderWidth: 1, borderColor: colors.gradientEnd },
            ]}
            onPress={() => {
              if (!canLike) {
                setShowLikeLimit(true);
              }
            }}
          >
            <Text style={[styles.likesPillText, { color: colors.gradientEnd }]}>
              {remainingLikes === 0 ? '0 likes' : `${remainingLikes} likes`}
            </Text>
          </Pressable>
        )}
      </View>

      {(isPaused || isBoosted || (preferences.travelMode && preferences.passportCity)) && (
        <View style={styles.bannerRow}>
          {isPaused && (
            <View style={[styles.miniBanner, { backgroundColor: colors.surface }]}>
              <Ionicons name="pause-circle" size={14} color={colors.rewind} />
              <Text style={[styles.miniBannerText, { color: colors.rewind }]}>Paused</Text>
            </View>
          )}
          {isBoosted && (
            <View style={styles.miniBannerBoost}>
              <Ionicons name="flash" size={14} color="#FFD700" />
              <Text style={styles.miniBannerBoostText}>Boost</Text>
            </View>
          )}
          {preferences.travelMode && preferences.passportCity && (
            <View style={[styles.miniBanner, { backgroundColor: colors.surface }]}>
              <Ionicons name="airplane" size={12} color={colors.superLike} />
              <Text style={[styles.miniBannerText, { color: colors.superLike }]}>
                {preferences.passportCity}
              </Text>
            </View>
          )}
        </View>
      )}

      <DiscoverFilterChips activeFilters={activeFilters} onToggle={handleFilterToggle} />

      <DailyBatchIndicator
        remaining={discoverQueue.length}
        total={discoverPoolTotal}
      />

      <Animated.View style={[styles.deckArea, { transform: [{ scale: rewindScale }] }]}>
        {isPaused ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⏸️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Account paused</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Unpause in Profile settings to start discovering again.
            </Text>
          </View>
        ) : discoverQueue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌍</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No more people nearby</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Expand your search radius or load another batch to keep discovering.
            </Text>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.gradientEnd }]}
              onPress={hasMoreInPool ? searchMorePeople : handleWidenFilters}
            >
              <Text style={[styles.primaryButtonText, { color: colors.text }]}>
                {hasMoreInPool ? 'Search more people' : 'Expand location'}
              </Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setShowExpandLocation(true)}>
              <Text style={[styles.secondaryButtonText, { color: colors.textMuted }]}>
                Widen search radius
              </Text>
            </Pressable>
          </View>
        ) : (
          <SwipeDeck
            key={`deck-${rewindKey}`}
            ref={deckRef}
            profiles={discoverQueue}
            onSwipe={handleSwipe}
            onEmpty={() => undefined}
            canLike={canLike}
            onLikeBlocked={() => setShowLikeLimit(true)}
            compact
          />
        )}
      </Animated.View>

      {showSearchMore && discoverQueue.length > 0 && (
        <Pressable
          style={[styles.searchMoreButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={hasMoreInPool ? searchMorePeople : handleWidenFilters}
        >
          <Ionicons name="people-outline" size={18} color={colors.gradientEnd} />
          <Text style={[styles.searchMoreText, { color: colors.gradientEnd }]}>
            {hasMoreInPool ? 'Search more people' : 'Expand location for more'}
          </Text>
        </Pressable>
      )}

      {currentProfile && !isPaused && (
        <View style={styles.actionRow}>
          {canRewind && (
            <Pressable style={[styles.actionPill, { backgroundColor: colors.surface }]} onPress={handleRewind}>
              <Ionicons name="refresh" size={16} color={colors.gradientEnd} />
            </Pressable>
          )}
          <Pressable style={[styles.actionPill, { backgroundColor: colors.surface }]} onPress={openSparkNote}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.gradientEnd} />
          </Pressable>
          <Pressable
            style={[styles.actionPill, { backgroundColor: colors.surface }]}
            onPress={() => setShowExpandLocation(true)}
          >
            <Ionicons name="expand-outline" size={16} color={colors.gradientEnd} />
          </Pressable>
          <Pressable
            style={[styles.actionPill, styles.actionPillWide, { backgroundColor: colors.surface }]}
            onPress={() => setDetailProfile(currentProfile)}
          >
            <Text style={[styles.actionPillText, { color: colors.textMuted }]}>Profile</Text>
          </Pressable>
        </View>
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

      <SparkNoteSheet
        visible={showSparkNote}
        profile={sparkNoteProfile}
        remainingNotes={remainingSparkNotes === Infinity ? 99 : remainingSparkNotes}
        onClose={() => {
          setShowSparkNote(false);
          setSparkNoteProfile(null);
        }}
        onSend={handleSparkNoteSend}
        onSkip={handleSparkNoteSkip}
      />

      <ProfileDetailSheet
        profile={detailProfile}
        visible={detailProfile !== null}
        onClose={() => setDetailProfile(null)}
        onBlock={handleBlockDetail}
        onReport={(profileId) => {
          if (detailProfile) {
            openReportSheet(profileId, detailProfile.name);
          }
        }}
      />

      <ReportReasonSheet
        visible={reportProfileId !== null}
        profileName={reportProfileName}
        onClose={() => setReportProfileId(null)}
        onSubmit={handleReportSubmit}
      />

      <DiscoveryPreferencesSheet
        visible={showPreferences}
        preferences={preferences}
        onClose={() => setShowPreferences(false)}
        onChange={updatePreferences}
      />

      <ExpandLocationSheet
        visible={showExpandLocation}
        currentRadius={preferences.maxDistanceMiles}
        poolTotal={discoverPoolTotal}
        onClose={() => setShowExpandLocation(false)}
        onSelectRadius={expandSearchRadius}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  radiusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  radiusText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  likesPill: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  likesPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bannerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  miniBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  miniBannerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  miniBannerBoost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  miniBannerBoostText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
  },
  deckArea: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xs,
    minHeight: 0,
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
    fontSize: 24,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  primaryButton: {
    marginTop: spacing.sm,
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
  },
  primaryButtonText: {
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  searchMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: spacing.sm + 2,
  },
  searchMoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  actionPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillWide: {
    width: 'auto',
    paddingHorizontal: spacing.md,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
