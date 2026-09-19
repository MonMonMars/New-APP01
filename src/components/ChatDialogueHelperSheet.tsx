import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import {
  generateDialogueSuggestions,
  type ChatDialogueMode,
} from '../services/chatReplyCoach';
import { Message } from '../types/match';
import { Profile, UserProfile } from '../types/profile';
import { radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { AnimatedPressable } from './AnimatedPressable';

type ChatDialogueHelperSheetProps = {
  visible: boolean;
  profile: Profile;
  user: UserProfile;
  messages: Message[];
  initialMode: ChatDialogueMode;
  onClose: () => void;
  onSelect: (text: string) => void;
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

function modeHint(t: (key: string) => string, mode: ChatDialogueMode): string {
  switch (mode) {
    case 'reply':
      return t('chat.aiModeReplyHint');
    case 'topic':
      return t('chat.aiModeTopicHint');
    case 'opener':
      return t('chat.aiModeOpenerHint');
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

/** Full-screen AI dialogue helper — reply ideas and fresh conversation topics. */
export function ChatDialogueHelperSheet({
  visible,
  profile,
  user,
  messages,
  initialMode,
  onClose,
  onSelect,
}: ChatDialogueHelperSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const [mode, setMode] = useState<ChatDialogueMode>(initialMode);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [source, setSource] = useState<'llm' | 'local'>('local');
  const requestRef = useRef(0);

  const availableModes = useMemo((): ChatDialogueMode[] => {
    if (messages.length === 0) {
      return ['opener'];
    }
    return ['reply', 'topic'];
  }, [messages.length]);

  const loadSuggestions = useCallback(() => {
    const activeMode = availableModes.includes(mode) ? mode : availableModes[0];
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    setFailed(false);
    void generateDialogueSuggestions(activeMode, profile, user, messages, locale)
      .then((result) => {
        if (requestId !== requestRef.current) {
          return;
        }
        setOptions([...result.options]);
        setSource(result.source);
      })
      .catch(() => {
        if (requestId !== requestRef.current) {
          return;
        }
        setFailed(true);
      })
      .finally(() => {
        if (requestId !== requestRef.current) {
          return;
        }
        setLoading(false);
      });
  }, [availableModes, locale, messages, mode, profile, user]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setMode(initialMode);
  }, [initialMode, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (!availableModes.includes(mode)) {
      setMode(availableModes[0]);
      return;
    }
    loadSuggestions();
  }, [availableModes, loadSuggestions, mode, visible]);

  const handleSelect = (text: string) => {
    onSelect(text);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Ionicons name="sparkles" size={18} color={colors.gradientEnd} />
              <Text style={[styles.title, { color: colors.text }]}>{t('chat.aiHelperTitle')}</Text>
              {source === 'llm' ? (
                <Text style={[styles.badge, { color: colors.gradientEnd }]}>{t('chat.aiPowered')}</Text>
              ) : null}
            </View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t('chat.aiHelperSubtitle', { name: profile.name })}
            </Text>
          </View>
          <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel={t('common.close')}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
        </View>

        {availableModes.length > 1 ? (
          <View style={[styles.segment, { backgroundColor: colors.surface }]}>
            {availableModes.map((item) => {
              const active = mode === item;
              return (
                <AnimatedPressable
                  key={item}
                  style={[styles.segmentItem, active ? { backgroundColor: colors.gradientEnd } : null]}
                  onPress={() => setMode(item)}
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

        <View style={styles.hintRow}>
          <Text style={[styles.hint, { color: colors.textMuted }]}>{modeHint(t, mode)}</Text>
          <AnimatedPressable
            onPress={loadSuggestions}
            disabled={loading}
            accessibilityLabel={t('chat.refreshSuggestions')}
            hitSlop={8}
          >
            <Ionicons name="refresh" size={20} color={loading ? colors.textMuted : colors.text} />
          </AnimatedPressable>
        </View>

        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {loading ? (
            <ActivityIndicator size="small" color={colors.gradientEnd} style={styles.loader} />
          ) : failed ? (
            <Text style={[styles.failed, { color: colors.textMuted }]}>{t('chat.suggestionsFailed')}</Text>
          ) : (
            options.map((option, index) => (
              <AnimatedPressable
                key={`${index}-${option.slice(0, 20)}`}
                style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleSelect(option)}
                accessibilityLabel={t('chat.suggestionA11y', { text: option })}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                <Ionicons name="arrow-forward-circle" size={20} color={colors.gradientEnd} />
              </AnimatedPressable>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  segment: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.button,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '800',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  hint: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    paddingRight: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  loader: {
    marginTop: spacing.lg,
  },
  failed: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.md,
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
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
});
