import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import type { ReactNode } from 'react';

import { AnimatedPressable } from './AnimatedPressable';

/** Tab bar item with the same press transition as in-app buttons. */
export function TabBarButton({ children, style, onPress, onLongPress, ...rest }: BottomTabBarButtonProps) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      scaleTo={0.94}
      opacityTo={0.88}
      style={style}
      {...rest}
    >
      {children as ReactNode}
    </AnimatedPressable>
  );
}
