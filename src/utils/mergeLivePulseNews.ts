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

/** Replace static headline slots with cached live headlines while keeping feed rhythm. */
export function mergeLiveNewsIntoFeed(items: FeedItem[], livePosts: NewsPost[], generation: number): FeedItem[] {
  if (livePosts.length === 0) {
    return items;
  }

  let cursor = generation % livePosts.length;
  return items.map((item) => {
    if (item.type !== 'news') {
      return item;
    }
    const live = livePosts[cursor % livePosts.length];
    cursor += 1;
    return cloneNewsShell(item, live);
  });
}

/** Insert extra news cards between non-news items for a denser Pulse rotation. */
export function densifyPulseNewsBlocks(items: FeedItem[], extraNews: NewsPost[], generation: number): FeedItem[] {
  if (extraNews.length === 0) {
    return items;
  }

  const result: FeedItem[] = [];
  let extraIndex = generation % extraNews.length;
  let nonNewsSinceNews = 0;

  for (const item of items) {
    result.push(item);
    if (item.type === 'news') {
      nonNewsSinceNews = 0;
      continue;
    }
    nonNewsSinceNews += 1;
    if (nonNewsSinceNews >= 2) {
      result.push(extraNews[extraIndex % extraNews.length]);
      extraIndex += 1;
      nonNewsSinceNews = 0;
    }
  }

  return result;
}
