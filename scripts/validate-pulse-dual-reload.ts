import assert from 'node:assert/strict';

import { disguiseFeedItems, type NewsPost } from '../src/data/disguiseFeed';
import { mergeLiveNewsIntoFeed } from '../src/utils/mergeLivePulseNews';

function newsSignature(items: ReturnType<typeof mergeLiveNewsIntoFeed>): string {
  return items
    .filter((item) => item.type === 'news')
    .map((item) => `${item.headline}|${item.imageUrl}`)
    .join(';');
}

function run(): void {
  const livePool: NewsPost[] = [
    {
      id: 'live-a',
      type: 'news',
      source: 'Wire A',
      category: 'World',
      headline: 'Alpha headline',
      summary: 'Summary A',
      imageUrl: 'https://example.com/a.jpg',
      timeAgo: '1m',
      articleBody: 'Body A',
      articleUrl: 'https://example.com/a',
      reporters: [],
    },
    {
      id: 'live-b',
      type: 'news',
      source: 'Wire B',
      category: 'Tech',
      headline: 'Beta headline',
      summary: 'Summary B',
      imageUrl: 'https://example.com/b.jpg',
      timeAgo: '2m',
      articleBody: 'Body B',
      articleUrl: 'https://example.com/b',
      reporters: [],
    },
    {
      id: 'live-c',
      type: 'news',
      source: 'Wire C',
      category: 'Culture',
      headline: 'Gamma headline',
      summary: 'Summary C',
      imageUrl: 'https://example.com/c.jpg',
      timeAgo: '3m',
      articleBody: 'Body C',
      articleUrl: 'https://example.com/c',
      reporters: [],
    },
  ];

  const base = disguiseFeedItems.slice(0, 24);
  const mergedGen1 = mergeLiveNewsIntoFeed(base, livePool, 1);
  const mergedGen2 = mergeLiveNewsIntoFeed(base, livePool, 2);

  assert.notEqual(
    newsSignature(mergedGen1),
    newsSignature(mergedGen2),
    'Pulse reload generation should remap live news into feed slots',
  );

  console.log('validate-pulse-dual-reload: ok');
}

run();
