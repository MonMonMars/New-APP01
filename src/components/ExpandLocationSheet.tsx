import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Image, LayoutChangeEvent, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { mockProfiles } from '../data/profiles';
import {
  formatSearchRadius,
  matchesSparkSection,
  PASSPORT_CITIES,
  resolveSparkSection,
} from '../types/preferences';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

const TILE_PX = 256;
const DEFAULT_CENTER = { lat: 40.758, lng: -73.985 };

const CITY_COORDS: Record<(typeof PASSPORT_CITIES)[number], { lat: number; lng: number }> = {
  'New York, NY': { lat: 40.758, lng: -73.985 },
  'Los Angeles, CA': { lat: 34.052, lng: -118.244 },
  'Chicago, IL': { lat: 41.878, lng: -87.63 },
  'Miami, FL': { lat: 25.762, lng: -80.192 },
  'Austin, TX': { lat: 30.267, lng: -97.743 },
  'San Francisco, CA': { lat: 37.775, lng: -122.419 },
  'London, UK': { lat: 51.507, lng: -0.128 },
  'Paris, France': { lat: 48.857, lng: 2.352 },
  'Tokyo, Japan': { lat: 35.676, lng: 139.65 },
  'Sydney, Australia': { lat: -33.869, lng: 151.209 },
};

const RADIUS_CHIPS = [
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '250', value: 250 },
  { label: 'Any', value: 9999 },
] as const;

type ExpandSearchMapProps = {
  onClose: () => void;
};

