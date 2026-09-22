import { AppLocale } from '../types/locale';
import { translate } from './index';
import { trendingContentEn } from './trendingContentEn';
import { trendingContentZhTw } from './trendingContentZhTw';

export type TrendingContentSection = 'brief' | 'radar' | 'editorsPick' | 'topic';

const trendingContentByLocale = {
  en: trendingContentEn,
  'zh-TW': trendingContentZhTw,
} as const;

export function getTrendingContentField(
  locale: AppLocale,
  section: TrendingContentSection,
  id: string,
  field: string,
  fallback: string,
): string {
  const bucket = trendingContentByLocale[locale][section] as Record<
    string,
    Record<string, string> | undefined
  >;
  const localized = bucket[id]?.[field];
  if (localized) {
    return localized;
  }

  const key = `trendingContent.${section}.${id}.${field}`;
  const translated = translate(locale, key);
  return translated === key ? fallback : translated;
}
