import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MatchModal } from '../components/MatchModal';
import { SwipeDeck } from '../components/SwipeDeck';
import { TabBar } from '../components/TabBar';
import { mockProfiles } from '../data/profiles';
import { colors, spacing } from '../theme';
import { Profile } from '../types/profile';

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [isEmpty, setIsEmpty] = useState(false);
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  const handleSwipe = useCallback((profile: Profile, direction: 'left' | 'right') => {
    if (direction === 'right' && Math.random() > 0.55) {
      setMatchProfile(profile);
      setShowMatch(true);
    }
  }, []);

  const handleEmpty = useCallback(() => {
    setIsEmpty(true);
  }, []);

  const handleCloseMatch = useCallback(() => {
    setShowMatch(false);
    setMatchProfile(null);
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Ionicons name="flame" size={28} color={colors.gradientEnd} />
          <Text style={styles.logo}>Spark</Text>
        </View>
        <Pressable style={styles.filterButton}>
          <Ionicons name="options-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.deckArea}>
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles" size={48} color={colors.gradientEnd} />
            <Text style={styles.emptyTitle}>No more profiles nearby</Text>
            <Text style={styles.emptySubtitle}>
              Check back later or expand your distance settings.
            </Text>
          </View>
        ) : (
          <SwipeDeck
            profiles={mockProfiles}
            onSwipe={handleSwipe}
            onEmpty={handleEmpty}
          />
        )}
      </View>

      <TabBar activeTab="discover" onTabPress={() => undefined} />

      <MatchModal
        visible={showMatch}
        profile={matchProfile}
        onClose={handleCloseMatch}
        onMessage={handleCloseMatch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
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
    marginTop: spacing.md,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
