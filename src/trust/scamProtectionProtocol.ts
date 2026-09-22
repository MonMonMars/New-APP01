import { AppLocale } from '../types/locale';
import { translate } from '../i18n';
import { CustomerProtectionPlan, ScamAssessment, ScamRiskLevel } from './scamTypes';

function tierForLevel(level: ScamRiskLevel): CustomerProtectionPlan['tier'] {
  switch (level) {
    case 'low':
      return 'monitor';
    case 'medium':
      return 'warn';
    case 'high':
      return 'restrict';
    case 'critical':
      return 'quarantine';
    default: {
      const _exhaustive: never = level;
      return _exhaustive;
    }
  }
}

/** Customer-facing protection steps — aligned with major dating apps' anti-scam guidance. */
export function buildCustomerProtectionPlan(
  assessment: ScamAssessment,
  locale: AppLocale,
): CustomerProtectionPlan {
  const tier = tierForLevel(assessment.level);
  const hideFromDiscover = tier === 'quarantine';
  const showChatBanner = assessment.level !== 'low';
  const showProfileWarning = assessment.level === 'high' || assessment.level === 'critical';
  const recommendBlockAndReport = assessment.level !== 'low';

  const protocolSteps = [
    translate(locale, 'scamProtection.stepStayOnApp'),
    translate(locale, 'scamProtection.stepNeverSendMoney'),
    translate(locale, 'scamProtection.stepNoGiftCards'),
    translate(locale, 'scamProtection.stepVideoVerify'),
    translate(locale, 'scamProtection.stepReport'),
  ];

  if (assessment.level === 'critical') {
    protocolSteps.unshift(translate(locale, 'scamProtection.stepStopContact'));
  }

  return {
    tier,
    hideFromDiscover,
    showChatBanner,
    showProfileWarning,
    blockOutgoingLinks: assessment.level === 'critical',
    recommendBlockAndReport,
    protocolSteps,
  };
}

const LEVEL_SCORE: Record<ScamRiskLevel, number> = {
  low: 12,
  medium: 40,
  high: 65,
  critical: 90,
};

export function buildCustomerProtectionPlanForLevel(
  level: ScamRiskLevel,
  locale: AppLocale,
): CustomerProtectionPlan {
  return buildCustomerProtectionPlan(
    {
      profileId: '',
      score: LEVEL_SCORE[level],
      level,
      signals: [],
      assessedAt: new Date().toISOString(),
    },
    locale,
  );
}
