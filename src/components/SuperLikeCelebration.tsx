import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';

const PARTICLE_COUNT = 56;

type SuperLikeCelebrationProps = {
  visible: boolean;
  effectKey: number;
  onComplete: () => void;
};

type ParticleProps = {
  index: number;
  effectKey: number;
};

function SuperParticle({ index, effectKey }: ParticleProps) {
  const progress = useSharedValue(0);
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + (index % 5) * 0.15;
  const distance = 120 + (index % 9) * 42;
  const isGold = index % 4 === 0;

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      index * 8,
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) }),
    );
  }, [effectKey, index, progress]);

  const style = useAnimatedStyle(() => {
    const travel = progress.value * distance;
    const wobble = Math.sin(progress.value * Math.PI * 3) * 12;
    return {
      opacity: Math.max(0, 1 - progress.value * 0.92),
      transform: [
        { translateX: Math.cos(angle) * travel - 14 + wobble },
        { translateY: Math.sin(angle) * travel - 14 },
        { scale: 0.4 + progress.value * (isGold ? 2.4 : 1.8) },
        { rotate: `${progress.value * 360}deg` },
      ],
    };
  });

  const iconName = index % 4 === 0 ? 'star' : 'sparkles';
  const iconColor = isGold ? '#FFD700' : index % 2 === 0 ? colors.heartRed : '#FFFFFF';

  return (
    <Animated.View style={[styles.particle, style]}>
      <Ionicons name={iconName} size={isGold ? 28 : 22} color={iconColor} />
    </Animated.View>
  );
}

export function SuperLikeCelebration({
  visible,
  effectKey,
  onComplete,
}: SuperLikeCelebrationProps) {
  const flashOpacity = useSharedValue(0);
  const gradientOpacity = useSharedValue(0);
  const roseScale = useSharedValue(0);
  const roseOpacity = useSharedValue(0);
  const ring1Scale = useSharedValue(0.2);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.1);
  const ring2Opacity = useSharedValue(0);
  const ring3Scale = useSharedValue(0.05);
  const ring3Opacity = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const starBurstScale = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const gradientStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));

  const roseStyle = useAnimatedStyle(() => ({
    opacity: roseOpacity.value,
    transform: [{ scale: roseScale.value }],
  }));

  const starBurstStyle = useAnimatedStyle(() => ({
    opacity: roseOpacity.value * 0.85,
    transform: [
      { scale: starBurstScale.value },
      { rotate: `${starBurstScale.value * 45}deg` },
    ],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));

  const ring3Style = useAnimatedStyle(() => ({
    opacity: ring3Opacity.value,
    transform: [{ scale: ring3Scale.value }],
  }));

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    flashOpacity.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withTiming(0.55, { duration: 200 }),
      withTiming(0, { duration: 900 }),
    );

    gradientOpacity.value = withSequence(
      withTiming(0.9, { duration: 150 }),
      withDelay(400, withTiming(0, { duration: 1100 })),
    );

    roseScale.value = 0.1;
    roseOpacity.value = 1;
    roseScale.value = withSequence(
      withTiming(1.4, { duration: 280, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(1.2, { duration: 160 }),
      withTiming(1.6, { duration: 200 }),
      withTiming(0.2, { duration: 450 }),
    );
    roseOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(900, withTiming(0, { duration: 500 })),
    );

    starBurstScale.value = withSequence(
      withTiming(0.2, { duration: 50 }),
      withTiming(2.2, { duration: 500, easing: Easing.out(Easing.cubic) }),
      withTiming(2.8, { duration: 350 }),
    );

    ring1Opacity.value = 1;
    ring1Scale.value = withTiming(8, { duration: 900, easing: Easing.out(Easing.cubic) });
    ring1Opacity.value = withDelay(200, withTiming(0, { duration: 800 }));

    ring2Opacity.value = 0.9;
    ring2Scale.value = withDelay(
      120,
      withTiming(10, { duration: 1000, easing: Easing.out(Easing.cubic) }),
    );
    ring2Opacity.value = withDelay(300, withTiming(0, { duration: 900 }));

    ring3Opacity.value = 0.7;
    ring3Scale.value = withDelay(
      250,
      withTiming(12, { duration: 1100, easing: Easing.out(Easing.cubic) }),
    );
    ring3Opacity.value = withDelay(500, withTiming(0, { duration: 800 }));

    shakeX.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 40 }),
        withTiming(6, { duration: 40 }),
        withTiming(-4, { duration: 40 }),
        withTiming(4, { duration: 40 }),
        withTiming(0, { duration: 40 }),
      ),
      4,
      false,
    );

    const timer = setTimeout(() => {
      onComplete();
    }, 1850);

    return () => clearTimeout(timer);
  }, [
    effectKey,
    flashOpacity,
    gradientOpacity,
    onComplete,
    ring1Opacity,
    ring1Scale,
    ring2Opacity,
    ring2Scale,
    ring3Opacity,
    ring3Scale,
    roseOpacity,
    roseScale,
    shakeX,
    starBurstScale,
    visible,
  ]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, containerStyle]} pointerEvents="none">
      <Animated.View style={[styles.flash, flashStyle]} />
      <Animated.View style={[StyleSheet.absoluteFill, gradientStyle]}>
        <LinearGradient
          colors={[colors.heartRed, '#FF6B8A', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.centerStage}>
        <View style={styles.burstCore}>
          <Animated.View style={[styles.ring, ring3Style, styles.ringGold]} />
          <Animated.View style={[styles.ring, ring2Style, styles.ringWhite]} />
          <Animated.View style={[styles.ring, ring1Style, styles.ringBlue]} />

          <Animated.View style={starBurstStyle}>
            <Ionicons name="star" size={180} color="rgba(255,215,0,0.4)" />
          </Animated.View>

          <Animated.View style={roseStyle}>
            <Ionicons name="star" size={160} color={colors.heartRed} />
          </Animated.View>

          <View style={styles.particleAnchor}>
            {Array.from({ length: PARTICLE_COUNT }).map((_, index) => (
              <SuperParticle key={`${effectKey}-super-${index}`} index={index} effectKey={effectKey} />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 200,
    elevation: 200,
  },
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.heartRed,
  },
  centerStage: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstCore: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleAnchor: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
  },
  ringBlue: {
    borderColor: colors.heartRed,
  },
  ringWhite: {
    borderColor: 'rgba(255,255,255,0.7)',
    borderWidth: 3,
  },
  ringGold: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  particle: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
