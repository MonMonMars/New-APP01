import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useCallback, useEffect, useState } from 'react';
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
import { AdPost, DisguiseAlert, disguiseAlerts, NewsPost, NewsReporter } from '../../data/disguiseFeed';
import { buildAlertReporter, resolveAlertPersonProfile } from '../../utils/disguiseReporterPhotos';
import { resolvePulseAlertTarget } from '../../utils/resolvePulseAlertTarget';
import { radii, spacing } from '../../theme';
import { useApp } from '../../context/AppContext';
import { PulseFeedRefreshFooter } from '../../components/disguise/PulseFeedRefreshFooter';
import { PulseFeedRefreshHeader } from '../../components/disguise/PulseFeedRefreshHeader';
import { PulseFeedRefreshDimLayer } from '../../components/disguise/PulseFeedRefreshDimLayer';
import { DisguiseTabParamList } from '../../navigation/DisguiseNavigator';
import { PulseProfileSwap } from '../../components/motion/PulseProfileSwap';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { usePulseContextSection } from '../../hooks/usePulseContextSection';
import { useRotatedPulseContent } from '../../hooks/useRotatedPulseContent';
import { usePulseFeedRefreshGeneration, usePulseScrollRefresh } from '../../hooks/usePulseFeedRefresh';
import { profileIntroCaption } from '../../utils/profileIntroCaption';

export function DisguiseAlertsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<DisguiseTabParamList>>();
  const { colors } = useTheme();
  const { locale, t } = useTranslation();
  const { markActivityAlertsRead } = useApp();
  const pulseSection = usePulseContextSection();
  const meta = useDisguiseWorld();
  const refreshGeneration = usePulseFeedRefreshGeneration();
  const alerts = useRotatedPulseContent(disguiseAlerts);
  const {
    refreshing,
    justUpdated,
    isAtTop,
    flatListProps,
    listRef,
    refresh,
    handleTabRepress,
  } = usePulseScrollRefresh();

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      handleTabRepress();
    });
    return unsubscribe;
  }, [handleTabRepress, navigation]);

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
    const reporter = buildAlertReporter(alert.person, pulseSection);
    if (!reporter.profileId) {
      return;
    }
    setPreviewReporter(reporter);
  };

  const openAlertTarget = (alert: DisguiseAlert) => {
    const target = resolvePulseAlertTarget(alert, locale);
    switch (target.kind) {
      case 'news':
        setArticlePost(target.post);
        break;
      case 'ad':
        setAdPost(target.ad);
        break;
      case 'activity':
        setActivityAlert(alert);
        break;
      default: {
        const _exhaustive: never = target;
        return _exhaustive;
      }
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader title={t('tabs.activity')} showSearch={false} />
      <PulseFeedRefreshDimLayer refreshing={refreshing}>
      <FlatList
        ref={listRef}
        data={alerts}
        extraData={refreshGeneration}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        {...flatListProps}
        ListHeaderComponent={
          <PulseFeedRefreshHeader
            refreshing={refreshing}
            justUpdated={justUpdated}
            isAtTop={isAtTop}
            onPullRefresh={() => {
              void refresh();
            }}
          />
        }
        ListFooterComponent={
          <PulseFeedRefreshFooter
            refreshing={refreshing}
            justUpdated={justUpdated}
            variant="refresh"
            onPressRefresh={() => {
              void refresh();
            }}
          />
        }
        renderItem={({ item }) => {
          const linkedProfile = item.person ? resolveAlertPersonProfile(item.person, pulseSection) : null;
          const profileKey = linkedProfile?.id ?? `alert-${item.id}-${refreshGeneration}`;
          const avatarUrl = linkedProfile?.photos[0] ?? item.person?.avatarUrl ?? '';
          const avatarCaption = linkedProfile ? profileIntroCaption(linkedProfile) : undefined;
          const alertText = getActivityAlertText(locale, item.id, item.text);

          const textBlock = (
            <>
              <Text style={[styles.text, { color: colors.text }]} numberOfLines={3}>
                {alertText}
              </Text>
              <Text style={[styles.time, { color: colors.textMuted }]}>
                {localizeTimeAgoLabel(locale, item.time)}
              </Text>
            </>
          );

          return (
            <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                      contentKind={linkedProfile ? 'profile' : item.person.overlayVariant === 'news' ? 'news' : 'alert'}
                      caption={avatarCaption}
                      hideLabel
                      showIconBadge={Boolean(linkedProfile)}
                      onPress={linkedProfile ? () => openPersonPreview(item) : undefined}
                      accessibilityLabel={
                        linkedProfile
                          ? t('disguiseMiniWindow.viewProfile', { name: item.person.name })
                          : item.person.name
                      }
                    />
                  </PulseProfileSwap>
                  <AnimatedPressable
                    accessibilityRole="button"
                    onPress={() => openAlertTarget(item)}
                    style={styles.textWrap}
                  >
                    {textBlock}
                  </AnimatedPressable>
                </View>
              ) : (
                <AnimatedPressable
                  accessibilityRole="button"
                  onPress={() => openAlertTarget(item)}
                  style={styles.iconRow}
                >
                  <View style={[styles.iconWrap, { backgroundColor: meta.accentSoft }]}>
                    <Ionicons name={item.icon} size={20} color={meta.accent} />
                  </View>
                  <View style={styles.textWrap}>{textBlock}</View>
                </AnimatedPressable>
              )}
            </View>
          );
        }}
      />
      </PulseFeedRefreshDimLayer>

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
  iconRow: {
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
