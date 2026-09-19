import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import type { ChatDialogueMode } from '../services/chatReplyCoach';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ChatReplySuggestionsProps = {
  title: string;
  options: string[];
  loading?: boolean;
  failed?: boolean;
  hint?: string;
  source?: 'llm' | 'local';
  mode?: ChatDialogueMode;
  availableModes?: ChatDialogueMode[];
  onModeChange?: (mode: ChatDialogueMode) => void;
  onOpenHelper?: () => void;
  onSelect: (text: string) => void;
  onRefresh?: () => void;
};

function modeLabel(t: (key: string) => string, mode: ChatDialogueMode): string {
  switch (mode) {
    case 'reply':
      return t('chat.aiModeReply');
    case 'topic':
      return t('chat.aiModeTopic');
    case 'opener':
      return t('chat.aiModeOpener');
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

/** Three tappable AI reply / opener suggestions above the composer. */
export function ChatReplySuggestions({
  title,
  options,
  loading = false,
  failed = false,
  hint,
  source,
  mode,
  availableModes,
  onModeChange,
  onOpenHelper,
  onSelect,
  onRefresh,
}: ChatReplySuggestionsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showModeTabs =
    availableModes && availableModes.length > 1 && mode && onModeChange;

  return (
    <View style={[styles.wrap, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <AnimatedPressable
          style={styles.titleRow}
          onPress={onOpenHelper}
          disabled={!onOpenHelper}
          accessibilityLabel={onOpenHelper ? t('chat.openDialogueHelper') : title}
        >
          <Ionicons name="sparkles" size={14} color={colors.gradientEnd} />
          <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
          {source === 'llm' ? (
            <Text style={[styles.badge, { color: colors.gradientEnd }]}>{t('chat.aiPowered')}</Text>
          ) : null}
          {onOpenHelper ? (
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          ) : null}
        </AnimatedPressable>
        <View style={styles.headerActions}>
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
      </View>

      {showModeTabs ? (
        <View style={[styles.segment, { backgroundColor: colors.surface }]}>
          {availableModes.map((item) => {
            const active = mode === item;
            return (
              <AnimatedPressable
                key={item}
                style={[styles.segmentItem, active ? { backgroundColor: colors.gradientEnd } : null]}
                onPress={() => onModeChange(item)}
                accessibilityLabel={modeLabel(t, item)}
              >
                <Text style={[styles.segmentText, { color: active ? colors.text : colors.textMuted }]}>
                  {modeLabel(t, item)}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      ) : null}

      {hint ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}

      {loading ? (
        <ActivityIndicator size="small" color={colors.gradientEnd} style={styles.loader} />
      ) : failed ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('chat.suggestionsFailed')}</Text>
      ) : (
        <ScrollView
          horizontal={options.length > 3}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={options.length > 3 ? styles.optionsRow : styles.options}
          keyboardShouldPersistTaps="handled"
        >
          {options.map((option, index) => (
            <AnimatedPressable
              key={`${index}-${option.slice(0, 24)}`}
              scaleTo={0.97}
              style={[
                styles.chip,
                options.length > 3 ? styles.chipHorizontal : null,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => onSelect(option)}
              accessibilityLabel={t('chat.suggestionA11y', { text: option })}
            >
              <Text style={[styles.chipText, { color: colors.text }]} numberOfLines={3}>
                {option}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: radii.button,
    padding: 3,
    gap: 3,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.button,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
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
  hint: {
    fontSize: 12,
    lineHeight: 17,
  },
  options: {
    gap: spacing.xs,
  },
  optionsRow: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  chip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipHorizontal: {
    maxWidth: 260,
  },
  chipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
