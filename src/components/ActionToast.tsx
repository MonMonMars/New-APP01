import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';

type ActionToastProps = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  durationMs?: number;
};

export function ActionToast({ visible, message, onDismiss, durationMs = 2800 }: ActionToastProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  useEffect(() => {
    if (!visible) {
      return;
    }
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [visible, message, durationMs, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + spacing.md }]}>
      <View style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    alignItems: 'center',
  },
  toast: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
