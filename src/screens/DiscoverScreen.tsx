import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
import { ExpandLocationSheet } from '../components/ExpandLocationSheet';
import { BoostBanner } from '../components/BoostBanner';
import { RewindButton } from '../components/RewindButton';
import { LikeLimitModal } from '../components/LikeLimitModal';
import { PostMatchMomentumModal } from '../components/PostMatchMomentumModal';
import { MatchModal } from '../components/MatchModal';
import { MatchToast } from '../components/MatchToast';
import { ModeToggleLogo } from '../components/disguise/ModeToggleLogo';
import { PromptLikeSheet } from '../components/PromptLikeSheet';
import { SuperLikeResultModal } from '../components/SuperLikeResultModal';
import { SparkSectionToggle } from '../components/SparkSectionToggle';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { IncognitoBanner } from '../components/IncognitoBanner';
import { SparkNoteSheet } from '../components/SparkNoteSheet';
import { ReportReasonSheet, type ReportReason } from '../components/ReportReasonSheet';
import { SwipeDeck, SwipeDeckHandle } from '../components/SwipeDeck';
import { WaitingForMatchModal } from '../components/WaitingForMatchModal';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Profile, ProfilePrompt } from '../types/profile';
import { resolveSparkSection, SPARK_SECTION_EMPTY } from '../types/preferences';
import { spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

const TAB_BAR_HEIGHT = 72;
const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const deckHeight = Math.round((WINDOW_HEIGHT - insets.top - TAB_BAR_HEIGHT) * 0.92);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const {
    discoverQueue,
    hasMoreInPool,
    preferences,
    updatePreferences,
    setSparkSection,
    searchMorePeople,
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
    holdProfile,
    unholdProfile,
    getCompatibilityScore,
    remainingSparkNotes,
    canSendSparkNote,
    isIncognitoActive,
    isBoosted,
    showMomentumUpsell,
    dismissMomentumUpsell,
    canRewind,
    hasRewindablePass,
    rewindLastPass,
    isSparkPlus,
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
  const [showSparkNote, setShowSparkNote] = useState(false);
  const [sparkNoteTarget, setSparkNoteTarget] = useState<Profile | null>(null);

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

  const openSparkNote = useCallback((profile: Profile) => {
    setSparkNoteTarget(profile);
    setShowSparkNote(true);
  }, []);

  const handleSparkNoteSend = useCallback(
    (note: string) => {
      if (!sparkNoteTarget) {
        return;
      }
      setShowSparkNote(false);
      setDetailProfile(null);
      processLike(sparkNoteTarget, note);
      setSparkNoteTarget(null);
    },
    [processLike, sparkNoteTarget],
  );

  const handleSparkNoteSkip = useCallback(() => {
    if (!sparkNoteTarget) {
      return;
    }
    setShowSparkNote(false);
    setDetailProfile(null);
    processLike(sparkNoteTarget);
    setSparkNoteTarget(null);
  }, [processLike, sparkNoteTarget]);

  const handleDetailLike = useCallback(() => {
    if (!detailProfile) {
      return;
    }
    setDetailProfile(null);
    processLike(detailProfile);
  }, [detailProfile, processLike]);

  const handleDetailPass = useCallback(() => {
    if (!detailProfile) {
      return;
    }
    passProfile(detailProfile);
    setDetailProfile(null);
  }, [detailProfile, passProfile]);

  const handleDetailSparkNote = useCallback(() => {
    if (!detailProfile) {
      return;
    }
    if (!canSendSparkNote) {
      setShowLikeLimit(true);
      return;
    }
    openSparkNote(detailProfile);
  }, [canSendSparkNote, detailProfile, openSparkNote]);

  const handleDetailHold = useCallback(() => {
    if (!detailProfile) {
      return;
    }
    if (heldIds.has(detailProfile.id)) {
      unholdProfile(detailProfile.id);
      return;
    }
    holdProfile(detailProfile.id);
  }, [detailProfile, heldIds, holdProfile, unholdProfile]);

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

  if (!isFocused) {
    return <View style={[styles.screen, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.emergencyBar, { paddingTop: insets.top }]}>
        <ModeToggleLogo variant="spark" compact />
        <View style={styles.sectionToggle}>
          <SparkSectionToggle
            section={resolveSparkSection(preferences.sparkSection)}
            onChange={setSparkSection}
            variant="title"
          />
        </View>
        <AnimatedPressable style={styles.hubButton} onPress={openDiscoverHub} accessibilityLabel="Discover tools">
          <Ionicons name="options-outline" size={22} color={colors.textMuted} />
        </AnimatedPressable>
      </View>
      {isIncognitoActive && <IncognitoBanner />}
      <BoostBanner visible={isBoosted} />
      <RewindButton
        visible={hasRewindablePass && !isPaused}
        isSparkPlus={isSparkPlus}
        onPress={rewindLastPass}
        onUpgrade={() => navigation.getParent()?.navigate('SparkPlus')}
      />
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
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {SPARK_SECTION_EMPTY[resolveSparkSection(preferences.sparkSection)].title}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {SPARK_SECTION_EMPTY[resolveSparkSection(preferences.sparkSection)].subtitle}
            </Text>
            <AnimatedPressable
              style={[styles.primaryButton, { backgroundColor: colors.gradientEnd }]}
              onPress={hasMoreInPool ? searchMorePeople : () => setShowExpandLocation(true)}
            >
              <Text style={[styles.primaryButtonText, { color: colors.text }]}>
                {hasMoreInPool ? 'Search more people' : 'Expand search'}
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
            onOpenProfile={setDetailProfile}
            onEmpty={() => {
              if (hasMoreInPool) {
                searchMorePeople();
              }
            }}
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

      <PostMatchMomentumModal
        visible={showMomentumUpsell}
        onClose={dismissMomentumUpsell}
        onUpgrade={() => {
          dismissMomentumUpsell();
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
        onHold={handleDetailHold}
        onLike={handleDetailLike}
        onPass={handleDetailPass}
        onSparkNote={canSendSparkNote ? handleDetailSparkNote : undefined}
        onReport={(profileId) => {
          if (detailProfile) {
            openReportSheet(profileId, detailProfile.name);
          }
        }}
      />

      <SparkNoteSheet
        visible={showSparkNote}
        profile={sparkNoteTarget}
        remainingNotes={remainingSparkNotes}
        variant={resolveSparkSection(preferences.sparkSection)}
        onClose={() => {
          setShowSparkNote(false);
          setSparkNoteTarget(null);
        }}
        onSend={handleSparkNoteSend}
        onSkip={handleSparkNoteSkip}
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
        onClose={() => setShowExpandLocation(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
  },
  deckContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  emergencyBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionToggle: {
    flex: 1,
    alignItems: 'center',
  },
  hubButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
