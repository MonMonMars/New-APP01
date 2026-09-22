import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTranslation } from '../../i18n';
import { resolveUserLocation } from '../../services/userLocation';
import { colors, radii, spacing } from '../../theme';
import { pulseBrand } from '../../theme/pulseBrand';
import type { GeoPoint } from '../../utils/geoMap';
import { searchMapPlaces, type MapPlaceSuggestion } from '../../utils/mapPlaceSearch';
import { zoomForRadius } from '../../utils/searchMapTiles';
import { AnimatedPressable } from '../AnimatedPressable';
import { MAP_MAX_ZOOM, MAP_MIN_ZOOM, SearchMapView } from '../SearchMapView';

type OnboardingLocationMapProps = {
  initialCenter: GeoPoint;
  radiusMiles: number;
  onConfirm: (center: GeoPoint, passportCity?: string) => void;
};

export function OnboardingLocationMap({
  initialCenter,
  radiusMiles,
  onConfirm,
}: OnboardingLocationMapProps) {
  const { t, locale } = useTranslation();
  const [mapCenter, setMapCenter] = useState<GeoPoint>(initialCenter);
  const [mapZoom, setMapZoom] = useState(() => zoomForRadius(Math.min(radiusMiles, 50)));
  const [searchQuery, setSearchQuery] = useState('');
  const [passportCity, setPassportCity] = useState<string | undefined>(undefined);
  const [gpsLoading, setGpsLoading] = useState(false);

  const placeSuggestions = useMemo(
    () => searchMapPlaces(searchQuery, locale, 5),
    [locale, searchQuery],
  );

  const handleSelectPlace = (place: MapPlaceSuggestion) => {
    setMapCenter(place.coords);
    setMapZoom(place.kind === 'passport' ? 11 : 13);
    setSearchQuery(place.label);
    if (place.kind === 'passport') {
      const cityKey = place.id.replace(/^passport:/, '');
      setPassportCity(cityKey);
    } else {
      setPassportCity(undefined);
    }
  };

  const handleUseGps = () => {
    setGpsLoading(true);
    void resolveUserLocation(passportCity)
      .then((result) => {
        setMapCenter(result.coords);
        setMapZoom(13);
        setSearchQuery('');
        setPassportCity(result.source === 'passport' ? passportCity : undefined);
      })
      .finally(() => {
        setGpsLoading(false);
      });
  };

  const handleContinue = () => {
    onConfirm(mapCenter, passportCity);
  };

  return (
    <View style={styles.root}>
      <View style={styles.mapWrap}>
        <SearchMapView
          center={mapCenter}
          zoom={mapZoom}
          radiusMiles={Math.min(radiusMiles, 50)}
          accentColor={pulseBrand.accent}
          pinColor={pulseBrand.accent}
          showRadiusRing
          showYouMarker={false}
          showAvatarPins={false}
          interactive
          showZoomControls
          showLocateButton
          onLocatePress={handleUseGps}
          locateLoading={gpsLoading}
          locateAccessibilityLabel={t('mapDiscover.locateGpsA11y')}
          locateInsetBottom={spacing.sm}
          onCenterChange={(next) => {
            setMapCenter(next);
            setPassportCity(undefined);
          }}
          onZoomChange={(next) => {
            setMapZoom(Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, next)));
          }}
          style={styles.map}
        />
        <View pointerEvents="none" style={styles.crosshair} accessibilityElementsHidden>
          <View style={[styles.crosshairRing, { borderColor: pulseBrand.accent }]} />
          <Ionicons name="location" size={34} color={pulseBrand.accent} />
        </View>
      </View>

      <Text style={styles.mapHint}>{t('onboarding.mapDragHint')}</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('onboarding.searchPlacePlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 ? (
          <AnimatedPressable
            onPress={() => {
              setSearchQuery('');
            }}
            accessibilityLabel={t('onboarding.clearPlaceSearch')}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </AnimatedPressable>
        ) : null}
      </View>

      {placeSuggestions.length > 0 ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.suggestions}
          contentContainerStyle={styles.suggestionsContent}
        >
          {placeSuggestions.map((place) => (
            <AnimatedPressable
              key={place.id}
              style={styles.suggestionRow}
              onPress={() => handleSelectPlace(place)}
            >
              <Ionicons
                name={place.kind === 'passport' ? 'business-outline' : 'navigate-outline'}
                size={16}
                color={pulseBrand.accent}
              />
              <Text style={styles.suggestionLabel} numberOfLines={1}>
                {place.label}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      ) : null}

      <AnimatedPressable style={styles.primaryButton} onPress={handleContinue}>
        <Text style={styles.primaryButtonText}>{t('onboarding.confirmLocation')}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  mapWrap: {
    borderRadius: radii.card,
    overflow: 'hidden',
    minHeight: 260,
    height: 260,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  map: {
    flex: 1,
    minHeight: 260,
  },
  crosshair: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  mapHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 4,
  },
  suggestions: {
    maxHeight: 160,
    marginBottom: spacing.sm,
  },
  suggestionsContent: {
    gap: spacing.xs,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.button,
    backgroundColor: colors.surface,
  },
  suggestionLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: pulseBrand.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: pulseBrand.accent,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});
