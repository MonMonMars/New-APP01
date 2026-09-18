import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import type { GeoPoint } from '../utils/geoMap';
import {
  buildMapTiles,
  latLngToPixel,
  layoutMapPins,
  milesToPixels,
  moveMapCenter,
  TILE_PX,
  type MapPin,
} from '../utils/searchMapTiles';
import { AnimatedPressable } from './AnimatedPressable';

type MapProfilePin = {
  id: string;
  distanceMiles?: number;
  latitude?: number;
  longitude?: number;
  mapX?: number;
  mapY?: number;
  photos?: string[];
  name?: string;
};

type SearchMapViewProps = {
  center: GeoPoint;
  zoom: number;
  radiusMiles: number;
  accentColor: string;
  pinColor: string;
  pins?: MapProfilePin[];
  userLocation?: GeoPoint | null;
  showRadiusRing?: boolean;
  showYouMarker?: boolean;
  showAvatarPins?: boolean;
  selectedPinId?: string | null;
  interactive?: boolean;
  onCenterChange?: (center: GeoPoint) => void;
  onZoomChange?: (zoom: number) => void;
  onPinPress?: (profileId: string) => void;
  pinAccessibilityLabel?: (name: string) => string;
  style?: ViewStyle;
};

const windowSize = Dimensions.get('window');
export const MAP_MIN_ZOOM = 3;
export const MAP_MAX_ZOOM = 16;

const AVATAR_PIN_SIZE = 28;
const AVATAR_PIN_SELECTED = 34;

/** Esri street map with real lat/lng pins, pan, and pinch zoom. */
export function SearchMapView({
  center,
  zoom,
  radiusMiles,
  accentColor,
  pinColor,
  pins = [],
  userLocation = null,
  showRadiusRing = true,
  showYouMarker = true,
  showAvatarPins = true,
  selectedPinId = null,
  interactive = true,
  onCenterChange,
  onZoomChange,
  onPinPress,
  pinAccessibilityLabel,
  style,
}: SearchMapViewProps) {
  const [mapSize, setMapSize] = useState({
    width: windowSize.width,
    height: windowSize.height,
  });

  const tiles = useMemo(
    () => buildMapTiles(zoom, mapSize.width, mapSize.height, center.lat, center.lng),
    [center.lat, center.lng, mapSize.height, mapSize.width, zoom],
  );

  const ringDiameter = useMemo(
    () =>
      radiusMiles >= 9999
        ? Math.min(mapSize.width, mapSize.height) * 0.92
        : milesToPixels(radiusMiles, center.lat, zoom) * 2,
    [center.lat, mapSize.height, mapSize.width, radiusMiles, zoom],
  );

  const mapPins: MapPin[] = useMemo(
    () => layoutMapPins(pins, center, zoom, mapSize.width, mapSize.height),
    [center, mapSize.height, mapSize.width, pins, zoom],
  );

  const youMarker = useMemo(() => {
    if (!userLocation) {
      return { left: mapSize.width / 2, top: mapSize.height / 2 };
    }
    return latLngToPixel(userLocation, center, zoom, mapSize.width, mapSize.height);
  }, [center, mapSize.height, mapSize.width, userLocation, zoom]);

  const panGesture = Gesture.Pan()
    .enabled(interactive && Boolean(onCenterChange))
    .onEnd((event) => {
      onCenterChange?.(moveMapCenter(center, event.translationX, event.translationY, zoom));
    });

  const pinchGesture = Gesture.Pinch()
    .enabled(interactive && Boolean(onZoomChange))
    .onEnd((event) => {
      const nextZoom = Math.round(
        Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, zoom + Math.log2(event.scale) * 1.5)),
      );
      if (nextZoom !== zoom) {
        onZoomChange?.(nextZoom);
      }
    });

  const mapGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const onMapLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) {
      return;
    }
    setMapSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  const renderPin = (pin: MapPin) => {
    const selected = selectedPinId === pin.id;
    const useAvatar = showAvatarPins && Boolean(pin.photoUrl);
    const size = useAvatar ? (selected ? AVATAR_PIN_SELECTED : AVATAR_PIN_SIZE) : selected ? 14 : 10;
    const half = size / 2;
    const positionStyle = {
      left: pin.left - half,
      top: pin.top - half,
      width: size,
      height: size,
      borderRadius: half,
    };

    const pinStyle = [
      useAvatar ? styles.avatarPin : styles.pin,
      selected && (useAvatar ? styles.avatarPinSelected : styles.pinSelected),
      positionStyle,
      {
        backgroundColor: useAvatar ? '#fff' : selected ? accentColor : pinColor,
        borderColor: selected ? accentColor : '#fff',
      },
    ];

    const a11yLabel = pin.name
      ? pinAccessibilityLabel?.(pin.name) ?? pin.name
      : undefined;

    if (!onPinPress) {
      return (
        <View key={pin.id} pointerEvents="none" style={pinStyle}>
          {useAvatar ? (
            <Image source={{ uri: pin.photoUrl }} style={styles.avatarImage} contentFit="cover" />
          ) : null}
        </View>
      );
    }

    return (
      <AnimatedPressable
        key={pin.id}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        onPress={() => onPinPress(pin.id)}
        style={pinStyle}
      >
        {useAvatar ? (
          <Image source={{ uri: pin.photoUrl }} style={styles.avatarImage} contentFit="cover" />
        ) : null}
      </AnimatedPressable>
    );
  };

  const mapBody = (
    <View style={[styles.map, style]} onLayout={onMapLayout}>
      <View style={styles.mapFill} />
      {tiles.map((tile) => (
        <Image
          key={tile.key}
          source={{ uri: tile.uri }}
          style={[styles.tile, { left: tile.left, top: tile.top }]}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ))}

      {showRadiusRing && ringDiameter > 0 ? (
        <View
          pointerEvents="none"
          style={[
            styles.radiusRing,
            {
              width: ringDiameter,
              height: ringDiameter,
              left: mapSize.width / 2 - ringDiameter / 2,
              top: mapSize.height / 2 - ringDiameter / 2,
              borderColor: accentColor,
              backgroundColor: `${accentColor}22`,
            },
          ]}
        />
      ) : null}

      {showYouMarker ? (
        <View
          pointerEvents="none"
          style={[
            styles.youMarker,
            {
              left: youMarker.left - 8,
              top: youMarker.top - 8,
            },
          ]}
        >
          <View style={[styles.youDot, { backgroundColor: accentColor }]} />
        </View>
      ) : null}

      {mapPins.map(renderPin)}
    </View>
  );

  if (!interactive) {
    return mapBody;
  }

  return <GestureDetector gesture={mapGesture}>{mapBody}</GestureDetector>;
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#e6eed8',
    minHeight: 120,
  },
  mapFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#e6eed8',
  },
  tile: {
    position: 'absolute',
    width: TILE_PX,
    height: TILE_PX,
  },
  radiusRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
  },
  youMarker: {
    position: 'absolute',
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
    borderWidth: 1.5,
  },
  pinSelected: {
    borderWidth: 2,
    zIndex: 5,
  },
  avatarPin: {
    position: 'absolute',
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  avatarPinSelected: {
    borderWidth: 3,
    zIndex: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
