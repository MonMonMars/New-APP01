import {
  AdPost,
  DisguiseAlert,
  findAdPostByLandingUrl,
  findNewsPostByArticleUrl,
  NewsPost,
} from '../data/disguiseFeed';
import { pulseNewsImages } from '../data/pulseNewsMedia';
import { AppLocale } from '../types/locale';
import { getActivityAlertText } from '../i18n/labels';

export type PulseAlertTarget =
  | { kind: 'news'; post: NewsPost }
  | { kind: 'ad'; ad: AdPost }
  | { kind: 'activity' };

/** Map an activity row to the sheet it should open (article, ad, or in-app activity). */
export function resolvePulseAlertTarget(alert: DisguiseAlert, locale: AppLocale): PulseAlertTarget {
  if (alert.articleUrl) {
    const fromCatalog = findNewsPostByArticleUrl(alert.articleUrl);
    if (fromCatalog) {
      return { kind: 'news', post: fromCatalog };
    }
    const headline = getActivityAlertText(locale, alert.id, alert.text);
    const sourceMatch = headline.match(/^([^:]+):/);
    return {
      kind: 'news',
      post: {
        id: `alert-article-${alert.id}`,
        type: 'news',
        source: sourceMatch?.[1]?.trim() ?? 'News',
        headline,
        summary: headline,
        articleBody: headline,
        imageUrl: pulseNewsImages.cityFinance,
        timeAgo: alert.time,
        category: 'News',
        articleUrl: alert.articleUrl,
        reporters: [],
      },
    };
  }

  if (alert.landingUrl) {
    const ad = findAdPostByLandingUrl(alert.landingUrl);
    if (ad) {
      return { kind: 'ad', ad };
    }
  }

  return { kind: 'activity' };
}
