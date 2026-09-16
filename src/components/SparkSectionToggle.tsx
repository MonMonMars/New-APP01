import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import {
  SparkSection,
  SPARK_SECTION_HINTS,
  SPARK_SECTION_LABELS,
} from '../types/preferences';
import { ColorPalette, radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type SparkSectionToggleVariant = 'title' | 'chip' | 'list';

type SparkSectionToggleProps = {
  section: SparkSection;
  onChange: (section: SparkSection) => void;
  /** title = Discover header; chip = Likes/Matches; list = Hub world cards */
  variant?: SparkSectionToggleVariant;
};

const SECTIONS: SparkSection[] = ['spark', 'ember'];

const SECTION_ICONS: Record<SparkSection, keyof typeof Ionicons.glyphMap> = {
  spark: 'flame',
  ember: 'bonfire',
};

const WEB_FILL = (
  Platform.OS === 'web'
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }
    : {}
) as ViewStyle;

const WEB_SHEET_IN = (
  Platform.OS === 'web'
    ? {
        animationDuration: '380ms',
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        animationFillMode: 'both',
        animationKeyframes: {
          '0%': { opacity: 0, transform: 'scale(0.86) translateY(28px)' },
          '62%': { opacity: 1, transform: 'scale(1.035) translateY(-6px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0px)' },
        },
      }
    : {}
) as ViewStyle;

const WEB_BACKDROP_IN = (
  Platform.OS === 'web'
    ? {
        animationDuration: '240ms',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'both',
        animationKeyframes: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }
    : {}
) as ViewStyle;

function sectionAccent(section: SparkSection, colors: ColorPalette): string {
  return section === 'ember' ? colors.ember : colors.gradientEnd;
}

function WorldRow({
  item,
  selected,
  colors,
  onPress,
}: {
  item: SparkSection;
  selected: boolean;
  colors: ColorPalette;
  onPress: () => void;
}) {
  const accent = sectionAccent(item, colors);

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${SPARK_SECTION_LABELS[item]}. ${SPARK_SECTION_HINTS[item]}`}
      style={[
        styles.row,
        {
          backgroundColor: selected ? `${accent}14` : colors.surface,
          borderColor: selected ? accent : colors.border,
        },
      ]}
      scaleTo={0.96}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={SECTION_ICONS[item]} size={20} color={accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>
          {SPARK_SECTION_LABELS[item]}
        </Text>
        <Text style={[styles.rowHint, { color: colors.textMuted }]}>
          {SPARK_SECTION_HINTS[item]}
        </Text>
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={accent} /> : null}
    </AnimatedPressable>
  );
}

function WorldPickerSheet({
  visible,
  section,
  colors,
  onClose,
  onSelect,
}: {
  visible: boolean;
  section: SparkSection;
  colors: ColorPalette;
  onClose: () => void;
  onSelect: (section: SparkSection) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.modalRoot, WEB_FILL]} pointerEvents="box-none">
        <AnimatedPressable
          style={[styles.backdrop, WEB_BACKDROP_IN]}
          onPress={onClose}
          scaleTo={1}
          opacityTo={1}
          popOnRelease={false}
          flash={false}
          accessibilityRole="button"
          accessibilityLabel="Close world picker"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
            WEB_SHEET_IN,
          ]}
        >
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose a world</Text>
          <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>
            Anyone can join either section. Likes, matches, and chats stay in the world you pick.
          </Text>
          <View style={styles.listWrap}>
            {SECTIONS.map((item) => (
              <WorldRow
                key={item}
                item={item}
                selected={section === item}
                colors={colors}
                onPress={() => onSelect(item)}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function WorldTrigger({
  section,
  colors,
  variant,
  onPress,
}: {
  section: SparkSection;
  colors: ColorPalette;
  variant: 'title' | 'chip';
  onPress: () => void;
}) {
  const accent = sectionAccent(section, colors);

  switch (variant) {
    case 'chip':
      return (
        <AnimatedPressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${SPARK_SECTION_LABELS[section]}. Switch world`}
          accessibilityHint="Opens Spark and Ember. Anyone can join Ember."
          style={[
            styles.chipTrigger,
            {
              backgroundColor: colors.surface,
              borderColor: section === 'ember' ? colors.ember : colors.border,
            },
          ]}
          scaleTo={0.94}
        >
          <Ionicons name={SECTION_ICONS[section]} size={14} color={accent} />
          <Text style={[styles.chipLabel, { color: section === 'ember' ? colors.ember : colors.text }]}>
            {SPARK_SECTION_LABELS[section]}
          </Text>
          <Ionicons name="chevron-down" size={14} color={section === 'ember' ? colors.ember : colors.textMuted} />
        </AnimatedPressable>
      );
    case 'title':
      return (
        <AnimatedPressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${SPARK_SECTION_LABELS[section]}. Switch world`}
          accessibilityHint="Opens Spark and Ember. Anyone can join Ember."
          style={styles.titleTrigger}
          scaleTo={0.94}
        >
          <Ionicons name={SECTION_ICONS[section]} size={20} color={accent} />
          <Text style={[styles.titleLabel, { color: section === 'ember' ? colors.ember : colors.text }]}>
            {SPARK_SECTION_LABELS[section]}
          </Text>
          <Ionicons name="chevron-down" size={18} color={section === 'ember' ? colors.ember : colors.textMuted} />
        </AnimatedPressable>
      );
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

/** Spark vs Ember switcher — Tinder-style title tap. Ember is open to everyone. */
export function SparkSectionToggle({
  section,
  onChange,
  variant = 'title',
}: SparkSectionToggleProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const select = (next: SparkSection) => {
    onChange(next);
    setTimeout(() => setOpen(false), 160);
  };

  switch (variant) {
    case 'list':
      return (
        <View style={styles.listWrap}>
          {SECTIONS.map((item) => (
            <WorldRow
              key={item}
              item={item}
              selected={section === item}
              colors={colors}
              onPress={() => onChange(item)}
            />
          ))}
        </View>
      );
    case 'chip':
    case 'title':
      return (
        <>
          <WorldTrigger
            section={section}
            colors={colors}
            variant={variant}
            onPress={() => setOpen(true)}
          />
          <WorldPickerSheet
            visible={open}
            section={section}
            colors={colors}
            onClose={() => setOpen(false)}
            onSelect={select}
          />
        </>
      );
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  titleTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  titleLabel: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  chipTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalRoot: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 99999,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  sheet: {
    zIndex: 2,
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  listWrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.card,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  rowHint: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
});
