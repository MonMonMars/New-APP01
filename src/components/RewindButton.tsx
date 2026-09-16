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
};

export function RewindButton({ visible, onPress, onUpgrade, isSparkPlus }: RewindButtonProps) {
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

  return (
    <AnimatedPressable
      style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.rewind }]}
      onPress={handlePress}
      accessibilityLabel="Rewind last pass"
    >
      <Ionicons name="refresh" size={18} color={colors.rewind} />
      <Text style={[styles.label, { color: colors.rewind }]}>Rewind</Text>
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
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.lg + 88,
    zIndex: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.button,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
