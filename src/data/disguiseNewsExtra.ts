import { NewsPost } from './disguiseFeed';

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
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    timeAgo: '7h ago',
    category: 'Business',
    articleUrl: 'https://www.bbc.co.uk/news/articles/remote-standups-demo',
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
    source: 'The Verge',
    headline: 'Health-tech hiring picks up after a quiet Q1',
    summary:
      'Clinical software and AI diagnostics startups are staffing engineering and design roles again.',
    articleBody:
      'After a quiet first quarter, health-tech hiring is ticking up across clinical software and AI diagnostics.\n\nRecruiters say senior full-stack and compliance-aware product designers are the hardest roles to fill.\n\nSeveral Series B companies opened New York hubs this month.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    timeAgo: '8h ago',
    category: 'Tech',
    articleUrl: 'https://www.theverge.com/news/health-tech-hiring-demo',
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
    source: 'BBC Good Food',
    headline: 'Weekend brunch lists: 12 spots with walk-in tables',
    summary:
      'Editors rounded up neighborhood favorites that still take walk-ins before 11am.',
    articleBody:
      'If you hate reservation apps, this list is for you — twelve brunch spots that reliably seat walk-ins before 11am on Saturdays.\n\nHighlights include a Basque pintxo counter, a Japanese breakfast cafe, and a classic diner with excellent pancakes.',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
    timeAgo: '9h ago',
    category: 'Lifestyle',
    articleUrl: 'https://www.bbcgoodfood.com/brunch-walkins-demo',
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
    source: 'BBC News',
    headline: 'Night transit safety upgrades roll out at busy stops',
    summary:
      'Brighter lighting and CCTV expansion aim to make late buses feel safer after midnight.',
    articleBody:
      'City transit officials announced lighting and CCTV upgrades at twelve high-traffic night stops.\n\nRiders surveyed last year cited visibility and real-time arrival data as top concerns after midnight.',
    imageUrl: 'https://images.unsplash.com/photo-1544627677-05470f41cd8a?w=800&q=80',
    timeAgo: '10h ago',
    category: 'Local',
    articleUrl: 'https://www.bbc.co.uk/news/articles/night-transit-demo',
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
