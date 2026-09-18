import { EntitlementGrant } from '../types/purchases';
import { SparkPlusPlan } from '../types/subscription';

export type EntitlementStatePatch = {
  isSparkPlus?: boolean;
  subscriptionPlan?: SparkPlusPlan | null;
  subscriptionExpiresAt?: string | null;
  bonusBoostsDelta?: number;
  activateBoost?: boolean;
  bonusSparkNotesDelta?: number;
};

/** Pure mapping from a verified purchase grant → local entitlement state deltas. */
export function entitlementPatchFromGrant(grant: EntitlementGrant): EntitlementStatePatch {
  const patch: EntitlementStatePatch = {};

  if (grant.sparkPlus) {
    patch.isSparkPlus = true;
    patch.subscriptionPlan = grant.sparkPlus.plan;
    patch.subscriptionExpiresAt = grant.sparkPlus.expiresAt;
  }

  if (grant.bonusBoosts !== undefined && grant.bonusBoosts > 0) {
    patch.bonusBoostsDelta = grant.bonusBoosts;
  }

  if (grant.activateBoost) {
    patch.activateBoost = true;
  }

  if (grant.bonusSparkNotes !== undefined && grant.bonusSparkNotes > 0) {
    patch.bonusSparkNotesDelta = grant.bonusSparkNotes;
  }

  return patch;
}

export function isSubscriptionActive(
  isSparkPlus: boolean,
  expiresAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!isSparkPlus) {
    return false;
  }
  if (!expiresAt) {
    return true;
  }
  return new Date(expiresAt).getTime() > now;
}
