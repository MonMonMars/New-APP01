import { StyleSheet, Text, View } from 'react-native';

import { useAppLocale } from '../../hooks/useAppLocale';
import { APP_LOCALE_SHORT, AppLocale } from '../../types/locale';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type LocaleToggleProps = {
  compact?: boolean;
  /** Align chips to the end for inline settings rows. */
  inline?: boolean;
};

export function LocaleToggle({ compact, inline }: LocaleToggleProps) {
  const { colors } = useTheme();
  const { locale, setLocale } = useAppLocale();

  const options: AppLocale[] = ['en', 'zh-TW'];

  return (
    <View style={[styles.row, compact && styles.rowCompact, inline && styles.rowInline]}>
      {options.map((option) => {
        const selected = locale === option;
        return (
          <AnimatedPressable
            key={option}
            style={[
              styles.chip,
              compact && styles.chipCompact,
              {
                backgroundColor: selected ? colors.gradientEnd : colors.surface,
                borderColor: selected ? colors.gradientEnd : colors.border,
              },
            ]}
            onPress={() => setLocale(option)}
          >
            <Text style={[styles.chipText, { color: selected ? '#fff' : colors.textMuted }]}>
              {APP_LOCALE_SHORT[option]}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  rowCompact: {
    marginBottom: 0,
  },
  rowInline: {
    justifyContent: 'flex-end',
    marginBottom: 0,
  },
  chip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipCompact: {
    paddingHorizontal: spacing.sm,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
