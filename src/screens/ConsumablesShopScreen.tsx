import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  formatProductPrice,
  PRODUCT_CATALOG,
  SHOP_PACK_TO_PRODUCT,
} from '../constants/products';
import { useApp } from '../context/AppContext';
import { getLegalUiStrings } from '../content/legal';
import { useTranslation } from '../i18n';
import { translatePurchaseError } from '../utils/purchaseMessages';
import { RootStackParamList } from '../types/navigation';
import { PurchaseProductId } from '../types/purchases';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { PurchaseConfirmSheet } from '../components/PurchaseConfirmSheet';
import { PurchasesModeNotice } from '../components/PurchasesModeNotice';
import { usePurchaseStepUp } from '../hooks/usePurchaseStepUp';

type ConsumablesShopScreenProps = {
  onClose: () => void;
};

type Pack = {
  id: string;
  productId: PurchaseProductId;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  price: string;
  quantity: string;
};

export function ConsumablesShopScreen({ onClose }: ConsumablesShopScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { purchaseProduct } = useApp();
  const { t, locale } = useTranslation();
  const legalUi = getLegalUiStrings(locale);
  const [pendingPack, setPendingPack] = useState<Pack | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const {
    needsStepUp,
    needsSecondCode,
    verificationCode,
    setVerificationCode,
    verificationCodeConfirm,
    setVerificationCodeConfirm,
    stepUpReady,
    resetStepUp,
  } = usePurchaseStepUp();

  const packs: Pack[] = useMemo(
    () => [
      {
        id: 'boost-3',
        productId: 'boost_3',
        icon: 'flash',
        title: t('shop.boostPack'),
        description: t('shop.boostPackDesc'),
        price: formatProductPrice(PRODUCT_CATALOG.boost_3.displayPriceUsd),
        quantity: t('shop.boostPackQty'),
      },
      {
        id: 'boost-1',
        productId: 'boost_1',
        icon: 'flash',
        title: t('shop.singleBoost'),
        description: t('shop.singleBoostDesc'),
        price: formatProductPrice(PRODUCT_CATALOG.boost_1.displayPriceUsd),
        quantity: t('shop.singleBoostQty'),
      },
      {
        id: 'notes-5',
        productId: 'spark_notes_5',
        icon: 'chatbubble-ellipses',
        title: t('shop.notesPack'),
        description: t('shop.notesPackDesc'),
        price: formatProductPrice(PRODUCT_CATALOG.spark_notes_5.displayPriceUsd),
        quantity: t('shop.notesPackQty'),
      },
      {
        id: 'notes-1',
        productId: 'spark_notes_1',
        icon: 'chatbubble-ellipses',
        title: t('shop.singleNote'),
        description: t('shop.singleNoteDesc'),
        price: formatProductPrice(PRODUCT_CATALOG.spark_notes_1.displayPriceUsd),
        quantity: t('shop.singleNoteQty'),
      },
    ],
    [t],
  );

  const handlePurchase = async (pack: Pack) => {
    setPurchasing(true);
    setPurchaseError(null);
    const productId = SHOP_PACK_TO_PRODUCT[pack.id] ?? pack.productId;
    const result = await purchaseProduct(
      productId,
      verificationCode || undefined,
      undefined,
      verificationCodeConfirm || undefined,
    );
    setPurchasing(false);

    if (!result.ok) {
      if (result.code !== 'cancelled') {
        setPurchaseError(translatePurchaseError(locale, result.code, result.message));
      }
      return;
    }

    setPendingPack(null);
    resetStepUp();
    const grant = result.grant;
    const product = PRODUCT_CATALOG[productId];

    if (product.boostCount) {
      const saved = grant.bonusBoosts ?? 0;

      if (grant.activateBoost && saved > 0) {
        Alert.alert(
          t('payments.boostActivated'),
          t('payments.boostActivatedWithSaved', { count: saved }),
        );
        return;
      }

      if (grant.activateBoost) {
        Alert.alert(t('payments.boostActivated'), t('payments.boostActivated'));
        return;
      }

      Alert.alert(
        t('payments.boostAdded'),
        t('payments.boostAddedBody', { quantity: pack.quantity }),
      );
      return;
    }

    const noteCount = grant.bonusSparkNotes ?? product.sparkNoteCount ?? 1;
    Alert.alert(
      t('payments.notesAdded'),
      noteCount > 1
        ? t('payments.notesAddedBodyMany', { count: noteCount })
        : t('payments.notesAddedBody', { count: noteCount }),
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>{t('shop.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>{t('shop.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('shop.heroSubtitle')}</Text>
        </LinearGradient>

        <PurchasesModeNotice />

        {packs.map((pack) => {
          const packAccent = colors.gradientEnd;
          return (
            <AnimatedPressable
              key={pack.id}
              style={[styles.packCard, { backgroundColor: colors.surface }]}
              onPress={() => {
                setPurchaseError(null);
                setPendingPack(pack);
              }}
            >
              <View style={[styles.packIcon, { backgroundColor: `${packAccent}22` }]}>
                <Ionicons name={pack.icon} size={24} color={packAccent} />
              </View>
              <View style={styles.packInfo}>
                <Text style={[styles.packTitle, { color: colors.text }]}>{pack.title}</Text>
                <Text style={[styles.packDesc, { color: colors.textMuted }]}>{pack.description}</Text>
                <Text style={[styles.packQty, { color: packAccent }]}>{pack.quantity}</Text>
              </View>
              <Text style={[styles.packPrice, { color: colors.text }]}>{pack.price}</Text>
            </AnimatedPressable>
          );
        })}

        <Text style={[styles.legal, { color: colors.textMuted }]}>
          {t('shop.purchaseNote')}{' '}
          <Text
            style={[styles.legalLink, { color: colors.gradientEnd }]}
            onPress={() => navigation.navigate('LegalDocument', { documentId: 'subscription' })}
          >
            {legalUi.subscriptionTermsLink}
          </Text>
        </Text>
      </ScrollView>

      <PurchaseConfirmSheet
        visible={pendingPack !== null}
        title={pendingPack?.title ?? ''}
        description={pendingPack?.description ?? ''}
        price={pendingPack?.price ?? ''}
        quantity={pendingPack?.quantity}
        icon={pendingPack?.icon}
        iconColor={colors.gradientEnd}
        confirmLoading={purchasing}
        errorMessage={purchaseError}
        onClose={() => {
          if (!purchasing) {
            setPendingPack(null);
            setPurchaseError(null);
            resetStepUp();
          }
        }}
        onConfirm={() => {
          if (pendingPack) {
            return handlePurchase(pendingPack);
          }
        }}
        showPurchaseStepUp={needsStepUp}
        needsSecondVerificationCode={needsSecondCode}
        verificationCode={verificationCode}
        onVerificationCodeChange={setVerificationCode}
        verificationCodeConfirm={verificationCodeConfirm}
        onVerificationCodeConfirmChange={setVerificationCodeConfirm}
        confirmDisabled={!stepUpReady}
        onOpenSubscriptionTerms={() => navigation.navigate('LegalDocument', { documentId: 'subscription' })}
      />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    borderRadius: radii.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  packIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packInfo: {
    flex: 1,
  },
  packTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  packDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  packQty: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  packPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  legal: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 16,
  },
  legalLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
