export type SparkPlusPlan = 'weekly' | 'monthly' | 'annual';

export type SparkPlusFeature = {
  icon: string;
  title: string;
  description: string;
};

export const SPARK_PLUS_FEATURES: SparkPlusFeature[] = [
  {
    icon: 'heart',
    title: 'See who likes you',
    description: 'Skip the guesswork — match instantly with people who already liked you.',
  },
  {
    icon: 'infinite',
    title: 'Unlimited likes',
    description: 'No daily cap. Like as many profiles as you want.',
  },
  {
    icon: 'flash',
    title: '1 free Boost / week',
    description: 'Be a top profile in your area for 30 minutes.',
  },
  {
    icon: 'refresh',
    title: 'Unlimited rewinds',
    description: 'Undo a pass if you changed your mind.',
  },
  {
    icon: 'options',
    title: 'Advanced filters',
    description: 'Filter by intent, interests, and more.',
  },
  {
    icon: 'chatbubble-ellipses',
    title: 'Spark Notes',
    description: 'Send one message before you match (1/day).',
  },
];

export const SPARK_PLUS_PRICING: Record<SparkPlusPlan, { label: string; price: string; perMonth: string }> = {
  weekly: { label: '1 week', price: '$12.99', perMonth: '—' },
  monthly: { label: '1 month', price: '$14.99', perMonth: '$14.99/mo' },
  annual: { label: '12 months', price: '$99.99', perMonth: '$8.33/mo' },
};

export const FREE_DAILY_LIKE_LIMIT = 10;
