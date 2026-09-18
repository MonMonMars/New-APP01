import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { formatSearchRadiusLocalized } from '../i18n/labels';
import { resolveSparkSection } from '../types/preferences';
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

/** Full-bleed map. Radius chips zoom the map. Tap pins to add people to your deck. */
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
  const zoom = zoomForRadius(currentRadius);
  const center = useMemo(
    () =>
      preferences.travelMode && preferences.passportCity
        ? mapCenterForCity(preferences.passportCity)
        : mapCenterForCity(null),
    [preferences.passportCity, preferences.travelMode],
  );

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [deckToast, setDeckToast] = useState<string | null>(null);

  const pins = discoverPool;

  const handlePinPress = (profileId: string) => {
    setSelectedPinId(profileId);
    const profile = pins.find((item) => item.id === profileId);
    if (!profile) {
      return;
    }
    prioritizeProfileInDeck(profileId);
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
        center={center}
        zoom={zoom}
        radiusMiles={currentRadius}
        accentColor={accent}
        pinColor={colors.heartRed}
        pins={pins}
        selectedPinId={selectedPinId}
        onPinPress={handlePinPress}
        style={styles.fullMap}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <AnimatedPressable
          onPress={onClose}
          hitSlop={12}
          accessibilityLabel={t('common.close')}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={22} color="#111" />
        </AnimatedPressable>
        <View style={styles.metaPill}>
          <Text style={styles.metaText}>
            {t('mapDiscover.meta', {
              radius: formatSearchRadiusLocalized(locale, currentRadius),
              count: pins.length,
            })}
          </Text>
        </View>
        <View style={styles.closeSlot} />
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {pins.length === 0 ? (
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
