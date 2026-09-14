const MAX_MESSAGE_LENGTH = 4000;
const MAX_BIO_LENGTH = 500;
const MAX_REPORT_REASON_LENGTH = 500;

type RateLimitBucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function sanitizeTextInput(value: string, maxLength: number): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMessage(text: string): string {
  return sanitizeTextInput(text, MAX_MESSAGE_LENGTH);
}

export function sanitizeBio(text: string): string {
  return sanitizeTextInput(text, MAX_BIO_LENGTH);
}

export function sanitizeReportReason(text: string): string {
  return sanitizeTextInput(text, MAX_REPORT_REASON_LENGTH);
}

/** Client-side throttle — complements server rate limits. */
export function checkClientRateLimit(
  key: string,
  maxEvents: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (bucket.count >= maxEvents) {
    return false;
  }
  bucket.count += 1;
  return true;
}

export function redactForLogs(value: string, visible = 4): string {
  if (value.length <= visible) {
    return '****';
  }
  return `${value.slice(0, visible)}…`;
}

export function isProductionBuild(): boolean {
  return !__DEV__;
}

export function assertHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
