import * as Haptics from 'expo-haptics';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useSwipeSounds } from '../hooks/useSwipeSounds';
import { Profile } from '../types/profile';
import { DropTargets, ZoneLayout } from './DropTargets';
import { ProfileCard } from './ProfileCard';
import { SwipeBurstEffect, SwipeEffectKind, SwipeEffectOrigin } from './SwipeBurstEffect';

const ZONE_HIT_PADDING = 36;

export type SwipeDeckHandle = {
  reject: () => void;
  like: () => void;
  superLike: () => void;
};

type SwipeDeckProps = {
  profiles: Profile[];
  onSwipe: (profile: Profile, direction: 'left' | 'right') => void;
  onEmpty: () => void;
  canLike?: boolean;
  onLikeBlocked?: () => void;
  compact?: boolean;
};

type ActiveEffect = {
  kind: SwipeEffectKind;
  origin: SwipeEffectOrigin;
};

function isPointInZone(
  x: number,
  y: number,
  zone: ZoneLayout,
  padding: number,
): boolean {
  'worklet';
  return (
    x >= zone.x - padding &&
    x <= zone.x + zone.width + padding &&
    y >= zone.y - padding &&
    y <= zone.y + zone.height + padding
  );
}

function isOverZone(
  x: number,
  y: number,
  cardCenterX: number,
  cardCenterY: number,
  zone: ZoneLayout,
  padding: number,
): boolean {
  'worklet';
  return (
    isPointInZone(x, y, zone, padding) ||
    isPointInZone(cardCenterX, cardCenterY, zone, padding)
  );
}

function zoneProximity(
  x: number,
  y: number,
  zone: ZoneLayout,
  padding: number,
): number {
  'worklet';
  const centerX = zone.x + zone.width / 2;
  const centerY = zone.y + zone.height / 2;
  const maxDistance = zone.width / 2 + padding;
  const distance = Math.hypot(x - centerX, y - centerY);
  if (distance >= maxDistance) {
    return 0;
  }
  return 1 - distance / maxDistance;
}

