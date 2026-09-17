import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { AnimatedPressable } from '../AnimatedPressable';

type SavePostButtonProps = {
  postId: string;
  size?: number;
};

export function SavePostButton({ postId, size = 22 }: SavePostButtonProps) {
  const { pulseSocial, savePulsePost, unsavePulsePost, preferences } = useApp();
  const isSaved = pulseSocial.savedPostIds.includes(postId);
  const accent = useDisguiseWorld().accent;

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
        color={accent}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
