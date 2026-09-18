import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
  /** Geo anchor for the search-radius ring (defaults to map center). */
  radiusCenter?: GeoPoint | null;
  showRadiusRing?: boolean;
  showYouMarker?: boolean;
  showAvatarPins?: boolean;
  selectedPinId?: string | null;
  interactive?: boolean;
  onCenterChange?: (center: GeoPoint) => void;
  onZoomChange?: (zoom: number) => void;
  onPinPress?: (profileId: string) => void;
  pinAccessibilityLabel?: (name: string) => string;
  youMarkerA11y?: string;
  style?: ViewStyle;
};

const windowSize = Dimensions.get('window');
export const MAP_MIN_ZOOM = 3;
export const MAP_MAX_ZOOM = 16;

const AVATAR_PIN_SIZE = 28;
const AVATAR_PIN_SELECTED = 34;

function clampZoom(value: number): number {
  return Math.round(Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, value)));
}

function zoomFromPinchScale(baseZoom: number, scale: number): number {
  return clampZoom(baseZoom + Math.log2(scale) * 1.5);
}

/** Esri street map with real lat/lng pins, live pan, and pinch zoom. */
export function SearchMapView({
  center,
  zoom,
  radiusMiles,
  accentColor,
  pinColor,
  pins = [],
  userLocation = null,
  radiusCenter = null,
  showRadiusRing = true,
  showYouMarker = true,
  showAvatarPins = true,
  selectedPinId = null,
  interactive = true,
  onCenterChange,
  onZoomChange,
  onPinPress,
  pinAccessibilityLabel,
  youMarkerA11y,
  style,
}: SearchMapViewProps) {
  const [mapSize, setMapSize] = useState({
    width: windowSize.width,
    height: windowSize.height,
  });

  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const pinchBaseZoom = useSharedValue(zoom);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  useEffect(() => {
    panX.value = withTiming(0, { duration: 0 });
    panY.value = withTiming(0, { duration: 0 });
  }, [center.lat, center.lng, panX, panY]);

  const tiles = useMemo(
    () => buildMapTiles(zoom, mapSize.width, mapSize.height, center.lat, center.lng),
    [center.lat, center.lng, mapSize.height, mapSize.width, zoom],
  );

  const ringAnchor = radiusCenter ?? center;
  const ringPixel = useMemo(
    () => latLngToPixel(ringAnchor, center, zoom, mapSize.width, mapSize.height),
    [center, mapSize.height, mapSize.width, ringAnchor, zoom],
  );

  const ringDiameter = useMemo(
    () =>
      radiusMiles >= 9999
        ? Math.min(mapSize.width, mapSize.height) * 0.92
        : milesToPixels(radiusMiles, ringAnchor.lat, zoom) * 2,
    [mapSize.height, mapSize.width, radiusMiles, ringAnchor.lat, zoom],
  );

  const ringVisible =
    ringPixel.left > -ringDiameter / 2 &&
    ringPixel.top > -ringDiameter / 2 &&
    ringPixel.left < mapSize.width + ringDiameter / 2 &&
    ringPixel.top < mapSize.height + ringDiameter / 2;

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

  const commitPan = (dx: number, dy: number) => {
    onCenterChange?.(moveMapCenter(center, dx, dy, zoom));
  };

  const commitZoom = (nextZoom: number) => {
    if (nextZoom !== zoomRef.current) {
      onZoomChange?.(nextZoom);
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(interactive && Boolean(onCenterChange))
    .onUpdate((event) => {
      panX.value = event.translationX;
      panY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(commitPan)(event.translationX, event.translationY);
      panX.value = withTiming(0, { duration: 0 });
      panY.value = withTiming(0, { duration: 0 });
    });

  const pinchGesture = Gesture.Pinch()
    .enabled(interactive && Boolean(onZoomChange))
    .onBegin(() => {
      pinchBaseZoom.value = zoomRef.current;
    })
    .onUpdate((event) => {
      const nextZoom = zoomFromPinchScale(pinchBaseZoom.value, event.scale);
      if (nextZoom !== zoomRef.current) {
        runOnJS(commitZoom)(nextZoom);
      }
    });

  const mapGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const layerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panX.value }, { translateY: panY.value }],
  }));

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

  const mapLayer = (
    <>
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

      {showRadiusRing && ringDiameter > 0 && ringVisible ? (
        <View
          pointerEvents="none"
          style={[
            styles.radiusRing,
            {
              width: ringDiameter,
              height: ringDiameter,
              left: ringPixel.left - ringDiameter / 2,
              top: ringPixel.top - ringDiameter / 2,
              borderColor: accentColor,
              backgroundColor: `${accentColor}22`,
            },
          ]}
        />
      ) : null}

      {showYouMarker ? (
        <View
          pointerEvents="none"
          accessible={Boolean(youMarkerA11y)}
          accessibilityLabel={youMarkerA11y}
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
    </>
  );

  const mapBody = (
    <View style={[styles.map, style]} onLayout={onMapLayout}>
      {interactive ? (
        <GestureDetector gesture={mapGesture}>
          <Animated.View style={[styles.mapLayer, layerStyle]}>{mapLayer}</Animated.View>
        </GestureDetector>
      ) : (
        <View style={styles.mapLayer}>{mapLayer}</View>
      )}
    </View>
  );

  return mapBody;
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#e6eed8',
    minHeight: 120,
  },
  mapLayer: {
    ...StyleSheet.absoluteFill,
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
