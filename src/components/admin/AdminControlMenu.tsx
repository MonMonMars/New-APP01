import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '../AnimatedPressable';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { spacing } from '../../theme';

export type AdminMenuItem = {
  id: string;
  labelKey: string;
  subtitleKey?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  visible: boolean;
};

type AdminControlMenuProps = {
  items: AdminMenuItem[];
  sectionTitleKey?: string;
};

export function AdminControlMenu({ items, sectionTitleKey = 'admin.tools' }: AdminControlMenuProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const visible = items.filter((item) => item.visible);

  if (visible.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.section, { color: colors.textMuted }]}>{t(sectionTitleKey)}</Text>
      {visible.map((item) => (
        <AnimatedPressable
          key={item.id}
          style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={item.onPress}
          accessibilityRole="button"
        >
          <View style={[styles.iconWrap, { backgroundColor: `${colors.gradientEnd}22` }]}>
            <Ionicons name={item.icon} size={20} color={colors.gradientEnd} />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.label, { color: colors.text }]}>{t(item.labelKey)}</Text>
            {item.subtitleKey ? (
              <Text style={[styles.sub, { color: colors.textMuted }]}>{t(item.subtitleKey)}</Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </AnimatedPressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    fontSize: 12,
    lineHeight: 16,
  },
});
