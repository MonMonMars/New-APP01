import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DailyBatchIndicator } from '../components/DailyBatchIndicator';
import { AdvancedFiltersSection } from '../components/AdvancedFiltersSection';
import { DiscoverFilterChips } from '../components/DiscoverFilterChips';
import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
import { ExpandLocationSheet } from '../components/ExpandLocationSheet';
import { AiPersonasRow } from '../components/AiPersonasRow';
import { HeldProfilesRow } from '../components/HeldProfilesRow';
import { MatchModal } from '../components/MatchModal';
import { MostCompatibleBanner } from '../components/MostCompatibleBanner';
import { RecentlyActiveStrip } from '../components/RecentlyActiveStrip';
import { SparkSectionToggle } from '../components/SparkSectionToggle';
import { ScreenHeader } from '../components/ScreenHeader';
import { StandoutsRow } from '../components/StandoutsRow';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { DiscoverFilter, formatSearchRadius, resolveSparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { ActionToast } from '../components/ActionToast';
import { AnimatedPressable } from '../components/AnimatedPressable';

type DiscoverHubScreenProps = {
  onClose: () => void;
};

export function DiscoverHubScreen({ onClose }: DiscoverHubScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    preferences,
    updatePreferences,
    setSparkSection,
    toggleDiscoverFilter,
    discoverQueue,
    discoverPoolTotal,
    hasMoreInPool,
    searchMorePeople,
    expandSearchRadius,
    isPaused,
    isBoosted,
    isSparkPlus,
    remainingLikes,
    canLike,
    heldProfiles,
    standoutsProfiles,
    recentlyActiveProfiles,
    dailyMostCompatible,
    getCompatibilityScore,
    unholdProfile,
    prioritizeProfileInDeck,
    likeProfile,
    getConversationIdForProfile,
    user,
  } = useApp();

  const [showPreferences, setShowPreferences] = useState(false);
  const [showExpandLocation, setShowExpandLocation] = useState(false);
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [deckToast, setDeckToast] = useState<string | null>(null);
  const [closeAfterToast, setCloseAfterToast] = useState(false);

  const activeFilters = preferences.discoverFilters ?? [];

  const openMap = () => {
    navigation.getParent()?.navigate('MapDiscover');
  };

  const openExplore = () => {
    navigation.getParent()?.navigate('Explore');
  };

  const handleSelectProfile = useCallback(
    (profile: Profile) => {
      prioritizeProfileInDeck(profile.id);
      setDeckToast(`${profile.name} added to your deck`);
      setCloseAfterToast(true);
    },
    [prioritizeProfileInDeck],
  );

  const handleSelectAiPersona = useCallback(
    (profile: Profile) => {
      if (!canLike) {
        Alert.alert('Like limit reached', 'Come back tomorrow or upgrade to Spark+ for unlimited likes.');
        return;
      }
      const match = likeProfile(profile);
      if (match) {
        setMatchProfile(profile);
        setShowMatch(true);
      }
    },
    [canLike, likeProfile],
  );

  const handleOpenChat = useCallback(() => {
    if (!matchProfile) {
      return;
    }
    const conversationId = getConversationIdForProfile(matchProfile.id);
    setShowMatch(false);
    setMatchProfile(null);
    onClose();
    navigation.getParent()?.navigate('Chat', { conversationId });
  }, [getConversationIdForProfile, matchProfile, navigation, onClose]);

  const handleWidenFilters = () => {
    if (preferences.maxDistanceMiles >= 9999) {
      setShowPreferences(true);
      return;
    }
    const presets = [25, 50, 100, 250, 9999];
    const next = presets.find((value) => value > preferences.maxDistanceMiles) ?? 9999;
    expandSearchRadius(next);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader
        title="Discover tools"
        leftIcon="chevron-back"
        onLeftPress={onClose}
        showDisguiseButton
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickGrid}>
          <HubTile icon="map-outline" label="Map" colors={colors} onPress={openMap} />
          <HubTile icon="compass-outline" label="Explore" colors={colors} onPress={openExplore} />
          <HubTile
            icon="options-outline"
            label="Preferences"
            colors={colors}
            onPress={() => setShowPreferences(true)}
          />
          <HubTile
            icon="expand-outline"
            label="Radius"
            colors={colors}
            onPress={() => setShowExpandLocation(true)}
          />
        </View>

        <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Search area</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatSearchRadius(preferences.maxDistanceMiles)}
          </Text>
          {!isSparkPlus && (
            <Text style={[styles.metaSub, { color: colors.gradientEnd }]}>
              {remainingLikes} likes left today
            </Text>
          )}
          {(isPaused || isBoosted || (preferences.travelMode && preferences.passportCity)) && (
            <View style={styles.statusRow}>
              {isPaused && <StatusPill label="Paused" color={colors.rewind} />}
              {isBoosted && <StatusPill label="Boost active" color="#FFD700" />}
              {preferences.travelMode && preferences.passportCity && (
                <StatusPill label={preferences.passportCity} color={colors.superLike} />
              )}
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>World</Text>
        <SparkSectionToggle
          section={resolveSparkSection(preferences.sparkSection)}
          onChange={setSparkSection}
          variant="list"
        />
        <Text style={[styles.metaSub, { color: colors.textMuted }]}>
          Likes, matches, and chats stay in the section you pick. Ember keeps photos and city private until you match.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Filters</Text>
        <DiscoverFilterChips
          activeFilters={activeFilters}
          onToggle={(filter: DiscoverFilter) => toggleDiscoverFilter(filter)}
        />

        <AdvancedFiltersSection
          filters={preferences.advancedFilters ?? {}}
          isSparkPlus={isSparkPlus}
          emberMode={resolveSparkSection(preferences.sparkSection) === 'ember'}
          onChange={(advancedFilters) => updatePreferences({ ...preferences, advancedFilters })}
          onUpgrade={() => navigation.getParent()?.navigate('SparkPlus')}
        />

        {resolveSparkSection(preferences.sparkSection) === 'spark' ? (
          <AiPersonasRow onSelect={handleSelectAiPersona} />
        ) : null}

        {dailyMostCompatible && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Most compatible today</Text>
            <MostCompatibleBanner
              profile={dailyMostCompatible}
              score={getCompatibilityScore(dailyMostCompatible)}
              onPress={() => handleSelectProfile(dailyMostCompatible)}
            />
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Standouts</Text>
        <StandoutsRow
          profiles={standoutsProfiles.slice(0, 6)}
          onSelect={handleSelectProfile}
        />

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Recently active</Text>
        <RecentlyActiveStrip
          profiles={recentlyActiveProfiles.slice(0, 8)}
          onSelect={handleSelectProfile}
        />

        {heldProfiles.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>On hold</Text>
            <HeldProfilesRow
              profiles={heldProfiles}
              onSelect={handleSelectProfile}
              onRemove={unholdProfile}
            />
          </>
        )}

        <DailyBatchIndicator remaining={discoverQueue.length} total={discoverPoolTotal} />

        {!isPaused && (
          <AnimatedPressable
            style={[styles.primaryButton, { backgroundColor: colors.gradientEnd }]}
            onPress={() => {
              if (hasMoreInPool) {
                searchMorePeople();
              } else {
                handleWidenFilters();
              }
            }}
          >
            <Ionicons name="people-outline" size={18} color={colors.text} />
            <Text style={[styles.primaryButtonText, { color: colors.text }]}>
              {hasMoreInPool ? 'Search more people' : 'Expand search area'}
            </Text>
          </AnimatedPressable>
        )}

        {!canLike && !isSparkPlus && (
          <AnimatedPressable
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => navigation.getParent()?.navigate('SparkPlus')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.gradientEnd }]}>
              Get unlimited likes with Spark+
            </Text>
          </AnimatedPressable>
        )}
      </ScrollView>

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

      <MatchModal
        visible={showMatch}
        profile={matchProfile}
        userPhoto={user.photos[0] ?? ''}
        onClose={() => {
          setShowMatch(false);
          setMatchProfile(null);
        }}
        onMessage={handleOpenChat}
      />

      <ActionToast
        visible={deckToast !== null}
        message={deckToast ?? ''}
        onDismiss={() => {
          setDeckToast(null);
          if (closeAfterToast) {
            setCloseAfterToast(false);
            onClose();
          }
        }}
      />
    </View>
  );
}

function HubTile({
  icon,
  label,
  colors,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: { surface: string; text: string; textMuted: string; border: string };
  onPress: () => void;
}) {
  return (
    <AnimatedPressable
      style={[styles.hubTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={colors.text} />
      <Text style={[styles.hubTileLabel, { color: colors.text }]}>{label}</Text>
    </AnimatedPressable>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.statusPill, { borderColor: color }]}>
      <Text style={[styles.statusPillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hubTile: {
    width: '47%',
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  hubTileLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  metaCard: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  metaSub: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 999,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: spacing.sm + 2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
