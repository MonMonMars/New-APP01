/** Live photo URLs for Pulse/Harbor — Pexels hosts, checked HTTP 200 and hotlink-safe. */
export const pulseNewsImages = {
  cityFinance:
    'https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg?auto=compress&cs=tinysrgb&w=1200',
  newspaper:
    'https://images.pexels.com/photos/3944454/pexels-photo-3944454.jpeg?auto=compress&cs=tinysrgb&w=1200',
  earthTech:
    'https://images.pexels.com/photos/2156/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=1200',
  transit:
    'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&w=1200',
  restaurant:
    'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
  office:
    'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
  phone:
    'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=1200',
  cafe:
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1200',
  newsroom:
    'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=1200',
  chips:
    'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1200',
  fallback:
    'https://images.pexels.com/photos/3944454/pexels-photo-3944454.jpeg?auto=compress&cs=tinysrgb&w=1200',
  stars:
    'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1200',
  moon:
    'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=1200',
  tarot:
    'https://images.pexels.com/photos/7661160/pexels-photo-7661160.jpeg?auto=compress&cs=tinysrgb&w=1200',
  concert:
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200',
  cinema:
    'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1200',
  fashion:
    'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200',
} as const;

/** Free-to-read publishers — no subscription or registration wall on these section pages. */
export const freeNewsLinks = {
  bbcTechnology: 'https://www.bbc.com/news/technology',
  bbcNews: 'https://www.bbc.com/news',
  bbcFood: 'https://www.bbc.com/food',
  guardianAI: 'https://www.theguardian.com/technology/artificialintelligenceai',
  guardianTransport: 'https://www.theguardian.com/uk/transport',
  guardianFood: 'https://www.theguardian.com/food',
  nprTechnology: 'https://www.npr.org/sections/technology',
  nprHealth: 'https://www.npr.org/sections/health',
  pbsNews: 'https://www.pbs.org/newshour',
  pbsEconomy: 'https://www.pbs.org/newshour/economy',
  aljazeeraNews: 'https://www.aljazeera.com/news/',
  aljazeeraEconomy: 'https://www.aljazeera.com/economy/',
  dwNews: 'https://www.dw.com/en/top-stories/s-9097',
  cbcNews: 'https://www.cbc.ca/news',
  abcNews: 'https://www.abc.net.au/news',
  bbcCulture: 'https://www.bbc.com/culture',
  guardianFilm: 'https://www.theguardian.com/film',
  guardianStage: 'https://www.theguardian.com/stage',
  nprPopCulture: 'https://www.npr.org/sections/pop-culture',
  nprMusic: 'https://www.npr.org/sections/arts-life/music',
} as const;

export function freeNewsUrlForTopic(topic: string): string {
  switch (topic) {
    case '#TechNews':
    case '#EURegulation':
      return freeNewsLinks.nprTechnology;
    case '#AIInvesting':
    case '#MarketWatch':
      return freeNewsLinks.bbcTechnology;
    case '#CityLife':
    case '#NightTransit':
    case '#TransitTalk':
      return freeNewsLinks.guardianTransport;
    case '#CoffeeShops':
    case '#WeekendEats':
    case '#WeekendPlans':
      return freeNewsLinks.bbcFood;
    case '#ClimateTech':
      return freeNewsLinks.dwNews;
    case '#RemoteWork':
    case '#DesignTips':
      return freeNewsLinks.bbcNews;
    case '#StartupJobs':
      return freeNewsLinks.nprHealth;
    case '#BookClub':
    case '#IndieBooks':
      return freeNewsLinks.bbcCulture;
    case '#Weather':
    case '#HeatWave':
      return freeNewsLinks.abcNews;
    case '#OnDeviceAI':
      return freeNewsLinks.bbcTechnology;
    case '#CarFreeCities':
      return freeNewsLinks.guardianTransport;
    case '#SolarHome':
      return freeNewsLinks.dwNews;
    default:
      return freeNewsLinks.bbcNews;
  }
}
