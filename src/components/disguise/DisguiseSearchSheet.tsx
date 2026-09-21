import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useAppLocale } from '../../hooks/useAppLocale';
import { useTranslation } from '../../i18n';
import { getPulseCategoryLabel } from '../../i18n/labels';
import { AppLocale } from '../../types/locale';
import { useTheme } from '../../context/ThemeContext';
import { femaleTrendingTopics } from '../../data/disguiseFemaleTrending';
import { disguiseTrendingTopics } from '../../data/disguiseTrending';
import { radii, spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { disguiseFeedItemsForGender } from '../../utils/disguiseFeedCatalog';
import { FeedItem } from '../../data/disguiseFeed';
import { usesFemalePulseExperience } from '../../utils/genderAccountPerks';
import { PulseFeedRefreshFooter } from './PulseFeedRefreshFooter';
import { useRotatedPulseContent } from '../../hooks/useRotatedPulseContent';
import { usePulseScrollRefresh } from '../../hooks/usePulseFeedRefresh';
import { AnimatedPressable } from '../AnimatedPressable';

type SearchResult =
  | { kind: 'topic'; label: string; preview: string }
  | { kind: 'article'; item: FeedItem };

type DisguiseSearchSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelectTopic: (topic: string) => void;
  onSelectArticle: (item: FeedItem) => void;
};

function searchableText(item: FeedItem, locale: AppLocale): string {
  switch (item.type) {
    case 'news':
      return `${item.headline} ${item.summary} ${item.source} ${item.category} ${getPulseCategoryLabel(locale, item.category)}`;
    case 'social':
      return `${item.body} ${item.author} ${item.handle}`;
    case 'ad':
      return `${item.brand} ${item.tagline}`;
    case 'disguised_profile':
      return `${item.headline} ${item.name}`;
    default: {
      const _exhaustive: never = item;
      return _exhaustive;
    }
  }
}

export function DisguiseSearchSheet({
  visible,
  onClose,
  onSelectTopic,
  onSelectArticle,
}: DisguiseSearchSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useApp();
  const { locale } = useAppLocale();
  const { t } = useTranslation();
  const meta = useDisguiseWorld();
  const feedCatalog = disguiseFeedItemsForGender(user.gender);
  const baseTrendingTopics = usesFemalePulseExperience(user.gender)
    ? femaleTrendingTopics
    : disguiseTrendingTopics;
  const trendingTopics = useRotatedPulseContent(baseTrendingTopics);
  const rotatedFeedCatalog = useRotatedPulseContent(feedCatalog);
  const { refreshing, justUpdated, scrollViewProps, refresh } = usePulseScrollRefresh();
  const [query, setQuery] = useState('');

  const results = useMemo((): SearchResult[] => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return trendingTopics.slice(0, 6).map((topic) => ({
        kind: 'topic' as const,
        label: topic.label,
        preview: topic.preview,
      }));
    }

    const topicHits = trendingTopics
      .filter(
        (topic) =>
          topic.label.toLowerCase().includes(q) ||
          topic.preview.toLowerCase().includes(q) ||
          topic.category.toLowerCase().includes(q) ||
          getPulseCategoryLabel(locale, topic.category).toLowerCase().includes(q),
      )
      .slice(0, 5)
      .map((topic) => ({ kind: 'topic' as const, label: topic.label, preview: topic.preview }));

    const articleHits: SearchResult[] = [];
    const seen = new Set<string>();
    for (const item of rotatedFeedCatalog) {
      if (seen.has(item.id)) {
        continue;
      }
      if (searchableText(item, locale).toLowerCase().includes(q)) {
        seen.add(item.id);
        articleHits.push({ kind: 'article', item });
      }
      if (articleHits.length >= 8) {
        break;
      }
    }

    return [...topicHits, ...articleHits];
  }, [query, rotatedFeedCatalog, trendingTopics, locale]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{meta.searchTitle}</Text>
          <AnimatedPressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('disguiseSearch.placeholder')}
          placeholderTextColor={colors.textMuted}
          autoFocus
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        />
        <ScrollView
          contentContainerStyle={styles.list}
          {...scrollViewProps}
        >
          {results.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              {t('disguiseSearch.noResults', { query })}
            </Text>
          ) : (
            results.map((result, index) => (
              <AnimatedPressable
                key={`${result.kind}-${index}`}
                style={[styles.row, { borderBottomColor: colors.border }]}
                onPress={() => {
                  if (result.kind === 'topic') {
                    onSelectTopic(result.label);
                  } else {
                    onSelectArticle(result.item);
                  }
                  handleClose();
                }}
              >
                <Ionicons
                  name={result.kind === 'topic' ? 'pricetag-outline' : 'newspaper-outline'}
                  size={18}
                  color={meta.accent}
                />
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
                    {result.kind === 'topic' ? result.label : result.item.type === 'news' ? result.item.headline : result.item.type === 'social' ? result.item.body : result.item.type === 'ad' ? result.item.tagline : result.item.headline}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textMuted }]} numberOfLines={1}>
                    {result.kind === 'topic' ? result.preview : result.item.type === 'news' ? result.item.source : result.item.type === 'social' ? result.item.author : result.item.type === 'ad' ? result.item.brand : result.item.sourceLabel}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </AnimatedPressable>
            ))
          )}
          <PulseFeedRefreshFooter
            refreshing={refreshing}
            justUpdated={justUpdated}
            onPressRefresh={() => {
              void refresh();
            }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  input: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl * 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: spacing.xl,
  },
});
