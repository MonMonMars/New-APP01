import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { AnimatedPressable } from '../AnimatedPressable';

export type PulseDetailItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

type PulseDetailSheetProps = {
  visible: boolean;
  title: string;
  items: PulseDetailItem[];
  onClose: () => void;
  onItemPress?: (item: PulseDetailItem) => void;
};

export function PulseDetailSheet({
  visible,
  title,
  items,
  onClose,
  onItemPress,
}: PulseDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { preferences } = useApp();
  const accent = useDisguiseWorld().accent;

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
          {items.map((item) => {
            const isPlaceholder = item.id.startsWith('empty-');
            return (
              <AnimatedPressable
                key={item.id}
                style={[styles.row, { borderBottomColor: colors.border }]}
                onPress={isPlaceholder ? undefined : () => onItemPress?.(item)}
                disabled={isPlaceholder}
              >
                {item.icon ? (
                  <Ionicons name={item.icon} size={20} color={accent} />
                ) : (
                  <View style={[styles.dot, { backgroundColor: accent }]} />
                )}
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                  {item.subtitle ? (
                    <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
                  ) : null}
                </View>
                {!isPlaceholder ? (
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                ) : null}
              </AnimatedPressable>
            );
          })}
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
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 24,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
