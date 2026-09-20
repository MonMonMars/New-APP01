# Pulse live headlines

Pulse disguise mode merges cached live headlines into the static feed rhythm.

## Refresh

- On first Pulse visit, cached headlines load from `AsyncStorage` (`@pulse/live-news/v1`), then a background fetch runs if the cache is older than 45 minutes.
- Scrolling to the end of the feed (pull-to-refresh footer) forces a fetch and bumps the feed generation.

## Sources (in order)

1. **NewsAPI.org** when `EXPO_PUBLIC_NEWS_API_KEY` is set (`top-headlines` for general, technology, entertainment).
2. **RSS** from BBC (world, technology, entertainment) and Reuters world news, fetched through `EXPO_PUBLIC_NEWS_RSS_PROXY` (defaults to AllOrigins on web).
3. **Last good cache** if the network fails.
4. **Static seed headlines** in `src/data/disguiseFeed.ts` until the first successful fetch.

## Web / CORS

RSS publishers block browser `fetch` directly. Use a proxy URL in `EXPO_PUBLIC_NEWS_RSS_PROXY` or host a small edge function that returns RSS XML. Native builds can often fetch RSS without a proxy when the OS allows it; the app still uses the proxy when configured.

## Reporter profiles

Live and static news rows attach demo dating profiles via `src/data/disguiseReporterProfileLinks.ts`. Tapping a reporter avatar opens the Pulse mini-window (`PersonPreviewSheet`); tapping the headline or hero opens the article sheet.
