import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdLandingSheet } from '../../components/disguise/AdLandingSheet';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { FeedPersonRow } from '../../components/disguise/FeedPersonRow';
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
import { AnimatedPressable } from '../../components/AnimatedPressable';

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
            <AnimatedPressable
              accessibilityRole="button"
              onPress={handlePress}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {item.person ? (
                <FeedPersonRow
                  imageUrl={item.person.avatarUrl}
                  overlayText={item.person.overlayText ?? 'LIVE'}
                  overlayVariant={item.person.overlayVariant ?? 'news'}
                  plainAvatar={!item.person.overlayVariant}
                  title={item.person.name}
                  body={item.text}
                  titleStyle={{ color: colors.text }}
                  bodyStyle={{ color: colors.textMuted, fontWeight: '500' }}
                  rightAccessory={
                    <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
                  }
                />
              ) : (
                <>
                  <View style={[styles.iconWrap, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                    <Ionicons name={item.icon} size={20} color="#3b82f6" />
                  </View>
                  <View style={styles.textWrap}>
                    <Text style={[styles.text, { color: colors.text }]}>{item.text}</Text>
                    <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
                  </View>
                </>
              )}
            </AnimatedPressable>
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
    paddingBottom: spacing.xl * 3,
  },
  row: {
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
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
    fontSize: 11,
    marginTop: 2,
  },
});
