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
  onComplete: () => void;
};

const PARTICLE_COUNT = 16;

type ParticleProps = {
  index: number;
  kind: SwipeEffectKind;
  origin: SwipeEffectOrigin;
};

function Particle({ index, kind, origin }: ParticleProps) {
  const progress = useSharedValue(0);
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + (kind === 'like' ? 0.2 : -0.1);
  const distance = 48 + (index % 5) * 18;
  const isLike = kind === 'like';

  useEffect(() => {
    progress.value = withDelay(
      index * 18,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => {
    const travel = progress.value * distance;
    const x = origin.x + Math.cos(angle) * travel - 10;
    const y = origin.y + Math.sin(angle) * travel - 10;
    const scale = 0.5 + progress.value * (isLike ? 1.1 : 0.7);
    const opacity = 1 - progress.value;

    return {
      opacity,
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
        { rotate: `${progress.value * (isLike ? 35 : -25)}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.particle, style]}>
      <Ionicons
        name={isLike ? 'heart' : 'close'}
        size={isLike ? 18 : 16}
        color={isLike ? colors.like : colors.nope}
      />
    </Animated.View>
  );
}

export function SwipeBurstEffect({
  kind,
  origin,
  onComplete,
}: SwipeBurstEffectProps) {
  const flashOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.4);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (!kind || !origin) {
      return;
    }

    const flashColor = kind === 'like' ? 0.35 : 0.28;
    flashOpacity.value = withSequence(
      withTiming(flashColor, { duration: 80 }),
      withTiming(0, { duration: 320 }),
    );

    ringScale.value = 0.4;
    ringOpacity.value = 0.85;
    ringScale.value = withTiming(2.4, { duration: 420, easing: Easing.out(Easing.cubic) });
    ringOpacity.value = withTiming(0, { duration: 420 }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    });
  }, [flashOpacity, kind, onComplete, origin, ringOpacity, ringScale]);

  if (!kind || !origin) {
    return null;
  }

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    backgroundColor: kind === 'like' ? colors.like : colors.nope,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [
      { translateX: origin.x - 34 },
      { translateY: origin.y - 34 },
      { scale: ringScale.value },
    ],
  }));

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
        <Particle key={`${kind}-${index}`} index={index} kind={kind} origin={origin} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
  },
  flash: {
    ...StyleSheet.absoluteFill,
  },
  ring: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
  },
  particle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
