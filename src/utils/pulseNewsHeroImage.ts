import { pulseNewsImages } from '../data/pulseNewsMedia';

type PulseNewsImageKey = keyof typeof pulseNewsImages;

const CATEGORY_POOLS: Record<string, PulseNewsImageKey[]> = {
  World: ['earthTech', 'newsroom', 'cityFinance', 'newspaper', 'office', 'skyline'],
  Tech: ['chips', 'phone', 'office', 'earthTech', 'laptop', 'server'],
  Culture: ['concert', 'cinema', 'fashion', 'stars', 'theater', 'gallery'],
  Business: ['cityFinance', 'newsroom', 'office', 'market', 'newspaper'],
  General: ['newspaper', 'newsroom', 'earthTech', 'cityFinance', 'cafe'],
};

const ALL_HERO_KEYS: PulseNewsImageKey[] = [
  'cityFinance',
  'newspaper',
  'earthTech',
  'transit',
  'restaurant',
  'office',
  'phone',
  'cafe',
  'newsroom',
  'chips',
  'stars',
  'moon',
  'tarot',
  'concert',
  'cinema',
  'fashion',
  'skyline',
  'laptop',
  'market',
  'protest',
  'health',
  'science',
  'sports',
  'weather',
  'theater',
  'gallery',
  'server',
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function isLikelyImageUrl(url: string): boolean {
  if (!url.startsWith('http')) {
    return false;
  }
  const lower = url.toLowerCase();
  if (lower.includes('.mp4') || lower.includes('.m3u8')) {
    return false;
  }
  return true;
}

/** Pull hero image URL from a single RSS `<item>` chunk when the feed provides media. */
export function extractRssItemImage(itemXml: string): string | undefined {
  const patterns = [
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
    /<media:content[^>]+url=["']([^"']+)["'][^>]*(?:medium=["']image["']|type=["']image)/i,
    /<media:content[^>]+medium=["']image["'][^>]+url=["']([^"']+)["']/i,
    /<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image[^"']*["']/i,
    /<enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = itemXml.match(pattern);
    const candidate = match?.[1]?.trim();
    if (candidate && isLikelyImageUrl(candidate)) {
      return candidate;
    }
  }

  const imgInDesc = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]?.trim();
  if (imgInDesc && isLikelyImageUrl(imgInDesc)) {
    return imgInDesc;
  }

  return undefined;
}

/** Prefer wire/API image; otherwise pick a distinct stock hero per story. */
export function resolveNewsHeroImage(options: {
  category: string;
  seed: string;
  wireImageUrl?: string | null;
  defaultKey?: PulseNewsImageKey;
}): string {
  const wire = options.wireImageUrl?.trim();
  if (wire && isLikelyImageUrl(wire)) {
    return wire;
  }

  const category = options.category.trim() || 'General';
  const pool = CATEGORY_POOLS[category] ?? CATEGORY_POOLS.General ?? ALL_HERO_KEYS;
  const hash = hashSeed(`${options.seed}|${category}`);
  const fromPool = pool[hash % pool.length] ?? options.defaultKey ?? 'fallback';
  const key = ALL_HERO_KEYS.includes(fromPool) ? fromPool : options.defaultKey ?? 'fallback';
  return pulseNewsImages[key];
}

export function newsHeroFallbackUri(seed: string): string {
  const hash = hashSeed(seed || 'fallback');
  const key = ALL_HERO_KEYS[hash % ALL_HERO_KEYS.length] ?? 'fallback';
  return pulseNewsImages[key];
}
