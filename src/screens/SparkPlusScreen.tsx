import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import {
  SPARK_PLUS_FEATURES,
  SPARK_PLUS_PRICING,
  SparkPlusPlan,
} from '../types/subscription';
import { colors, radii, spacing } from '../theme';

type SparkPlusScreenProps = {
  onClose: () => void;
};

export function SparkPlusScreen({ onClose }: SparkPlusScreenProps) {
  const insets = useSafeAreaInsets();
  const { activateSparkPlus } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<SparkPlusPlan>('annual');

  const handleSubscribe = () => {
    activateSparkPlus();
    onClose();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.hero}>
        <Pressable style={styles.close} onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Ionicons name="diamond" size={48} color={colors.text} />
        <Text style={styles.heroTitle}>Spark+</Text>
        <Text style={styles.heroSubtitle}>
          See who likes you. Unlimited likes. Match faster.
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {SPARK_PLUS_FEATURES.map((feature) => (
          <View key={feature.title} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons
                name={feature.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={colors.gradientEnd}
              />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.planTitle}>Choose your plan</Text>
        {(Object.keys(SPARK_PLUS_PRICING) as SparkPlusPlan[]).map((plan) => {
          const pricing = SPARK_PLUS_PRICING[plan];
          const isSelected = selectedPlan === plan;
          return (
            <Pressable
              key={plan}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View>
                <Text style={styles.planLabel}>{pricing.label}</Text>
                {plan === 'annual' && (
                  <Text style={styles.planBadge}>Best value</Text>
                )}
              </View>
              <View style={styles.planPriceCol}>
                <Text style={styles.planPrice}>{pricing.price}</Text>
                {pricing.perMonth !== '—' && (
                  <Text style={styles.planPerMonth}>{pricing.perMonth}</Text>
                )}
              </View>
            </Pressable>
          );
        })}

        <Pressable style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeText}>
            Continue — {SPARK_PLUS_PRICING[selectedPlan].price}
          </Text>
        </Pressable>
        <Text style={styles.legal}>
          Recurring billing. Cancel anytime in App Store settings. This is a prototype — no real charge.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
  },
  close: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  heroSubtitle: {
    color: colors.text,
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
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  featureDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  planTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: colors.gradientEnd,
  },
  planLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  planBadge: {
    color: colors.gradientEnd,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  planPriceCol: {
    alignItems: 'flex-end',
  },
  planPrice: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  planPerMonth: {
    color: colors.textMuted,
    fontSize: 12,
  },
  subscribeButton: {
    backgroundColor: colors.gradientEnd,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  subscribeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  legal: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 16,
  },
});
