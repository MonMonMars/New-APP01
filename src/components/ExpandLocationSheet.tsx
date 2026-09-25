import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { LikeLimitModal } from './LikeLimitModal';
import { MatchModal } from './MatchModal';
import { WaitingForMatchModal } from './WaitingForMatchModal';
import { dailyLikeLimitForGender } from '../utils/genderAccountPerks';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { formatSearchRadiusLocalized } from '../i18n/labels';
import { type DiscoveryPreferences, resolveSparkSection } from '../types/preferences';
import type { Profile } from '../types/profile';
import { distanceFromCenter, type GeoPoint } from '../utils/geoMap';
import { resolveMapAreaPeople } from '../utils/mapDiscoverPins';
import { resolveUserLocation } from '../services/userLocation';
import {
  listPinnedMapPlaces,
  searchMapPlaces,
  type MapPlaceSuggestion,
} from '../utils/mapPlaceSearch';
import { mapCenterForCity, zoomForRadius } from '../utils/searchMapTiles';
import {
  MAP_SEARCH_STACK_TOP_OFFSET,
  MAP_ZOOM_CONTROLS_TOP_OFFSET,
  MAP_ZOOM_SUGGESTIONS_EXTRA_TOP,
} from '../constants/mapDiscoverLayout';
import { radii, spacing } from '../theme';
import { ActionToast } from './ActionToast';
import { AnimatedPressable } from './AnimatedPressable';
import { ProfileDetailSheet } from './ProfileDetailSheet';
import { ReportReasonSheet, type ReportReason, getReportReasonLabel } from './ReportReasonSheet';
import { RootStackParamList } from '../types/navigation';
import { MAP_MAX_ZOOM, MAP_MIN_ZOOM, SearchMapView } from './SearchMapView';

function approxDistanceMiles(profile: Profile, center: GeoPoint, radiusCap: number): number {
  const raw = distanceFromCenter(profile, center);
  const rounded = Math.max(1, Math.round(raw));
  if (radiusCap >= 9999) {
    return rounded;
  }
  return Math.min(rounded, radiusCap);
}

const RADIUS_CHIPS = [
  { labelKey: '25', value: 25 },
  { labelKey: '50', value: 50 },
  { labelKey: '100', value: 100 },
  { labelKey: '250', value: 250 },
  { labelKey: 'any', value: 9999 },
] as const;

type ExpandSearchMapProps = {
  onClose: () => void;
};

function centersDiffer(a: GeoPoint, b: GeoPoint): boolean {
  return (
    Math.abs(a.lat - b.lat) > 0.002 ||
    Math.abs(a.lng - b.lng) > 0.002
  );
}

/** Full-bleed map for area context — people shown in list, not as map pins. */
function resolveInitialMapCenter(preferences: DiscoveryPreferences): GeoPoint {
  if (preferences.mapSearchLat != null && preferences.mapSearchLng != null) {
    return { lat: preferences.mapSearchLat, lng: preferences.mapSearchLng };
  }
  if (preferences.travelMode && preferences.passportCity) {
    return mapCenterForCity(preferences.passportCity);
  }
  return mapCenterForCity(null);
}

