import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SparkPlusComparisonTable } from '../components/SparkPlusComparisonTable';
import { formatProductPrice, PRODUCT_CATALOG, sparkPlusProductForPlan } from '../constants/products';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { getLegalUiStrings } from '../content/legal';
import { useTranslation } from '../i18n';
import { formatSparkPlusPerMonth, getSparkPlusPlanLabel } from '../i18n/labels';
import { translateRestoreMessage, translatePurchaseError } from '../utils/purchaseMessages';
import { RootStackParamList } from '../types/navigation';
import { SPARK_PLUS_PRICING, SparkPlusPlan } from '../types/subscription';
import { sparkPlusFeatureDescriptions } from '../utils/genderAccountPerks';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { PurchaseConfirmSheet } from '../components/PurchaseConfirmSheet';
import { PurchasesModeNotice } from '../components/PurchasesModeNotice';

type SparkPlusScreenProps = {
  onClose: () => void;
};

function formatExpiryDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function SparkPlusScreen({ onClose }: SparkPlusScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const {
    purchaseProduct,
    mfaEnabled,
    paymentVerificationRequired,
    restorePurchases,
    openManageSubscriptions,
    user,
    isSubscriptionActive,
    subscriptionPlan,
    subscriptionExpiresAt,
  } = useApp();
  const { t, locale } = useTranslation();
  const legalUi = getLegalUiStrings(locale);
  const features = sparkPlusFeatureDescriptions(user.gender, t);
  const [selectedPlan, setSelectedPlan] = useState<SparkPlusPlan>(subscriptionPlan ?? 'annual');
  const [restoring, setRestoring] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubscribe = async () => {
    setPurchasing(true);
    setPurchaseError(null);
    const productId = sparkPlusProductForPlan(selectedPlan);
    const result = await purchaseProduct(
      productId,
      paymentVerificationRequired && mfaEnabled ? verificationCode : undefined,
    );
    setPurchasing(false);

    if (result.ok) {
      setShowConfirm(false);
      Alert.alert(t('payments.purchaseSuccess'), t('payments.subscriptionActivated'));
      onClose();
      return;
    }

    if (result.code === 'cancelled') {
      return;
    }

    setPurchaseError(translatePurchaseError(locale, result.code, result.message));
  };

  const handleRestore = async () => {
    setRestoring(true);
    const result = await restorePurchases();
    setRestoring(false);
    if (result.ok) {
      Alert.alert(t('sparkPlus.restored'), t('sparkPlus.restoredBody'));
      onClose();
    } else {
      Alert.alert(t('sparkPlus.noneFound'), translateRestoreMessage(locale, result));
    }
  };

  const handleManageSubscription = () => {
    if (Platform.OS === 'web') {
      Alert.alert(t('sparkPlus.manageSubscription'), t('payments.manageOnWeb'));
      return;
    }
    openManageSubscriptions();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.hero}>
        <View style={styles.heroTopRow}>
          <AnimatedPressable style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.text} />
          </AnimatedPressable>
        </View>
        <Ionicons name="diamond" size={48} color={colors.text} />
        <Text style={styles.heroTitle}>{t('sparkPlus.title')}</Text>
        <Text style={styles.heroSubtitle}>{t('sparkPlus.hero')}</Text>
        {isSubscriptionActive && subscriptionExpiresAt ? (
          <Text style={styles.activeBadge}>
            {t('sparkPlus.activeUntil', { date: formatExpiryDate(subscriptionExpiresAt, locale) })}
          </Text>
        ) : null}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <PurchasesModeNotice />
        <SparkPlusComparisonTable />

        {features.map((feature) => (
          <View key={feature.title} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
              <Ionicons
                name={feature.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={colors.gradientEnd}
              />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDescription, { color: colors.textMuted }]}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}

        {!isSubscriptionActive ? (
          <>
            <Text style={[styles.planTitle, { color: colors.text }]}>{t('sparkPlus.choosePlan')}</Text>
            {(Object.keys(SPARK_PLUS_PRICING) as SparkPlusPlan[]).map((plan) => {
              const pricing = SPARK_PLUS_PRICING[plan];
              const product = PRODUCT_CATALOG[sparkPlusProductForPlan(plan)];
              const displayPrice = formatProductPrice(product.displayPriceUsd);
              const isSelected = selectedPlan === plan;
              return (
                <AnimatedPressable
                  key={plan}
                  style={[
                    styles.planCard,
                    { backgroundColor: colors.surface },
                    isSelected && { borderColor: colors.gradientEnd },
                  ]}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <View>
                    <Text style={[styles.planLabel, { color: colors.text }]}>
                      {getSparkPlusPlanLabel(locale, plan)}
                    </Text>
                    {plan === 'annual' && (
                      <Text style={[styles.planBadge, { color: colors.gradientEnd }]}>
                        {t('sparkPlus.bestValue')}
                      </Text>
                    )}
                  </View>
                  <View style={styles.planPriceCol}>
                    <Text style={[styles.planPrice, { color: colors.text }]}>{displayPrice}</Text>
                    {pricing.perMonth !== '—' && (
                      <Text style={[styles.planPerMonth, { color: colors.textMuted }]}>
                        {formatSparkPlusPerMonth(locale, pricing.perMonth)}
                      </Text>
                    )}
                  </View>
                </AnimatedPressable>
              );
            })}

            <AnimatedPressable
              style={[styles.subscribeButton, { backgroundColor: colors.gradientEnd }]}
              onPress={() => {
                setPurchaseError(null);
                setShowConfirm(true);
              }}
            >
              <Text style={[styles.subscribeText, { color: colors.text }]}>
                {t('sparkPlus.continuePrice', {
                  price: formatProductPrice(
                    PRODUCT_CATALOG[sparkPlusProductForPlan(selectedPlan)].displayPriceUsd,
                  ),
                })}
              </Text>
            </AnimatedPressable>
          </>
        ) : (
          <AnimatedPressable
            style={[styles.subscribeButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            onPress={handleManageSubscription}
          >
            <Text style={[styles.subscribeText, { color: colors.text }]}>
              {t('sparkPlus.manageSubscription')}
            </Text>
          </AnimatedPressable>
        )}

        <AnimatedPressable style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
          {restoring ? (
            <ActivityIndicator color={colors.textMuted} />
          ) : (
            <Text style={[styles.restoreText, { color: colors.textMuted }]}>
              {t('sparkPlus.restorePurchases')}
            </Text>
          )}
        </AnimatedPressable>

        <Text style={[styles.legal, { color: colors.textMuted }]}>
          {t('sparkPlus.billingNote')}{' '}
          <Text
            style={[styles.legalLink, { color: colors.gradientEnd }]}
            onPress={() => navigation.navigate('LegalDocument', { documentId: 'subscription' })}
          >
            {legalUi.subscriptionTermsLink}
          </Text>
        </Text>
      </ScrollView>

      <PurchaseConfirmSheet
        visible={showConfirm}
        title={t('sparkPlus.confirmTitle', { plan: getSparkPlusPlanLabel(locale, selectedPlan) })}
        description={t('sparkPlus.confirmDesc')}
        price={formatProductPrice(
          PRODUCT_CATALOG[sparkPlusProductForPlan(selectedPlan)].displayPriceUsd,
        )}
        quantity={
          SPARK_PLUS_PRICING[selectedPlan].perMonth !== '—'
            ? formatSparkPlusPerMonth(locale, SPARK_PLUS_PRICING[selectedPlan].perMonth)
            : undefined
        }
        icon="diamond"
        confirmLoading={purchasing}
        errorMessage={purchaseError}
        onClose={() => {
          if (!purchasing) {
            setShowConfirm(false);
            setPurchaseError(null);
            setVerificationCode('');
          }
        }}
        requireVerificationCode={paymentVerificationRequired && mfaEnabled}
        verificationCode={verificationCode}
        onVerificationCodeChange={setVerificationCode}
        onConfirm={handleSubscribe}
        onOpenSubscriptionTerms={() => navigation.navigate('LegalDocument', { documentId: 'subscription' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  hero: {
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
  },
  heroTopRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    padding: spacing.sm,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.sm,
    opacity: 0.9,
  },
  activeBadge: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
    opacity: 0.95,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  planBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  planPriceCol: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  planPerMonth: {
    fontSize: 12,
  },
  subscribeButton: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  legal: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 16,
  },
  legalLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
