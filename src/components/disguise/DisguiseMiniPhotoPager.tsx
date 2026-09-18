import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseMiniPhotoPagerProps = {
  photos: string[];
  index: number;
  onIndexChange: (index: number) => void;
  height?: number;
};

/** Swipeable full-photo strip for the disguise mini-window — contain fit, drag to page. */
export function DisguiseMiniPhotoPager({
  photos,
  index,
  onIndexChange,
  height = 156,
}: DisguiseMiniPhotoPagerProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const scrollSourceRef = useRef<'external' | 'gesture'>('external');
  const [laneWidth, setLaneWidth] = useState(0);
  const safeIndex = photos.length > 0 ? Math.min(index, photos.length - 1) : 0;
  const multiPhoto = photos.length > 1;

  useEffect(() => {
    if (laneWidth <= 0 || !multiPhoto) {
      return;
    }
    if (scrollSourceRef.current === 'gesture') {
      scrollSourceRef.current = 'external';
      return;
    }
    scrollRef.current?.scrollTo({ x: safeIndex * laneWidth, animated: false });
  }, [laneWidth, multiPhoto, photos.length, safeIndex]);

  const syncIndexFromOffset = (offsetX: number) => {
    if (laneWidth <= 0) {
      return;
    }
    const nextIndex = Math.round(offsetX / laneWidth);
    const clamped = Math.max(0, Math.min(nextIndex, photos.length - 1));
    if (clamped !== safeIndex) {
      scrollSourceRef.current = 'gesture';
      onIndexChange(clamped);
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncIndexFromOffset(event.nativeEvent.contentOffset.x);
  };

  const goPrev = () => {
    if (!multiPhoto) {
      return;
    }
    onIndexChange((safeIndex - 1 + photos.length) % photos.length);
  };

  const goNext = () => {
    if (!multiPhoto) {
      return;
    }
    onIndexChange((safeIndex + 1) % photos.length);
  };

  if (photos.length === 0) {
    return (
      <View style={[styles.empty, { height, backgroundColor: colors.surface }]}>
        <Ionicons name="image-outline" size={28} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <View style={[styles.row, { height }]}>
      {multiPhoto ? (
        <AnimatedPressable
          onPress={goPrev}
          style={styles.navButton}
          accessibilityLabel="Previous photo"
          scaleTo={0.9}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
        </AnimatedPressable>
      ) : null}

      <View
        style={styles.lane}
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;
          if (nextWidth > 0 && nextWidth !== laneWidth) {
            setLaneWidth(nextWidth);
          }
        }}
      >
        {multiPhoto && laneWidth > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScrollEnd}
            onScrollEndDrag={handleScrollEnd}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            {photos.map((uri, photoIdx) => (
              <View key={`${uri}-${photoIdx}`} style={[styles.page, { width: laneWidth, height }]}>
                <Image
                  source={{ uri }}
                  style={styles.image}
                  contentFit="contain"
                  transition={120}
                  accessibilityLabel={`Photo ${photoIdx + 1} of ${photos.length}`}
                />
              </View>
            ))}
          </ScrollView>
        ) : multiPhoto ? (
          <View style={[styles.page, { height, opacity: 0.35 }]} />
        ) : (
          <Image
            source={{ uri: photos[safeIndex] }}
            style={styles.image}
            contentFit="contain"
            transition={120}
            accessibilityLabel="Profile photo"
          />
        )}

        {multiPhoto && laneWidth > 0 ? (
          <View style={styles.dots} pointerEvents="none">
            {photos.map((_, dotIndex) => (
              <View
                key={dotIndex}
                style={[styles.dot, dotIndex === safeIndex && styles.dotActive]}
              />
            ))}
          </View>
        ) : null}
      </View>

      {multiPhoto ? (
        <AnimatedPressable
          onPress={goNext}
          style={styles.navButton}
          accessibilityLabel="Next photo"
          scaleTo={0.9}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </AnimatedPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  navButton: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  lane: {
    flex: 1,
    borderRadius: radii.card - 2,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
    minWidth: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'stretch',
  },
  page: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dots: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    zIndex: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 14,
    backgroundColor: '#fff',
  },
  empty: {
    flex: 1,
    borderRadius: radii.card - 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
});
