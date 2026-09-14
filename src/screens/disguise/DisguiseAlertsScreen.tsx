import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdLandingSheet } from '../../components/disguise/AdLandingSheet';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { NewsArticleSheet } from '../../components/disguise/NewsArticleSheet';
import { useTheme } from '../../context/ThemeContext';
import {
  AdPost,
  disguiseAlerts,
  findAdPostByLandingUrl,
  findNewsPostByArticleUrl,
  NewsPost,
} from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { showDemoToast } from '../../utils/demoFeedback';

export function DisguiseAlertsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [articlePost, setArticlePost] = useState<NewsPost | null>(null);
  const [adPost, setAdPost] = useState<AdPost | null>(null);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader title="Activity" showSearch={false} />
      <FlatList
        data={disguiseAlerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const newsPost = item.articleUrl ? findNewsPostByArticleUrl(item.articleUrl) : undefined;
          const ad = item.landingUrl ? findAdPostByLandingUrl(item.landingUrl) : undefined;
          const handlePress = item.articleUrl && newsPost
            ? () => setArticlePost(newsPost)
            : item.landingUrl && ad
              ? () => setAdPost(ad)
              : item.landingUrl
                ? () => {
                    showDemoToast('Sponsored offer', item.text);
                  }
                : () => {
                    showDemoToast('Activity', item.text);
                  };

          return (
            <Pressable
              accessibilityRole="button"
              onPress={handlePress}
              style={[styles.row, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                <Ionicons name={item.icon} size={20} color="#3b82f6" />
              </View>
              <View style={styles.textWrap}>
                <Text style={[styles.text, { color: colors.text }]}>{item.text}</Text>
                <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
              </View>
            </Pressable>
          );
        }}
      />

      <NewsArticleSheet
        visible={articlePost !== null}
        post={articlePost}
        onClose={() => setArticlePost(null)}
      />
      <AdLandingSheet visible={adPost !== null} ad={adPost} onClose={() => setAdPost(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    marginTop: 4,
  },
});
