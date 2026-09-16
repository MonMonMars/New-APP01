import { ReactNode, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { MOTION } from '../../motion/presets';

type AnimatedTabScreenProps = {
  children: ReactNode;
  focused: boolean;
};

/** Subtle fade + slide when a bottom-tab screen gains focus. */
export function AnimatedTabScreen({ children, focused }: AnimatedTabScreenProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0.92, MOTION.spring.tab);
  }, [focused, progress]);

  const style = useAnimatedStyle(() => ({
    flex: 1,
    opacity: 0.55 + progress.value * 0.45,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return <Animated.View style={[styles.screen, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
