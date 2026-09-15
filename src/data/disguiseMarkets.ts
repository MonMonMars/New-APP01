export type MarketCategory = 'index' | 'stock' | 'crypto' | 'forex' | 'commodity';

export type MarketQuote = {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePct: string;
  up: boolean;
  category: MarketCategory;
  sparkline?: number[];
};

export type MarketMover = MarketQuote & {
  volumeLabel: string;
};

export const marketIndexQuotes: MarketQuote[] = [
  {
    id: 'idx-spx',
    symbol: 'S&P 500',
    name: 'US large cap',
    price: '5,842.31',
    change: '+34.18',
    changePct: '+0.59%',
    up: true,
    category: 'index',
    sparkline: [5780, 5795, 5810, 5802, 5825, 5842],
  },
  {
    id: 'idx-ndx',
    symbol: 'NASDAQ',
    name: 'US tech',
    price: '18,421.06',
    change: '+162.44',
    changePct: '+0.89%',
    up: true,
    category: 'index',
    sparkline: [18200, 18240, 18210, 18300, 18380, 18421],
  },
  {
    id: 'idx-dji',
    symbol: 'DOW',
    name: 'Industrials',
    price: '42,208.18',
    change: '-48.22',
    changePct: '-0.11%',
    up: false,
    category: 'index',
    sparkline: [42280, 42240, 42210, 42190, 42230, 42208],
  },
  {
    id: 'idx-ftse',
    symbol: 'FTSE 100',
    name: 'UK blue chips',
    price: '8,314.52',
    change: '+21.07',
    changePct: '+0.25%',
    up: true,
    category: 'index',
    sparkline: [8280, 8290, 8295, 8300, 8310, 8314],
  },
];

export const marketStockQuotes: MarketQuote[] = [
  {
    id: 'stk-aapl',
    symbol: 'AAPL',
    name: 'Apple',
    price: '$228.42',
    change: '+2.18',
    changePct: '+0.96%',
    up: true,
    category: 'stock',
  },
  {
    id: 'stk-msft',
    symbol: 'MSFT',
    name: 'Microsoft',
    price: '$441.05',
    change: '+4.62',
    changePct: '+1.06%',
    up: true,
    category: 'stock',
  },
  {
    id: 'stk-nvda',
    symbol: 'NVDA',
    name: 'NVIDIA',
    price: '$128.74',
    change: '+3.91',
    changePct: '+3.13%',
    up: true,
    category: 'stock',
  },
  {
    id: 'stk-tsla',
    symbol: 'TSLA',
    name: 'Tesla',
    price: '$248.19',
    change: '-5.44',
    changePct: '-2.15%',
    up: false,
    category: 'stock',
  },
  {
    id: 'stk-goog',
    symbol: 'GOOGL',
    name: 'Alphabet',
    price: '$176.88',
    change: '+1.02',
    changePct: '+0.58%',
    up: true,
    category: 'stock',
  },
  {
    id: 'stk-meta',
    symbol: 'META',
    name: 'Meta',
    price: '$582.31',
    change: '+7.24',
    changePct: '+1.26%',
    up: true,
    category: 'stock',
  },
];

export const marketCryptoForex: MarketQuote[] = [
  {
    id: 'cry-btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: '$94,218',
    change: '-1,142',
    changePct: '-1.20%',
    up: false,
    category: 'crypto',
  },
  {
    id: 'cry-eth',
    symbol: 'ETH',
    name: 'Ethereum',
    price: '$3,412',
    change: '+48',
    changePct: '+1.43%',
    up: true,
    category: 'crypto',
  },
  {
    id: 'fx-eurusd',
    symbol: 'EUR/USD',
    name: 'Euro',
    price: '1.0892',
    change: '+0.0011',
    changePct: '+0.10%',
    up: true,
    category: 'forex',
  },
  {
    id: 'com-gold',
    symbol: 'GOLD',
    name: 'Spot gold',
    price: '$2,384',
    change: '+12.40',
    changePct: '+0.52%',
    up: true,
    category: 'commodity',
  },
];

export const marketTopMovers: MarketMover[] = [
  {
    id: 'mv-nvda',
    symbol: 'NVDA',
    name: 'NVIDIA',
    price: '$128.74',
    change: '+3.91',
    changePct: '+3.13%',
    up: true,
    category: 'stock',
    volumeLabel: '48.2M vol',
  },
  {
    id: 'mv-amd',
    symbol: 'AMD',
    name: 'AMD',
    price: '$162.08',
    change: '+4.22',
    changePct: '+2.67%',
    up: true,
    category: 'stock',
    volumeLabel: '31.5M vol',
  },
  {
    id: 'mv-tsla',
    symbol: 'TSLA',
    name: 'Tesla',
    price: '$248.19',
    change: '-5.44',
    changePct: '-2.15%',
    up: false,
    category: 'stock',
    volumeLabel: '62.1M vol',
  },
  {
    id: 'mv-coin',
    symbol: 'COIN',
    name: 'Coinbase',
    price: '$214.55',
    change: '-6.88',
    changePct: '-3.10%',
    up: false,
    category: 'stock',
    volumeLabel: '9.8M vol',
  },
];

export const marketSessionLabel = 'US markets open · UK close in 2h 14m';
