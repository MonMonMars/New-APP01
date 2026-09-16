import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import type { ReactNode } from 'react';

/**
 * Tab bar item with press feedback. Uses PlatformPressable so web tab `href` /
 * navigation still works (AnimatedPressable breaks tab switching on web).
 */
export function TabBarButton({ children, style, ...rest }: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...rest}
      pressOpacity={0.88}
      style={style}
    >
      {children as ReactNode}
    </PlatformPressable>
  );
}
