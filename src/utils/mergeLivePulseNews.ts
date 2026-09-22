import { FeedItem, NewsPost } from '../data/disguiseFeed';

function cloneNewsShell(template: NewsPost, live: NewsPost): NewsPost {
  return {
    ...template,
    source: live.source,
    headline: live.headline,
    summary: live.summary,
    articleBody: live.articleBody || live.summary,
    imageUrl: live.imageUrl,
    timeAgo: live.timeAgo,
    category: live.category,
    articleUrl: live.articleUrl,
    reporters: live.reporters.length > 0 ? live.reporters : template.reporters,
  };
}

/** Replace static headline slots with cached live headlines — each live hero image used at most once. */
export function mergeLiveNewsIntoFeed(items: FeedItem[], livePosts: NewsPost[], generation: number): FeedItem[] {
  if (livePosts.length === 0) {
    return items;
  }

  const usedLiveImages = new Set<string>();
  const usedLiveHeadlines = new Set<string>();
  let liveIndex = generation % livePosts.length;

  const nextLive = (): NewsPost | null => {
    for (let step = 0; step < livePosts.length; step += 1) {
      const live = livePosts[(liveIndex + step) % livePosts.length];
      if (usedLiveImages.has(live.imageUrl) || usedLiveHeadlines.has(live.headline)) {
        continue;
      }
      liveIndex = (liveIndex + step + 1) % livePosts.length;
      usedLiveImages.add(live.imageUrl);
      usedLiveHeadlines.add(live.headline);
      return live;
    }
    return null;
  };

  return items.map((item) => {
    if (item.type !== 'news') {
      return item;
    }
    const live = nextLive();
    if (!live) {
      return item;
    }
    return cloneNewsShell(item, live);
  });
}

/** @deprecated Live merge + unique catalog replace extra insertions — avoids duplicate headlines in-feed. */
export function densifyPulseNewsBlocks(items: FeedItem[], _extraNews: NewsPost[], _generation: number): FeedItem[] {
  return items;
}
