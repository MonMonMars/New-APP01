import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';

type VideoProfileOverlayProps = {
  visible: boolean;
};

export function VideoProfileOverlay({ visible }: VideoProfileOverlayProps) {
  const { colors } = useTheme();

  if (!visible) {
    return null;
  }

  const handlePress = () => {
    Alert.alert('Video profiles', 'Short video intros are coming soon in Spark v1.0!');
  };

  return (
    <Pressable style={styles.overlay} onPress={handlePress}>
      <View style={[styles.playButton, { backgroundColor: colors.overlay }]}>
        <Ionicons name="play" size={28} color={colors.text} />
      </View>
      <View style={[styles.badge, { backgroundColor: colors.surface }]}>
        <Ionicons name="videocam" size={12} color={colors.gradientEnd} />
        <Text style={[styles.badgeText, { color: colors.text }]}>Video</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: spacing.md + 28,
    right: spacing.md,
    zIndex: 7,
    alignItems: 'center',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
