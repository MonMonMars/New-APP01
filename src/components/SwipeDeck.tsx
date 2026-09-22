import { Ionicons } from '@expo/vector-icons';
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

import { Profile } from '../types/profile';
import {
  DISCOVER_INFO_BUTTON_SIZE,
  DISCOVER_INFO_TOP,
  discoverActionRailHeight,
} from '../constants/discoverLayout';
import { spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { AnimatedPressable } from './AnimatedPressable';
import { DropTargets, ZoneLayout } from './DropTargets';
import { ProfileCard } from './ProfileCard';
import { SuperLikeCelebration } from './SuperLikeCelebration';
import { SwipeBurstEffect, SwipeEffectKind, SwipeEffectOrigin } from './SwipeBurstEffect';

const ZONE_HIT_PADDING = 36;
const ZONE_HIT_PADDING_COMPACT = 26;

export type SwipeDeckHandle = {
  reject: () => void;
  like: () => void;
  superLike: () => void;
  advanceAfterSuperLike: () => void;
};

type SwipeDeckProps = {
  profiles: Profile[];
  onSwipe: (profile: Profile, direction: 'left' | 'right' | 'super') => void;
  onEmpty: () => void;
  canLike?: boolean;
  onLikeBlocked?: () => void;
  onSuperLike?: (profile: Profile) => void;
  onOpenProfile?: (profile: Profile) => void;
  compact?: boolean;
  onRewindPress?: () => void;
  onBoostPress?: () => void;
  rewindEnabled?: boolean;
  isSparkPlus?: boolean;
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
  function SwipeDeck(
    {
      profiles,
      onSwipe,
      onEmpty,
      canLike = true,
      onLikeBlocked,
      onSuperLike,
      onOpenProfile,
      compact = false,
      onRewindPress,
      onBoostPress,
      rewindEnabled = false,
      isSparkPlus = true,
    },
    ref,
  ) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const containerRef = useRef<View>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeEffect, setActiveEffect] = useState<ActiveEffect | null>(null);
    const [effectKey, setEffectKey] = useState(0);
    const [superCelebrationKey, setSuperCelebrationKey] = useState(0);
    const [showSuperCelebration, setShowSuperCelebration] = useState(false);
    const pendingSuperProfileRef = useRef<Profile | null>(null);
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
    const starZone = useSharedValue<ZoneLayout>({
      x: 0,
      y: 0,
      width: 58,
      height: 58,
    });
    const trashActive = useSharedValue(0);
    const heartActive = useSharedValue(0);
    const starActive = useSharedValue(0);

    useEffect(() => {
      setActiveIndex((index) => {
        if (profiles.length === 0) {
          return 0;
        }
        return Math.min(index, profiles.length - 1);
      });
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

      },
      [heartZone, trashZone],
    );

    const advanceCard = useCallback(
      (direction: 'left' | 'right' | 'super') => {
        const current = profiles[activeIndex];
        if (!current) {
          return;
        }

        onSwipe(current, direction);

        // Front card is removed from `profiles` after pass/like — stay at 0 so the next profile fills the slot.
        if (profiles.length <= 1) {
          onEmpty();
        }
      },
      [onEmpty, onSwipe, profiles.length],
    );

    const resetPosition = useCallback(() => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      cardScale.value = withSpring(1, { damping: 18, stiffness: 220 });
      passDim.value = withTiming(0, { duration: 120 });
      trashActive.value = withTiming(0, { duration: 120 });
      heartActive.value = withTiming(0, { duration: 120 });
      starActive.value = withTiming(0, { duration: 120 });
    }, [cardScale, heartActive, passDim, starActive, trashActive, translateX, translateY]);

    const advanceAfterSuperLike = useCallback(() => {
      translateX.value = 0;
      translateY.value = 0;
      cardScale.value = 1;
      passDim.value = 0;
      trashActive.value = 0;
      heartActive.value = 0;
      starActive.value = 0;

      if (profiles.length <= 1) {
        onEmpty();
      }
    }, [
      cardScale,
      heartActive,
      onEmpty,
      passDim,
      profiles.length,
      starActive,
      trashActive,
      translateX,
      translateY,
    ]);

    const finishSuperLikeAnimation = useCallback(() => {
      setShowSuperCelebration(false);
      const profile = pendingSuperProfileRef.current;
      pendingSuperProfileRef.current = null;
      if (profile && onSuperLike) {
        onSuperLike(profile);
      }
    }, [onSuperLike]);

    const dropToTarget = useCallback(
      (direction: 'left' | 'right', superLike = false) => {
        if (direction === 'right' && !canLike) {
          resetPosition();
          if (onLikeBlocked) {
            onLikeBlocked();
          }
          return;
        }

        const current = profiles[activeIndex];
        if (!current) {
          return;
        }

        if (superLike) {
          starActive.value = withTiming(1, { duration: 120 });

          pendingSuperProfileRef.current = current;
          setSuperCelebrationKey((key) => key + 1);
          setShowSuperCelebration(true);

          // Keep the card centered — star burst plays in the middle of the deck.
          translateX.value = withTiming(0, { duration: 180 });
          translateY.value = withTiming(0, { duration: 180 });
          cardScale.value = withTiming(0.94, { duration: 180 });
          return;
        }

        const effectKind: SwipeEffectKind = direction === 'left' ? 'pass' : 'like';
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
            starActive.value = 0;
            runOnJS(advanceCard)(direction);
          }
        });
      },
      [
        activeIndex,
        advanceCard,
        canLike,
        cardScale,
        deckHeight,
        deckWidth,
        heartActive,
        onLikeBlocked,
        passDim,
        profiles,
        resetPosition,
        starActive,
        starZone,
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
        advanceAfterSuperLike,
      }),
      [advanceAfterSuperLike, dropToTarget],
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

    const handleStarLayout = useCallback(
      (layout: ZoneLayout) => {
        starZone.value = layout;
      },
      [starZone],
    );

    const zoneHitPadding = compact ? ZONE_HIT_PADDING_COMPACT : ZONE_HIT_PADDING;

    const panGesture = Gesture.Pan()
      .activeOffsetX([-16, 16])
      .activeOffsetY([-16, 16])
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;

        const cardCenterX = deckWidth.value / 2 + event.translationX;
        const cardCenterY = deckHeight.value / 2 + event.translationY;
        const pointerX = event.x;
        const pointerY = event.y;

        const trashProximity = Math.max(
          zoneProximity(pointerX, pointerY, trashZone.value, zoneHitPadding),
          zoneProximity(
            cardCenterX,
            cardCenterY,
            trashZone.value,
            zoneHitPadding,
          ),
        );
        const heartProximity = Math.max(
          zoneProximity(pointerX, pointerY, heartZone.value, zoneHitPadding),
          zoneProximity(
            cardCenterX,
            cardCenterY,
            heartZone.value,
            zoneHitPadding,
          ),
        );
        const starProximity = Math.max(
          zoneProximity(pointerX, pointerY, starZone.value, zoneHitPadding),
          zoneProximity(
            cardCenterX,
            cardCenterY,
            starZone.value,
            zoneHitPadding,
          ),
        );

        trashActive.value = trashProximity;
        heartActive.value = heartProximity;
        starActive.value = starProximity;

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
          zoneHitPadding,
        );
        const overHeart = isOverZone(
          pointerX,
          pointerY,
          cardCenterX,
          cardCenterY,
          heartZone.value,
          zoneHitPadding,
        );
        const overStar = isOverZone(
          pointerX,
          pointerY,
          cardCenterX,
          cardCenterY,
          starZone.value,
          zoneHitPadding,
        );

        if (overTrash) {
          runOnJS(dropToTarget)('left');
          return;
        }

        if (overStar) {
          runOnJS(dropToTarget)('right', true);
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

    const actionRailHeight = discoverActionRailHeight(compact);

    return (
      <View ref={containerRef} style={styles.container} onLayout={handleDeckLayout}>
        <View style={[styles.deck, { paddingBottom: actionRailHeight }]}>
          {visibleProfiles
            .slice()
            .reverse()
            .map((profile, reverseIndex) => {
              const index =
                activeIndex + (visibleProfiles.length - 1 - reverseIndex);
              const isTop = index === activeIndex;

              if (isTop) {
                return (
                  <View key={profile.id} style={styles.cardSlot} pointerEvents="box-none">
                    <GestureDetector gesture={panGesture}>
                      <Animated.View style={styles.cardSlot} collapsable={false}>
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
                  </View>
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
          starActive={starActive}
          compact={compact}
          onTrashLayout={handleTrashLayout}
          onHeartLayout={handleHeartLayout}
          onStarLayout={handleStarLayout}
          onTrashPress={() => dropToTarget('left')}
          onHeartPress={() => dropToTarget('right')}
          onStarPress={() => dropToTarget('right', true)}
          onRewindPress={onRewindPress}
          onBoostPress={onBoostPress}
          rewindEnabled={rewindEnabled}
          isSparkPlus={isSparkPlus}
        />

        {onOpenProfile && activeIndex < profiles.length ? (
          <View style={styles.infoButtonWrap} pointerEvents="box-none">
            <AnimatedPressable
              style={styles.infoButton}
              onPress={() => onOpenProfile(profiles[activeIndex])}
              accessibilityLabel={t('profileDetail.openDetails')}
              hitSlop={6}
              scaleTo={0.9}
            >
              <Ionicons name="information-circle" size={28} color={colors.text} />
            </AnimatedPressable>
          </View>
        ) : null}

        <SwipeBurstEffect
          kind={activeEffect?.kind ?? null}
          origin={activeEffect?.origin ?? null}
          effectKey={effectKey}
          onComplete={() => setActiveEffect(null)}
        />

        <SuperLikeCelebration
          visible={showSuperCelebration}
          effectKey={superCelebrationKey}
          onComplete={finishSuperLikeAnimation}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  deck: {
    flex: 1,
    height: '100%',
  },
  cardSlot: {
    ...StyleSheet.absoluteFill,
  },
  infoButtonWrap: {
    position: 'absolute',
    top: DISCOVER_INFO_TOP,
    right: spacing.md,
    width: DISCOVER_INFO_BUTTON_SIZE,
    height: DISCOVER_INFO_BUTTON_SIZE,
    zIndex: 50,
    elevation: 50,
  },
  infoButton: {
    width: DISCOVER_INFO_BUTTON_SIZE,
    height: DISCOVER_INFO_BUTTON_SIZE,
    borderRadius: DISCOVER_INFO_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
