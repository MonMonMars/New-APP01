import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import {
  SparkSection,
  SPARK_SECTION_HINTS,
  SPARK_SECTION_LABELS,
} from '../types/preferences';
import { ColorPalette, radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { FadeSlideIn } from './motion/FadeSlideIn';

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
      scaleTo={0.98}
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
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close world picker"
        />
        <FadeSlideIn replayKey={visible} distance={22} style={styles.sheetMotion}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose a world</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>
              Anyone can join either section. Likes, matches, and chats stay in the world you pick.
            </Text>
            <View style={styles.listWrap}>
              {SECTIONS.map((item, index) => (
                <FadeSlideIn key={item} replayKey={visible} index={index} distance={12}>
                  <WorldRow
                    item={item}
                    selected={section === item}
                    colors={colors}
                    onPress={() => onSelect(item)}
                  />
                </FadeSlideIn>
              ))}
            </View>
          </View>
        </FadeSlideIn>
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
          scaleTo={0.97}
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
          scaleTo={0.97}
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
    setOpen(false);
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheetMotion: {
    width: '100%',
    maxWidth: 360,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
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
