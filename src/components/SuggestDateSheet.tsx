import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { DATE_SUGGESTIONS } from '../utils/dateSuggestions';
import { radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { AnimatedPressable } from './AnimatedPressable';

type SuggestDateSheetProps = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onSelect: (message: string) => void;
};

/** Bumble Suggest a Date — move from chat to offline. */
export function SuggestDateSheet({ visible, profileName, onClose, onSelect }: SuggestDateSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.backdrop, modalFill]}>
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Suggest a date</Text>
            <AnimatedPressable onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </AnimatedPressable>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Skip small talk — send {profileName} a clear invite to meet.
          </Text>
          <ScrollView contentContainerStyle={styles.list}>
            {DATE_SUGGESTIONS.map((item) => (
              <AnimatedPressable
                key={item.id}
                style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  onSelect(item.message);
                  onClose();
                }}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.gradientEnd} />
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.optionPreview, { color: colors.textMuted }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </AnimatedPressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: radii.card * 2,
    borderTopRightRadius: radii.card * 2,
    padding: spacing.lg,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionPreview: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
