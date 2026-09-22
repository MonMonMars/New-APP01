import { pulseNewsImages } from './pulseNewsMedia';

/**
 * Client ad campaigns shown in disguise mode.
 * Update `landingUrl` when a client provides a new campaign link.
 */
export type ClientAdCampaign = {
  id: string;
  brand: string;
  tagline: string;
  description: string;
  imageUrl: string;
  cta: string;
  landingUrl: string;
};

export const disguiseClientAds: ClientAdCampaign[] = [
  {
    id: 'ad-1',
    brand: 'NordVPN',
    tagline: 'Browse privately on public Wi‑Fi. 2 years + 3 months free.',
    description:
      'Protect your connection on coffee-shop Wi‑Fi, flights, and hotel networks. NordVPN encrypts traffic with one tap and includes Threat Protection Lite on supported plans.\n\nLimited-time offer: 2 years plus 3 bonus months. Cancel within 30 days for a full refund on annual plans.',
    imageUrl: pulseNewsImages.laptop,
    cta: 'Learn more',
    landingUrl: 'https://nordvpn.com/special/',
  },
  {
    id: 'ad-2',
    brand: 'Spotify Premium',
    tagline: '3 months free. Cancel anytime. Listen offline on your commute.',
    description:
      'Stream ad-free music and podcasts with offline downloads for your commute. Premium includes higher audio quality and unlimited skips.\n\nNew subscribers in eligible regions can try 3 months free, then standard pricing applies. Cancel anytime in account settings.',
    imageUrl: pulseNewsImages.concert,
    cta: 'Try free',
    landingUrl: 'https://www.spotify.com/premium/',
  },
  {
    id: 'ad-3',
    brand: 'Airbnb',
    tagline: 'Weekend getaways under $150/night. Flexible cancellation.',
    description:
      'Find unique stays near the city or a few hours away — cabins, lofts, and guesthouses with flexible cancellation on many listings.\n\nFilter by price, amenities, and Superhost status. This feed card highlights weekend trips under $150 per night.',
    imageUrl: pulseNewsImages.skyline,
    cta: 'Explore stays',
    landingUrl: 'https://www.airbnb.com/',
  },
];
