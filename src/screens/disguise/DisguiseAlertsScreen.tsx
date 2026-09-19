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
import { useTranslation } from '../../i18n';
import {
  getActivityAlertText,
  getDisguiseOverlaySnippet,
  localizeTimeAgoLabel,
} from '../../i18n/labels';
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
import { PulseFeedRefreshFooter } from '../../components/disguise/PulseFeedRefreshFooter';
import { PulseProfileSwap } from '../../components/motion/PulseProfileSwap';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { useRotatedPulseContent } from '../../hooks/useRotatedPulseContent';
import { usePulseFeedRefreshGeneration, usePulseScrollRefresh } from '../../hooks/usePulseFeedRefresh';
import { resolveDisguiseProfile } from '../../utils/resolveDisguiseProfile';
import { profileIntroCaption } from '../../utils/profileIntroCaption';

export function DisguiseAlertsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { locale, t } = useTranslation();
  const { markActivityAlertsRead, preferences } = useApp();
  const meta = useDisguiseWorld();
  const refreshGeneration = usePulseFeedRefreshGeneration();
  const alerts = useRotatedPulseContent(disguiseAlerts);
  const { refreshing, justUpdated, flatListProps } = usePulseScrollRefresh();

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
      <DisguiseHeader title={t('tabs.activity')} showSearch={false} />
      <FlatList
        data={alerts}
        extraData={refreshGeneration}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        {...flatListProps}
        ListFooterComponent={<PulseFeedRefreshFooter refreshing={refreshing} justUpdated={justUpdated} />}
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

          const linkedProfile = item.person
            ? resolveDisguiseProfile(`alert-${item.id}`, undefined, preferences.sparkSection)
            : null;
          const profileKey = linkedProfile?.id ?? `alert-${item.id}-${refreshGeneration}`;
          const avatarUrl = linkedProfile?.photos[0] ?? item.person?.avatarUrl ?? '';
          const avatarCaption = linkedProfile ? profileIntroCaption(linkedProfile) : undefined;

          return (
            <AnimatedPressable
              accessibilityRole="button"
              onPress={handlePress}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {item.person ? (
                <View style={styles.personRow}>
                  <PulseProfileSwap profileKey={profileKey} style={styles.avatarSlot}>
                    <FeedPersonThumbnail
                      imageUrl={avatarUrl}
                      overlayText={
                        item.person.overlayText
                          ? getDisguiseOverlaySnippet(locale, item.person.overlayText)
                          : t('profile.live')
                      }
                      overlayVariant={item.person.overlayVariant ?? 'news'}
                      plainAvatar={!item.person.overlayVariant}
                      contentKind="profile"
                      caption={avatarCaption}
                      hideLabel
                      showIconBadge
                      onPress={() => openPersonPreview(item)}
                      accessibilityLabel={t('disguiseMiniWindow.viewProfile', { name: item.person.name })}
                    />
                  </PulseProfileSwap>
                  <View style={styles.textWrap}>
                    <Text style={[styles.text, { color: colors.text }]} numberOfLines={3}>
                      {getActivityAlertText(locale, item.id, item.text)}
                    </Text>
                    <Text style={[styles.time, { color: colors.textMuted }]}>
                      {localizeTimeAgoLabel(locale, item.time)}
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={[styles.iconWrap, { backgroundColor: meta.accentSoft }]}>
                    <Ionicons name={item.icon} size={20} color={meta.accent} />
                  </View>
                  <View style={styles.textWrap}>
                    <Text style={[styles.text, { color: colors.text }]} numberOfLines={3}>
                      {getActivityAlertText(locale, item.id, item.text)}
                    </Text>
                    <Text style={[styles.time, { color: colors.textMuted }]}>
                      {localizeTimeAgoLabel(locale, item.time)}
                    </Text>
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
