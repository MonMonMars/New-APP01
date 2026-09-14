import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

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
  color: string;
};

const PACKS: Pack[] = [
  {
    id: 'boost-3',
    icon: 'flash',
    title: 'Boost Pack',
    description: 'Be a top profile for 30 minutes each',
    price: '$9.99',
    quantity: '3 Boosts',
    color: '#FFD700',
  },
  {
    id: 'boost-1',
    icon: 'flash',
    title: 'Single Boost',
    description: 'One 30-minute visibility boost',
    price: '$3.99',
    quantity: '1 Boost',
    color: '#FFD700',
  },
  {
    id: 'notes-5',
    icon: 'chatbubble-ellipses',
    title: 'Spark Notes Pack',
    description: 'Send a message before you match',
    price: '$4.99',
    quantity: '5 Notes',
    color: '#FF2D55',
  },
  {
    id: 'notes-1',
    icon: 'chatbubble-ellipses',
    title: 'Single Spark Note',
    description: 'One pre-match message',
    price: '$1.99',
    quantity: '1 Note',
    color: '#FF2D55',
  },
];

export function ConsumablesShopScreen({ onClose }: ConsumablesShopScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { activateBoost, purchaseSparkNotes } = useApp();

  const handlePurchase = (pack: Pack) => {
    if (pack.id.startsWith('boost')) {
      activateBoost();
      Alert.alert('Boost activated!', `You purchased ${pack.quantity}. Boost is now active for 30 minutes.`);
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
        <Text style={[styles.title, { color: colors.text }]}>Shop</Text>
        <DisguiseModeButton />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Power up your dating</Text>
          <Text style={styles.heroSubtitle}>Boost visibility or send Spark Notes</Text>
        </LinearGradient>

        {PACKS.map((pack) => (
          <AnimatedPressable
            key={pack.id}
            style={[styles.packCard, { backgroundColor: colors.surface }]}
            onPress={() => handlePurchase(pack)}
          >
            <View style={[styles.packIcon, { backgroundColor: `${pack.color}22` }]}>
              <Ionicons name={pack.icon} size={24} color={pack.color} />
            </View>
            <View style={styles.packInfo}>
              <Text style={[styles.packTitle, { color: colors.text }]}>{pack.title}</Text>
              <Text style={[styles.packDesc, { color: colors.textMuted }]}>{pack.description}</Text>
              <Text style={[styles.packQty, { color: pack.color }]}>{pack.quantity}</Text>
            </View>
            <Text style={[styles.packPrice, { color: colors.text }]}>{pack.price}</Text>
          </AnimatedPressable>
        ))}

        <Text style={[styles.legal, { color: colors.textMuted }]}>
          Prototype — no real charges. Purchases activate immediately for demo.
        </Text>
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
});
