import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { ColorPalette, radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  gradient?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const SIZE_STYLES: Record<ButtonSize, { padV: number; padH: number; font: number; icon: number }> = {
  sm: { padV: spacing.sm, padH: spacing.md, font: 14, icon: 16 },
  md: { padV: spacing.md, padH: spacing.lg, font: 16, icon: 18 },
  lg: { padV: spacing.md + 2, padH: spacing.xl, font: 17, icon: 20 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  gradient = false,
  fullWidth = true,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const { colors } = useTheme();
  const metrics = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant, colors, gradient);
  const textColor = variantStyles.textColor;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {iconLeft ? <Ionicons name={iconLeft} size={metrics.icon} color={textColor} /> : null}
          <Text style={[styles.label, { color: textColor, fontSize: metrics.font }]}>{label}</Text>
          {iconRight ? <Ionicons name={iconRight} size={metrics.icon} color={textColor} /> : null}
        </>
      )}
    </>
  );

  const pressableStyle = [
    styles.base,
    {
      paddingVertical: metrics.padV,
      paddingHorizontal: metrics.padH,
      backgroundColor: variantStyles.backgroundColor,
      borderColor: variantStyles.borderColor,
      borderWidth: variantStyles.borderWidth,
    },
    fullWidth && styles.fullWidth,
    style,
  ];

  if (gradient && variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={onPress}
        disabled={isDisabled}
        scaleTo={0.94}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            styles.gradientInner,
            { paddingVertical: metrics.padV, paddingHorizontal: metrics.padH },
          ]}
        >
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={pressableStyle}
    >
      {content}
    </AnimatedPressable>
  );
};

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function IconButton({
  icon,
  onPress,
  size = 40,
  iconSize = 22,
  color,
  backgroundColor,
  disabled,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.88}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor ?? colors.surface,
        },
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={color ?? colors.text} />
    </AnimatedPressable>
  );
}

function getVariantStyles(variant: ButtonVariant, colors: ColorPalette, gradient: boolean) {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: gradient ? 'transparent' : colors.gradientEnd,
        borderColor: 'transparent',
        borderWidth: 0,
        textColor: colors.text,
      };
    case 'secondary':
      return {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: StyleSheet.hairlineWidth,
        textColor: colors.text,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.border,
        borderWidth: 1,
        textColor: colors.text,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        textColor: colors.textMuted,
      };
    case 'destructive':
      return {
        backgroundColor: colors.nope,
        borderColor: 'transparent',
        borderWidth: 0,
        textColor: colors.text,
      };
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  gradientInner: {
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
