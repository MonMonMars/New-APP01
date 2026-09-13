import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
import { MatchModal } from '../components/MatchModal';
import { WaitingForMatchModal } from '../components/WaitingForMatchModal';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { SwipeDeck, SwipeDeckHandle } from '../components/SwipeDeck';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../theme';
import { Profile } from '../types/profile';

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const {
    discoverQueue,
    preferences,
    updatePreferences,
    passProfile,
    likeProfile,
    getConversationIdForProfile,
  } = useApp();

  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [waitingProfile, setWaitingProfile] = useState<Profile | null>(null);
  const [showWaiting, setShowWaiting] = useState(false);
  const [detailProfile, setDetailProfile] = useState<Profile | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const handleSwipe = useCallback(
    (profile: Profile, direction: 'left' | 'right') => {
      if (direction === 'left') {
        passProfile(profile);
        return;
      }

      const match = likeProfile(profile);
      if (match) {
        setMatchProfile(profile);
        setShowMatch(true);
        return;
      }

      setWaitingProfile(profile);
      setShowWaiting(true);
    },
    [likeProfile, passProfile],
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

  const currentProfile = discoverQueue[0] ?? null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        showLogo
        rightIcon="options-outline"
        onRightPress={() => setShowPreferences(true)}
      />

      <View style={styles.deckArea}>
        {discoverQueue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No more profiles nearby</Text>
            <Text style={styles.emptySubtitle}>
              Try widening your distance or age range in discovery settings.
            </Text>
            <Pressable
              style={styles.settingsButton}
              onPress={() => setShowPreferences(true)}
            >
              <Text style={styles.settingsButtonText}>Discovery settings</Text>
            </Pressable>
          </View>
        ) : (
          <SwipeDeck
            ref={deckRef}
            profiles={discoverQueue}
            onSwipe={handleSwipe}
            onEmpty={() => undefined}
          />
        )}
      </View>

      {currentProfile && (
        <Pressable style={styles.infoPill} onPress={() => setDetailProfile(currentProfile)}>
          <Text style={styles.infoPillText}>View full profile</Text>
        </Pressable>
      )}

      <MatchModal
        visible={showMatch}
        profile={matchProfile}
        onClose={handleCloseMatch}
        onMessage={handleOpenChat}
      />

      <WaitingForMatchModal
        visible={showWaiting}
        profile={waitingProfile}
        onFindMorePeople={handleFindMorePeople}
      />

      <ProfileDetailSheet
        profile={detailProfile}
        visible={detailProfile !== null}
        onClose={() => setDetailProfile(null)}
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
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  settingsButton: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  settingsButtonText: {
    color: colors.gradientEnd,
    fontWeight: '700',
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
