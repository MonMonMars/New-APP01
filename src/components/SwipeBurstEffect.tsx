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

import { useTheme } from '../context/ThemeContext';

export type SwipeEffectKind = 'like' | 'pass' | 'super';

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

const PARTICLE_COUNT = 28;

type ParticleProps = {
  index: number;
  kind: SwipeEffectKind;
  origin: SwipeEffectOrigin;
  effectKey: number;
};

function Particle({ index, kind, origin, effectKey }: ParticleProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const isLike = kind === 'like' || kind === 'super';
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + (isLike ? 0.2 : -0.1);
  const distance = isLike ? 80 + (index % 7) * 28 : 50 + (index % 5) * 18;

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      index * (isLike ? 10 : 14),
      withTiming(1, { duration: isLike ? 750 : 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [effectKey, index, isLike, progress]);

  const style = useAnimatedStyle(() => {
    const travel = progress.value * distance;
    const x = origin.x + Math.cos(angle) * travel - 12;
    const y = origin.y + Math.sin(angle) * travel - 12;
    const scale = 0.5 + progress.value * (isLike ? (kind === 'super' ? 2.2 : 1.8) : 0.9);
    const opacity = Math.max(0, 1 - progress.value * (isLike ? 0.88 : 1));

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

  const particleColor = isLike
    ? kind === 'super'
      ? colors.heartRed
      : index % 3 === 0
        ? colors.heartPink
        : colors.heartRed
    : index % 2 === 0
      ? '#4A4A4E'
      : '#1A1A1C';

  const iconName = isLike
    ? kind === 'super'
      ? 'rose'
      : 'heart'
    : index % 3 === 0
      ? 'remove'
      : 'close';

  const iconSize = isLike ? (kind === 'super' ? 26 : 22) : 18;

  return (
    <Animated.View style={[styles.particle, style]}>
      <Ionicons name={iconName} size={iconSize} color={particleColor} />
    </Animated.View>
  );
}

export function SwipeBurstEffect({
  kind,
  origin,
  effectKey,
  onComplete,
}: SwipeBurstEffectProps) {
  const { colors } = useTheme();
  const flashOpacity = useSharedValue(0);
  const vignetteOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.4);
  const ringOpacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.3);
  const ring2Opacity = useSharedValue(0);
  const bigHeartScale = useSharedValue(0);
  const bigHeartOpacity = useSharedValue(0);

  const isLike = kind === 'like' || kind === 'super';
  const isPass = kind === 'pass';

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    backgroundColor: isLike
      ? kind === 'super'
        ? colors.superLike
        : colors.heartRed
      : colors.passDim,
  }));

  const vignetteStyle = useAnimatedStyle(() => ({
    opacity: vignetteOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [
      { translateX: (origin?.x ?? 0) - 50 },
      { translateY: (origin?.y ?? 0) - 50 },
      { scale: ringScale.value },
    ],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [
      { translateX: (origin?.x ?? 0) - 60 },
      { translateY: (origin?.y ?? 0) - 60 },
      { scale: ring2Scale.value },
    ],
  }));

  const bigHeartStyle = useAnimatedStyle(() => ({
    opacity: bigHeartOpacity.value,
    transform: [
      { translateX: (origin?.x ?? 0) - 48 },
      { translateY: (origin?.y ?? 0) - 48 },
      { scale: bigHeartScale.value },
    ],
  }));

  useEffect(() => {
    if (!kind || !origin) {
      return;
    }

    if (isLike) {
      const flashPeak = kind === 'super' ? 0.65 : 0.5;
      flashOpacity.value = withSequence(
        withTiming(flashPeak, { duration: 80 }),
        withTiming(0, { duration: 550 }),
      );

      ringScale.value = 0.3;
      ringOpacity.value = 1;
      ringScale.value = withTiming(kind === 'super' ? 4.5 : 4, {
        duration: 650,
        easing: Easing.out(Easing.cubic),
      });
      ringOpacity.value = withTiming(0, { duration: 650 });

      ring2Scale.value = 0.2;
      ring2Opacity.value = 0.8;
      ring2Scale.value = withDelay(
        80,
        withTiming(kind === 'super' ? 5.5 : 5, { duration: 700, easing: Easing.out(Easing.cubic) }),
      );
      ring2Opacity.value = withDelay(80, withTiming(0, { duration: 700 }));

      bigHeartScale.value = 0.2;
      bigHeartOpacity.value = 1;
      bigHeartScale.value = withSequence(
        withTiming(kind === 'super' ? 2.8 : 2.4, { duration: 280, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(kind === 'super' ? 2.2 : 1.8, { duration: 200 }),
        withTiming(0.5, { duration: 350 }),
      );
      bigHeartOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(380, withTiming(0, { duration: 400 })),
      );

      ringOpacity.value = withDelay(700, withTiming(0, { duration: 50 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }));
    } else if (isPass) {
      flashOpacity.value = withSequence(
        withTiming(0.7, { duration: 120 }),
        withTiming(0.45, { duration: 200 }),
        withTiming(0, { duration: 400 }),
      );

      vignetteOpacity.value = withSequence(
        withTiming(0.85, { duration: 150 }),
        withDelay(200, withTiming(0, { duration: 450 })),
      );

      ringScale.value = 0.5;
      ringOpacity.value = 0.6;
      ringScale.value = withTiming(2.5, { duration: 500, easing: Easing.out(Easing.cubic) });
      ringOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });
    }
  }, [
    bigHeartOpacity,
    bigHeartScale,
    effectKey,
    flashOpacity,
    isLike,
    isPass,
    kind,
    onComplete,
    origin,
    ring2Opacity,
    ring2Scale,
    ringOpacity,
    ringScale,
    vignetteOpacity,
  ]);

  if (!kind || !origin) {
    return null;
  }

  const ringColor = isLike
    ? kind === 'super'
      ? colors.superLike
      : colors.heartPink
    : '#3A3A3E';

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.flash, flashStyle]} />
      {isPass && <Animated.View style={[styles.vignette, vignetteStyle]} />}
      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          { borderColor: ringColor, borderWidth: isLike ? 5 : 3 },
        ]}
      />
      {isLike && (
        <Animated.View
          style={[
            styles.ring,
            styles.ringLarge,
            ring2Style,
            { borderColor: colors.heartRed, borderWidth: 3 },
          ]}
        />
      )}
      {isLike && (
        <Animated.View style={[styles.bigHeart, bigHeartStyle]}>
          <Ionicons
            name={kind === 'super' ? 'star' : 'heart'}
            size={96}
            color={colors.heartRed}
          />
        </Animated.View>
      )}
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
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  ringLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  bigHeart: {
    position: 'absolute',
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
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
