import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { useTheme } from '../../context/ThemeContext';
import { disguiseTrendingTopics } from '../../data/disguiseFeed';
import { spacing } from '../../theme';
import { showDemoToast } from '../../utils/demoFeedback';

export function DisguiseTrendingScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader title="Trending" showSearch={false} />
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          What people are talking about today
        </Text>
        {disguiseTrendingTopics.map((item, index) => (
          <Pressable
            key={item.id}
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() =>
              showDemoToast(
                item.label,
                `${item.posts} posts in the last 24 hours. A filtered feed view would open here in production.`,
              )
            }
          >
            <Text style={[styles.rank, { color: colors.textMuted }]}>{index + 1}</Text>
            <View style={styles.topicText}>
              <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.posts, { color: colors.textMuted }]}>{item.posts} posts</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  rank: {
    fontSize: 18,
    fontWeight: '800',
    width: 28,
  },
  topicText: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  posts: {
    fontSize: 12,
    marginTop: 2,
  },
});
