import * as Haptics from 'expo-haptics';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Profile } from '../types/profile';
import { ProfileCard } from './ProfileCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_OUT_DISTANCE = SCREEN_WIDTH * 1.25;

export type SwipeDeckHandle = {
  swipeLeft: () => void;
  swipeRight: () => void;
};

type SwipeDeckProps = {
  profiles: Profile[];
  onSwipe: (profile: Profile, direction: 'left' | 'right') => void;
  onEmpty: () => void;
};

export const SwipeDeck = forwardRef<SwipeDeckHandle, SwipeDeckProps>(
  function SwipeDeck({ profiles, onSwipe, onEmpty }, ref) {
    const [activeIndex, setActiveIndex] = useState(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const visibleProfiles = useMemo(
      () => profiles.slice(activeIndex, activeIndex + 3),
      [profiles, activeIndex],
    );

    const advanceCard = useCallback(
      (direction: 'left' | 'right') => {
        const current = profiles[activeIndex];
        if (!current) {
          return;
        }

        void Haptics.impactAsync(
          direction === 'right'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light,
        );

        onSwipe(current, direction);

        const nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex);

        if (nextIndex >= profiles.length) {
          onEmpty();
        }
      },
      [activeIndex, onEmpty, onSwipe, profiles],
    );

    const resetPosition = useCallback(() => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
    }, [translateX, translateY]);

    const swipeOut = useCallback(
      (direction: 'left' | 'right') => {
        const toValue =
          direction === 'right' ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE;
        translateX.value = withTiming(toValue, { duration: 220 }, (finished) => {
          if (finished) {
            translateX.value = 0;
            translateY.value = 0;
            runOnJS(advanceCard)(direction);
          }
        });
      },
      [advanceCard, translateX, translateY],
    );

    useImperativeHandle(
      ref,
      () => ({
        swipeLeft: () => swipeOut('left'),
        swipeRight: () => swipeOut('right'),
      }),
      [swipeOut],
    );

    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.15;
      })
      .onEnd((event) => {
        const shouldSwipeRight =
          event.translationX > SWIPE_THRESHOLD || event.velocityX > 900;
        const shouldSwipeLeft =
          event.translationX < -SWIPE_THRESHOLD || event.velocityX < -900;

        if (shouldSwipeRight) {
          runOnJS(swipeOut)('right');
          return;
        }

        if (shouldSwipeLeft) {
          runOnJS(swipeOut)('left');
          return;
        }

        runOnJS(resetPosition)();
      });

    const deckStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    if (activeIndex >= profiles.length) {
      return null;
    }

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.deck, deckStyle]}>
          {visibleProfiles
            .slice()
            .reverse()
            .map((profile, reverseIndex) => {
              const index =
                activeIndex + (visibleProfiles.length - 1 - reverseIndex);
              const isTop = index === activeIndex;

              if (isTop) {
                return (
                  <GestureDetector key={profile.id} gesture={panGesture}>
                    <Animated.View style={styles.cardSlot}>
                      <ProfileCard
                        profile={profile}
                        index={index}
                        activeIndex={activeIndex}
                        translateX={translateX}
                      />
                    </Animated.View>
                  </GestureDetector>
                );
              }

              return (
                <View key={profile.id} style={styles.cardSlot}>
                  <ProfileCard
                    profile={profile}
                    index={index}
                    activeIndex={activeIndex}
                  />
                </View>
              );
            })}
        </Animated.View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deck: {
    flex: 1,
  },
  cardSlot: {
    ...StyleSheet.absoluteFill,
  },
});
