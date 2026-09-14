import { secureGetItem, secureSetItem } from './secureStorage';

const FAIL_COUNT_KEY = 'spark_unlock_fail_count';
const LOCK_UNTIL_KEY = 'spark_unlock_lock_until';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60_000;

export async function getUnlockLockoutRemainingMs(): Promise<number> {
  const untilRaw = await secureGetItem(LOCK_UNTIL_KEY);
  if (!untilRaw) {
    return 0;
  }
  const until = Number.parseInt(untilRaw, 10);
  if (!Number.isFinite(until)) {
    return 0;
  }
  return Math.max(0, until - Date.now());
}

export async function isUnlockLockedOut(): Promise<boolean> {
  const remaining = await getUnlockLockoutRemainingMs();
  return remaining > 0;
}

export async function recordFailedUnlockAttempt(): Promise<{
  locked: boolean;
  remainingAttempts: number;
  lockoutMs: number;
}> {
  const lockoutRemaining = await getUnlockLockoutRemainingMs();
  if (lockoutRemaining > 0) {
    return { locked: true, remainingAttempts: 0, lockoutMs: lockoutRemaining };
  }

  const countRaw = await secureGetItem(FAIL_COUNT_KEY);
  const count = countRaw ? Number.parseInt(countRaw, 10) : 0;
  const next = count + 1;

  if (next >= MAX_ATTEMPTS) {
    const until = Date.now() + LOCKOUT_MS;
    await secureSetItem(LOCK_UNTIL_KEY, String(until));
    await secureSetItem(FAIL_COUNT_KEY, '0');
    return { locked: true, remainingAttempts: 0, lockoutMs: LOCKOUT_MS };
  }

  await secureSetItem(FAIL_COUNT_KEY, String(next));
  return {
    locked: false,
    remainingAttempts: MAX_ATTEMPTS - next,
    lockoutMs: 0,
  };
}

export async function clearFailedUnlockAttempts(): Promise<void> {
  await secureSetItem(FAIL_COUNT_KEY, '0');
  await secureSetItem(LOCK_UNTIL_KEY, '0');
}
