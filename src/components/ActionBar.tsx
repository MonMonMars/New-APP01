import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';

type ActionBarProps = {
  onNope: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onRewind: () => void;
  onBoost: () => void;
};

type ActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  backgroundColor: string;
  onPress: () => void;
  disabled?: boolean;
};

function ActionButton({
  icon,
  color,
  size,
  backgroundColor,
  onPress,
  disabled = false,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          opacity: pressed ? 0.85 : disabled ? 0.45 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={size * 0.42} color={color} />
    </Pressable>
  );
}

export function ActionBar({
  onNope,
  onLike,
  onSuperLike,
  onRewind,
  onBoost,
}: ActionBarProps) {
  return (
    <View style={styles.container}>
      <ActionButton
        icon="refresh"
        color={colors.rewind}
        size={46}
        backgroundColor="#1F1F22"
        onPress={onRewind}
        disabled
      />
      <ActionButton
        icon="close"
        color={colors.nope}
        size={58}
        backgroundColor="#1F1F22"
        onPress={onNope}
      />
      <ActionButton
        icon="star"
        color={colors.superLike}
        size={46}
        backgroundColor="#1F1F22"
        onPress={onSuperLike}
      />
      <ActionButton
        icon="heart"
        color={colors.like}
        size={58}
        backgroundColor="#1F1F22"
        onPress={onLike}
      />
      <ActionButton
        icon="flash"
        color={colors.boost}
        size={46}
        backgroundColor="#1F1F22"
        onPress={onBoost}
        disabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
