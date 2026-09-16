import { BreakingCard, TrendingBrief } from '../data/disguiseTrending';
import { NewsPost } from '../data/disguiseFeed';

function topicCategory(topic: string): string {
  switch (topic) {
    case '#TechNews':
    case '#AIInvesting':
    case '#EURegulation':
      return 'Tech';
    case '#MarketWatch':
      return 'Business';
    case '#CityLife':
    case '#NightTransit':
    case '#TransitTalk':
      return 'Local';
    case '#CoffeeShops':
    case '#WeekendEats':
    case '#WeekendPlans':
      return 'Lifestyle';
    case '#ClimateTech':
      return 'Science';
    case '#BookClub':
      return 'Culture';
    case '#DesignTips':
    case '#RemoteWork':
      return 'Creators';
    case '#StartupJobs':
      return 'Business';
    case '#Weather':
      return 'Local';
    default:
      return 'News';
  }
}

export function briefToNewsPost(brief: TrendingBrief): NewsPost {
  const category = topicCategory(brief.topic);

  return {
    id: `trending-brief-${brief.id}`,
    type: 'news',
    source: brief.source,
    headline: brief.headline,
    summary: brief.summary,
    articleBody: `${brief.summary}\n\nThis morning brief is curated by Pulse editors from trusted publishers. Open the full story on ${brief.source} for complete reporting, charts, and updates as the story develops.`,
    imageUrl: brief.imageUrl,
    timeAgo: `${brief.readMinutes} min read`,
    category,
    articleUrl: 'https://www.bbc.co.uk/news',
    reporters: [],
  };
}

export function breakingToNewsPost(card: BreakingCard): NewsPost {
  const category = topicCategory(card.topic);

  return {
    id: `trending-breaking-${card.id}`,
    type: 'news',
    source: card.source,
    headline: card.headline,
    summary: card.headline,
    articleBody: `${card.headline}\n\nReported ${card.timeAgo} ago on Pulse. This breaking story is being updated — follow ${card.source} for the latest details and context.`,
    imageUrl: card.imageUrl,
    timeAgo: card.timeAgo,
    category,
    articleUrl: 'https://www.bbc.co.uk/news',
    reporters: [],
  };
}
