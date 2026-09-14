import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import {
  formatSearchRadius,
  SEARCH_RADIUS_PRESETS,
  SearchRadiusPreset,
} from '../types/preferences';
import { radii, spacing } from '../theme';

type ExpandLocationSheetProps = {
  visible: boolean;
  currentRadius: number;
  poolTotal: number;
  onClose: () => void;
  onSelectRadius: (miles: SearchRadiusPreset) => void;
};

export function ExpandLocationSheet({
  visible,
  currentRadius,
  poolTotal,
  onClose,
  onSelectRadius,
}: ExpandLocationSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top + spacing.md },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Expand location</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Widen your search radius to discover more people nearby. Currently searching within{' '}
          <Text style={{ color: colors.gradientEnd, fontWeight: '700' }}>
            {formatSearchRadius(currentRadius)}
          </Text>
          {' '}({poolTotal} people in range).
        </Text>

        <View style={styles.chips}>
          {SEARCH_RADIUS_PRESETS.map((preset) => {
            const isActive = currentRadius === preset.value;
            return (
              <Pressable
                key={preset.label}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.gradientEnd : colors.surface,
                    borderColor: isActive ? colors.gradientEnd : colors.border,
                  },
                ]}
                onPress={() => {
                  onSelectRadius(preset.value);
                  onClose();
                }}
              >
                <Ionicons
                  name="location"
                  size={16}
                  color={isActive ? colors.text : colors.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    { color: isActive ? colors.text : colors.textMuted },
                  ]}
                >
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.button,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
