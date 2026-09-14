import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBannerCard } from '../../components/disguise/AdBannerCard';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { NewsPostCard } from '../../components/disguise/NewsPostCard';
import { SocialPostCard } from '../../components/disguise/SocialPostCard';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { FeedItem } from '../../data/disguiseFeed';
import { DisguiseTabParamList } from '../../navigation/DisguiseNavigator';
import { buildDisguiseFeed } from '../../utils/buildDisguiseFeed';
import { filterDisguiseFeed, topicFilterLabel } from '../../utils/disguiseFeedFilter';
import { spacing } from '../../theme';

function renderFeedItem({ item }: { item: FeedItem }) {
  switch (item.type) {
    case 'news':
      return <NewsPostCard post={item} />;
    case 'ad':
      return <AdBannerCard ad={item} />;
    case 'social':
      return <SocialPostCard post={item} />;
    default: {
      const _exhaustive: never = item;
      return _exhaustive;
    }
  }
}

export function DisguiseFeedScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, disguiseAdCreative } = useApp();
  const navigation = useNavigation<BottomTabNavigationProp<DisguiseTabParamList>>();
  const route = useRoute<RouteProp<DisguiseTabParamList, 'Home'>>();
  const topic = route.params?.topic;

  const feedItems = useMemo(() => {
    const base = buildDisguiseFeed(user, disguiseAdCreative);
    return filterDisguiseFeed(base, topic);
  }, [user, disguiseAdCreative, topic]);

  const sectionLabel = topicFilterLabel(topic);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader />
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{sectionLabel}</Text>
            {topic ? (
              <Pressable
                onPress={() => navigation.navigate('Home', {})}
                accessibilityLabel="Clear topic filter"
              >
                <Text style={[styles.clearFilter, { color: colors.gradientEnd }]}>Clear</Text>
              </Pressable>
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
