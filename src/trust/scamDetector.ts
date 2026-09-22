import { SCAM_DEMO_PROFILE_MARKERS } from '../data/scamDemoAccounts';
import { Profile } from '../types/profile';
import { getQuarantineBonusScore, isProfileQuarantined } from './scamEnforcementStore';
import {
  collectScamSignalsFromText,
  levelFromScore,
  scoreFromSignals,
} from './scamSignals';
import { ScamAssessment, ScamSignal } from './scamTypes';

function profileTrustSignals(profile: Profile): ScamSignal[] {
  const signals: ScamSignal[] = [];
  if (!profile.photoVerified && !profile.personVerified && !profile.verified) {
    signals.push({
      id: 'profile-unverified',
      category: 'unverified_new',
      weight: profile.isNew ? 14 : 8,
    });
  }
  if (profile.isNew && (profile.bio?.length ?? 0) < 40) {
    signals.push({
      id: 'profile-thin-bio',
      category: 'unverified_new',
      weight: 6,
    });
  }
  if ((profile.photos?.length ?? 0) <= 1) {
    signals.push({
      id: 'profile-single-photo',
      category: 'unverified_new',
      weight: 5,
    });
  }
  return signals;
}

function demoMarkerSignals(profileId: string): ScamSignal[] {
  const marker = SCAM_DEMO_PROFILE_MARKERS[profileId];
  if (!marker) {
    return [];
  }
  const signals: ScamSignal[] = [];
  if (marker.bioSnippet) {
    signals.push(...collectScamSignalsFromText(marker.bioSnippet, 'demo-bio'));
  }
  if (marker.openerSnippet) {
    signals.push(...collectScamSignalsFromText(marker.openerSnippet, 'demo-opener'));
  }
  if (marker.bonusScore) {
    signals.push({
      id: 'demo-marker',
      category: 'admin_confirmed',
      weight: marker.bonusScore,
    });
  }
  return signals;
}

export function assessProfile(profile: Profile, messageTexts: string[] = []): ScamAssessment {
  const texts = [
    profile.bio ?? '',
    profile.openingMove ?? '',
    ...(profile.prompts?.map((p) => `${p.question} ${p.answer}`) ?? []),
    ...messageTexts,
  ];
  const textSignals = texts.flatMap((text, index) =>
    collectScamSignalsFromText(text, `text-${index}`),
  );
  const merged = [...profileTrustSignals(profile), ...demoMarkerSignals(profile.id), ...textSignals];

  if (isProfileQuarantined(profile.id)) {
    merged.push({
      id: 'admin-quarantine',
      category: 'admin_confirmed',
      weight: 50,
    });
  }

  const bonus = getQuarantineBonusScore(profile.id);
  let score = scoreFromSignals(merged) + bonus;
  score = Math.min(100, score);

  const uniqueSignals = dedupeSignals(merged);

  return {
    profileId: profile.id,
    score,
    level: levelFromScore(score),
    signals: uniqueSignals.slice(0, 12),
    assessedAt: new Date().toISOString(),
  };
}

export function assessMessageText(profileId: string, text: string): ScamAssessment {
  const signals = collectScamSignalsFromText(text, 'msg');
  let score = scoreFromSignals(signals);
  if (isProfileQuarantined(profileId)) {
    score = Math.min(100, score + 20);
  }
  return {
    profileId,
    score,
    level: levelFromScore(score),
    signals: dedupeSignals(signals),
    assessedAt: new Date().toISOString(),
  };
}

function dedupeSignals(signals: ScamSignal[]): ScamSignal[] {
  const seen = new Set<string>();
  const out: ScamSignal[] = [];
  for (const signal of signals) {
    const key = `${signal.category}-${signal.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(signal);
  }
  return out;
}

export function shouldHideProfileFromDiscover(assessment: ScamAssessment): boolean {
  if (isProfileQuarantined(assessment.profileId)) {
    return true;
  }
  if (assessment.level === 'critical') {
    return true;
  }
  if (assessment.level === 'high' && assessment.score >= 70) {
    return true;
  }
  return false;
}
