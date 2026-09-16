import { useEffect, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { radii } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseMiniPhotoPagerProps = {
  photos: string[];
  index: number;
  onIndexChange: (index: number) => void;
  height?: number;
};

/** Swipeable photo strip for the disguise mini-window preview. */
export function DisguiseMiniPhotoPager({
  photos,
  index,
  onIndexChange,
  height = 120,
}: DisguiseMiniPhotoPagerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const safeIndex = photos.length > 0 ? Math.min(index, photos.length - 1) : 0;

  useEffect(() => {
    if (width <= 0 || photos.length <= 1) {
      return;
    }
    scrollRef.current?.scrollTo({ x: safeIndex * width, animated: false });
  }, [photos.length, safeIndex, width]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) {
      return;
    }
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    const clamped = Math.max(0, Math.min(nextIndex, photos.length - 1));
    if (clamped !== safeIndex) {
      onIndexChange(clamped);
    }
  };

  const goPrev = () => {
    if (photos.length <= 1) {
      return;
    }
    onIndexChange((safeIndex - 1 + photos.length) % photos.length);
  };

  const goNext = () => {
    if (photos.length <= 1) {
      return;
    }
    onIndexChange((safeIndex + 1) % photos.length);
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        if (nextWidth > 0 && nextWidth !== width) {
          setWidth(nextWidth);
        }
      }}
    >
      {photos.length === 1 ? (
        <Image source={{ uri: photos[0] }} style={styles.image} resizeMode="cover" />
      ) : width > 0 ? (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleScrollEnd}
            style={styles.scroll}
          >
            {photos.map((uri, photoIdx) => (
              <View key={`${uri}-${photoIdx}`} style={[styles.page, { width }]}>
                <Image source={{ uri }} style={styles.image} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
          <AnimatedPressable
            style={styles.tapLeft}
            onPress={goPrev}
            accessibilityLabel="Previous photo"
          />
          <AnimatedPressable
            style={styles.tapRight}
            onPress={goNext}
            accessibilityLabel="Next photo"
          />
          <View style={styles.dots} pointerEvents="none">
            {photos.map((_, dotIndex) => (
              <View
                key={dotIndex}
                style={[styles.dot, dotIndex === safeIndex && styles.dotActive]}
              />
            ))}
          </View>
        </>
      ) : (
        <Image source={{ uri: photos[safeIndex] }} style={styles.image} resizeMode="cover" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radii.card - 2,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  page: {
    height: '100%',
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
    width: '32%',
  },
  tapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '32%',
  },
  dots: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
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
});
