import { useMemo } from 'react';

import { useApp } from '../../context/AppContext';
import { FeedItem } from '../../data/disguiseFeed';
import { buildDisguiseFeed } from '../../utils/buildDisguiseFeed';
import { findFeedItemById, findNewsPostByHeadline } from '../../utils/findFeedItem';
import { AdLandingSheet } from './AdLandingSheet';
import { NewsArticleSheet } from './NewsArticleSheet';
import { PersonPreviewSheet } from './PersonPreviewSheet';
import { PulseUnavailableSheet } from './PulseUnavailableSheet';
import { SocialCommentSheet } from './SocialCommentSheet';

type PulseFeedItemViewerProps = {
  itemId?: string | null;
  headline?: string | null;
  onClose: () => void;
};

/** Opens the correct disguise sheet for a saved or history item. */
export function PulseFeedItemViewer({ itemId, headline, onClose }: PulseFeedItemViewerProps) {
  const { user, disguiseAdCreative } = useApp();

  const feedItem = useMemo((): FeedItem | null => {
    if (itemId && !itemId.startsWith('empty-') && !itemId.startsWith('hist-')) {
      const fromFeed = buildDisguiseFeed(user, disguiseAdCreative).find((item) => item.id === itemId);
      if (fromFeed) {
        return fromFeed;
      }
      const fromCatalog = findFeedItemById(itemId);
      if (fromCatalog) {
        return fromCatalog;
      }
    }
    if (headline) {
      const news = findNewsPostByHeadline(headline);
      if (news) {
        return news;
      }
    }
    return null;
  }, [itemId, headline, user, disguiseAdCreative]);

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
      return <SocialCommentSheet visible post={feedItem} onClose={onClose} />;
    case 'ad':
      return <AdLandingSheet visible ad={feedItem} onClose={onClose} />;
    case 'disguised_profile':
      return (
        <PersonPreviewSheet
          visible
          reporter={{
            id: feedItem.id,
            name: feedItem.name,
            avatarUrl: feedItem.avatarUrl,
            quote: feedItem.summary,
            photos: feedItem.photos,
            profileId: feedItem.id,
          }}
          onClose={onClose}
        />
      );
    default: {
      const _exhaustive: never = feedItem;
      return _exhaustive;
    }
  }
}
