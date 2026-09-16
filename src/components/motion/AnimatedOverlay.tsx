import { ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { MOTION } from '../../motion/presets';

type OverlayVariant = 'center' | 'bottom';

type AnimatedOverlayProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: OverlayVariant;
  contentStyle?: StyleProp<ViewStyle>;
};

export function AnimatedOverlay({
  visible,
  onClose,
  children,
  variant = 'bottom',
  contentStyle,
}: AnimatedOverlayProps) {
  const [mounted, setMounted] = useState(visible);
  const backdrop = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdrop.value = withTiming(1, { duration: MOTION.duration.backdrop });
      progress.value = withSpring(
        1,
        variant === 'center' ? MOTION.spring.pop : MOTION.spring.sheet,
      );
      return;
    }

    if (!mounted) {
      return;
    }

    backdrop.value = withTiming(0, { duration: MOTION.duration.exit });
    progress.value = withTiming(0, { duration: MOTION.duration.exit }, (finished) => {
      if (finished) {
        runOnJS(setMounted)(false);
      }
    });
  }, [visible, mounted, variant, backdrop, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value * 0.52,
  }));

  const panelStyle = useAnimatedStyle(() => {
    if (variant === 'center') {
      return {
        opacity: progress.value,
        transform: [
          { scale: 0.9 + progress.value * 0.1 },
          { translateY: (1 - progress.value) * 28 },
        ],
      };
    }

    return {
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * 360 }],
    };
  });

  if (!mounted) {
    return null;
  }

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View
          style={[
            variant === 'center' ? styles.centerPanel : styles.bottomPanel,
            panelStyle,
            contentStyle,
          ]}
          pointerEvents="box-none"
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  centerPanel: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bottomPanel: {
    width: '100%',
  },
});
