import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';

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
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      style={[styles.button, { backgroundColor }]}
    >
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
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
  },
});
