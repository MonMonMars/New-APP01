import { StyleSheet, Text, View } from 'react-native';

import { SUGGESTED_INTERESTS } from '../data/suggestedInterests';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type InterestsEditorProps = {
  interests: string[];
  onChange: (interests: string[]) => void;
  max?: number;
};

export function InterestsEditor({ interests, onChange, max = 10 }: InterestsEditorProps) {
  const { colors } = useTheme();

  const toggle = (interest: string) => {
    if (interests.includes(interest)) {
      onChange(interests.filter((item) => item !== interest));
      return;
    }
    if (interests.length >= max) {
      return;
    }
    onChange([...interests, interest]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textMuted }]}>
        Interests ({interests.length}/{max})
      </Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Pick at least 5 to improve compatibility and Standouts.
      </Text>
      <View style={styles.chips}>
        {SUGGESTED_INTERESTS.map((interest) => {
          const selected = interests.includes(interest);
          return (
            <AnimatedPressable
              key={interest}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.gradientEnd : colors.surface,
                  borderColor: selected ? colors.gradientEnd : colors.border,
                },
              ]}
              onPress={() => toggle(interest)}
              scaleTo={0.96}
            >
              <Text style={[styles.chipText, { color: selected ? '#fff' : colors.text }]}>
                {interest}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
