import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { mockProfiles } from '../data/profiles';
import {
  formatSearchRadius,
  matchesSparkSection,
  resolveSparkSection,
} from '../types/preferences';
import { mapCenterForCity, zoomForRadius } from '../utils/searchMapTiles';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { SearchMapView } from './SearchMapView';

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
  const center = useMemo(
    () =>
      preferences.travelMode && preferences.passportCity
        ? mapCenterForCity(preferences.passportCity)
        : mapCenterForCity(null),
    [preferences.passportCity, preferences.travelMode],
  );

  const pins = useMemo(() => {
    const excluded = new Set([...passedIds, ...likedIds, ...blockedIds]);
    return mockProfiles.filter(
      (profile) =>
        !excluded.has(profile.id) &&
        profile.distanceMiles <= currentRadius &&
        matchesSparkSection(profile, section),
    );
  }, [blockedIds, currentRadius, likedIds, passedIds, section]);

  return (
    <View style={styles.screen}>
      <SearchMapView
        center={center}
        zoom={zoom}
        radiusMiles={currentRadius}
        accentColor={accent}
        pinColor={colors.heartRed}
        pins={pins}
        style={styles.fullMap}
      />

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
        <View style={styles.closeSlot} />
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
        <Text style={styles.attrib}>© Esri</Text>
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  closeSlot: {
    width: 40,
    height: 40,
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
