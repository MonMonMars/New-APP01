import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';

export type SwipeEffectKind = 'like' | 'pass';

export type SwipeEffectOrigin = {
  x: number;
  y: number;
};

type SwipeBurstEffectProps = {
  kind: SwipeEffectKind | null;
  origin: SwipeEffectOrigin | null;
  effectKey: number;
  onComplete: () => void;
};

const PARTICLE_COUNT = 20;

type ParticleProps = {
  index: number;
  kind: SwipeEffectKind;
  origin: SwipeEffectOrigin;
  effectKey: number;
};

function Particle({ index, kind, origin, effectKey }: ParticleProps) {
  const progress = useSharedValue(0);
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + (kind === 'like' ? 0.2 : -0.1);
  const distance = 60 + (index % 6) * 22;
  const isLike = kind === 'like';

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      index * 12,
      withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }),
    );
  }, [effectKey, index, progress]);

  const style = useAnimatedStyle(() => {
    const travel = progress.value * distance;
    const x = origin.x + Math.cos(angle) * travel - 12;
    const y = origin.y + Math.sin(angle) * travel - 12;
    const scale = 0.6 + progress.value * (isLike ? 1.4 : 1);
    const opacity = Math.max(0, 1 - progress.value * 0.95);

    return {
      opacity,
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
        { rotate: `${progress.value * (isLike ? 45 : -30)}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.particle, style]}>
      <Ionicons
        name={isLike ? 'heart' : 'close'}
        size={isLike ? 22 : 20}
        color={isLike ? colors.like : colors.nope}
      />
    </Animated.View>
  );
}

export function SwipeBurstEffect({
  kind,
  origin,
  effectKey,
  onComplete,
}: SwipeBurstEffectProps) {
  const flashOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.4);
  const ringOpacity = useSharedValue(0);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    backgroundColor: kind === 'like' ? colors.like : colors.nope,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [
      { translateX: (origin?.x ?? 0) - 40 },
      { translateY: (origin?.y ?? 0) - 40 },
      { scale: ringScale.value },
    ],
  }));

  useEffect(() => {
    if (!kind || !origin) {
      return;
    }

    const flashPeak = kind === 'like' ? 0.55 : 0.45;
    flashOpacity.value = withSequence(
      withTiming(flashPeak, { duration: 100 }),
      withTiming(0, { duration: 450 }),
    );

    ringScale.value = 0.35;
    ringOpacity.value = 1;
    ringScale.value = withTiming(3, { duration: 500, easing: Easing.out(Easing.cubic) });
    ringOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    });
  }, [effectKey, flashOpacity, kind, onComplete, origin, ringOpacity, ringScale]);

  if (!kind || !origin) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.flash, flashStyle]} />
      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          { borderColor: kind === 'like' ? colors.like : colors.nope },
        ]}
      />
      {Array.from({ length: PARTICLE_COUNT }).map((_, index) => (
        <Particle
          key={`${effectKey}-${index}`}
          index={index}
          kind={kind}
          origin={origin}
          effectKey={effectKey}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    elevation: 100,
  },
  flash: {
    ...StyleSheet.absoluteFill,
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
  },
  particle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
