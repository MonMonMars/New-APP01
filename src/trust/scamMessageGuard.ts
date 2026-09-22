import { assessMessageText } from './scamDetector';
import type { ScamRiskLevel } from './scamTypes';

const URL_PATTERN = /\b(https?:\/\/|www\.)[^\s]+/i;
const SHORT_LINK_PATTERN = /\b(bit\.ly|t\.co|tinyurl\.com|cutt\.ly|rb\.gy)\/\S+/i;

export function messageContainsSuspiciousLink(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) {
    return false;
  }
  return URL_PATTERN.test(normalized) || SHORT_LINK_PATTERN.test(normalized);
}

/** Block tapping through on links in messages from high-risk matches. */
export function shouldSanitizeIncomingLinks(peerRiskLevel: ScamRiskLevel): boolean {
  return peerRiskLevel === 'high' || peerRiskLevel === 'critical';
}

export function assessOutgoingUserMessage(profileId: string, text: string) {
  return assessMessageText(profileId, text);
}

export function shouldWarnBeforeSendingToScammer(
  peerLevel: ScamRiskLevel,
  outgoingText: string,
): boolean {
  if (peerLevel !== 'high' && peerLevel !== 'critical') {
    return false;
  }
  const trimmed = outgoingText.trim();
  if (!trimmed) {
    return false;
  }
  const outgoing = assessMessageText('self', trimmed);
  return (
    outgoing.level !== 'low' ||
    messageContainsSuspiciousLink(trimmed) ||
    /\b(send|wire|transfer|gift card|crypto|bitcoin|venmo|cash app)\b/i.test(trimmed)
  );
}

export function shouldBlockOutgoingLinkToPeer(
  peerLevel: ScamRiskLevel,
  outgoingText: string,
): boolean {
  if (peerLevel !== 'critical') {
    return false;
  }
  return messageContainsSuspiciousLink(outgoingText);
}
