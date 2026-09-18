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
  distanceMiles: number;
  latitude?: number;
  longitude?: number;
  mapX?: number;
  mapY?: number;
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
  selectedPinId?: string | null;
  interactive?: boolean;
  onCenterChange?: (center: GeoPoint) => void;
  onZoomChange?: (zoom: number) => void;
  onPinPress?: (profileId: string) => void;
  style?: ViewStyle;
};

const windowSize = Dimensions.get('window');
const MIN_ZOOM = 3;
const MAX_ZOOM = 16;

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
  selectedPinId = null,
  interactive = true,
  onCenterChange,
  onZoomChange,
  onPinPress,
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
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + Math.log2(event.scale) * 1.5)),
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

      {mapPins.map((pin) => {
        const selected = selectedPinId === pin.id;
        const pinStyle = [
          styles.pin,
          selected && styles.pinSelected,
          {
            left: pin.left,
            top: pin.top,
            backgroundColor: selected ? accentColor : pinColor,
          },
        ];

        if (!onPinPress) {
          return <View key={pin.id} pointerEvents="none" style={pinStyle} />;
        }

        return (
          <AnimatedPressable
            key={pin.id}
            hitSlop={10}
            accessibilityRole="button"
            onPress={() => onPinPress(pin.id)}
            style={pinStyle}
          />
        );
      })}
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    marginTop: -5,
    borderWidth: 1.5,
    borderColor: '#fff',
    zIndex: 3,
  },
  pinSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    marginTop: -7,
    borderWidth: 2,
    zIndex: 5,
  },
});
