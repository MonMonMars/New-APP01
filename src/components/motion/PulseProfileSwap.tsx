import { ReactNode, useEffect, useRef, useState } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MOTION } from '../../motion/presets';
import { ensureWebMotionCss, webClass } from '../../motion/webMotion';

type PulseProfileSwapProps = {
  /** Changes when the underlying dating profile changes — triggers fade-out then fade-in. */
  profileKey: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PulseProfileSwap({ profileKey, children, style }: PulseProfileSwapProps) {
  const [renderKey, setRenderKey] = useState(profileKey);
  const [rendered, setRendered] = useState(children);
  const [webPhase, setWebPhase] = useState<'visible' | 'out' | 'in'>('visible');
  const pendingChildren = useRef(children);
  const opacity = useSharedValue(1);
  const swapToken = useRef(0);

  pendingChildren.current = children;

  useEffect(() => {
    ensureWebMotionCss();
  }, []);

  useEffect(() => {
    if (profileKey === renderKey) {
      setRendered(pendingChildren.current);
      return;
    }

    const token = swapToken.current + 1;
    swapToken.current = token;

    if (Platform.OS === 'web') {
      // Instant swap on web — fade animation left taps dead after Pulse reload.
      setRenderKey(profileKey);
      setRendered(pendingChildren.current);
      setWebPhase('visible');
      return;
    }

    opacity.value = withTiming(0, { duration: MOTION.duration.exit }, (finished) => {
      if (!finished || swapToken.current !== token) {
        return;
      }

      runOnJS(setRenderKey)(profileKey);
      runOnJS(setRendered)(pendingChildren.current);
      opacity.value = withTiming(1, { duration: MOTION.duration.normal });
    });
  }, [opacity, profileKey, renderKey]);

  if (Platform.OS === 'web') {
    const webClassName =
      webPhase === 'out'
        ? 'spark-profile-swap-out'
        : webPhase === 'in'
          ? 'spark-profile-swap-in'
          : undefined;

    return (
      <View style={style} {...(webClassName ? webClass(webClassName) : {})}>
        {webPhase === 'out' ? rendered : children}
      </View>
    );
  }

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[style, animatedStyle]}>{rendered}</Animated.View>;
}