export function ExpandSearchMap({ onClose }: ExpandSearchMapProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const {
    preferences,
    mapDiscoverPool,
    expandSearchRadius,
    searchMapAt,
    clearMapSearch,
    searchMorePeople,
    prioritizeProfileInDeck,
    getCompatibilityScore,
    likeProfile,
    passProfile,
    holdProfile,
    unholdProfile,
    heldIds,
    canLike,
    isSparkPlus,
    user,
    getConversationIdForProfile,
    blockProfile,
    reportProfile,
  } = useApp();

  const section = resolveSparkSection(preferences.sparkSection);
  const accent = section === 'ember' ? colors.ember : colors.gradientEnd;
  const currentRadius = preferences.maxDistanceMiles;
  const chromeBg = colors.surface;
  const chromeText = colors.text;
  const chromeMuted = colors.textMuted;
  const onAccentText = section === 'ember' ? colors.text : '#fff';

  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [mapCenter, setMapCenter] = useState<GeoPoint>(() => resolveInitialMapCenter(preferences));
  const [searchCenter, setSearchCenter] = useState<GeoPoint>(() => resolveInitialMapCenter(preferences));
  const [mapZoom, setMapZoom] = useState(() => zoomForRadius(currentRadius));
  const [queryMode, setQueryMode] = useState<'people' | 'places'>('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailProfile, setDetailProfile] = useState<Profile | null>(null);
  const [deckToast, setDeckToast] = useState<string | null>(null);
  const [showLikeLimit, setShowLikeLimit] = useState(false);
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [waitingProfile, setWaitingProfile] = useState<Profile | null>(null);
  const [showWaiting, setShowWaiting] = useState(false);
  const [reportProfileId, setReportProfileId] = useState<string | null>(null);
  const [reportProfileName, setReportProfileName] = useState('');
  const [locatingGps, setLocatingGps] = useState(false);
  const hasActiveMapSearch =
    preferences.mapSearchLat != null && preferences.mapSearchLng != null;

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await resolveUserLocation(preferences.passportCity);
      if (!active) {
        return;
      }
      setUserLocation(result.coords);
      if (!preferences.travelMode && !hasActiveMapSearch) {
        setMapCenter(result.coords);
        setSearchCenter(result.coords);
      }
    })();
    return () => {
      active = false;
    };
  }, [hasActiveMapSearch, preferences.passportCity, preferences.travelMode]);

  useEffect(() => {
    setMapZoom(zoomForRadius(currentRadius));
  }, [currentRadius]);

  useEffect(() => {
    if (preferences.mapSearchLat != null && preferences.mapSearchLng != null) {
      const saved = { lat: preferences.mapSearchLat, lng: preferences.mapSearchLng };
      setMapCenter(saved);
      setSearchCenter(saved);
      setMapZoom(zoomForRadius(currentRadius));
    }
  }, [currentRadius, preferences.mapSearchLat, preferences.mapSearchLng]);

  useEffect(() => {
    if (preferences.travelMode && preferences.passportCity && !hasActiveMapSearch) {
      const passportCenter = mapCenterForCity(preferences.passportCity);
      setMapCenter(passportCenter);
      setSearchCenter(passportCenter);
    }
  }, [hasActiveMapSearch, preferences.passportCity, preferences.travelMode]);

  const showSearchArea = centersDiffer(mapCenter, searchCenter);
  /** Counts follow the radius chip + discovery prefs (show me, age), not the map viewport. */
  const viewportCenter = mapCenter;

  const peopleNameQuery = queryMode === 'people' ? searchQuery : '';

  const areaPins = useMemo(
    () =>
      resolveMapAreaPeople(mapDiscoverPool, viewportCenter, currentRadius, {
        nameQuery: peopleNameQuery,
      }),
    [currentRadius, mapDiscoverPool, peopleNameQuery, viewportCenter],
  );

  const mapPrivacyPins = useMemo(
    () =>
      areaPins.map((profile) => ({
        id: profile.id,
        latitude: profile.latitude,
        longitude: profile.longitude,
        name: profile.name,
      })),
    [areaPins],
  );

  const placeSuggestions = useMemo(() => {
    if (queryMode !== 'places') {
      return [];
    }
    const query = searchQuery.trim();
    if (query.length >= 2) {
      return searchMapPlaces(query, locale);
    }
    return listPinnedMapPlaces(locale, 12);
  }, [locale, queryMode, searchQuery]);

  const handleSearchThisArea = useCallback(() => {
    setSearchCenter(mapCenter);
    searchMapAt(mapCenter);
    setSearchQuery('');
    setQueryMode('people');
    setDeckToast(t('mapDiscover.areaLoaded'));
  }, [mapCenter, searchMapAt, t]);

  const handleLocateGps = useCallback(() => {
    setLocatingGps(true);
    void resolveUserLocation(preferences.passportCity)
      .then((result) => {
        setUserLocation(result.coords);
        setMapCenter(result.coords);
        if (!hasActiveMapSearch) {
          setSearchCenter(result.coords);
        }
        setMapZoom((prev) => Math.min(MAP_MAX_ZOOM, Math.max(prev, 14)));
      })
      .finally(() => {
        setLocatingGps(false);
      });
  }, [hasActiveMapSearch, preferences.passportCity]);

  const handleResetSearchArea = useCallback(() => {
    clearMapSearch();
    const target =
      preferences.travelMode && preferences.passportCity
        ? mapCenterForCity(preferences.passportCity)
        : userLocation ?? mapCenterForCity(preferences.passportCity);
    setMapCenter(target);
    setSearchCenter(target);
    setSearchQuery('');
    setQueryMode('people');
    setDeckToast(t('mapDiscover.resetSearchArea'));
  }, [clearMapSearch, preferences.passportCity, preferences.travelMode, t, userLocation]);

  const handleSelectPlace = useCallback(
    (place: MapPlaceSuggestion) => {
      const jumpRadius =
        currentRadius >= 100 ? currentRadius : Math.max(currentRadius, 100);
      if (jumpRadius !== currentRadius) {
        expandSearchRadius(jumpRadius);
      }
      setMapCenter(place.coords);
      setSearchCenter(place.coords);
      setMapZoom(zoomForRadius(jumpRadius));
      searchMapAt(place.coords);
      setSearchQuery('');
      setQueryMode('people');
      setDeckToast(t('mapDiscover.areaLoaded'));
    },
    [currentRadius, expandSearchRadius, searchMapAt, t],
  );

  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(MAP_MAX_ZOOM, prev + 1));
  };

  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(MAP_MIN_ZOOM, prev - 1));
  };

  const handleBrowseAreaMatches = useCallback(() => {
    if (showSearchArea) {
      setSearchCenter(mapCenter);
      searchMapAt(mapCenter);
    }
    navigation.navigate('MapAreaMatches', {
      centerLat: viewportCenter.lat,
      centerLng: viewportCenter.lng,
      radiusMiles: currentRadius,
      nameQuery: peopleNameQuery.trim() || undefined,
    });
  }, [
    currentRadius,
    mapCenter,
    navigation,
    peopleNameQuery,
    searchMapAt,
    showSearchArea,
    viewportCenter.lat,
    viewportCenter.lng,
  ]);

  const handleDetailLike = () => {
    if (!detailProfile) {
      return;
    }
    if (!canLike) {
      setShowLikeLimit(true);
      return;
    }
    if (showSearchArea) {
      setSearchCenter(mapCenter);
      searchMapAt(mapCenter);
    }
    const match = likeProfile(detailProfile);
    prioritizeProfileInDeck(detailProfile.id);
    setDetailProfile(null);
    if (match) {
      setMatchProfile(detailProfile);
      setShowMatch(true);
      return;
    }
    setWaitingProfile(detailProfile);
    setShowWaiting(true);
  };

  const handleOpenChat = () => {
    if (!matchProfile) {
      return;
    }
    const conversationId = getConversationIdForProfile(matchProfile.id);
    setShowMatch(false);
    setMatchProfile(null);
    onClose();
    if (conversationId) {
      navigation.getParent()?.navigate('Chat', { conversationId });
    }
  };

  const handleBlockDetail = (profileId: string) => {
    blockProfile(profileId);
    setDetailProfile(null);
    Alert.alert(t('discover.blocked'), t('discover.blockedHint'));
  };

  const handleReportDetail = (profileId: string) => {
    const profile =
      detailProfile?.id === profileId
        ? detailProfile
        : mapDiscoverPool.find((item) => item.id === profileId);
    setReportProfileId(profileId);
    setReportProfileName(profile?.name ?? '');
    setDetailProfile(null);
  };

  const handleReportSubmit = (reason: ReportReason) => {
    if (!reportProfileId) {
      return;
    }
    reportProfile(reportProfileId, reason);
    Alert.alert(
      t('discover.reportSubmitted'),
      t('discover.reportThanks', { reason: getReportReasonLabel(locale, reason) }),
    );
    setReportProfileId(null);
    setReportProfileName('');
  };

  const detailDistanceMiles = useMemo(() => {
    if (!detailProfile) {
      return undefined;
    }
    return Math.max(1, Math.round(distanceFromCenter(detailProfile, viewportCenter)));
  }, [detailProfile, viewportCenter]);

  const handleDetailPass = () => {
    if (!detailProfile) {
      return;
    }
    passProfile(detailProfile);
    setDetailProfile(null);
  };

  const handleDetailHold = () => {
    if (!detailProfile) {
      return;
    }
    if (heldIds.has(detailProfile.id)) {
      unholdProfile(detailProfile.id);
    } else {
      holdProfile(detailProfile.id);
    }
  };

  const radiusChipLabel = (key: (typeof RADIUS_CHIPS)[number]['labelKey']) => {
    if (key === 'any') {
      return t('mapDiscover.any');
    }
    return formatSearchRadiusLocalized(locale, Number(key));
  };

  const radiusA11y = (key: (typeof RADIUS_CHIPS)[number]['labelKey']) => {
    if (key === 'any') {
      return t('mapDiscover.searchAnywhereA11y');
    }
    return t('mapDiscover.searchMilesA11y', { miles: key });
  };

  return (
    <View style={styles.screen}>
      <SearchMapView
        center={mapCenter}
        zoom={mapZoom}
        radiusMiles={currentRadius}
        radiusCenter={viewportCenter}
        accentColor={accent}
        pinColor={colors.heartRed}
        pins={mapPrivacyPins}
        showAvatarPins={false}
        pinMarkerStyle="icon"
        userLocation={null}
        showYouMarker={false}
        onCenterChange={setMapCenter}
        onZoomChange={setMapZoom}
        showLocateButton
        onLocatePress={handleLocateGps}
        locateLoading={locatingGps}
        locateAccessibilityLabel={t('mapDiscover.locateGpsA11y')}
        locateInsetBottom={Math.max(insets.bottom, spacing.md) + 168}
        style={styles.fullMap}
      />

      <View
        pointerEvents="box-none"
        style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}
      >
        <AnimatedPressable
          onPress={onClose}
          hitSlop={12}
          accessibilityLabel={t('common.close')}
          style={[styles.iconButton, { backgroundColor: chromeBg }]}
        >
          <Ionicons name="close" size={22} color={chromeText} />
        </AnimatedPressable>
        <View style={[styles.metaPill, { backgroundColor: chromeBg }]}>
          <Text style={[styles.metaText, { color: chromeText }]} numberOfLines={1} ellipsizeMode="tail">
            {t('mapDiscover.meta', {
              radius: formatSearchRadiusLocalized(locale, currentRadius),
              count: areaPins.length,
            })}
          </Text>
        </View>
        {hasActiveMapSearch ? (
          <AnimatedPressable
            onPress={handleResetSearchArea}
            hitSlop={12}
            accessibilityLabel={t('mapDiscover.resetSearchAreaA11y')}
            style={[styles.iconButton, { backgroundColor: chromeBg }]}
          >
            <Ionicons name="refresh" size={20} color={chromeText} />
          </AnimatedPressable>
        ) : (
          <AnimatedPressable
            onPress={handleLocateGps}
            hitSlop={12}
            accessibilityLabel={t('mapDiscover.locateGpsA11y')}
            style={[styles.iconButton, { backgroundColor: chromeBg }]}
          >
            {locatingGps ? (
              <ActivityIndicator size="small" color={chromeText} />
            ) : (
              <Ionicons name="locate" size={20} color={chromeText} />
            )}
          </AnimatedPressable>
        )}
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.searchBarWrap, { top: insets.top + MAP_SEARCH_STACK_TOP_OFFSET }]}
      >
        <View style={[styles.queryModeRow, { backgroundColor: chromeBg }]}>
          {(['people', 'places'] as const).map((mode) => {
            const active = queryMode === mode;
            return (
              <AnimatedPressable
                key={mode}
                style={[styles.queryModeChip, active ? { backgroundColor: accent } : null]}
                accessibilityLabel={
                  mode === 'people'
                    ? t('mapDiscover.searchModePeopleA11y')
                    : t('mapDiscover.searchModePlacesA11y')
                }
                onPress={() => {
                  setQueryMode(mode);
                  setSearchQuery('');
                }}
              >
                <Text style={[styles.queryModeText, { color: active ? onAccentText : chromeText }]}>
                  {mode === 'people'
                    ? t('mapDiscover.searchModePeople')
                    : t('mapDiscover.searchModePlaces')}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
        <View style={[styles.searchBar, { backgroundColor: chromeBg }]}>
          <Ionicons name="search" size={18} color={chromeMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              queryMode === 'people'
                ? t('mapDiscover.searchPeoplePlaceholder')
                : t('mapDiscover.searchPlacesPlaceholder')
            }
            placeholderTextColor={chromeMuted}
            style={[styles.searchInput, { color: chromeText }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel={
              queryMode === 'people'
                ? t('mapDiscover.searchPeopleA11y')
                : t('mapDiscover.searchPlacesA11y')
            }
          />
          {searchQuery.length > 0 ? (
            <AnimatedPressable
              hitSlop={8}
              accessibilityLabel={t('common.close')}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={18} color={chromeMuted} />
            </AnimatedPressable>
          ) : null}
        </View>
        {placeSuggestions.length > 0 ? (
          <ScrollView
            style={[styles.suggestionsList, { backgroundColor: chromeBg }]}
            keyboardShouldPersistTaps="handled"
            accessibilityLabel={t('mapDiscover.placeSuggestionsA11y')}
          >
            {queryMode === 'places' && searchQuery.trim().length < 2 ? (
              <Text style={[styles.pinnedPlacesHint, { color: chromeMuted }]}>
                {t('mapDiscover.pinnedPlacesHint')}
              </Text>
            ) : null}
            {placeSuggestions.map((place) => (
              <AnimatedPressable
                key={place.id}
                style={styles.suggestionRow}
                accessibilityLabel={t('mapDiscover.goToPlaceA11y', { place: place.label })}
                onPress={() => handleSelectPlace(place)}
              >
                <Ionicons
                  name={place.kind === 'passport' ? 'earth' : 'location-outline'}
                  size={16}
                  color={chromeMuted}
                />
                <Text style={[styles.suggestionText, { color: chromeText }]}>{place.label}</Text>
              </AnimatedPressable>
            ))}
          </ScrollView>
        ) : null}
      </View>

      <View
        pointerEvents="box-none"
        style={[
          styles.zoomControls,
          {
            top:
              insets.top +
              MAP_ZOOM_CONTROLS_TOP_OFFSET +
              (placeSuggestions.length > 0 ? MAP_ZOOM_SUGGESTIONS_EXTRA_TOP : 0),
          },
        ]}
      >
        <AnimatedPressable
          onPress={handleZoomIn}
          hitSlop={8}
          accessibilityLabel={t('mapDiscover.zoomInA11y')}
          style={[styles.iconButton, { backgroundColor: chromeBg }]}
        >
          <Ionicons name="add" size={20} color={chromeText} />
        </AnimatedPressable>
        <AnimatedPressable
          onPress={handleZoomOut}
          hitSlop={8}
          accessibilityLabel={t('mapDiscover.zoomOutA11y')}
          style={[styles.iconButton, { backgroundColor: chromeBg }]}
        >
          <Ionicons name="remove" size={20} color={chromeText} />
        </AnimatedPressable>
      </View>

      {queryMode === 'people' ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.peoplePanel,
            {
              backgroundColor: chromeBg,
              bottom: Math.max(insets.bottom, spacing.md) + 148,
            },
          ]}
        >
          <View style={styles.peoplePanelHeader}>
            <Text style={[styles.peopleCount, { color: chromeText }]}>
              {t('mapDiscover.peopleInArea', { count: areaPins.length })}
            </Text>
            <Text style={[styles.peopleHint, { color: chromeMuted }]} numberOfLines={2}>
              {t('mapDiscover.peopleInAreaHint')}
            </Text>
          </View>
          {areaPins.length > 0 ? (
            <AnimatedPressable
              style={[styles.browseMatchesButton, { backgroundColor: accent }]}
              accessibilityLabel={t('mapDiscover.browseMatchesA11y', { count: areaPins.length })}
              onPress={handleBrowseAreaMatches}
            >
              <Ionicons name="people" size={18} color={onAccentText} />
              <Text style={[styles.browseMatchesText, { color: onAccentText }]}>
                {t('mapDiscover.browseMatches', { count: areaPins.length })}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={onAccentText} />
            </AnimatedPressable>
          ) : (
            <Text style={[styles.peopleEmpty, { color: chromeMuted }]}>
              {searchQuery.trim()
                ? t('mapDiscover.noSearchResults')
                : t('mapDiscover.emptyArea')}
            </Text>
          )}
        </View>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
      >
        <AnimatedPressable
          style={[
            styles.searchAreaButton,
            styles.searchAreaBottom,
            {
              backgroundColor: accent,
              opacity: showSearchArea ? 1 : 0.78,
            },
          ]}
          onPress={handleSearchThisArea}
          accessibilityLabel={t('mapDiscover.searchThisArea')}
        >
          <Ionicons name="search" size={16} color={onAccentText} />
          <Text style={[styles.searchAreaText, { color: onAccentText }]}>
            {t('mapDiscover.searchThisArea')}
          </Text>
        </AnimatedPressable>
        <View style={[styles.segment, { backgroundColor: chromeBg }]}>
          {RADIUS_CHIPS.map((preset) => {
            const isActive = currentRadius === preset.value;
            return (
              <AnimatedPressable
                key={preset.labelKey}
                accessibilityLabel={radiusA11y(preset.labelKey)}
                style={[styles.segmentItem, isActive ? { backgroundColor: accent } : null]}
                onPress={() => {
                  expandSearchRadius(preset.value);
                  if (hasActiveMapSearch) {
                    searchMapAt(searchCenter);
                  }
                }}
              >
                <Text style={[styles.segmentText, { color: isActive ? onAccentText : chromeText }]}>
                  {radiusChipLabel(preset.labelKey)}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
        <Text
          style={[styles.attrib, { color: chromeMuted }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {t('mapDiscover.attribution')}
        </Text>
      </View>

      <ActionToast
        visible={deckToast !== null}
        message={deckToast ?? ''}
        onDismiss={() => setDeckToast(null)}
      />

      <ProfileDetailSheet
        profile={detailProfile}
        visible={detailProfile !== null}
        compatibilityScore={detailProfile ? getCompatibilityScore(detailProfile) : undefined}
        isHeld={detailProfile ? heldIds.has(detailProfile.id) : false}
        distanceMilesOverride={detailDistanceMiles}
        onClose={() => setDetailProfile(null)}
        onHold={handleDetailHold}
        onLike={handleDetailLike}
        onPass={handleDetailPass}
        onBlock={handleBlockDetail}
        onReport={handleReportDetail}
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

      <WaitingForMatchModal
        visible={showWaiting}
        profile={waitingProfile}
        onClose={() => {
          setShowWaiting(false);
          setWaitingProfile(null);
        }}
        onFindMorePeople={() => {
          setShowWaiting(false);
          setWaitingProfile(null);
          searchMorePeople();
        }}
      />

      <LikeLimitModal
        visible={showLikeLimit}
        onClose={() => setShowLikeLimit(false)}
        onUpgrade={() => {
          setShowLikeLimit(false);
          onClose();
          navigation.getParent()?.navigate('SparkPlus');
        }}
        dailyLikeLimit={dailyLikeLimitForGender(user.gender, isSparkPlus)}
      />

      <ReportReasonSheet
        visible={reportProfileId !== null}
        profileName={reportProfileName}
        onClose={() => {
          setReportProfileId(null);
          setReportProfileName('');
        }}
        onSubmit={handleReportSubmit}
      />
    </View>
  );
}

type ExpandLocationSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function ExpandLocationSheet({ visible, onClose }: ExpandLocationSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <ExpandSearchMap onClose={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#e6eed8',
  },
  fullMap: {
    ...StyleSheet.absoluteFill,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  zoomControls: {
    position: 'absolute',
    right: spacing.md,
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaPill: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    borderRadius: radii.button,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '800',
  },
  searchBarWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    gap: spacing.xs,
  },
  queryModeRow: {
    flexDirection: 'row',
    borderRadius: radii.button,
    padding: 3,
    gap: 3,
  },
  queryModeChip: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radii.button - 2,
    paddingVertical: spacing.xs,
  },
  queryModeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
  },
  suggestionsList: {
    marginTop: spacing.xs,
    borderRadius: radii.button,
    maxHeight: 180,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  searchAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchAreaBottom: {
    alignSelf: 'center',
    minWidth: '72%',
    marginBottom: spacing.xs,
  },
  searchAreaText: {
    fontSize: 14,
    fontWeight: '800',
  },
  peoplePanel: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    borderRadius: radii.card,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  peoplePanelHeader: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    gap: 2,
  },
  peopleCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  peopleHint: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  browseMatchesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.sm,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.button,
  },
  browseMatchesText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  peopleEmpty: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pinnedPlacesHint: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  emptyHint: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.button,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: radii.button,
    padding: 4,
    gap: 2,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.button,
    paddingVertical: spacing.sm + 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '800',
  },
  attrib: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
