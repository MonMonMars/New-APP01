import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '../components/AnimatedPressable';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { loadPurchaseHistory } from '../services/purchaseHistory';
import { PurchaseTransaction } from '../types/purchases';
import { getProductLabel } from '../utils/productLabels';
import { radii, spacing } from '../theme';

type PurchaseHistoryScreenProps = {
  onClose: () => void;
};

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function isSubscription(productId: string): boolean {
  return productId.startsWith('spark_plus_');
}

export function PurchaseHistoryScreen({ onClose }: PurchaseHistoryScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const [history, setHistory] = useState<PurchaseTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void loadPurchaseHistory().then((entries) => {
      if (mounted) {
        setHistory(entries);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('payments.historyTitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!loading && history.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('payments.historyEmpty')}</Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>{t('payments.historyEmptyHint')}</Text>
          </View>
        )}

        {history.map((tx) => {
          const subscription = isSubscription(tx.productId);
          return (
            <View key={tx.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
                <Ionicons
                  name={subscription ? 'diamond' : 'bag-handle'}
                  size={20}
                  color={colors.gradientEnd}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.productName, { color: colors.text }]}>
                  {getProductLabel(locale, tx.productId)}
                </Text>
                <Text style={[styles.date, { color: colors.textMuted }]}>
                  {formatDate(tx.purchasedAt, locale)}
                </Text>
                {tx.expiresAt && (
                  <Text style={[styles.expiry, { color: colors.gradientEnd }]}>
                    {t('payments.historyExpires', {
                      date: formatDate(tx.expiresAt, locale),
                    })}
                  </Text>
                )}
              </View>
              <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.badgeText, { color: colors.textMuted }]}>
                    {subscription ? t('payments.historySubscription') : t('payments.historyConsumable')}
                  </Text>
                </View>
                {tx.provider === 'demo' && (
                  <View style={[styles.badge, { backgroundColor: colors.border }]}>
                    <Text style={[styles.badgeText, { color: colors.textMuted }]}>
                      {t('payments.historyDemoBadge')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyCard: {
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    fontSize: 13,
  },
  expiry: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  badges: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  badge: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
