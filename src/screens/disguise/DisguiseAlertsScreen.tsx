import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityAlertSheet } from '../../components/disguise/ActivityAlertSheet';
import { AdLandingSheet } from '../../components/disguise/AdLandingSheet';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { FeedPersonThumbnail } from '../../components/disguise/FeedPersonThumbnail';
import { NewsArticleSheet } from '../../components/disguise/NewsArticleSheet';
import { PersonPreviewSheet } from '../../components/disguise/PersonPreviewSheet';
import { useTheme } from '../../context/ThemeContext';
import {
  AdPost,
  DisguiseAlert,
  disguiseAlerts,
  findAdPostByLandingUrl,
  findNewsPostByArticleUrl,
  NewsPost,
  NewsReporter,
} from '../../data/disguiseFeed';
import { buildAlertReporter } from '../../utils/disguiseReporterPhotos';
import { radii, spacing } from '../../theme';
import { useApp } from '../../context/AppContext';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';

export function DisguiseAlertsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { markActivityAlertsRead, preferences } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection);

  useFocusEffect(
    useCallback(() => {
      markActivityAlertsRead();
    }, [markActivityAlertsRead]),
  );
  const [articlePost, setArticlePost] = useState<NewsPost | null>(null);
  const [adPost, setAdPost] = useState<AdPost | null>(null);
  const [activityAlert, setActivityAlert] = useState<DisguiseAlert | null>(null);
  const [previewReporter, setPreviewReporter] = useState<NewsReporter | null>(null);

  const openPersonPreview = (alert: DisguiseAlert) => {
    if (!alert.person) {
      return;
    }
    setPreviewReporter(buildAlertReporter(alert.person, preferences.sparkSection));
  };

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
              : item.person
                ? () => openPersonPreview(item)
                : () => setActivityAlert(item);

          return (
            <AnimatedPressable
              accessibilityRole="button"
              onPress={handlePress}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {item.person ? (
                <View style={styles.personRow}>
                  <View style={styles.avatarSlot}>
                    <FeedPersonThumbnail
                      imageUrl={item.person.avatarUrl}
                      overlayText={item.person.overlayText ?? 'LIVE'}
                      overlayVariant={item.person.overlayVariant ?? 'news'}
                      plainAvatar={!item.person.overlayVariant}
                      contentKind="profile"
                      hideLabel
                      showIconBadge
                      onPress={() => openPersonPreview(item)}
                      accessibilityLabel={`View profile: ${item.person.name}`}
                    />
                  </View>
                  <View style={styles.textWrap}>
                    <Text style={[styles.text, { color: colors.text }]} numberOfLines={3}>
                      {item.text}
                    </Text>
                    <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={[styles.iconWrap, { backgroundColor: meta.accentSoft }]}>
                    <Ionicons name={item.icon} size={20} color={meta.accent} />
                  </View>
                  <View style={styles.textWrap}>
                    <Text style={[styles.text, { color: colors.text }]} numberOfLines={3}>
                      {item.text}
                    </Text>
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
      <ActivityAlertSheet
        visible={activityAlert !== null}
        alert={activityAlert}
        onClose={() => setActivityAlert(null)}
      />
      <PersonPreviewSheet
        visible={previewReporter !== null}
        reporter={previewReporter}
        onClose={() => setPreviewReporter(null)}
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
    paddingBottom: spacing.xl * 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
    minWidth: 0,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    width: '100%',
    minWidth: 0,
  },
  avatarSlot: {
    width: 48,
    flexShrink: 0,
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
    minWidth: 0,
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
