import { mockProfiles } from '../src/data/profiles';
import { SCAM_DEMO_PROFILE_MARKERS } from '../src/data/scamDemoAccounts';
import {
  assessProfile,
  shouldAutoQuarantineOnReport,
  shouldHideProfileFromDiscover,
} from '../src/trust/scamDetector';

function main(): void {
  const demoIds = Object.keys(SCAM_DEMO_PROFILE_MARKERS);
  let failed = false;

  for (const id of demoIds) {
    const profile = mockProfiles.find((entry) => entry.id === id);
    if (!profile) {
      console.error(`validate-scam-detector: missing demo profile id ${id}`);
      failed = true;
      continue;
    }
    const assessment = assessProfile(profile);
    if (assessment.level === 'low') {
      console.error(`validate-scam-detector: demo id ${id} should not be low risk (score ${assessment.score})`);
      failed = true;
    }
  }

  const criticalDemo = demoIds.filter((id) => {
    const profile = mockProfiles.find((entry) => entry.id === id);
    return profile && assessProfile(profile).level === 'critical';
  });
  if (criticalDemo.length < 2) {
    console.error('validate-scam-detector: expected at least two critical demo markers');
    failed = true;
  }

  const hidden = mockProfiles.filter((profile) => shouldHideProfileFromDiscover(assessProfile(profile)));
  if (hidden.length === 0) {
    console.error('validate-scam-detector: expected at least one profile hidden from Discover');
    failed = true;
  }

  if (!shouldAutoQuarantineOnReport('Spam or scam', { profileId: 'x', score: 10, level: 'low', signals: [], assessedAt: '' })) {
    console.error('validate-scam-detector: spam report must auto-quarantine');
    failed = true;
  }
  if (shouldAutoQuarantineOnReport('Inappropriate photos', { profileId: 'x', score: 40, level: 'medium', signals: [], assessedAt: '' })) {
    console.error('validate-scam-detector: non-scam report must not quarantine medium-only profiles');
    failed = true;
  }

  if (failed) {
    process.exit(1);
  }
  console.log(
    `validate-scam-detector: ok (${demoIds.length} demo markers, ${hidden.length} hidden from Discover)`,
  );
}

main();
