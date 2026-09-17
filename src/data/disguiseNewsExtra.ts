import { NewsPost } from './disguiseFeed';
import { freeNewsLinks, pulseNewsImages } from './pulseNewsMedia';

export const disguiseNewsExtra: NewsPost[] = [
  {
    id: 'news-5',
    type: 'news',
    source: 'BBC News',
    headline: 'Remote teams rethink async standups as hybrid policies tighten',
    summary:
      'Large employers are trimming meeting load — async updates and written briefs are replacing daily video calls.',
    articleBody:
      'A growing number of companies are rethinking the daily standup as hybrid policies tighten and calendar fatigue rises.\n\nProduct teams report switching to written async updates in Slack or Notion, reserving live time for blockers only.\n\nHR leaders say the shift is less about cost cutting and more about protecting focus time for deep work.',
    imageUrl: pulseNewsImages.office,
    timeAgo: '7h ago',
    category: 'Business',
    articleUrl: freeNewsLinks.bbcNews,
    reporters: [
      {
        id: 'rep-5a',
        name: 'Noor H.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        quote: 'Async beats another 9am Zoom',
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'],
      },
    ],
  },
  {
    id: 'news-6',
    type: 'news',
    source: 'NPR',
    headline: 'Health-tech hiring picks up after a quiet Q1',
    summary:
      'Clinical software and AI diagnostics startups are staffing engineering and design roles again.',
    articleBody:
      'After a quiet first quarter, health-tech hiring is ticking up across clinical software and AI diagnostics.\n\nRecruiters say senior full-stack and compliance-aware product designers are the hardest roles to fill.\n\nSeveral Series B companies opened New York hubs this month.',
    imageUrl: pulseNewsImages.chips,
    timeAgo: '8h ago',
    category: 'Tech',
    articleUrl: freeNewsLinks.nprHealth,
    reporters: [
      {
        id: 'rep-6a',
        name: 'Dana W.',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
        quote: 'Design roles with HIPAA context pay well',
        photos: ['https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80'],
      },
      {
        id: 'rep-6b',
        name: 'Chris P.',
        avatarUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a5c59363?w=200&q=80',
        quote: 'Seeing more onsite days in job posts',
        photos: ['https://images.unsplash.com/photo-1552374196-1ab2a5c59363?w=400&q=80'],
      },
    ],
  },
  {
    id: 'news-7',
    type: 'news',
    source: 'The Guardian',
    headline: 'Weekend brunch lists: 12 spots with walk-in tables',
    summary:
      'Editors rounded up neighborhood favorites that still take walk-ins before 11am.',
    articleBody:
      'If you hate reservation apps, this list is for you — twelve brunch spots that reliably seat walk-ins before 11am on Saturdays.\n\nHighlights include a Basque pintxo counter, a Japanese breakfast cafe, and a classic diner with excellent pancakes.',
    imageUrl: pulseNewsImages.cafe,
    timeAgo: '9h ago',
    category: 'Lifestyle',
    articleUrl: freeNewsLinks.guardianFood,
    reporters: [
      {
        id: 'rep-7a',
        name: 'Taylor B.',
        avatarUrl: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&q=80',
        quote: 'The pintxo place is underrated',
        photos: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80'],
      },
    ],
  },
  {
    id: 'news-8',
    type: 'news',
    source: 'The Guardian',
    headline: 'Night transit safety upgrades roll out at busy stops',
    summary:
      'Brighter lighting and CCTV expansion aim to make late buses feel safer after midnight.',
    articleBody:
      'City transit officials announced lighting and CCTV upgrades at twelve high-traffic night stops.\n\nRiders surveyed last year cited visibility and real-time arrival data as top concerns after midnight.',
    imageUrl: pulseNewsImages.transit,
    timeAgo: '10h ago',
    category: 'Local',
    articleUrl: freeNewsLinks.guardianTransport,
    reporters: [
      {
        id: 'rep-8a',
        name: 'Morgan S.',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
        quote: 'Finally lights at my stop',
        photos: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'],
      },
    ],
  },
];
