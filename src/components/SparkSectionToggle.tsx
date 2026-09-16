import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { SparkSection, SPARK_SECTION_LABELS } from '../types/preferences';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type SparkSectionToggleProps = {
  section: SparkSection;
  onChange: (section: SparkSection) => void;
  wide?: boolean;
};

const SECTIONS: SparkSection[] = ['dating', 'married'];

/** Dating vs Married decks on Spark Discover. */
export function SparkSectionToggle({ section, onChange, wide = false }: SparkSectionToggleProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.surface, borderColor: colors.border },
        wide && styles.wrapWide,
      ]}
    >
      {SECTIONS.map((item) => {
        const active = section === item;
        return (
          <AnimatedPressable
            key={item}
            onPress={() => onChange(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={SPARK_SECTION_LABELS[item]}
            style={[
              styles.tab,
              active && { backgroundColor: colors.gradientEnd },
            ]}
            scaleTo={0.97}
          >
            <Text
              style={[
                styles.label,
                { color: active ? '#fff' : colors.textMuted },
              ]}
            >
              {SPARK_SECTION_LABELS[item]}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 3,
    flex: 1,
    maxWidth: 220,
  },
  wrapWide: {
    flexGrow: 0,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.button - 2,
    paddingVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
