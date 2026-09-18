import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DailyBatchIndicator } from '../components/DailyBatchIndicator';
import { AdvancedFiltersSection } from '../components/AdvancedFiltersSection';
import { DiscoverFilterChips } from '../components/DiscoverFilterChips';
import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
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
import { useTranslation } from '../i18n';
import { formatSearchRadiusLocalized } from '../i18n/labels';
import { DiscoverFilter, resolveSparkSection } from '../types/preferences';
import { RootStackParamList } from '../types/navigation';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { ActionToast } from '../components/ActionToast';
import { SearchMapView } from '../components/SearchMapView';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { mapCenterForCity, zoomForRadius } from '../utils/searchMapTiles';

type DiscoverHubScreenProps = {
  onClose: () => void;
};

export function DiscoverHubScreen({ onClose }: DiscoverHubScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const {
    preferences,
    updatePreferences,
    setSparkSection,
    toggleDiscoverFilter,
    discoverQueue,
    discoverPoolTotal,
    hasMoreInPool,
    searchMorePeople,
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
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [deckToast, setDeckToast] = useState<string | null>(null);
  const [closeAfterToast, setCloseAfterToast] = useState(false);

  const activeFilters = preferences.discoverFilters ?? [];

  const openMap = () => {
    navigation.navigate('MapDiscover');
  };

  const openExplore = () => {
    navigation.navigate('Explore');
  };

  const handleSelectProfile = useCallback(
    (profile: Profile) => {
      prioritizeProfileInDeck(profile.id);
      setDeckToast(t('discoverHub.addedToDeck', { name: profile.name }));
      setCloseAfterToast(true);
    },
    [prioritizeProfileInDeck, t],
  );

  const handleSelectAiPersona = useCallback(
    (profile: Profile) => {
      if (!canLike) {
        Alert.alert(t('discoverHub.likeLimitTitle'), t('discoverHub.likeLimitBody'));
        return;
      }
      const match = likeProfile(profile);
      if (match) {
        setMatchProfile(profile);
        setShowMatch(true);
      }
    },
    [canLike, likeProfile, t],
  );

  const handleOpenChat = useCallback(() => {
    if (!matchProfile) {
      return;
    }
    const conversationId = getConversationIdForProfile(matchProfile.id);
    setShowMatch(false);
    setMatchProfile(null);
    onClose();
    if (conversationId) {
      navigation.navigate('Chat', { conversationId });
    }
  }, [getConversationIdForProfile, matchProfile, navigation, onClose]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('discoverHub.title')}
        leftIcon="chevron-back"
        onLeftPress={onClose}
        showLogo
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickGrid}>
          <HubTile
            icon="map-outline"
            label={t('discoverHub.map')}
            hint={formatSearchRadiusLocalized(locale, preferences.maxDistanceMiles)}
            colors={colors}
            onPress={openMap}
            featured
            mapPreview
            mapCenter={
              preferences.travelMode && preferences.passportCity
                ? mapCenterForCity(preferences.passportCity)
                : mapCenterForCity(null)
            }
            mapZoom={zoomForRadius(preferences.maxDistanceMiles)}
            mapRadiusMiles={preferences.maxDistanceMiles}
            mapAccent={colors.gradientEnd}
          />
          <HubTile icon="compass-outline" label={t('discoverHub.explore')} colors={colors} onPress={openExplore} />
          <HubTile
            icon="options-outline"
            label={t('discoverHub.preferences')}
            colors={colors}
            onPress={() => setShowPreferences(true)}
          />
        </View>

        {(!isSparkPlus || isPaused || isBoosted || (preferences.travelMode && preferences.passportCity)) && (
          <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {!isSparkPlus && (
              <Text style={[styles.metaSub, { color: colors.gradientEnd }]}>
                {t('discoverHub.likesLeft', { n: remainingLikes })}
              </Text>
            )}
            {(isPaused || isBoosted || (preferences.travelMode && preferences.passportCity)) && (
              <View style={styles.statusRow}>
                {isPaused && <StatusPill label={t('discoverHub.paused')} color={colors.rewind} />}
                {isBoosted && <StatusPill label={t('discoverHub.boostActive')} color={colors.boost} />}
                {preferences.travelMode && preferences.passportCity && (
                  <StatusPill label={preferences.passportCity} color={colors.superLike} />
                )}
              </View>
            )}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('discoverHub.world')}</Text>
        <SparkSectionToggle
          section={resolveSparkSection(preferences.sparkSection)}
          onChange={setSparkSection}
          variant="list"
        />
        <Text style={[styles.metaSub, { color: colors.textMuted }]}>
          {t('discoverHub.emberHint')}
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('discoverHub.filters')}</Text>
        <DiscoverFilterChips
          activeFilters={activeFilters}
          onToggle={(filter: DiscoverFilter) => toggleDiscoverFilter(filter)}
        />

        <AdvancedFiltersSection
          filters={preferences.advancedFilters ?? {}}
          isSparkPlus={isSparkPlus}
          emberMode={resolveSparkSection(preferences.sparkSection) === 'ember'}
          onChange={(advancedFilters) => updatePreferences({ ...preferences, advancedFilters })}
          onUpgrade={() => navigation.navigate('SparkPlus')}
        />

        {resolveSparkSection(preferences.sparkSection) === 'spark' ? (
          <AiPersonasRow onSelect={handleSelectAiPersona} />
        ) : null}

        {dailyMostCompatible && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {t('discoverHub.mostCompatible')}
            </Text>
            <MostCompatibleBanner
              profile={dailyMostCompatible}
              score={getCompatibilityScore(dailyMostCompatible)}
              onPress={() => handleSelectProfile(dailyMostCompatible)}
            />
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('discoverHub.standouts')}</Text>
        <StandoutsRow
          profiles={standoutsProfiles.slice(0, 6)}
          onSelect={handleSelectProfile}
        />

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          {t('discoverHub.recentlyActive')}
        </Text>
        <RecentlyActiveStrip
          profiles={recentlyActiveProfiles.slice(0, 8)}
          onSelect={handleSelectProfile}
        />

        {heldProfiles.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('discoverHub.onHold')}</Text>
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
                openMap();
              }
            }}
          >
            <Ionicons name="people-outline" size={18} color={colors.text} />
            <Text style={[styles.primaryButtonText, { color: colors.text }]}>
              {hasMoreInPool ? t('discover.searchMore') : t('discover.expandSearch')}
            </Text>
          </AnimatedPressable>
        )}

        {!canLike && !isSparkPlus && (
          <AnimatedPressable
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('SparkPlus')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.gradientEnd }]}>
              {t('discoverHub.getUnlimited')}
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
  hint,
  colors,
  onPress,
  featured,
  mapPreview,
  mapCenter,
  mapZoom,
  mapRadiusMiles,
  mapAccent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  colors: { surface: string; text: string; textMuted: string; border: string };
  onPress: () => void;
  featured?: boolean;
  mapPreview?: boolean;
  mapCenter?: { lat: number; lng: number };
  mapZoom?: number;
  mapRadiusMiles?: number;
  mapAccent?: string;
}) {
  return (
    <AnimatedPressable
      style={[
        styles.hubTile,
        featured ? styles.hubTileFeatured : null,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      accessibilityLabel={label}
    >
      {mapPreview && mapCenter && mapZoom !== undefined && mapRadiusMiles !== undefined && mapAccent ? (
        <>
          <SearchMapView
            center={mapCenter}
            zoom={mapZoom}
            radiusMiles={mapRadiusMiles}
            accentColor={mapAccent}
            pinColor={mapAccent}
            showYouMarker
            showRadiusRing
            style={styles.hubMapPreview}
          />
          <View style={styles.hubMapScrim} />
        </>
      ) : (
        <Ionicons name={icon} size={22} color={colors.text} />
      )}
      <Text style={[styles.hubTileLabel, { color: mapPreview ? '#fff' : colors.text }]}>{label}</Text>
      {hint ? (
        <Text style={[styles.hubTileHint, { color: mapPreview ? 'rgba(255,255,255,0.9)' : colors.textMuted }]}>
          {hint}
        </Text>
      ) : null}
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
    overflow: 'hidden',
  },
  hubTileFeatured: {
    width: '100%',
    minHeight: 132,
    paddingVertical: spacing.lg,
    justifyContent: 'flex-end',
  },
  hubMapPreview: {
    ...StyleSheet.absoluteFill,
    minHeight: 132,
  },
  hubMapScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,15,16,0.38)',
  },
  hubTileLabel: {
    fontSize: 13,
    fontWeight: '700',
    zIndex: 1,
  },
  hubTileHint: {
    fontSize: 12,
    fontWeight: '600',
    zIndex: 1,
  },
  metaCard: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: 4,
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
