import AsyncStorage from '@react-native-async-storage/async-storage';

import { NewsPost, NewsReporter } from '../data/disguiseFeed';
import { LIVE_NEWS_REPORTER_ROTATION } from '../data/disguiseReporterProfileLinks';
import { pulseNewsImages } from '../data/pulseNewsMedia';
import { getProfileById } from '../data/profiles';
import { AppLocale, resolveAppLocale } from '../types/locale';
import { translate } from '../i18n';
import { disguiseDisplayName } from '../utils/disguiseProfileFeed';
import { profileIntroCaption } from '../utils/profileIntroCaption';

const CACHE_KEY = '@pulse/live-news/v1';
const CACHE_TTL_MS = 45 * 60 * 1000;

type PulseNewsCachePayload = {
  lastFetched: number;
  posts: NewsPost[];
};

type RssFeedSpec = {
  url: string;
  source: string;
  category: string;
  imageKey: keyof typeof pulseNewsImages;
};

const RSS_FEEDS: RssFeedSpec[] = [
  {
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    source: 'BBC News',
    category: 'World',
    imageKey: 'earthTech',
  },
  {
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    source: 'BBC News',
    category: 'Tech',
    imageKey: 'chips',
  },
  {
    url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    source: 'BBC News',
    category: 'Culture',
    imageKey: 'concert',
  },
  {
    url: 'https://feeds.reuters.com/reuters/worldNews',
    source: 'Reuters',
    category: 'World',
    imageKey: 'newsroom',
  },
];

type NewsApiArticle = {
  title?: string;
  description?: string;
  url?: string;
  urlToImage?: string | null;
  publishedAt?: string;
  source?: { name?: string };
};

let memoryCache: PulseNewsCachePayload | null = null;
const subscribers = new Set<() => void>();

function notify(): void {
  subscribers.forEach((listener) => listener());
}

export function subscribePulseLiveNews(listener: () => void): () => void {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export function getPulseLiveNewsSnapshot(): PulseNewsCachePayload | null {
  return memoryCache;
}

export function getPulseLiveNewsLastFetched(): number | null {
  return memoryCache?.lastFetched ?? null;
}

function stripHtml(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseRssItems(xml: string, maxItems: number): Array<{ title: string; link: string; summary: string; pubDate?: string }> {
  const items: Array<{ title: string; link: string; summary: string; pubDate?: string }> = [];
  const chunks = xml.split(/<item[\s>]/i).slice(1);
  for (const chunk of chunks) {
    if (items.length >= maxItems) {
      break;
    }
    const titleRaw = chunk.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
    const linkRaw = chunk.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? '';
    const descRaw =
      chunk.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ??
      chunk.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i)?.[1] ??
      '';
    const pubRaw = chunk.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1];
    const title = decodeEntities(stripHtml(titleRaw));
    const link = decodeEntities(stripHtml(linkRaw));
    const summary = decodeEntities(stripHtml(descRaw)).slice(0, 280);
    if (title.length > 0 && link.startsWith('http')) {
      items.push({ title, link, summary, pubDate: pubRaw ? stripHtml(pubRaw) : undefined });
    }
  }
  return items;
}

function rssProxyUrl(feedUrl: string): string {
  const custom = process.env.EXPO_PUBLIC_NEWS_RSS_PROXY?.trim();
  if (custom) {
    return custom.includes('{url}')
      ? custom.replace('{url}', encodeURIComponent(feedUrl))
      : `${custom}${encodeURIComponent(feedUrl)}`;
  }
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
}

