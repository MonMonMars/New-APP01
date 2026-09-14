import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { SparkPlusComparisonTable } from '../components/SparkPlusComparisonTable';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  SPARK_PLUS_FEATURES,
  SPARK_PLUS_PRICING,
  SparkPlusPlan,
} from '../types/subscription';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type SparkPlusScreenProps = {
  onClose: () => void;
};

export function SparkPlusScreen({ onClose }: SparkPlusScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { activateSparkPlus, restorePurchases } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<SparkPlusPlan>('annual');
  const [restoring, setRestoring] = useState(false);

  const handleSubscribe = () => {
    activateSparkPlus();
    onClose();
  };

  const handleRestore = async () => {
    setRestoring(true);
    const restored = await restorePurchases();
    setRestoring(false);
    if (restored) {
      Alert.alert('Purchases restored', 'Your Spark+ subscription has been restored.');
      onClose();
    } else {
      Alert.alert('No purchases found', 'We could not find any previous Spark+ subscriptions.');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.hero}>
        <View style={styles.heroTopRow}>
          <AnimatedPressable style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.text} />
          </AnimatedPressable>
          <DisguiseModeButton />
        </View>
        <Ionicons name="diamond" size={48} color={colors.text} />
        <Text style={styles.heroTitle}>Spark+</Text>
        <Text style={styles.heroSubtitle}>
          See who likes you. Unlimited likes. Match faster.
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <SparkPlusComparisonTable />

        {SPARK_PLUS_FEATURES.map((feature) => (
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
              <Text style={[styles.featureDescription, { color: colors.textMuted }]}>{feature.description}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.planTitle, { color: colors.text }]}>Choose your plan</Text>
        {(Object.keys(SPARK_PLUS_PRICING) as SparkPlusPlan[]).map((plan) => {
          const pricing = SPARK_PLUS_PRICING[plan];
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
                <Text style={[styles.planLabel, { color: colors.text }]}>{pricing.label}</Text>
                {plan === 'annual' && (
                  <Text style={[styles.planBadge, { color: colors.gradientEnd }]}>Best value</Text>
                )}
              </View>
              <View style={styles.planPriceCol}>
                <Text style={[styles.planPrice, { color: colors.text }]}>{pricing.price}</Text>
                {pricing.perMonth !== '—' && (
                  <Text style={[styles.planPerMonth, { color: colors.textMuted }]}>{pricing.perMonth}</Text>
                )}
              </View>
            </AnimatedPressable>
          );
        })}

        <AnimatedPressable style={[styles.subscribeButton, { backgroundColor: colors.gradientEnd }]} onPress={handleSubscribe}>
          <Text style={[styles.subscribeText, { color: colors.text }]}>
            Continue — {SPARK_PLUS_PRICING[selectedPlan].price}
          </Text>
        </AnimatedPressable>

        <AnimatedPressable style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
          {restoring ? (
            <ActivityIndicator color={colors.textMuted} />
          ) : (
            <Text style={[styles.restoreText, { color: colors.textMuted }]}>Restore purchases</Text>
          )}
        </AnimatedPressable>

        <Text style={[styles.legal, { color: colors.textMuted }]}>
          Recurring billing. Cancel anytime in App Store settings. This is a prototype — no real charge.
        </Text>
      </ScrollView>
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
});
