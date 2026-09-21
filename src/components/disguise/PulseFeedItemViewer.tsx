import { useMemo } from 'react';

import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { getDisguisedSourceLabel } from '../../i18n/labels';
import { AdPost, DisguisedProfilePost, FeedItem, NewsPost } from '../../data/disguiseFeed';
import { disguiseClientAds } from '../../data/disguiseClientAds';
import { buildDisguiseFeed } from '../../utils/buildDisguiseFeed';
import { isCosmosTarotFeedItem } from '../../utils/disguiseFeedCatalog';
import { usesFemalePulseExperience } from '../../utils/genderAccountPerks';
import { findFeedItemById, findNewsPostByHeadline } from '../../utils/findFeedItem';
import { usePulseContextSection } from '../../hooks/usePulseContextSection';
import { AdLandingSheet } from './AdLandingSheet';
import { NewsArticleSheet } from './NewsArticleSheet';
import { PulseUnavailableSheet } from './PulseUnavailableSheet';
import { SocialCommentSheet } from './SocialCommentSheet';

type PulseFeedItemViewerProps = {
  itemId?: string | null;
  headline?: string | null;
  onClose: () => void;
};

function disguisedProfileAsNewsPost(post: DisguisedProfilePost, locale: Parameters<typeof getDisguisedSourceLabel>[0]): NewsPost {
  return {
    id: post.id,
    type: 'news',
    source: getDisguisedSourceLabel(locale, post.sourceLabel),
    headline: post.headline,
    summary: post.summary,
    articleBody: post.summary,
    imageUrl: post.coverImageUrl,
    timeAgo: post.timeAgo,
    category: post.category ?? 'News',
    articleUrl: '',
    reporters: [],
  };
}

function disguisedProfileAsAdPost(post: DisguisedProfilePost, learnMoreLabel: string): AdPost {
  return {
    id: post.id,
    type: 'ad',
    brand: post.headline,
    tagline: post.summary,
    description: post.summary,
    imageUrl: post.coverImageUrl,
    cta: post.cta ?? learnMoreLabel,
    landingUrl: disguiseClientAds[0]?.landingUrl ?? 'https://example.com',
    sponsored: true,
  };
}

/** Opens the correct disguise sheet for a saved or history item. */
export function PulseFeedItemViewer({ itemId, headline, onClose }: PulseFeedItemViewerProps) {
  const { user, disguiseAdCreative } = useApp();
  const pulseSection = usePulseContextSection();
  const { locale, t } = useTranslation();

  const feedItem = useMemo((): FeedItem | null => {
    const allowItem = (item: FeedItem | undefined): FeedItem | null => {
      if (!item) {
        return null;
      }
      if (!usesFemalePulseExperience(user.gender) && isCosmosTarotFeedItem(item)) {
        return null;
      }
      return item;
    };

    if (itemId && !itemId.startsWith('empty-') && !itemId.startsWith('hist-')) {
      const fromFeed = buildDisguiseFeed(user, disguiseAdCreative, pulseSection).find((item) => item.id === itemId);
      const resolved = allowItem(fromFeed) ?? allowItem(findFeedItemById(itemId, user.gender));
      if (resolved) {
        return resolved;
      }
    }
    if (headline) {
      return allowItem(findNewsPostByHeadline(headline, user.gender));
    }
    return null;
  }, [itemId, headline, user, disguiseAdCreative, pulseSection]);

  const visible = Boolean(itemId || headline);
  const newsPost = feedItem?.type === 'news' ? feedItem : null;

  if (!visible) {
    return null;
  }

  if (!feedItem) {
    return (
      <PulseUnavailableSheet
        visible={visible}
        onClose={onClose}
      />
    );
  }

  switch (feedItem.type) {
    case 'news':
      return (
        <NewsArticleSheet
          visible
          post={newsPost}
          onClose={onClose}
        />
      );
    case 'social':
      return (
        <SocialCommentSheet
          visible
          post={feedItem}
          onClose={onClose}
          sheetTitle={itemId ? t('pulseSocial.postTitle') : t('pulseSocial.comments')}
        />
      );
    case 'ad':
      return <AdLandingSheet visible ad={feedItem} onClose={onClose} />;
    case 'disguised_profile':
      if (feedItem.variant === 'social') {
        return (
          <SocialCommentSheet
            visible
            post={{
              id: feedItem.id,
              type: 'social',
              author: feedItem.name,
              handle:
              feedItem.handle ??
              `@${feedItem.name.toLowerCase().replace(/\s+/g, '')}`,
              body: feedItem.summary,
              avatarUrl: feedItem.avatarUrl,
              timeAgo: feedItem.timeAgo,
              likes: 24,
              comments: 3,
              avatarMask: { text: feedItem.overlayText, variant: 'news' },
            }}
            onClose={onClose}
            sheetTitle={t('pulseSocial.postTitle')}
          />
        );
      }
      if (feedItem.variant === 'ad') {
        return (
          <AdLandingSheet
            visible
            ad={disguisedProfileAsAdPost(feedItem, t('disguiseAd.learnMore'))}
            onClose={onClose}
          />
        );
      }
      return (
        <NewsArticleSheet
          visible
          post={disguisedProfileAsNewsPost(feedItem, locale)}
          onClose={onClose}
        />
      );
    default: {
      const _exhaustive: never = feedItem;
      return _exhaustive;
    }
  }
}
