import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type RewindButtonProps = {
  visible: boolean;
  onPress: () => void;
  onUpgrade: () => void;
  isSparkPlus: boolean;
  /** Header chip — sits next to Discover tools, clear of profile name. */
  variant?: 'header' | 'overlay';
};

export function RewindButton({
  visible,
  onPress,
  onUpgrade,
  isSparkPlus,
  variant = 'overlay',
}: RewindButtonProps) {
  const { colors } = useTheme();

  if (!visible) {
    return null;
  }

  const handlePress = () => {
    if (isSparkPlus) {
      onPress();
      return;
    }
    onUpgrade();
  };

  const isHeader = variant === 'header';

  return (
    <AnimatedPressable
      style={[
        styles.button,
        isHeader ? styles.headerButton : styles.overlayButton,
        { backgroundColor: colors.surface, borderColor: colors.rewind },
      ]}
      onPress={handlePress}
      accessibilityLabel="Rewind last pass"
    >
      <Ionicons name="refresh" size={isHeader ? 16 : 18} color={colors.rewind} />
      {!isHeader ? <Text style={[styles.label, { color: colors.rewind }]}>Rewind</Text> : null}
      {!isSparkPlus && (
        <View style={[styles.plusDot, { backgroundColor: colors.gradientEnd }]}>
          <Ionicons name="diamond" size={8} color={colors.text} />
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.button,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerButton: {
    height: 40,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: 20,
  },
  overlayButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    zIndex: 25,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
  },
  plusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
