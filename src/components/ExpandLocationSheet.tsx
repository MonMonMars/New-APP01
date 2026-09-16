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
  SearchRadiusPreset,
} from '../types/preferences';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ExpandLocationSheetProps = {
  visible: boolean;
  currentRadius: number;
  poolTotal: number;
  onClose: () => void;
  onSelectRadius: (miles: SearchRadiusPreset) => void;
};

export function ExpandLocationSheet({
  visible,
  currentRadius,
  poolTotal,
  onClose,
  onSelectRadius,
}: ExpandLocationSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { preferences, blockedIds, likedIds, passedIds } = useApp();

  const pins = useMemo(() => {
    const excluded = new Set([...passedIds, ...likedIds, ...blockedIds]);
    const section = resolveSparkSection(preferences.sparkSection);
    return mockProfiles.filter(
      (profile) =>
        !excluded.has(profile.id) &&
        profile.distanceMiles <= currentRadius &&
        matchesSparkSection(profile, section),
    );
  }, [blockedIds, currentRadius, likedIds, passedIds, preferences.sparkSection]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top + spacing.md },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Expand search</Text>
          <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
        </View>

        <View style={styles.mapFrame}>
          <LinearGradient colors={['#1a3a2f', '#0d2137', '#162447']} style={styles.mapBackground}>
            <View style={styles.radiusRing} pointerEvents="none" />
            <View style={styles.youMarker}>
              <View style={[styles.youDot, { backgroundColor: colors.gradientEnd }]} />
            </View>
            {pins.slice(0, 18).map((profile) => (
              <View
                key={profile.id}
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
        </View>

        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {formatSearchRadius(currentRadius)} · {poolTotal} people
        </Text>

        <View style={styles.chips}>
          {SEARCH_RADIUS_PRESETS.map((preset) => {
            const isActive = currentRadius === preset.value;
            return (
              <AnimatedPressable
                key={preset.label}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.gradientEnd : colors.surface,
                    borderColor: isActive ? colors.gradientEnd : colors.border,
                  },
                ]}
                onPress={() => {
                  onSelectRadius(preset.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isActive ? colors.text : colors.textMuted },
                  ]}
                >
                  {preset.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  mapFrame: {
    height: 280,
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  radiusRing: {
    position: 'absolute',
    width: '62%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: '19%',
    left: '19%',
  },
  youMarker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -7,
    marginTop: -7,
  },
  youDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
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
  },
  meta: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.button,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
