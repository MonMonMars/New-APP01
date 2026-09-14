import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DailyBatchIndicator } from '../components/DailyBatchIndicator';
import { DiscoverFilterChips } from '../components/DiscoverFilterChips';
import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
import { ExpandLocationSheet } from '../components/ExpandLocationSheet';
import { LikeLimitModal } from '../components/LikeLimitModal';
import { MatchModal } from '../components/MatchModal';
import { MatchToast } from '../components/MatchToast';
import { SuperLikeResultModal } from '../components/SuperLikeResultModal';
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

const TAB_BAR_HEIGHT = 72;
const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const deckHeight = Math.round((WINDOW_HEIGHT - insets.top - TAB_BAR_HEIGHT) * 0.92);
  const navigation = useNavigation();
  const { colors } = useTheme();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const rewindAnim = useRef(new Animated.Value(0)).current;
  const {
    discoverQueue,
    discoverPoolTotal,
    hasMoreInPool,
    preferences,
    updatePreferences,
    toggleDiscoverFilter,
    searchMorePeople,
    expandSearchRadius,
    passProfile,
    likeProfile,
    superLikeProfile,
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
  const [superLikeProfileState, setSuperLikeProfileState] = useState<Profile | null>(null);
  const [showSuperLikeResult, setShowSuperLikeResult] = useState(false);
  const [superLikeIsMatch, setSuperLikeIsMatch] = useState(false);

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
    (profile: Profile, direction: 'left' | 'right' | 'super') => {
      if (direction === 'left') {
        passProfile(profile);
        return;
      }
      if (direction === 'super') {
        return;
      }
      processLike(profile);
    },
    [passProfile, processLike],
  );

  const handleSuperLikeEffectComplete = useCallback(
    (profile: Profile) => {
      if (!canLike) {
        setShowLikeLimit(true);
        return;
      }
      const match = superLikeProfile(profile);
      setSuperLikeProfileState(profile);
      setSuperLikeIsMatch(match !== null);
      setShowSuperLikeResult(true);
    },
    [canLike, superLikeProfile],
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

  const openExplore = useCallback(() => {
    navigation.getParent()?.navigate('Explore');
  }, [navigation]);

  const dismissSuperLikeResult = useCallback(() => {
    setShowSuperLikeResult(false);
    setSuperLikeProfileState(null);
    deckRef.current?.advanceAfterSuperLike();
  }, []);

  const handleSuperLikeChat = useCallback(() => {
    if (!superLikeProfileState) {
      return;
    }
    const conversationId = getConversationIdForProfile(superLikeProfileState.id);
    setShowSuperLikeResult(false);
    setSuperLikeProfileState(null);
    deckRef.current?.advanceAfterSuperLike();
    navigation.getParent()?.navigate('Chat', { conversationId });
  }, [getConversationIdForProfile, navigation, superLikeProfileState]);

  const rewindScale = rewindAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.08, 1],
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.deckContainer,
          {
            height: deckHeight,
            marginTop: insets.top,
            transform: [{ scale: rewindScale }],
          },
        ]}
      >
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
            onSuperLike={handleSuperLikeEffectComplete}
            onEmpty={() => undefined}
            canLike={canLike}
            onLikeBlocked={() => setShowLikeLimit(true)}
            compact
          />
        )}

        <View style={styles.topOverlay} pointerEvents="box-none">
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
              style={[styles.radiusPill, { backgroundColor: 'rgba(26, 26, 28, 0.72)' }]}
              onPress={() => setShowExpandLocation(true)}
            >
              <Ionicons name="location-outline" size={12} color={colors.gradientEnd} />
              <Text style={[styles.radiusText, { color: colors.textMuted }]} numberOfLines={1}>
                {formatSearchRadius(preferences.maxDistanceMiles)}
              </Text>
              <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
            </Pressable>

            {!isSparkPlus && (
              <Pressable
                style={[
                  styles.likesPill,
                  { backgroundColor: 'rgba(26, 26, 28, 0.72)' },
                  !canLike && { borderWidth: 1, borderColor: colors.gradientEnd },
                ]}
                onPress={() => {
                  if (!canLike) {
                    setShowLikeLimit(true);
                  }
                }}
              >
                <Text style={[styles.likesPillText, { color: colors.gradientEnd }]}>
                  {remainingLikes === 0 ? '0' : remainingLikes}
                </Text>
              </Pressable>
            )}
          </View>

          {(isPaused || isBoosted || (preferences.travelMode && preferences.passportCity)) && (
            <View style={styles.bannerRow}>
              {isPaused && (
                <View style={[styles.miniBanner, { backgroundColor: 'rgba(26, 26, 28, 0.72)' }]}>
                  <Ionicons name="pause-circle" size={12} color={colors.rewind} />
                  <Text style={[styles.miniBannerText, { color: colors.rewind }]}>Paused</Text>
                </View>
              )}
              {isBoosted && (
                <View style={styles.miniBannerBoost}>
                  <Ionicons name="flash" size={12} color="#FFD700" />
                  <Text style={styles.miniBannerBoostText}>Boost</Text>
                </View>
              )}
              {preferences.travelMode && preferences.passportCity && (
                <View style={[styles.miniBanner, { backgroundColor: 'rgba(26, 26, 28, 0.72)' }]}>
                  <Ionicons name="airplane" size={11} color={colors.superLike} />
                  <Text style={[styles.miniBannerText, { color: colors.superLike }]}>
                    {preferences.passportCity}
                  </Text>
                </View>
              )}
            </View>
          )}

          <DiscoverFilterChips activeFilters={activeFilters} onToggle={handleFilterToggle} compact />

          <DailyBatchIndicator
            remaining={discoverQueue.length}
            total={discoverPoolTotal}
            slim
          />
        </View>

        <View style={styles.bottomOverlay} pointerEvents="box-none">
          {showSearchMore && discoverQueue.length > 0 && (
            <Pressable
              style={[styles.searchMorePill, { backgroundColor: 'rgba(26, 26, 28, 0.82)', borderColor: colors.border }]}
              onPress={hasMoreInPool ? searchMorePeople : handleWidenFilters}
            >
              <Ionicons name="people-outline" size={14} color={colors.gradientEnd} />
              <Text style={[styles.searchMoreText, { color: colors.gradientEnd }]}>
                {hasMoreInPool ? 'More people' : 'Expand'}
              </Text>
            </Pressable>
          )}

          {currentProfile && !isPaused && (
            <View style={styles.actionRow}>
              {canRewind && (
                <Pressable style={[styles.actionPill, { backgroundColor: 'rgba(26, 26, 28, 0.82)' }]} onPress={handleRewind}>
                  <Ionicons name="refresh" size={14} color={colors.gradientEnd} />
                </Pressable>
              )}
              <Pressable style={[styles.actionPill, { backgroundColor: 'rgba(26, 26, 28, 0.82)' }]} onPress={openSparkNote}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.gradientEnd} />
              </Pressable>
              <Pressable
                style={[styles.actionPill, { backgroundColor: 'rgba(26, 26, 28, 0.82)' }]}
                onPress={() => setShowExpandLocation(true)}
              >
                <Ionicons name="expand-outline" size={14} color={colors.gradientEnd} />
              </Pressable>
              <Pressable style={[styles.actionPill, { backgroundColor: 'rgba(26, 26, 28, 0.82)' }]} onPress={openExplore}>
                <Ionicons name="compass-outline" size={14} color={colors.gradientEnd} />
              </Pressable>
              <Pressable
                style={[styles.actionPill, styles.actionPillWide, { backgroundColor: 'rgba(26, 26, 28, 0.82)' }]}
                onPress={() => setDetailProfile(currentProfile)}
              >
                <Text style={[styles.actionPillText, { color: colors.textMuted }]}>Profile</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Animated.View>

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

      <SuperLikeResultModal
        visible={showSuperLikeResult}
        profile={superLikeProfileState}
        isMatch={superLikeIsMatch}
        userPhoto={user.photos[0]}
        onContinue={dismissSuperLikeResult}
        onChat={superLikeIsMatch ? handleSuperLikeChat : undefined}
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
  deckContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
    minHeight: 0,
    position: 'relative',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomOverlay: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: 78,
    zIndex: 15,
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  radiusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  radiusText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  likesPill: {
    borderRadius: 999,
    minWidth: 32,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  likesPillText: {
    fontSize: 11,
    fontWeight: '800',
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
  searchMorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  searchMoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actionPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
