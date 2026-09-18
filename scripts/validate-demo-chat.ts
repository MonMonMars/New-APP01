import { AI_PERSONA_IDS, mockProfiles } from '../src/data/profiles';
import { generateAiPersonaReply } from '../src/services/demoAiPersonaBrain';
import { generateLocalDemoReply } from '../src/services/demoChatBrain';
import { buildMatchOpenerMessage } from '../src/services/demoChatOpener';
import * as replyPools from '../src/services/demoChatReplies';

const SAMPLE_USER_MESSAGES = [
  'Hey!',
  'How is your weekend?',
  'Want to grab coffee sometime?',
  'You are really cute',
  'What are you looking for on here?',
  'lol that is funny',
  'Thanks!',
  'Goodnight talk tomorrow?',
  'sent a photo',
  'Voice note (12s)',
  'Any good restaurants near you?',
  'What are you watching on Netflix?',
  'I am kind of nervous texting first',
  'Rough day at work honestly',
  'Hot take: pineapple belongs on pizza',
];

const POOL_KEYS = Object.keys(replyPools);

function validatePools(): { emptyPools: string[]; totalLines: number } {
  const emptyPools: string[] = [];
  let totalLines = 0;

  for (const key of POOL_KEYS) {
    const pool = (replyPools as Record<string, unknown>)[key];

    if (key === 'INTEREST_REPLIES' || key === 'JOB_KEYWORD_REPLIES') {
      const record = pool as Record<string, string[]>;
      for (const [subKey, lines] of Object.entries(record)) {
        totalLines += lines.length;
        if (lines.length === 0 || lines.some((line) => !line.trim())) {
          emptyPools.push(`${key}.${subKey}`);
        }
      }
      continue;
    }

    if (!Array.isArray(pool)) {
      continue;
    }

    const lines = pool as string[];
    totalLines += lines.length;
    if (lines.length === 0 || lines.some((line) => !line.trim())) {
      emptyPools.push(key);
    }
  }

  return { emptyPools, totalLines };
}

function smokeTestReplies(): { localUnique: number; personaUnique: number; failures: string[] } {
  const failures: string[] = [];
  const humanProfiles = mockProfiles.filter((p) => !AI_PERSONA_IDS.has(p.id) && !p.isAiPersona);
  const aiProfiles = mockProfiles.filter((p) => AI_PERSONA_IDS.has(p.id) || p.isAiPersona);

  const sampleHumans = humanProfiles.filter((_, index) => index % 7 === 0).slice(0, 12);
  const localReplies = new Set<string>();

  for (const profile of sampleHumans) {
    for (const userMessage of SAMPLE_USER_MESSAGES) {
      const text = generateLocalDemoReply({
        profile,
        userMessage,
        recentMessages: [],
        userName: 'Alex',
      });
      if (!text.trim()) {
        failures.push(`Empty local reply for profile ${profile.id} / "${userMessage}"`);
      }
      localReplies.add(text);
    }
  }

  const personaReplies = new Set<string>();
  for (const profile of aiProfiles.slice(0, 5)) {
    for (const userMessage of SAMPLE_USER_MESSAGES.slice(0, 8)) {
      const text = generateAiPersonaReply({
        profile,
        userMessage,
        recentMessages: [],
        userName: 'Alex',
      });
      if (!text.trim()) {
        failures.push(`Empty persona reply for ${profile.id}`);
      }
      personaReplies.add(text);
    }
  }

  const openerCount = humanProfiles.filter((p) => buildMatchOpenerMessage(p)).length;
  if (openerCount < 40) {
    failures.push(`Expected at least 40 match openers, got ${openerCount}`);
  }

  return {
    localUnique: localReplies.size,
    personaUnique: personaReplies.size,
    failures,
  };
}

const { emptyPools, totalLines } = validatePools();
const smoke = smokeTestReplies();

console.log(
  JSON.stringify(
    {
      poolExportCount: POOL_KEYS.length,
      totalReplyLines: totalLines,
      emptyPools,
      smokeTestUniqueLocalReplies: smoke.localUnique,
      smokeTestUniquePersonaReplies: smoke.personaUnique,
      smokeFailures: smoke.failures,
    },
    null,
    2,
  ),
);

if (emptyPools.length > 0 || smoke.failures.length > 0) {
  process.exit(1);
}

if (totalLines < 400) {
  console.error('Expected at least 400 total reply lines');
  process.exit(1);
}

if (smoke.localUnique < 55) {
  console.error('Local reply smoke test lacks variety');
  process.exit(1);
}

process.exit(0);
