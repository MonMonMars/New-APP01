import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBannerCard } from '../../components/disguise/AdBannerCard';
import { DisguisedProfileCard } from '../../components/disguise/DisguisedProfileCard';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { NewsPostCard } from '../../components/disguise/NewsPostCard';
import { SocialPostCard } from '../../components/disguise/SocialPostCard';
import { useApp } from '../../context/AppContext';
import { useAppLocale } from '../../hooks/useAppLocale';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { FeedItem } from '../../data/disguiseFeed';
import { DisguiseTabParamList } from '../../navigation/DisguiseNavigator';
import { useDisguiseFeedItems } from '../../hooks/useDisguiseFeedItems';
import { topicFilterLabel } from '../../utils/disguiseFeedFilter';
import { navigateDisguiseFeedTopic } from '../../utils/disguiseNavigation';
import { spacing } from '../../theme';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { PulseFeedRefreshFooter } from '../../components/disguise/PulseFeedRefreshFooter';
import { FadeSlideIn } from '../../components/motion/FadeSlideIn';
import { usePulseFeedRefreshGeneration, usePulseScrollRefresh } from '../../hooks/usePulseFeedRefresh';

function renderFeedItem({ item, index }: { item: FeedItem; index: number }) {
  const card = (() => {
    switch (item.type) {
      case 'news':
        return <NewsPostCard post={item} />;
      case 'ad':
        return <AdBannerCard ad={item} />;
      case 'social':
        return <SocialPostCard post={item} />;
      case 'disguised_profile':
        return <DisguisedProfileCard post={item} />;
      default: {
        const _exhaustive: never = item;
        return _exhaustive;
      }
    }
  })();

  return (
    <FadeSlideIn index={index % 10} distance={18}>
      {card}
    </FadeSlideIn>
  );
}

export function DisguiseFeedScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, preferences } = useApp();
  const { locale } = useAppLocale();
  const { t } = useTranslation();
  const meta = disguiseWorldMeta(preferences.sparkSection, user.gender, locale);
  const navigation = useNavigation<BottomTabNavigationProp<DisguiseTabParamList>>();
  const route = useRoute<RouteProp<DisguiseTabParamList, 'Home'>>();
  const topic = route.params?.topic;

  const feedItems = useDisguiseFeedItems(topic);
  const refreshGeneration = usePulseFeedRefreshGeneration();
  const { refreshing, justUpdated, flatListProps } = usePulseScrollRefresh();

  const sectionLabel = topic ? topicFilterLabel(topic, locale) : meta.feedLabel;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader />
      <FlatList
        data={feedItems}
        extraData={refreshGeneration}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => renderFeedItem({ item, index })}
        contentContainerStyle={[styles.list, { paddingBottom: spacing.xl * 2 }]}
        {...flatListProps}
        ListFooterComponent={<PulseFeedRefreshFooter refreshing={refreshing} justUpdated={justUpdated} />}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{sectionLabel}</Text>
            {topic ? (
              <AnimatedPressable
                onPress={() => navigateDisguiseFeedTopic(navigation)}
                accessibilityLabel={t('disguiseFeed.clearFilterA11y')}
              >
                <Text style={[styles.clearFilter, { color: meta.accent }]}>
                  {t('disguiseFeed.clearFilter')}
                </Text>
              </AnimatedPressable>
            ) : null}
          </View>
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {topic
                ? t('disguiseFeed.emptyTopic', { topic: sectionLabel })
                : t('disguiseFeed.emptyNoTopic')}
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
              {topic ? t('disguiseFeed.emptyTopicBody') : t('disguiseFeed.emptyNoTopicBody')}
            </Text>
            {topic ? (
              <AnimatedPressable
                style={[styles.emptyButton, { borderColor: meta.accent }]}
                onPress={() => navigateDisguiseFeedTopic(navigation)}
              >
                <Text style={[styles.emptyButtonText, { color: meta.accent }]}>
                  {t('disguiseFeed.clearFilterButton')}
                </Text>
              </AnimatedPressable>
            ) : (
              <AnimatedPressable
                style={[styles.emptyButton, { borderColor: meta.accent }]}
                onPress={() => navigation.navigate('Trending')}
              >
                <Text style={[styles.emptyButtonText, { color: meta.accent }]}>
                  {t('disguiseFeed.exploreTrending', { tab: meta.trendingTab })}
                </Text>
              </AnimatedPressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  clearFilter: {
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
