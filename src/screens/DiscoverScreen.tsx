import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
import { ExpandLocationSheet } from '../components/ExpandLocationSheet';
import { LikeLimitModal } from '../components/LikeLimitModal';
import { MatchModal } from '../components/MatchModal';
import { MatchToast } from '../components/MatchToast';
import { ModeToggleLogo } from '../components/disguise/ModeToggleLogo';
import { PromptLikeSheet } from '../components/PromptLikeSheet';
import { SuperLikeResultModal } from '../components/SuperLikeResultModal';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { ReportReasonSheet, type ReportReason } from '../components/ReportReasonSheet';
import { SwipeDeck, SwipeDeckHandle } from '../components/SwipeDeck';
import { WaitingForMatchModal } from '../components/WaitingForMatchModal';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Profile, ProfilePrompt } from '../types/profile';
import { spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

const TAB_BAR_HEIGHT = 72;
const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const deckHeight = Math.round((WINDOW_HEIGHT - insets.top - TAB_BAR_HEIGHT) * 0.92);
  const navigation = useNavigation();
  const { colors } = useTheme();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const {
    discoverQueue,
    discoverPoolTotal,
    hasMoreInPool,
    preferences,
    updatePreferences,
    searchMorePeople,
    expandSearchRadius,
    passProfile,
    likeProfile,
    superLikeProfile,
    getConversationIdForProfile,
    canLike,
    rewindKey,
    isPaused,
    user,
    blockProfile,
    reportProfile,
    heldIds,
    getCompatibilityScore,
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
  const [reportProfileId, setReportProfileId] = useState<string | null>(null);
  const [reportProfileName, setReportProfileName] = useState('');
  const [superLikeProfileState, setSuperLikeProfileState] = useState<Profile | null>(null);
  const [showSuperLikeResult, setShowSuperLikeResult] = useState(false);
  const [superLikeIsMatch, setSuperLikeIsMatch] = useState(false);
  const [promptLikeTarget, setPromptLikeTarget] = useState<{
    profile: Profile;
    prompt: ProfilePrompt;
  } | null>(null);
  const [showPromptLike, setShowPromptLike] = useState(false);

  const openDiscoverHub = () => {
    navigation.getParent()?.navigate('DiscoverHub');
  };

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

  const dismissSuperLikeResult = useCallback(() => {
    setShowSuperLikeResult(false);
    setSuperLikeProfileState(null);
    deckRef.current?.advanceAfterSuperLike();
  }, []);

  const handleSuperLikeTalkLater = useCallback(() => {
    dismissSuperLikeResult();
  }, [dismissSuperLikeResult]);

  const handleLikePrompt = useCallback((prompt: ProfilePrompt) => {
    if (!detailProfile) {
      return;
    }
    setPromptLikeTarget({ profile: detailProfile, prompt });
    setShowPromptLike(true);
  }, [detailProfile]);

  const handlePromptLikeSend = useCallback(
    (comment: string) => {
      if (!promptLikeTarget) {
        return;
      }
      const note = comment
        ? `Liked "${promptLikeTarget.prompt.question}": ${comment}`
        : `Liked your answer: "${promptLikeTarget.prompt.answer}"`;
      setShowPromptLike(false);
      setDetailProfile(null);
      processLike(promptLikeTarget.profile, note);
      setPromptLikeTarget(null);
    },
    [processLike, promptLikeTarget],
  );

  const handleSuperLikeChatNow = useCallback(() => {
    if (!superLikeProfileState) {
      return;
    }
    const profile = superLikeProfileState;
    setShowSuperLikeResult(false);
    setSuperLikeProfileState(null);
    deckRef.current?.advanceAfterSuperLike();

    if (superLikeIsMatch) {
      const conversationId = getConversationIdForProfile(profile.id);
      navigation.getParent()?.navigate('Chat', { conversationId });
      return;
    }

    setWaitingProfile(profile);
    setShowWaiting(true);
  }, [dismissSuperLikeResult, getConversationIdForProfile, navigation, superLikeIsMatch, superLikeProfileState]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.emergencyBar, { paddingTop: insets.top }]}>
        <ModeToggleLogo variant="spark" compact />
      </View>
      <View
        style={[
          styles.deckContainer,
          {
            height: deckHeight,
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
            <AnimatedPressable
              style={[styles.primaryButton, { backgroundColor: colors.gradientEnd }]}
              onPress={hasMoreInPool ? searchMorePeople : handleWidenFilters}
            >
              <Text style={[styles.primaryButtonText, { color: colors.text }]}>
                {hasMoreInPool ? 'Search more people' : 'Expand location'}
              </Text>
            </AnimatedPressable>
            <AnimatedPressable style={styles.secondaryButton} onPress={() => setShowExpandLocation(true)}>
              <Text style={[styles.secondaryButtonText, { color: colors.textMuted }]}>
                Widen search radius
              </Text>
            </AnimatedPressable>
            <AnimatedPressable style={styles.secondaryButton} onPress={openDiscoverHub}>
              <Text style={[styles.secondaryButtonText, { color: colors.textMuted }]}>
                Open discover tools
              </Text>
            </AnimatedPressable>
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

      </View>

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
        onTalkLater={handleSuperLikeTalkLater}
        onChatNow={handleSuperLikeChatNow}
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
        compatibilityScore={detailProfile ? getCompatibilityScore(detailProfile) : undefined}
        isHeld={detailProfile ? heldIds.has(detailProfile.id) : false}
        onClose={() => setDetailProfile(null)}
        onBlock={handleBlockDetail}
        onLikePrompt={handleLikePrompt}
        onReport={(profileId) => {
          if (detailProfile) {
            openReportSheet(profileId, detailProfile.name);
          }
        }}
      />

      <PromptLikeSheet
        visible={showPromptLike}
        profile={promptLikeTarget?.profile ?? null}
        prompt={promptLikeTarget?.prompt ?? null}
        onClose={() => {
          setShowPromptLike(false);
          setPromptLikeTarget(null);
        }}
        onSend={handlePromptLikeSend}
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
  emergencyBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    zIndex: 20,
    alignItems: 'flex-start',
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
});
