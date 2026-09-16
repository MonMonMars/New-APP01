import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type PulseUnavailableSheetProps = {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
};

export function PulseUnavailableSheet({
  visible,
  title = 'Post unavailable',
  message = 'This item may have been removed from the feed or is no longer in your saved catalog.',
  onClose,
}: PulseUnavailableSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}>
          <Ionicons name="document-text-outline" size={40} color={colors.textMuted} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
          <AnimatedPressable style={[styles.button, { backgroundColor: colors.gradientEnd }]} onPress={onClose}>
            <Text style={styles.buttonText}>Got it</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
    borderRadius: radii.button,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
