import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { useApp } from '../context/AppContext';
import { getLegalUiStrings } from '../content/legal';
import { useTranslation } from '../i18n';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { PurchaseConfirmSheet } from '../components/PurchaseConfirmSheet';

type ConsumablesShopScreenProps = {
  onClose: () => void;
};

type Pack = {
  id: string;
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
  const { activateBoost, addBonusBoosts, purchaseSparkNotes } = useApp();
  const { t, locale } = useTranslation();
  const legalUi = getLegalUiStrings(locale);
  const [pendingPack, setPendingPack] = useState<Pack | null>(null);

  const packs: Pack[] = useMemo(
    () => [
      {
        id: 'boost-3',
        icon: 'flash',
        title: t('shop.boostPack'),
        description: t('shop.boostPackDesc'),
        price: '$9.99',
        quantity: t('shop.boostPackQty'),
      },
      {
        id: 'boost-1',
        icon: 'flash',
        title: t('shop.singleBoost'),
        description: t('shop.singleBoostDesc'),
        price: '$3.99',
        quantity: t('shop.singleBoostQty'),
      },
      {
        id: 'notes-5',
        icon: 'chatbubble-ellipses',
        title: t('shop.notesPack'),
        description: t('shop.notesPackDesc'),
        price: '$4.99',
        quantity: t('shop.notesPackQty'),
      },
      {
        id: 'notes-1',
        icon: 'chatbubble-ellipses',
        title: t('shop.singleNote'),
        description: t('shop.singleNoteDesc'),
        price: '$1.99',
        quantity: t('shop.singleNoteQty'),
      },
    ],
    [t],
  );

  const handlePurchase = (pack: Pack) => {
    if (pack.id.startsWith('boost')) {
      const totalBoosts = pack.id === 'boost-3' ? 3 : 1;
      const result = activateBoost({ purchased: true });
      if (!result.ok) {
        addBonusBoosts(totalBoosts);
        Alert.alert('Boost added!', `${pack.quantity} saved to your account. Activate from Profile when ready.`);
        return;
      }
      const saved = totalBoosts - 1;
      if (saved > 0) {
        addBonusBoosts(saved);
      }
      Alert.alert(
        'Boost activated!',
        saved > 0
          ? `Boost is live for 30 minutes. ${saved} more saved for later.`
          : `You purchased ${pack.quantity}. Boost is now active for 30 minutes.`,
      );
    } else {
      const count = pack.id === 'notes-5' ? 5 : 1;
      purchaseSparkNotes(count);
      Alert.alert('Spark Notes added!', `${count} Spark Note${count > 1 ? 's' : ''} added to your account.`);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>{t('shop.title')}</Text>
        <DisguiseModeButton />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>{t('shop.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('shop.heroSubtitle')}</Text>
        </LinearGradient>

        {packs.map((pack) => {
          const packAccent = colors.gradientEnd;
          return (
          <AnimatedPressable
            key={pack.id}
            style={[styles.packCard, { backgroundColor: colors.surface }]}
            onPress={() => setPendingPack(pack)}
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
        onClose={() => setPendingPack(null)}
        onConfirm={() => {
          if (pendingPack) {
            handlePurchase(pendingPack);
          }
        }}
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
