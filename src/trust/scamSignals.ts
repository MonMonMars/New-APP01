import { ScamSignal, ScamSignalCategory } from './scamTypes';

export type ScamPatternRule = {
  id: string;
  category: ScamSignalCategory;
  weight: number;
  /** Case-insensitive regex tested against normalized text. */
  pattern: RegExp;
};

/** Patterns informed by common dating-app trust & safety playbooks (Tinder, Bumble, Hinge, Match Group). */
export const SCAM_TEXT_PATTERNS: ScamPatternRule[] = [
  {
    id: 'whatsapp_move',
    category: 'off_platform',
    weight: 18,
    pattern: /\b(whatsapp|telegram|signal app|google chat|wechat|line app|snapchat only)\b/i,
  },
  {
    id: 'off_platform_early',
    category: 'off_platform',
    weight: 14,
    pattern: /\b(text me at|message me on|add me on|chat on)\b.+\b(\+?\d{3,}|@)\b/i,
  },
  {
    id: 'wire_transfer',
    category: 'money_request',
    weight: 28,
    pattern: /\b(wire transfer|bank transfer|western union|moneygram|zelle|venmo me|cash app me|send money)\b/i,
  },
  {
    id: 'gift_card',
    category: 'gift_card',
    weight: 26,
    pattern: /\b(gift card|itunes card|google play card|steam card|amazon card)\b/i,
  },
  {
    id: 'crypto',
    category: 'crypto_investment',
    weight: 30,
    pattern: /\b(bitcoin|btc|ethereum|crypto wallet|binance|coinbase|forex|trading platform|investment opportunity)\b/i,
  },
  {
    id: 'urgency',
    category: 'urgency_pressure',
    weight: 12,
    pattern: /\b(asap|urgent|right now|don't tell anyone|keep this secret|trust me only)\b/i,
  },
  {
    id: 'military_romance',
    category: 'identity_story',
    weight: 16,
    pattern: /\b(deployed|military base|oil rig|UN peacekeeping|stuck overseas|customs fee)\b/i,
  },
  {
    id: 'phishing_link',
    category: 'link_phishing',
    weight: 22,
    pattern: /\b(bit\.ly|tinyurl|login-verify|secure-pay|wallet-connect)\b/i,
  },
  {
    id: 'love_bomb',
    category: 'love_bombing',
    weight: 10,
    pattern: /\b(soulmate|destiny brought us|love of my life|marry you soon|future wife|future husband)\b/i,
  },
];

export function collectScamSignalsFromText(text: string, sourcePrefix: string): ScamSignal[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return [];
  }
  const found: ScamSignal[] = [];
  for (const rule of SCAM_TEXT_PATTERNS) {
    const match = normalized.match(rule.pattern);
    if (match) {
      found.push({
        id: `${sourcePrefix}-${rule.id}`,
        category: rule.category,
        weight: rule.weight,
        excerpt: match[0].slice(0, 80),
      });
    }
  }
  return found;
}

export function scoreFromSignals(signals: ScamSignal[]): number {
  const byCategory = new Map<ScamSignalCategory, number>();
  for (const signal of signals) {
    byCategory.set(signal.category, Math.max(byCategory.get(signal.category) ?? 0, signal.weight));
  }
  let total = 0;
  byCategory.forEach((weight) => {
    total += weight;
  });
  return Math.min(100, total);
}

export function levelFromScore(score: number): import('./scamTypes').ScamRiskLevel {
  if (score >= 80) {
    return 'critical';
  }
  if (score >= 55) {
    return 'high';
  }
  if (score >= 30) {
    return 'medium';
  }
  return 'low';
}