async function fetchRssFeed(spec: RssFeedSpec, perFeed: number): Promise<NewsPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(rssProxyUrl(spec.url), { signal: controller.signal });
    if (!response.ok) {
      return [];
    }
    const xml = await response.text();
    const parsed = parseRssItems(xml, perFeed);
    return parsed.map((item, index) => ({
      id: `live-rss-${spec.category.toLowerCase()}-${index}-${hashId(item.link)}`,
      type: 'news' as const,
      source: spec.source,
      headline: item.title,
      summary: item.summary || item.title,
      articleBody: item.summary || item.title,
      imageUrl: pulseNewsImages[spec.imageKey],
      timeAgo: 'just now',
      category: spec.category,
      articleUrl: item.link,
      reporters: [],
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function hashId(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

async function fetchNewsApiHeadlines(): Promise<NewsPost[]> {
  const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY?.trim();
  if (!apiKey) {
    return [];
  }

  const categories: Array<{ path: string; category: string; imageKey: keyof typeof pulseNewsImages }> = [
    { path: 'top-headlines?country=us&category=general', category: 'World', imageKey: 'earthTech' },
    { path: 'top-headlines?country=us&category=technology', category: 'Tech', imageKey: 'chips' },
    { path: 'top-headlines?country=us&category=entertainment', category: 'Culture', imageKey: 'cinema' },
  ];

  const posts: NewsPost[] = [];
  for (const spec of categories) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const url = `https://newsapi.org/v2/${spec.path}&pageSize=4&apiKey=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        continue;
      }
      const json = (await response.json()) as { articles?: NewsApiArticle[] };
      for (const [index, article] of (json.articles ?? []).entries()) {
        if (!article.title || !article.url) {
          continue;
        }
        posts.push({
          id: `live-api-${spec.category.toLowerCase()}-${index}-${hashId(article.url)}`,
          type: 'news',
          source: article.source?.name?.trim() || 'News',
          headline: article.title.trim(),
          summary: (article.description ?? article.title).trim().slice(0, 280),
          articleBody: (article.description ?? article.title).trim(),
          imageUrl: article.urlToImage?.startsWith('http') ? article.urlToImage : pulseNewsImages[spec.imageKey],
          timeAgo: 'just now',
          category: spec.category,
          articleUrl: article.url,
          reporters: [],
        });
      }
    } catch {
      // try next category
    } finally {
      clearTimeout(timeout);
    }
  }
  return posts;
}

function buildReporterForProfile(profileId: string, slot: number): NewsReporter {
  const profile = getProfileById(profileId);
  if (!profile) {
    return {
      id: `live-rep-${slot}`,
      name: 'Reader',
      avatarUrl: pulseNewsImages.fallback,
      quote: '',
      photos: [],
    };
  }
  const intro = profileIntroCaption(profile);
  return {
    id: `live-rep-${profileId}`,
    name: disguiseDisplayName(profile.name),
    avatarUrl: profile.photos[0] ?? pulseNewsImages.fallback,
    quote: intro,
    photos: profile.photos,
    profileId: profile.id,
  };
}

function attachDemoReporters(posts: NewsPost[]): NewsPost[] {
  return posts.map((post, index) => {
    if (post.reporters.length > 0) {
      return post;
    }
    const primaryId = LIVE_NEWS_REPORTER_ROTATION[index % LIVE_NEWS_REPORTER_ROTATION.length];
    const secondaryId =
      LIVE_NEWS_REPORTER_ROTATION[(index + 3) % LIVE_NEWS_REPORTER_ROTATION.length];
    const reporters = [buildReporterForProfile(primaryId, index)];
    if (index % 3 === 0 && secondaryId !== primaryId) {
      reporters.push(buildReporterForProfile(secondaryId, index + 100));
    }
    return { ...post, reporters };
  });
}

function formatTimeAgo(publishedMs: number | null, locale: AppLocale): string {
  if (!publishedMs) {
    return translate(locale, 'time.justNow');
  }
  const deltaMin = Math.max(1, Math.floor((Date.now() - publishedMs) / 60_000));
  if (deltaMin <= 2) {
    return translate(locale, 'time.justNow');
  }
  if (deltaMin < 60) {
    return translate(locale, 'time.minutesAgo', { n: deltaMin });
  }
  return translate(locale, 'time.hoursAgo', { n: Math.floor(deltaMin / 60) });
}

export function applyLiveNewsTimestamps(posts: NewsPost[], locale?: AppLocale | null): NewsPost[] {
  const resolved = resolveAppLocale(locale);
  const fetchedAt = memoryCache?.lastFetched ?? Date.now();
  const label = formatTimeAgo(fetchedAt, resolved);
  return posts.map((post) => ({ ...post, timeAgo: label }));
}

async function loadCacheFromDisk(): Promise<PulseNewsCachePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PulseNewsCachePayload;
    if (!parsed?.posts?.length || typeof parsed.lastFetched !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function persistCache(payload: PulseNewsCachePayload): Promise<void> {
  memoryCache = payload;
  notify();
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // non-fatal
  }
}

export async function hydratePulseLiveNewsFromDisk(): Promise<void> {
  if (memoryCache) {
    return;
  }
  const disk = await loadCacheFromDisk();
  if (disk) {
    memoryCache = disk;
    notify();
  }
}

export async function refreshPulseLiveNews(options?: {
  force?: boolean;
  locale?: AppLocale | null;
}): Promise<NewsPost[]> {
  const force = options?.force ?? false;
  const now = Date.now();

  if (!force && memoryCache && now - memoryCache.lastFetched < CACHE_TTL_MS) {
    return applyLiveNewsTimestamps(memoryCache.posts, options?.locale);
  }

  if (!memoryCache) {
    const disk = await loadCacheFromDisk();
    if (disk && !force && now - disk.lastFetched < CACHE_TTL_MS) {
      memoryCache = disk;
      notify();
      return applyLiveNewsTimestamps(disk.posts, options?.locale);
    }
  }

  let collected: NewsPost[] = [];
  collected = await fetchNewsApiHeadlines();

  if (collected.length < 6) {
    const rssChunks = await Promise.all(RSS_FEEDS.map((spec) => fetchRssFeed(spec, 3)));
    collected = [...collected, ...rssChunks.flat()];
  }

  collected = collected.filter(
    (post, index, list) => list.findIndex((item) => item.articleUrl === post.articleUrl) === index,
  );

  if (collected.length === 0 && memoryCache?.posts.length) {
    return applyLiveNewsTimestamps(memoryCache.posts, options?.locale);
  }

  if (collected.length === 0) {
    return [];
  }

  const withReporters = attachDemoReporters(collected.slice(0, 24));
  const payload: PulseNewsCachePayload = {
    lastFetched: now,
    posts: withReporters,
  };
  await persistCache(payload);
  return applyLiveNewsTimestamps(withReporters, options?.locale);
}