export const SwipeDeck = forwardRef<SwipeDeckHandle, SwipeDeckProps>(
  function SwipeDeck({ profiles, onSwipe, onEmpty, canLike = true, onLikeBlocked, compact = false }, ref) {
    const { playSound } = useSwipeSounds();
    const containerRef = useRef<View>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeEffect, setActiveEffect] = useState<ActiveEffect | null>(null);
    const [effectKey, setEffectKey] = useState(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const cardScale = useSharedValue(1);
    const passDim = useSharedValue(0);
    const deckWidth = useSharedValue(0);
    const deckHeight = useSharedValue(0);
    const trashZone = useSharedValue<ZoneLayout>({
      x: 0,
      y: 0,
      width: 68,
      height: 68,
    });
    const heartZone = useSharedValue<ZoneLayout>({
      x: 0,
      y: 0,
      width: 68,
      height: 68,
    });
    const trashActive = useSharedValue(0);
    const heartActive = useSharedValue(0);
    const roseActive = useSharedValue(0);

    useEffect(() => {
      setActiveIndex(0);
    }, [profiles]);

    const visibleProfiles = useMemo(
      () => profiles.slice(activeIndex, activeIndex + 3),
      [profiles, activeIndex],
    );

    const triggerFeedback = useCallback(
      (kind: SwipeEffectKind) => {
        const zone =
          kind === 'pass' ? trashZone.value : heartZone.value;

        setEffectKey((key) => key + 1);
        setActiveEffect({
          kind,
          origin: {
            x: zone.x + zone.width / 2,
            y: zone.y + zone.height / 2,
          },
        });

        void playSound(kind === 'pass' ? 'pass' : 'like');
        void Haptics.notificationAsync(
          kind === 'pass'
            ? Haptics.NotificationFeedbackType.Warning
            : Haptics.NotificationFeedbackType.Success,
        );
      },
      [heartZone, playSound, trashZone],
    );

    const advanceCard = useCallback(
      (direction: 'left' | 'right') => {
        const current = profiles[activeIndex];
        if (!current) {
          return;
        }

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
      cardScale.value = withSpring(1, { damping: 18, stiffness: 220 });
      passDim.value = withTiming(0, { duration: 120 });
      trashActive.value = withTiming(0, { duration: 120 });
      heartActive.value = withTiming(0, { duration: 120 });
      roseActive.value = withTiming(0, { duration: 120 });
    }, [cardScale, heartActive, passDim, roseActive, trashActive, translateX, translateY]);

    const dropToTarget = useCallback(
      (direction: 'left' | 'right', superLike = false) => {
        if (direction === 'right' && !canLike) {
          resetPosition();
          if (onLikeBlocked) {
            onLikeBlocked();
          }
          return;
        }

        const effectKind: SwipeEffectKind =
          direction === 'left' ? 'pass' : superLike ? 'super' : 'like';
        triggerFeedback(effectKind);

        const zone = direction === 'left' ? trashZone.value : heartZone.value;
        const targetCenterX = zone.x + zone.width / 2;
        const targetCenterY = zone.y + zone.height / 2;
        const toX = targetCenterX - deckWidth.value / 2;
        const toY = targetCenterY - deckHeight.value / 2;

        if (direction === 'left') {
          passDim.value = withTiming(1, { duration: 180 });
        }

        translateX.value = withTiming(toX, { duration: 220 });
        translateY.value = withTiming(toY, { duration: 220 });
        cardScale.value = withTiming(direction === 'left' ? 0.1 : 0.15, { duration: 220 }, (finished) => {
          if (finished) {
            translateX.value = 0;
            translateY.value = 0;
            cardScale.value = 1;
            passDim.value = 0;
            trashActive.value = 0;
            heartActive.value = 0;
            roseActive.value = 0;
            runOnJS(advanceCard)(direction);
          }
        });
      },
      [
        advanceCard,
        canLike,
        cardScale,
        deckHeight,
        deckWidth,
        heartActive,
        onLikeBlocked,
        passDim,
        resetPosition,
        roseActive,
        trashActive,
        translateX,
        translateY,
        trashZone,
        heartZone,
        triggerFeedback,
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        reject: () => dropToTarget('left'),
        like: () => dropToTarget('right'),
        superLike: () => dropToTarget('right', true),
      }),
      [dropToTarget],
    );

    const handleDeckLayout = useCallback((event: LayoutChangeEvent) => {
      deckWidth.value = event.nativeEvent.layout.width;
      deckHeight.value = event.nativeEvent.layout.height;
    }, [deckHeight, deckWidth]);

    const handleTrashLayout = useCallback(
      (layout: ZoneLayout) => {
        trashZone.value = layout;
      },
      [trashZone],
    );

    const handleHeartLayout = useCallback(
      (layout: ZoneLayout) => {
        heartZone.value = layout;
      },
      [heartZone],
    );

    const panGesture = Gesture.Pan()
      .activeOffsetX([-12, 12])
      .activeOffsetY([-12, 12])
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;

        const cardCenterX = deckWidth.value / 2 + event.translationX;
        const cardCenterY = deckHeight.value / 2 + event.translationY;
        const pointerX = event.x;
        const pointerY = event.y;

        const trashProximity = Math.max(
          zoneProximity(pointerX, pointerY, trashZone.value, ZONE_HIT_PADDING),
          zoneProximity(
            cardCenterX,
            cardCenterY,
            trashZone.value,
            ZONE_HIT_PADDING,
          ),
        );
        const heartProximity = Math.max(
          zoneProximity(pointerX, pointerY, heartZone.value, ZONE_HIT_PADDING),
          zoneProximity(
            cardCenterX,
            cardCenterY,
            heartZone.value,
            ZONE_HIT_PADDING,
          ),
        );

        trashActive.value = trashProximity;
        heartActive.value = heartProximity;

        if (trashProximity > 0.3) {
          passDim.value = trashProximity * 0.7;
        } else {
          passDim.value = 0;
        }
      })
      .onEnd((event) => {
        const cardCenterX = deckWidth.value / 2 + event.translationX;
        const cardCenterY = deckHeight.value / 2 + event.translationY;
        const pointerX = event.x;
        const pointerY = event.y;

        const overTrash = isOverZone(
          pointerX,
          pointerY,
          cardCenterX,
          cardCenterY,
          trashZone.value,
          ZONE_HIT_PADDING,
        );
        const overHeart = isOverZone(
          pointerX,
          pointerY,
          cardCenterX,
          cardCenterY,
          heartZone.value,
          ZONE_HIT_PADDING,
        );

        if (overTrash) {
          runOnJS(dropToTarget)('left');
          return;
        }

        if (overHeart) {
          runOnJS(dropToTarget)('right');
          return;
        }

        runOnJS(resetPosition)();
      });

    if (activeIndex >= profiles.length) {
      return null;
    }

    return (
      <View ref={containerRef} style={styles.container} onLayout={handleDeckLayout}>
        <View style={styles.deck}>
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
                        translateY={translateY}
                        scale={cardScale}
                        passDim={passDim}
                        compact={compact}
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
                    compact={compact}
                  />
                </View>
              );
            })}
        </View>

        <DropTargets
          containerRef={containerRef}
          trashActive={trashActive}
          heartActive={heartActive}
          roseActive={roseActive}
          compact={compact}
          onTrashLayout={handleTrashLayout}
          onHeartLayout={handleHeartLayout}
          onTrashPress={() => dropToTarget('left')}
          onHeartPress={() => dropToTarget('right')}
          onRosePress={() => dropToTarget('right', true)}
        />

        <SwipeBurstEffect
          kind={activeEffect?.kind ?? null}
          origin={activeEffect?.origin ?? null}
          effectKey={effectKey}
          onComplete={() => setActiveEffect(null)}
        />
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
