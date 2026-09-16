import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { pulseBrand } from '../../theme/pulseBrand';
import { AnimatedPressable } from '../AnimatedPressable';

type SavePostButtonProps = {
  postId: string;
  size?: number;
};

export function SavePostButton({ postId, size = 22 }: SavePostButtonProps) {
  const { colors } = useTheme();
  const { pulseSocial, savePulsePost, unsavePulsePost } = useApp();
  const isSaved = pulseSocial.savedPostIds.includes(postId);

  return (
    <AnimatedPressable
      onPress={() => {
        if (isSaved) {
          unsavePulsePost(postId);
        } else {
          savePulsePost(postId);
        }
      }}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={isSaved ? 'Remove from saved' : 'Save post'}
      scaleTo={0.9}
      style={styles.button}
    >
      <Ionicons
        name={isSaved ? 'bookmark' : 'bookmark-outline'}
        size={size}
        color={isSaved ? pulseBrand.accent : colors.textMuted}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
