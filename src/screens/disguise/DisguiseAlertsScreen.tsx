import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityAlertSheet } from '../../components/disguise/ActivityAlertSheet';
import { AdLandingSheet } from '../../components/disguise/AdLandingSheet';
import { maskVariantToContentKind } from '../../components/disguise/ContentTypeIcon';
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

export function DisguiseAlertsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { markActivityAlertsRead } = useApp();

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
    setPreviewReporter(buildAlertReporter(alert.person));
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

          const personContentKind = item.person?.overlayVariant
            ? maskVariantToContentKind(item.person.overlayVariant)
            : 'alert';

          return (
            <AnimatedPressable
              accessibilityRole="button"
              onPress={handlePress}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {item.person ? (
                <View style={styles.personRow}>
                  <FeedPersonThumbnail
                    imageUrl={item.person.avatarUrl}
                    overlayText={item.person.overlayText ?? 'LIVE'}
                    overlayVariant={item.person.overlayVariant ?? 'news'}
                    plainAvatar={!item.person.overlayVariant}
                    contentKind={personContentKind}
                    showIconBadge={!item.person.overlayVariant}
                    onPress={() => openPersonPreview(item)}
                    accessibilityLabel={`View profile: ${item.person.name}`}
                  />
                  <View style={styles.textWrap}>
                    <Text style={[styles.text, { color: colors.text }]}>{item.text}</Text>
                    <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
                  </View>
                </View>
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
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
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
