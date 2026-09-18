import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';

import {
  buildMapTiles,
  layoutMapPins,
  TILE_PX,
  type MapPin,
} from '../utils/searchMapTiles';
import { AnimatedPressable } from './AnimatedPressable';

type SearchMapViewProps = {
  center: { lat: number; lng: number };
  zoom: number;
  radiusMiles: number;
  accentColor: string;
  pinColor: string;
  pins?: Array<{ id: string; distanceMiles: number; mapX?: number; mapY?: number }>;
  showRadiusRing?: boolean;
  showYouMarker?: boolean;
  selectedPinId?: string | null;
  onPinPress?: (profileId: string) => void;
  style?: ViewStyle;
};

const windowSize = Dimensions.get('window');

/** Esri street tiles with optional radius ring and profile pins. */
export function SearchMapView({
  center,
  zoom,
  radiusMiles,
  accentColor,
  pinColor,
  pins = [],
  showRadiusRing = true,
  showYouMarker = true,
  selectedPinId = null,
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

  const ringDiameter = Math.min(mapSize.width, mapSize.height) * 0.52;

  const mapPins: MapPin[] = useMemo(
    () => layoutMapPins(pins, mapSize.width, mapSize.height, radiusMiles),
    [mapSize.height, mapSize.width, pins, radiusMiles],
  );

  const onMapLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) {
      return;
    }
    setMapSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  return (
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
        <View style={styles.youMarker} pointerEvents="none">
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
