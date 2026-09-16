import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  SEARCH_RADIUS_PRESETS,
} from '../types/preferences';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ExpandSearchMapProps = {
  onClose: () => void;
};

/** Map-first radius picker — full-bleed map, chips overlay, no extra tools. */
export function ExpandSearchMap({ onClose }: ExpandSearchMapProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { preferences, blockedIds, likedIds, passedIds, expandSearchRadius } = useApp();

  const section = resolveSparkSection(preferences.sparkSection);
  const accent = section === 'ember' ? colors.ember : colors.gradientEnd;
  const currentRadius = preferences.maxDistanceMiles;

  const pins = useMemo(() => {
    const excluded = new Set([...passedIds, ...likedIds, ...blockedIds]);
    return mockProfiles.filter(
      (profile) =>
        !excluded.has(profile.id) &&
        profile.distanceMiles <= currentRadius &&
        matchesSparkSection(profile, section),
    );
  }, [blockedIds, currentRadius, likedIds, passedIds, section]);

  const ring = ringMetrics(currentRadius);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#1a3a2f', '#0d2137', '#162447']} style={styles.map}>
        <View style={styles.gridLines} pointerEvents="none">
          {Array.from({ length: 8 }).map((_, row) => (
            <View key={`row-${row}`} style={styles.gridRow}>
              {Array.from({ length: 6 }).map((__, col) => (
                <View
                  key={`cell-${row}-${col}`}
                  style={[styles.gridCell, { borderColor: 'rgba(255,255,255,0.06)' }]}
                />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.roads} pointerEvents="none">
          <View style={[styles.roadH, { top: '35%', backgroundColor: 'rgba(255,255,255,0.12)' }]} />
          <View style={[styles.roadH, { top: '62%', backgroundColor: 'rgba(255,255,255,0.08)' }]} />
          <View style={[styles.roadV, { left: '28%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
          <View style={[styles.roadV, { left: '68%', backgroundColor: 'rgba(255,255,255,0.07)' }]} />
        </View>

        <View
          pointerEvents="none"
          style={[
            styles.radiusRing,
            {
              width: ring.size,
              height: ring.size,
              left: ring.offset,
              top: ring.offset,
              borderColor: accent,
            },
          ]}
        />

        <View style={styles.youMarker} pointerEvents="none">
          <View style={[styles.youDot, { backgroundColor: accent }]} />
          <Text style={styles.youLabel}>You</Text>
        </View>

        {pins.slice(0, 24).map((profile) => (
          <View
            key={profile.id}
            pointerEvents="none"
            style={[
              styles.pin,
              {
                left: `${profile.mapX ?? 50}%`,
                top: `${profile.mapY ?? 50}%`,
                backgroundColor: colors.heartRed,
              },
            ]}
          />
        ))}
      </LinearGradient>

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <AnimatedPressable
          onPress={onClose}
          hitSlop={12}
          accessibilityLabel="Close"
          style={[styles.closeButton, { backgroundColor: 'rgba(15,15,16,0.72)' }]}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </AnimatedPressable>
        <View style={styles.topCopy}>
          <Text style={styles.title}>Expand search</Text>
          <Text style={styles.meta}>
            {formatSearchRadius(currentRadius)} · {pins.length} people
          </Text>
        </View>
        <View style={styles.closeButton} />
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {pins.length === 0 ? (
          <Text style={styles.emptyHint}>No one in this area yet</Text>
        ) : null}
        <View style={styles.chips}>
          {SEARCH_RADIUS_PRESETS.map((preset) => {
            const isActive = currentRadius === preset.value;
            return (
              <AnimatedPressable
                key={preset.label}
                accessibilityLabel={`Search ${preset.label}`}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? accent : 'rgba(15,15,16,0.82)',
                    borderColor: isActive ? accent : 'rgba(255,255,255,0.18)',
                  },
                ]}
                onPress={() => expandSearchRadius(preset.value)}
              >
                <Text style={styles.chipText}>
                  {preset.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
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

function ringMetrics(miles: number): { size: `${number}%`; offset: `${number}%` } {
  const pinRadius = miles >= 9999 ? 46 : Math.min(miles / 250, 1) * 38 + 8;
  return {
    size: `${pinRadius * 2}%`,
    offset: `${50 - pinRadius}%`,
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  gridLines: {
    ...StyleSheet.absoluteFill,
    opacity: 0.5,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
  },
  roads: {
    ...StyleSheet.absoluteFill,
  },
  roadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
  },
  roadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
  },
  radiusRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  youMarker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -10,
    marginTop: -10,
    alignItems: 'center',
    zIndex: 4,
  },
  youDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  youLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
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
  },
  topCopy: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  emptyHint: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.button,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  chipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
