import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseMiniPhotoPagerProps = {
  photos: string[];
  index: number;
  onIndexChange: (index: number) => void;
  height?: number;
};

const SWIPE_THRESHOLD = 36;

/** Full-photo mini-window pager — segment bar, tap zones, and horizontal swipe. */
export function DisguiseMiniPhotoPager({
  photos,
  index,
  onIndexChange,
  height = 140,
}: DisguiseMiniPhotoPagerProps) {
  const { colors } = useTheme();
  const safeIndex = photos.length > 0 ? Math.min(index, photos.length - 1) : 0;
  const multiPhoto = photos.length > 1;
  const currentUri = photos[safeIndex];
  const indexRef = useRef(safeIndex);
  indexRef.current = safeIndex;

  const goPrev = useCallback(() => {
    if (photos.length <= 1) {
      return;
    }
    const current = indexRef.current;
    onIndexChange((current - 1 + photos.length) % photos.length);
  }, [onIndexChange, photos.length]);

  const goNext = useCallback(() => {
    if (photos.length <= 1) {
      return;
    }
    const current = indexRef.current;
    onIndexChange((current + 1) % photos.length);
  }, [onIndexChange, photos.length]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-14, 14])
        .failOffsetY([-10, 10])
        .onEnd((event) => {
          'worklet';
          if (event.translationX <= -SWIPE_THRESHOLD) {
            runOnJS(goNext)();
          } else if (event.translationX >= SWIPE_THRESHOLD) {
            runOnJS(goPrev)();
          }
        }),
    [goNext, goPrev],
  );

  if (photos.length === 0) {
    return (
      <View style={[styles.empty, { height, backgroundColor: colors.surface }]}>
        <Ionicons name="image-outline" size={28} color={colors.textMuted} />
      </View>
    );
  }

  const photoLane = (
    <View style={[styles.lane, { height }]}>
      {multiPhoto ? (
        <View style={styles.segments} pointerEvents="box-none">
          {photos.map((_, segmentIndex) => (
            <AnimatedPressable
              key={segmentIndex}
              style={[
                styles.segment,
                segmentIndex === safeIndex && styles.segmentActive,
              ]}
              onPress={() => onIndexChange(segmentIndex)}
              accessibilityRole="button"
              accessibilityLabel={`Photo ${segmentIndex + 1} of ${photos.length}`}
              scaleTo={0.98}
            />
          ))}
        </View>
      ) : null}

      <Image
        source={{ uri: currentUri }}
        style={styles.image}
        contentFit="contain"
        transition={120}
        accessibilityLabel={`Photo ${safeIndex + 1} of ${photos.length}`}
      />

      {multiPhoto ? (
        <>
          <AnimatedPressable
            style={styles.tapLeft}
            onPress={goPrev}
            accessibilityRole="button"
            accessibilityLabel="Previous photo"
          />
          <AnimatedPressable
            style={styles.tapRight}
            onPress={goNext}
            accessibilityRole="button"
            accessibilityLabel="Next photo"
          />
        </>
      ) : null}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {multiPhoto ? <GestureDetector gesture={panGesture}>{photoLane}</GestureDetector> : photoLane}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xs,
  },
  lane: {
    borderRadius: radii.card - 2,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
  },
  segments: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    gap: 3,
    zIndex: 2,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  segmentActive: {
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '38%',
    zIndex: 1,
  },
  tapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '38%',
    zIndex: 1,
  },
  empty: {
    borderRadius: radii.card - 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
});
