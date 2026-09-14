/**
 * Client ad campaigns shown in disguise mode.
 * Update `landingUrl` when a client provides a new campaign link.
 */
export type ClientAdCampaign = {
  id: string;
  brand: string;
  tagline: string;
  imageUrl: string;
  cta: string;
  landingUrl: string;
};

export const disguiseClientAds: ClientAdCampaign[] = [
  {
    id: 'ad-1',
    brand: 'NordVPN',
    tagline: 'Browse privately on public Wi‑Fi. 2 years + 3 months free.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3d58c?w=800&q=80',
    cta: 'Learn more',
    landingUrl: 'https://nordvpn.com/special/',
  },
  {
    id: 'ad-2',
    brand: 'Spotify Premium',
    tagline: '3 months free. Cancel anytime. Listen offline on your commute.',
    imageUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80',
    cta: 'Try free',
    landingUrl: 'https://www.spotify.com/premium/',
  },
  {
    id: 'ad-3',
    brand: 'Airbnb',
    tagline: 'Weekend getaways under $150/night. Flexible cancellation.',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    cta: 'Explore stays',
    landingUrl: 'https://www.airbnb.com/',
  },
];
