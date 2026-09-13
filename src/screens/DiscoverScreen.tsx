import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MatchModal } from '../components/MatchModal';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { SwipeDeck } from '../components/SwipeDeck';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../theme';
import { Profile } from '../types/profile';

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { discoverQueue, passProfile, likeProfile } = useApp();
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [detailProfile, setDetailProfile] = useState<Profile | null>(null);

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
      }
    },
    [likeProfile, passProfile],
  );

  const handleCloseMatch = useCallback(() => {
    setShowMatch(false);
    setMatchProfile(null);
  }, []);

  const currentProfile = discoverQueue[0] ?? null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        showLogo
        rightIcon="options-outline"
        onRightPress={() => currentProfile && setDetailProfile(currentProfile)}
      />

      <View style={styles.deckArea}>
        {discoverQueue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No more profiles nearby</Text>
            <Text style={styles.emptySubtitle}>
              Check back later or expand your distance settings.
            </Text>
          </View>
        ) : (
          <SwipeDeck
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
        onMessage={handleCloseMatch}
      />

      <ProfileDetailSheet
        profile={detailProfile}
        visible={detailProfile !== null}
        onClose={() => setDetailProfile(null)}
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
