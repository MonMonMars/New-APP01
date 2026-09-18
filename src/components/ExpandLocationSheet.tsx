import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { formatSearchRadiusLocalized } from '../i18n/labels';
import { resolveSparkSection } from '../types/preferences';
import type { Profile } from '../types/profile';
import {
  distanceFromCenter,
  filterProfilesInRadius,
  sortProfilesByDistance,
  type GeoPoint,
} from '../utils/geoMap';
import { resolveUserLocation } from '../services/userLocation';
import { mapCenterForCity, zoomForRadius } from '../utils/searchMapTiles';
import { radii, spacing } from '../theme';
import { ActionToast } from './ActionToast';
import { AnimatedPressable } from './AnimatedPressable';
import { SearchMapView } from './SearchMapView';

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
    Math.abs(a.lat - b.lat) > 0.004 ||
    Math.abs(a.lng - b.lng) > 0.004
  );
}

/** Full-bleed real map — pan/zoom, geo pins, search this area. */
export function ExpandSearchMap({ onClose }: ExpandSearchMapProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const {
    preferences,
    discoverPool,
    expandSearchRadius,
    prioritizeProfileInDeck,
  } = useApp();

  const section = resolveSparkSection(preferences.sparkSection);
  const accent = section === 'ember' ? colors.ember : colors.gradientEnd;
  const currentRadius = preferences.maxDistanceMiles;

  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [mapCenter, setMapCenter] = useState<GeoPoint>(() =>
    preferences.travelMode && preferences.passportCity
      ? mapCenterForCity(preferences.passportCity)
      : mapCenterForCity(null),
  );
  const [searchCenter, setSearchCenter] = useState<GeoPoint>(mapCenter);
  const [mapZoom, setMapZoom] = useState(() => zoomForRadius(currentRadius));
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [deckToast, setDeckToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await resolveUserLocation(preferences.passportCity);
      if (!active) {
        return;
      }
      setUserLocation(result.coords);
      if (!preferences.travelMode) {
        setMapCenter(result.coords);
        setSearchCenter(result.coords);
      }
    })();
    return () => {
      active = false;
    };
  }, [preferences.passportCity, preferences.travelMode]);

  useEffect(() => {
    setMapZoom(zoomForRadius(currentRadius));
  }, [currentRadius]);

  useEffect(() => {
    if (preferences.travelMode && preferences.passportCity) {
      const passportCenter = mapCenterForCity(preferences.passportCity);
      setMapCenter(passportCenter);
      setSearchCenter(passportCenter);
    }
  }, [preferences.passportCity, preferences.travelMode]);

  const visiblePins = useMemo(
    () =>
      sortProfilesByDistance(
        filterProfilesInRadius(discoverPool, searchCenter, currentRadius),
        searchCenter,
      ),
    [currentRadius, discoverPool, searchCenter],
  );

  const selectedProfile = useMemo(
    () => visiblePins.find((profile) => profile.id === selectedPinId) ?? null,
    [selectedPinId, visiblePins],
  );

  const showSearchArea = centersDiffer(mapCenter, searchCenter);

  const handleSearchThisArea = useCallback(() => {
    setSearchCenter(mapCenter);
    setSelectedPinId(null);
  }, [mapCenter]);

  const handleRecenter = useCallback(() => {
    const target = userLocation ?? mapCenterForCity(preferences.passportCity);
    setMapCenter(target);
    setSearchCenter(target);
    setSelectedPinId(null);
  }, [preferences.passportCity, userLocation]);

  const handlePinPress = (profileId: string) => {
    setSelectedPinId(profileId);
  };

  const handleAddToDeck = (profile: Profile) => {
    prioritizeProfileInDeck(profile.id);
    setDeckToast(t('discoverHub.addedToDeck', { name: profile.name }));
  };

  const radiusChipLabel = (key: (typeof RADIUS_CHIPS)[number]['labelKey']) => {
    if (key === 'any') {
      return t('mapDiscover.any');
    }
    return key;
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
        accentColor={accent}
        pinColor={colors.heartRed}
        pins={visiblePins}
        userLocation={userLocation}
        selectedPinId={selectedPinId}
        onCenterChange={setMapCenter}
        onZoomChange={setMapZoom}
        onPinPress={handlePinPress}
        style={styles.fullMap}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <AnimatedPressable
          onPress={onClose}
          hitSlop={12}
          accessibilityLabel={t('common.close')}
          style={styles.iconButton}
        >
          <Ionicons name="close" size={22} color="#111" />
        </AnimatedPressable>
        <View style={styles.metaPill}>
          <Text style={styles.metaText}>
            {t('mapDiscover.meta', {
              radius: formatSearchRadiusLocalized(locale, currentRadius),
              count: visiblePins.length,
            })}
          </Text>
        </View>
        <AnimatedPressable
          onPress={handleRecenter}
          hitSlop={12}
          accessibilityLabel={t('mapDiscover.recenterA11y')}
          style={styles.iconButton}
        >
          <Ionicons name="locate" size={20} color="#111" />
        </AnimatedPressable>
      </View>

      {showSearchArea ? (
        <View style={[styles.searchAreaWrap, { top: insets.top + spacing.sm + 52 }]}>
          <AnimatedPressable
            style={[styles.searchAreaButton, { backgroundColor: accent }]}
            onPress={handleSearchThisArea}
            accessibilityLabel={t('mapDiscover.searchThisArea')}
          >
            <Ionicons name="search" size={16} color="#fff" />
            <Text style={styles.searchAreaText}>{t('mapDiscover.searchThisArea')}</Text>
          </AnimatedPressable>
        </View>
      ) : null}

      {selectedProfile ? (
        <View style={[styles.previewCard, { bottom: Math.max(insets.bottom, spacing.md) + 112 }]}>
          <Image source={{ uri: selectedProfile.photos[0] }} style={styles.previewPhoto} contentFit="cover" />
          <View style={styles.previewBody}>
            <Text style={styles.previewName}>
              {selectedProfile.name}, {selectedProfile.age}
            </Text>
            <Text style={styles.previewDistance}>
              {t('mapDiscover.milesAway', {
                miles: Math.max(
                  1,
                  Math.round(distanceFromCenter(selectedProfile, searchCenter)),
                ),
              })}
            </Text>
          </View>
          <AnimatedPressable
            style={[styles.previewAction, { backgroundColor: accent }]}
            accessibilityLabel={t('mapDiscover.pinA11y', { name: selectedProfile.name })}
            onPress={() => handleAddToDeck(selectedProfile)}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </AnimatedPressable>
        </View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {visiblePins.length === 0 ? (
          <Text style={styles.emptyHint}>{t('mapDiscover.emptyArea')}</Text>
        ) : null}
        <View style={styles.segment}>
          {RADIUS_CHIPS.map((preset) => {
            const isActive = currentRadius === preset.value;
            return (
              <AnimatedPressable
                key={preset.labelKey}
                accessibilityLabel={radiusA11y(preset.labelKey)}
                style={[styles.segmentItem, isActive ? { backgroundColor: accent } : null]}
                onPress={() => expandSearchRadius(preset.value)}
              >
                <Text style={[styles.segmentText, { color: isActive ? '#fff' : '#111' }]}>
                  {radiusChipLabel(preset.labelKey)}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
        <Text style={styles.attrib}>{t('mapDiscover.attribution')}</Text>
      </View>

      <ActionToast
        visible={deckToast !== null}
        message={deckToast ?? ''}
        onDismiss={() => setDeckToast(null)}
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  metaPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radii.button,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  metaText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '800',
  },
  searchAreaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  searchAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchAreaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  previewCard: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radii.card,
    padding: spacing.sm,
  },
  previewPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  previewBody: {
    flex: 1,
    gap: 2,
  },
  previewName: {
    color: '#111',
    fontSize: 16,
    fontWeight: '800',
  },
  previewDistance: {
    color: 'rgba(17,17,17,0.55)',
    fontSize: 13,
    fontWeight: '600',
  },
  previewAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#111',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.button,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.94)',
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
    color: 'rgba(17,17,17,0.45)',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
