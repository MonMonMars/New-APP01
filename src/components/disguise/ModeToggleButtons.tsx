import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { AnimatedPressable } from '../AnimatedPressable';

type IconButtonProps = {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  accessibilityLabel: string;
};

function ModeIconButton({
  onPress,
  icon,
  color,
  backgroundColor,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      scaleTo={0.92}
      style={[styles.button, { backgroundColor }]}
    >
      <Ionicons name={icon} size={20} color={color} />
    </AnimatedPressable>
  );
}

/** Enter Pulse disguise mode from any Spark screen. */
export function DisguiseModeButton() {
  const { colors } = useTheme();
  const { setDisguiseMode } = useApp();

  return (
    <ModeIconButton
      icon="eye-off-outline"
      color={colors.textMuted}
      backgroundColor={colors.surface}
      accessibilityLabel={`Switch to ${DISGUISE_APP_NAME} disguise mode`}
      onPress={() => setDisguiseMode(true)}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
