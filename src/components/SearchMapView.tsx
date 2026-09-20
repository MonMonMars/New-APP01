import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  ImageStyle,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTranslation } from '../i18n';
import { spacing } from '../theme';
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
  /** Floating GPS / “my location” control overlaid on the map (Google Maps style). */
  showLocateButton?: boolean;
  onLocatePress?: () => void;
  locateLoading?: boolean;
  locateAccessibilityLabel?: string;
  /** Extra inset for the locate control (e.g. sit above bottom sheets). */
  locateInsetBottom?: number;
  locateInsetRight?: number;
  /** Google Maps–style +/- zoom (recommended for web and compact map previews). */
  showZoomControls?: boolean;
};

const windowSize = Dimensions.get('window');
export const MAP_MIN_ZOOM = 3;
export const MAP_MAX_ZOOM = 18;

const AVATAR_PIN_SIZE = 28;
const AVATAR_PIN_SELECTED = 34;

const PAN_RESET_MS = 120;
const ZOOM_SETTLE_MS = 220;
const WHEEL_ZOOM_COMMIT_MS = 140;

function clampZoom(value: number): number {
  return Math.round(Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, value)));
}

function fractionalZoomFromPinch(baseZoom: number, scale: number): number {
  return baseZoom + Math.log2(Math.max(scale, 0.12)) * 1.35;
}

function visualScaleForZoom(baseZoom: number, scale: number): number {
  const fractional = fractionalZoomFromPinch(baseZoom, scale);
  const clamped = Math.min(MAP_MAX_ZOOM + 0.85, Math.max(MAP_MIN_ZOOM - 0.85, fractional));
  return 2 ** (clamped - baseZoom);
}

function clampVisualScale(baseZoom: number, scale: number): number {
  const minScale = 2 ** (MAP_MIN_ZOOM - 0.85 - baseZoom);
  const maxScale = 2 ** (MAP_MAX_ZOOM + 0.85 - baseZoom);
  return Math.min(maxScale, Math.max(minScale, scale));
}

