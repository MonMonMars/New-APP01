import { disguiseFeedItems } from '../src/data/disguiseFeed';
import { disguiseFemaleFeedItems } from '../src/data/disguiseFemaleFeed';

const total = disguiseFeedItems.length + disguiseFemaleFeedItems.length;
if (total < 2) {
  console.error(`validate-pulse-feed-init: feed too small (${total})`);
  process.exit(1);
}
console.log(`validate-pulse-feed-init: ok (${total} slots)`);
