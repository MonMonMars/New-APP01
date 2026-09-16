import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBannerCard } from '../../components/disguise/AdBannerCard';
import { DisguisedProfileCard } from '../../components/disguise/DisguisedProfileCard';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { NewsPostCard } from '../../components/disguise/NewsPostCard';
import { SocialPostCard } from '../../components/disguise/SocialPostCard';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { FeedItem } from '../../data/disguiseFeed';
import { DisguiseTabParamList } from '../../navigation/DisguiseNavigator';
import { buildDisguiseFeed } from '../../utils/buildDisguiseFeed';
import { filterDisguiseFeed, topicFilterLabel } from '../../utils/disguiseFeedFilter';
import { navigateDisguiseFeedTopic } from '../../utils/disguiseNavigation';
import { pulseBrand } from '../../theme/pulseBrand';
import { spacing } from '../../theme';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { FadeSlideIn } from '../../components/motion/FadeSlideIn';

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
  const { user, disguiseAdCreative, pulseSocial } = useApp();
  const navigation = useNavigation<BottomTabNavigationProp<DisguiseTabParamList>>();
  const route = useRoute<RouteProp<DisguiseTabParamList, 'Home'>>();
  const topic = route.params?.topic;

  const feedItems = useMemo(() => {
    const base = buildDisguiseFeed(user, disguiseAdCreative);
    const filtered = filterDisguiseFeed(base, topic);
    return filtered.filter((item) => {
      if (item.type !== 'social') {
        return true;
      }
      if (pulseSocial.reportedPostIds.includes(item.id)) {
        return false;
      }
      const authorHandle = item.handle.trim().toLowerCase();
      return !pulseSocial.mutedAuthors.includes(authorHandle);
    });
  }, [user, disguiseAdCreative, topic, pulseSocial.mutedAuthors, pulseSocial.reportedPostIds]);

  const sectionLabel = topicFilterLabel(topic);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader />
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => renderFeedItem({ item, index })}
        contentContainerStyle={[styles.list, { paddingBottom: spacing.xl * 4 }]}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{sectionLabel}</Text>
            {topic ? (
              <AnimatedPressable
                onPress={() => navigateDisguiseFeedTopic(navigation)}
                accessibilityLabel="Clear topic filter"
              >
                <Text style={[styles.clearFilter, { color: pulseBrand.accent }]}>Clear</Text>
              </AnimatedPressable>
            ) : null}
          </View>
        }
        showsVerticalScrollIndicator={false}
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
});
