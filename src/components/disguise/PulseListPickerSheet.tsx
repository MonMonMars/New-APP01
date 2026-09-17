import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { AnimatedPressable } from '../AnimatedPressable';

export type PulseListPickerItem = {
  id: string;
  label: string;
  subtitle?: string;
  selected?: boolean;
};

type PulseListPickerSheetProps = {
  visible: boolean;
  title: string;
  items: PulseListPickerItem[];
  onClose: () => void;
  onSelect: (id: string) => void;
};

export function PulseListPickerSheet({
  visible,
  title,
  items,
  onClose,
  onSelect,
}: PulseListPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { preferences } = useApp();
  const accent = disguiseWorldMeta(preferences.sparkSection).accent;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <AnimatedPressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((item) => (
            <AnimatedPressable
              key={item.id}
              style={[styles.row, { borderBottomColor: colors.border, backgroundColor: item.selected ? `${accent}12` : 'transparent' }]}
              onPress={() => {
                onSelect(item.id);
                onClose();
              }}
            >
              <View style={styles.rowText}>
                <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
                {item.subtitle ? (
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
                ) : null}
              </View>
              {item.selected ? <Ionicons name="checkmark-circle" size={20} color={accent} /> : null}
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 24,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
