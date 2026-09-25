import { pulseFeedPostIdFromReporter, pulseSocialPostReporterId } from '../src/utils/resolveDisguiseProfile';

const postId = 'social-post-abc';
const reporterId = pulseSocialPostReporterId(postId);
if (reporterId !== `social-${postId}`) {
  throw new Error(`expected social- prefix reporter id, got ${reporterId}`);
}
if (pulseFeedPostIdFromReporter(reporterId) !== postId) {
  throw new Error('social reporter id must round-trip to feed post id');
}
if (pulseFeedPostIdFromReporter('disguised-profile-42') !== 'disguised-profile-42') {
  throw new Error('disguised card reporter id must map to itself');
}

console.log('validate-pulse-reporter-post-id: ok');
