import { NewsPost } from './disguiseFeed';
import { freeNewsLinks, pulseNewsImages } from './pulseNewsMedia';

/** Second batch of Pulse news stories — merged into the home feed */
export const disguiseNewsBatch2: NewsPost[] = [
  {
    id: 'news-9',
    type: 'news',
    source: 'BBC News',
    headline: 'OpenAI rivals race to ship smaller models that run on phones',
    summary:
      'On-device AI is the new battleground — startups promise privacy-friendly assistants without cloud latency.',
    articleBody:
      'The next wave of consumer AI may not live in the cloud at all.\n\nSeveral startups unveiled compact language models designed to run on flagship phones and laptops, targeting users who want faster responses and tighter privacy controls.\n\nAnalysts say on-device inference could reshape how news apps, assistants, and messaging tools embed AI — especially in regulated markets.',
    imageUrl: pulseNewsImages.chips,
    timeAgo: '35m ago',
    category: 'Tech',
    articleUrl: freeNewsLinks.bbcTechnology,
    reporters: [
      {
        id: 'rep-9a',
        name: 'Iris K.',
        avatarUrl: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=200',
        quote: 'Local inference is finally usable',
        photos: [
          'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
        ],
      },
    ],
  },
  {
    id: 'news-10',
    type: 'news',
    source: 'The Guardian',
    headline: 'City planners propose car-free weekends in downtown cores',
    summary:
      'Pilot programs in three cities would close main corridors to traffic on Sunday mornings.',
    articleBody:
      'Urban planners are testing car-free corridors on Sunday mornings to boost foot traffic for small businesses and reduce noise pollution.\n\nEarly surveys show strong support among residents under 40, while delivery firms asked for loading-zone exceptions.\n\nIf pilots succeed, officials may expand the program to monthly events with live music and markets.',
    imageUrl: pulseNewsImages.transit,
    timeAgo: '1h ago',
    category: 'Local',
    articleUrl: freeNewsLinks.guardianTransport,
    reporters: [
      {
        id: 'rep-10a',
        name: 'Morris L.',
        avatarUrl: 'https://images.pexels.com/photos/1689710/pexels-photo-1689710.jpeg?auto=compress&cs=tinysrgb&w=200',
        quote: 'Sunday markets would thrive',
        photos: ['https://images.pexels.com/photos/1689710/pexels-photo-1689710.jpeg?auto=compress&cs=tinysrgb&w=400'],
      },
    ],
  },
  {
    id: 'news-11',
    type: 'news',
    source: 'NPR',
    headline: 'Heat wave prompts early cooling-center openings across the region',
    summary:
      'Libraries and community halls extend hours as forecasters warn of consecutive 35°C days.',
    articleBody:
      'Emergency managers opened cooling centers two days earlier than usual as meteorologists forecast a prolonged heat wave.\n\nPublic health officials urged residents to check on elderly neighbors and stay hydrated during afternoon peaks.\n\nTransit agencies said they would allow water bottles on trains for the duration of the advisory.',
    imageUrl: pulseNewsImages.earthTech,
    timeAgo: '2h ago',
    category: 'Weather',
    articleUrl: freeNewsLinks.nprHealth,
    reporters: [
      {
        id: 'rep-11a',
        name: 'Vera S.',
        avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200',
        quote: 'Libraries saved my summer last year',
        photos: ['https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400'],
      },
    ],
  },
  {
    id: 'news-12',
    type: 'news',
    source: 'BBC Culture',
    headline: 'Indie bookstores report summer reading surge after festival season',
    summary:
      'Staff picks tables are restocked weekly as debut novels dominate local bestseller lists.',
    articleBody:
      'Independent bookstores across the region reported double-digit sales growth compared with last summer.\n\nOwners credit festival programming, signed first editions, and community book clubs that meet in-store on weeknights.\n\nPublishers say memoirs and translated fiction are outperforming celebrity memoirs for the first time in three years.',
    imageUrl: pulseNewsImages.newspaper,
    timeAgo: '3h ago',
    category: 'Culture',
    articleUrl: freeNewsLinks.bbcCulture,
    reporters: [
      {
        id: 'rep-12a',
        name: 'Clara D.',
        avatarUrl: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=200',
        quote: 'Staff picks beat algorithms',
        photos: ['https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=400'],
      },
    ],
  },
  {
    id: 'news-13',
    type: 'news',
    source: 'Al Jazeera',
    headline: 'Global supply chains stabilize as shipping rates cool from 2024 peaks',
    summary:
      'Container prices fall for a third straight month, easing inflation pressure on imported goods.',
    articleBody:
      'Shipping rates continued to decline as new vessel capacity entered service and port congestion eased in Asia and Europe.\n\nRetailers said lead times for electronics and furniture normalized to pre-pandemic averages.\n\nEconomists cautioned that geopolitical risk could still disrupt key chokepoints later in the year.',
    imageUrl: pulseNewsImages.cityFinance,
    timeAgo: '4h ago',
    category: 'Business',
    articleUrl: freeNewsLinks.aljazeeraEconomy,
    reporters: [
      {
        id: 'rep-13a',
        name: 'Simon R.',
        avatarUrl: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200',
        quote: 'Freight finally predictable again',
        photos: ['https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400'],
      },
      {
        id: 'rep-13b',
        name: 'Miguel A.',
        avatarUrl: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200',
        quote: 'Restaurant imports costs down too',
        photos: ['https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'],
      },
    ],
  },
  {
    id: 'news-14',
    type: 'news',
    source: 'DW News',
    headline: 'Solar adoption hits record as battery storage prices drop',
    summary:
      'Home installers report waitlists as federal incentives and cheaper lithium packs align.',
    articleBody:
      'Residential solar installers said waitlists stretched into autumn as battery storage prices fell sharply.\n\nUtility regulators are reviewing new grid-connection rules to handle the influx of home systems feeding power back during peak sun hours.\n\nClimate analysts called the trend a bright spot amid slower progress on industrial emissions.',
    imageUrl: pulseNewsImages.earthTech,
    timeAgo: '5h ago',
    category: 'Climate',
    articleUrl: freeNewsLinks.dwNews,
    reporters: [
      {
        id: 'rep-14a',
        name: 'Maya T.',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
        quote: 'ROI finally makes sense for renters too',
        photos: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'],
      },
    ],
  },
];
