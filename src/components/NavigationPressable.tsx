import type { ReactNode } from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { webClass } from '../motion/webMotion';
import { AnimatedPressable } from './AnimatedPressable';

type NavigationPressableProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  scaleTo?: number;
};

/**
 * Reliable taps for mode switches and modals. AnimatedPressable can miss presses on web;
 * PlatformPressable matches tab-bar behavior (see TabBarButton).
 */
export function NavigationPressable({
  children,
  style,
  scaleTo = 0.96,
  disabled,
  onPress,
  ...rest
}: NavigationPressableProps) {
  if (Platform.OS === 'web') {
    return (
      <Pressable
        {...rest}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          style,
          styles.webPressable,
          pressed && !disabled ? styles.webPressed : null,
          disabled ? styles.webDisabled : null,
        ]}
        {...webClass('spark-press')}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPress={onPress}
      style={style}
      scaleTo={scaleTo}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = {
  webPressable: Platform.OS === 'web' ? ({ cursor: 'pointer' } as ViewStyle) : {},
  webPressed: { opacity: 0.82 } as ViewStyle,
  webDisabled: Platform.OS === 'web' ? ({ cursor: 'auto' } as ViewStyle) : {},
};