/** Full-bleed map. Radius chips zoom the map. No extra tools. */
export function ExpandSearchMap({ onClose }: ExpandSearchMapProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { preferences, blockedIds, likedIds, passedIds, expandSearchRadius } = useApp();

  const section = resolveSparkSection(preferences.sparkSection);
  const accent = section === 'ember' ? colors.ember : colors.gradientEnd;
  const currentRadius = preferences.maxDistanceMiles;
  const zoom = zoomForRadius(currentRadius);
  const center =
    preferences.travelMode && preferences.passportCity && preferences.passportCity in CITY_COORDS
      ? CITY_COORDS[preferences.passportCity as (typeof PASSPORT_CITIES)[number]]
      : DEFAULT_CENTER;

  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const pins = useMemo(() => {
    const excluded = new Set([...passedIds, ...likedIds, ...blockedIds]);
    return mockProfiles.filter(
      (profile) =>
        !excluded.has(profile.id) &&
        profile.distanceMiles <= currentRadius &&
        matchesSparkSection(profile, section),
    );
  }, [blockedIds, currentRadius, likedIds, passedIds, section]);

  const tiles = useMemo(
    () => buildTiles(zoom, mapSize.width, mapSize.height, center.lat, center.lng),
    [center.lat, center.lng, mapSize.height, mapSize.width, zoom],
  );

  const scale = Math.min(mapSize.width, mapSize.height);
  const ringDiameter = scale * 0.52;

  const onMapLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMapSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.map} onLayout={onMapLayout}>
        <View style={styles.mapFill} />
        {tiles.map((tile) => (
          <Image
            key={tile.key}
            source={{ uri: tile.uri }}
            style={[styles.tile, { left: tile.left, top: tile.top }]}
          />
        ))}

        {ringDiameter > 0 ? (
          <View
            pointerEvents="none"
            style={[
              styles.radiusRing,
              {
                width: ringDiameter,
                height: ringDiameter,
                left: mapSize.width / 2 - ringDiameter / 2,
                top: mapSize.height / 2 - ringDiameter / 2,
                borderColor: accent,
                backgroundColor: `${accent}22`,
              },
            ]}
          />
        ) : null}

        <View style={styles.youMarker} pointerEvents="none">
          <View style={[styles.youDot, { backgroundColor: accent }]} />
        </View>

        {scale > 0
          ? pins.slice(0, 24).map((profile) => {
              const dx = (profile.mapX ?? 50) - 50;
              const dy = (profile.mapY ?? 50) - 50;
              const angle = Math.atan2(dy, dx);
              const distNorm =
                currentRadius >= 9999
                  ? Math.min(profile.distanceMiles / 400, 0.92)
                  : Math.min(profile.distanceMiles / Math.max(currentRadius, 1), 0.92);
              const radius = distNorm * (ringDiameter / 2);
              return (
                <View
                  key={profile.id}
                  pointerEvents="none"
                  style={[
                    styles.pin,
                    {
                      left: mapSize.width / 2 + Math.cos(angle) * radius,
                      top: mapSize.height / 2 + Math.sin(angle) * radius,
                      backgroundColor: colors.heartRed,
                    },
                  ]}
                />
              );
            })
          : null}
      </View>

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <AnimatedPressable
          onPress={onClose}
          hitSlop={12}
          accessibilityLabel="Close"
          style={styles.closeButton}
        >
          <Ionicons name="close" size={22} color="#111" />
        </AnimatedPressable>
        <View style={styles.metaPill}>
          <Text style={styles.metaText}>
            {formatSearchRadius(currentRadius)} · {pins.length} people
          </Text>
        </View>
        <View style={styles.closeButton} />
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {pins.length === 0 ? <Text style={styles.emptyHint}>No one in this area</Text> : null}
        <View style={styles.segment}>
          {RADIUS_CHIPS.map((preset) => {
            const isActive = currentRadius === preset.value;
            return (
              <AnimatedPressable
                key={preset.label}
                accessibilityLabel={`Search ${preset.label === 'Any' ? 'Anywhere' : `${preset.label} miles`}`}
                style={[styles.segmentItem, isActive ? { backgroundColor: accent } : null]}
                onPress={() => expandSearchRadius(preset.value)}
              >
                <Text style={[styles.segmentText, { color: isActive ? '#fff' : '#111' }]}>
                  {preset.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
        <Text style={styles.attrib}>© OpenStreetMap</Text>
      </View>
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
      <ExpandSearchMap onClose={onClose} />
    </Modal>
  );
}

function zoomForRadius(miles: number): number {
  if (miles >= 9999) {
    return 4;
  }
  if (miles >= 250) {
    return 7;
  }
  if (miles >= 100) {
    return 8;
  }
  if (miles >= 50) {
    return 10;
  }
  return 12;
}

function lonToTile(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * 2 ** zoom;
}

function latToTile(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom
  );
}

function buildTiles(
  zoom: number,
  width: number,
  height: number,
  lat: number,
  lng: number,
): Array<{ key: string; uri: string; left: number; top: number }> {
  if (width <= 0 || height <= 0) {
    return [];
  }
  const n = 2 ** zoom;
  const cx = lonToTile(lng, zoom);
  const cy = latToTile(lat, zoom);
  const minX = Math.floor(cx - width / 2 / TILE_PX) - 1;
  const maxX = Math.ceil(cx + width / 2 / TILE_PX) + 1;
  const minY = Math.floor(cy - height / 2 / TILE_PX) - 1;
  const maxY = Math.ceil(cy + height / 2 / TILE_PX) + 1;
  const tiles: Array<{ key: string; uri: string; left: number; top: number }> = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      if (y < 0 || y >= n) {
        continue;
      }
      const wrappedX = ((x % n) + n) % n;
      tiles.push({
        key: `${zoom}-${wrappedX}-${y}-${x}`,
        uri: `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${wrappedX}/${y}@2x.png`,
        left: (x - cx) * TILE_PX + width / 2,
        top: (y - cy) * TILE_PX + height / 2,
      });
    }
  }
  return tiles;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#d5e0d0',
  },
  map: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  mapFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#d5e0d0',
  },
  tile: {
    position: 'absolute',
    width: TILE_PX,
    height: TILE_PX,
    pointerEvents: 'none',
  },
  radiusRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
  },
  youMarker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -8,
    marginTop: -8,
    zIndex: 4,
  },
  youDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  pin: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    marginTop: -5,
    borderWidth: 1.5,
    borderColor: '#fff',
    zIndex: 3,
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
  closeButton: {
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