/** Standard street basemap (Carto Voyager by default) with pan, pinch/wheel zoom, and GPS control. */
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
  showLocateButton = false,
  onLocatePress,
  locateLoading = false,
  locateAccessibilityLabel,
  locateInsetBottom = spacing.md,
  locateInsetRight = spacing.md,
  showZoomControls = false,
}: SearchMapViewProps) {
  const { t } = useTranslation();
  const [mapSize, setMapSize] = useState({
    width: windowSize.width,
    height: windowSize.height,
  });
  const [webDragging, setWebDragging] = useState(false);

  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const visualZoomScale = useSharedValue(1);
  const mapWidthSv = useSharedValue(mapSize.width);
  const mapHeightSv = useSharedValue(mapSize.height);
  const pinchBaseZoom = useSharedValue(zoom);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const centerRef = useRef(center);
  centerRef.current = center;

  const webDragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });
  const wheelCommitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelPinchBaseZoom = useRef(zoom);
  const wheelAccumScale = useRef(1);

  const mapInteractive =
    interactive && (Boolean(onCenterChange) || Boolean(onZoomChange));

  const resetPanOffset = useCallback(() => {
    panX.value = withTiming(0, { duration: PAN_RESET_MS, easing: Easing.out(Easing.cubic) });
    panY.value = withTiming(0, { duration: PAN_RESET_MS, easing: Easing.out(Easing.cubic) });
  }, [panX, panY]);

  useEffect(() => {
    mapWidthSv.value = mapSize.width;
    mapHeightSv.value = mapSize.height;
  }, [mapHeightSv, mapSize.height, mapSize.width, mapWidthSv]);

  useEffect(() => {
    zoomRef.current = zoom;
    pinchBaseZoom.value = zoom;
    visualZoomScale.value = 1;
    wheelPinchBaseZoom.current = zoom;
    wheelAccumScale.current = 1;
  }, [pinchBaseZoom, visualZoomScale, zoom]);

  useEffect(() => {
    resetPanOffset();
  }, [center.lat, center.lng, resetPanOffset]);

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

  const commitPan = useCallback(
    (dx: number, dy: number) => {
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        resetPanOffset();
        return;
      }
      onCenterChange?.(moveMapCenter(centerRef.current, dx, dy, zoomRef.current));
    },
    [onCenterChange, resetPanOffset],
  );

  const settleVisualZoom = useCallback(() => {
    visualZoomScale.value = withTiming(1, {
      duration: ZOOM_SETTLE_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [visualZoomScale]);

  const commitZoom = useCallback(
    (nextZoom: number) => {
      const clamped = clampZoom(nextZoom);
      if (clamped !== zoomRef.current) {
        onZoomChange?.(clamped);
      } else {
        settleVisualZoom();
      }
    },
    [onZoomChange, settleVisualZoom],
  );

  const commitPinchZoom = useCallback(
    (baseZoom: number, scale: number) => {
      const nextZoom = clampZoom(fractionalZoomFromPinch(baseZoom, scale));
      commitZoom(nextZoom);
      settleVisualZoom();
    },
    [commitZoom, settleVisualZoom],
  );

  const panGesture = Gesture.Pan()
    .enabled(mapInteractive && Boolean(onCenterChange))
    .onUpdate((event) => {
      panX.value = event.translationX;
      panY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(commitPan)(event.translationX, event.translationY);
    });

  const pinchGesture = Gesture.Pinch()
    .enabled(mapInteractive && Boolean(onZoomChange))
    .onBegin(() => {
      pinchBaseZoom.value = zoomRef.current;
      visualZoomScale.value = 1;
    })
    .onUpdate((event) => {
      visualZoomScale.value = clampVisualScale(
        pinchBaseZoom.value,
        visualScaleForZoom(pinchBaseZoom.value, event.scale),
      );
    })
    .onEnd((event) => {
      runOnJS(commitPinchZoom)(pinchBaseZoom.value, event.scale);
    });

  const mapGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const layerStyle = useAnimatedStyle(() => {
    const halfW = mapWidthSv.value / 2;
    const halfH = mapHeightSv.value / 2;
    const scale = visualZoomScale.value;
    return {
      transform: [
        { translateX: halfW },
        { translateY: halfH },
        { scale },
        { translateX: -halfW + panX.value },
        { translateY: -halfH + panY.value },
      ],
    };
  });

  const scheduleWheelZoomCommit = useCallback(() => {
    if (wheelCommitTimer.current) {
      clearTimeout(wheelCommitTimer.current);
    }
    wheelCommitTimer.current = setTimeout(() => {
      wheelCommitTimer.current = null;
      const base = wheelPinchBaseZoom.current;
      const scale = wheelAccumScale.current;
      const nextZoom = clampZoom(fractionalZoomFromPinch(base, scale));
      wheelPinchBaseZoom.current = nextZoom;
      wheelAccumScale.current = 1;
      commitZoom(nextZoom);
      settleVisualZoom();
    }, WHEEL_ZOOM_COMMIT_MS);
  }, [commitZoom, settleVisualZoom]);

  useEffect(
    () => () => {
      if (wheelCommitTimer.current) {
        clearTimeout(wheelCommitTimer.current);
      }
    },
    [],
  );

  const handleZoomStep = (delta: number) => {
    if (!onZoomChange) {
      return;
    }
    const next = clampZoom(zoomRef.current + delta);
    visualZoomScale.value = delta > 0 ? 0.88 : 1.14;
    commitZoom(next);
    settleVisualZoom();
  };

  const handleWebWheel = (event: { deltaY?: number; preventDefault?: () => void }) => {
    if (!mapInteractive || !onZoomChange) {
      return;
    }
    event.preventDefault?.();
    const deltaY = event.deltaY ?? 0;
    if (Math.abs(deltaY) < 1) {
      return;
    }
    const factor = deltaY > 0 ? 0.94 : 1.06;
    wheelAccumScale.current = Math.min(
      4,
      Math.max(0.25, wheelAccumScale.current * factor),
    );
    visualZoomScale.value = clampVisualScale(
      wheelPinchBaseZoom.current,
      visualScaleForZoom(wheelPinchBaseZoom.current, wheelAccumScale.current),
    );
    scheduleWheelZoomCommit();
  };

  const handleWebPointerDown = (clientX: number, clientY: number) => {
    if (!mapInteractive || !onCenterChange) {
      return;
    }
    webDragRef.current = { active: true, lastX: clientX, lastY: clientY };
    setWebDragging(true);
  };

  const handleWebPointerMove = (clientX: number, clientY: number) => {
    const drag = webDragRef.current;
    if (!drag.active) {
      return;
    }
    const dx = clientX - drag.lastX;
    const dy = clientY - drag.lastY;
    drag.lastX = clientX;
    drag.lastY = clientY;
    if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
      panX.value += dx;
      panY.value += dy;
    }
  };

  const handleWebPointerUp = () => {
    const drag = webDragRef.current;
    if (drag.active && onCenterChange) {
      commitPan(panX.value, panY.value);
    }
    drag.active = false;
    setWebDragging(false);
  };

  const webMapHandlers =
    Platform.OS === 'web' && mapInteractive
      ? ({
          onWheel: (e: { nativeEvent: { deltaY: number }; preventDefault?: () => void }) => {
            handleWebWheel({
              deltaY: e.nativeEvent.deltaY,
              preventDefault: () => e.preventDefault?.(),
            });
          },
          onMouseDown: (e: { nativeEvent: { clientX: number; clientY: number } }) => {
            handleWebPointerDown(e.nativeEvent.clientX, e.nativeEvent.clientY);
          },
          onMouseMove: (e: { nativeEvent: { clientX: number; clientY: number } }) => {
            handleWebPointerMove(e.nativeEvent.clientX, e.nativeEvent.clientY);
          },
          onMouseUp: () => {
            handleWebPointerUp();
          },
          onMouseLeave: () => {
            handleWebPointerUp();
          },
        } as const)
      : {};

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

    const pinShellStyle: ViewStyle[] = [
      useAvatar ? styles.avatarPin : styles.pin,
      positionStyle,
      {
        backgroundColor: useAvatar ? '#fff' : selected ? accentColor : pinColor,
        borderColor: selected ? accentColor : '#fff',
      },
    ];
    if (selected) {
      pinShellStyle.push(useAvatar ? styles.avatarPinSelected : styles.pinSelected);
    }
    const avatarImageStyle: ImageStyle = styles.avatarImage;

    const a11yLabel = pin.name
      ? pinAccessibilityLabel?.(pin.name) ?? pin.name
      : undefined;

    if (!onPinPress) {
      return (
        <View key={pin.id} pointerEvents="none" style={pinShellStyle}>
          {useAvatar ? (
            <Image source={{ uri: pin.photoUrl }} style={avatarImageStyle} contentFit="cover" />
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
        style={pinShellStyle}
      >
        {useAvatar ? (
          <Image source={{ uri: pin.photoUrl }} style={avatarImageStyle} contentFit="cover" />
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
          contentFit="fill"
          cachePolicy="memory-disk"
          recyclingKey={tile.key}
          transition={80}
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

  const mapWebCursor =
    mapInteractive && Platform.OS === 'web'
      ? ({
          cursor: webDragging ? 'grabbing' : 'grab',
        } as unknown as ViewStyle)
      : undefined;

  const mapBody = (
    <View
      style={[styles.map, mapWebCursor, style]}
      onLayout={onMapLayout}
      {...webMapHandlers}
    >
      {mapInteractive ? (
        Platform.OS === 'web' ? (
          <Animated.View style={[styles.mapLayer, layerStyle]}>{mapLayer}</Animated.View>
        ) : (
          <GestureDetector gesture={mapGesture}>
            <Animated.View style={[styles.mapLayer, layerStyle]}>{mapLayer}</Animated.View>
          </GestureDetector>
        )
      ) : (
        <View style={styles.mapLayer}>{mapLayer}</View>
      )}
      {showZoomControls && mapInteractive && onZoomChange ? (
        <View style={[styles.zoomStack, { top: spacing.sm, right: spacing.sm }]}>
          <AnimatedPressable
            onPress={() => handleZoomStep(1)}
            accessibilityRole="button"
            accessibilityLabel={t('mapDiscover.zoomInA11y')}
            style={styles.zoomButton}
          >
            <Ionicons name="add" size={20} color="#1a73e8" />
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => handleZoomStep(-1)}
            accessibilityRole="button"
            accessibilityLabel={t('mapDiscover.zoomOutA11y')}
            style={styles.zoomButton}
          >
            <Ionicons name="remove" size={20} color="#1a73e8" />
          </AnimatedPressable>
        </View>
      ) : null}
      {showLocateButton && onLocatePress ? (
        <AnimatedPressable
          onPress={locateLoading ? undefined : onLocatePress}
          accessibilityRole="button"
          accessibilityLabel={locateAccessibilityLabel}
          style={[
            styles.locateButton,
            {
              right: locateInsetRight,
              bottom: locateInsetBottom,
            },
          ]}
        >
          {locateLoading ? (
            <ActivityIndicator color="#1a73e8" />
          ) : (
            <Ionicons name="locate" size={22} color="#1a73e8" />
          )}
        </AnimatedPressable>
      ) : null}
    </View>
  );

  return mapBody;
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    minHeight: 120,
  },
  zoomStack: {
    position: 'absolute',
    zIndex: 12,
    gap: 4,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  mapLayer: {
    ...StyleSheet.absoluteFill,
  },
  mapFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#e8e4df',
  },
  locateButton: {
    position: 'absolute',
    zIndex: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
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
