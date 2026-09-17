import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { AnimatedPressable } from './AnimatedPressable';

type PurchaseConfirmSheetProps = {
  visible: boolean;
  title: string;
  description: string;
  price: string;
  quantity?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function PurchaseConfirmSheet({
  visible,
  title,
  description,
  price,
  quantity,
  icon = 'bag-outline',
  iconColor,
  onConfirm,
  onClose,
}: PurchaseConfirmSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const accent = iconColor ?? colors.gradientEnd;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, modalFill]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
            <Ionicons name={icon} size={28} color={accent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
          {quantity ? (
            <Text style={[styles.quantity, { color: accent }]}>{quantity}</Text>
          ) : null}
          <Text style={[styles.price, { color: colors.text }]}>{price}</Text>
          <Text style={[styles.legal, { color: colors.textMuted }]}>
            Demo purchase — no real charge. In production this uses Apple or Google billing.
          </Text>
          <AnimatedPressable
            style={[styles.confirmButton, { backgroundColor: colors.gradientEnd }]}
            onPress={() => {
              onConfirm();
              onClose();
            }}
          >
            <Text style={styles.confirmText}>Confirm purchase</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.card + 8,
    borderTopRightRadius: radii.card + 8,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  quantity: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  legal: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  confirmButton: {
    width: '100%',
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelButton: {
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
