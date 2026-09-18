import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ChatReplySuggestionsProps = {
  title: string;
  options: string[];
  loading?: boolean;
  source?: 'llm' | 'local';
  onSelect: (text: string) => void;
  onRefresh?: () => void;
};

/** Three tappable AI reply / opener suggestions above the composer. */
export function ChatReplySuggestions({
  title,
  options,
  loading = false,
  source,
  onSelect,
  onRefresh,
}: ChatReplySuggestionsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.wrap, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={14} color={colors.gradientEnd} />
          <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
          {source === 'llm' ? (
            <Text style={[styles.badge, { color: colors.gradientEnd }]}>{t('chat.aiPowered')}</Text>
          ) : null}
        </View>
        {onRefresh ? (
          <AnimatedPressable
            onPress={onRefresh}
            disabled={loading}
            accessibilityLabel={t('chat.refreshSuggestions')}
            hitSlop={8}
          >
            <Ionicons name="refresh" size={18} color={loading ? colors.textMuted : colors.text} />
          </AnimatedPressable>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={colors.gradientEnd} style={styles.loader} />
      ) : (
        <View style={styles.options}>
          {options.map((option) => (
            <AnimatedPressable
              key={option}
              scaleTo={0.97}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => onSelect(option)}
            >
              <Text style={[styles.chipText, { color: colors.text }]} numberOfLines={3}>
                {option}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: spacing.xs,
  },
  options: {
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
