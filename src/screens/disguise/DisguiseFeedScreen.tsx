import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBannerCard } from '../../components/disguise/AdBannerCard';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { NewsPostCard } from '../../components/disguise/NewsPostCard';
import { SocialPostCard } from '../../components/disguise/SocialPostCard';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { FeedItem } from '../../data/disguiseFeed';
import { buildDisguiseFeed } from '../../utils/buildDisguiseFeed';
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
  const feedItems = useMemo(
    () => buildDisguiseFeed(user, disguiseAdCreative),
    [user, disguiseAdCreative],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader />
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>For you</Text>
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
});
