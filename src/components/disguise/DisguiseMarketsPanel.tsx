import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import {
  marketCryptoForex,
  marketIndexQuotes,
  marketSessionLabel,
  marketStockQuotes,
  marketTopMovers,
  MarketQuote,
} from '../../data/disguiseMarkets';
import { pulseBrand } from '../../theme/pulseBrand';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseMarketsPanelProps = {
  onQuotePress?: (symbol: string) => void;
};

function QuoteRow({ quote, colors, onPress }: { quote: MarketQuote; colors: { text: string; textMuted: string }; onPress?: () => void }) {
  const changeColor = quote.up ? '#22c55e' : '#ef4444';

  return (
    <AnimatedPressable style={styles.quoteRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.quoteLeft}>
        <Text style={[styles.symbol, { color: colors.text }]}>{quote.symbol}</Text>
        <Text style={[styles.name, { color: colors.textMuted }]} numberOfLines={1}>{quote.name}</Text>
      </View>
      <View style={styles.quoteRight}>
        <Text style={[styles.price, { color: colors.text }]}>{quote.price}</Text>
        <Text style={[styles.change, { color: changeColor }]}>
          {quote.change} ({quote.changePct})
        </Text>
      </View>
      <Ionicons name={quote.up ? 'caret-up' : 'caret-down'} size={14} color={changeColor} />
    </AnimatedPressable>
  );
}

export function DisguiseMarketsPanel({ onQuotePress }: DisguiseMarketsPanelProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.sessionBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="newspaper-outline" size={14} color={pulseBrand.accent} />
        <Text style={[styles.sessionText, { color: colors.textMuted }]}>{marketSessionLabel}</Text>
      </View>

      <Text style={[styles.subheading, { color: colors.textMuted }]}>Indices</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.indexRow}>
        {marketIndexQuotes.map((quote) => (
          <AnimatedPressable
            key={quote.id}
            style={[styles.indexCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onQuotePress?.(quote.symbol)}
          >
            <Text style={[styles.indexSymbol, { color: colors.textMuted }]}>{quote.symbol}</Text>
            <Text style={[styles.indexPrice, { color: colors.text }]}>{quote.price}</Text>
            <Text style={[styles.indexChange, { color: quote.up ? '#22c55e' : '#ef4444' }]}>
              {quote.changePct}
            </Text>
          </AnimatedPressable>
        ))}
      </ScrollView>

      <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.tableTitle, { color: colors.text }]}>Stocks</Text>
        {marketStockQuotes.map((quote) => (
          <QuoteRow
            key={quote.id}
            quote={quote}
            colors={colors}
            onPress={() => onQuotePress?.(quote.symbol)}
          />
        ))}
      </View>

      <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.tableTitle, { color: colors.text }]}>Crypto & FX</Text>
        {marketCryptoForex.map((quote) => (
          <QuoteRow
            key={quote.id}
            quote={quote}
            colors={colors}
            onPress={() => onQuotePress?.(quote.symbol)}
          />
        ))}
      </View>

      <Text style={[styles.subheading, { color: colors.textMuted }]}>Top movers</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moverRow}>
        {marketTopMovers.map((mover) => (
          <AnimatedPressable
            key={mover.id}
            style={[styles.moverCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onQuotePress?.(mover.symbol)}
          >
            <Text style={[styles.moverSymbol, { color: colors.text }]}>{mover.symbol}</Text>
            <Text style={[styles.moverPrice, { color: colors.text }]}>{mover.price}</Text>
            <Text style={[styles.moverChange, { color: mover.up ? '#22c55e' : '#ef4444' }]}>
              {mover.changePct}
            </Text>
            <Text style={[styles.moverVol, { color: colors.textMuted }]}>{mover.volumeLabel}</Text>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  sessionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  sessionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subheading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  indexRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  indexCard: {
    width: 118,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
  },
  indexSymbol: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  indexPrice: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  indexChange: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  tableCard: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.18)',
  },
  quoteLeft: {
    flex: 1,
    minWidth: 0,
  },
  symbol: {
    fontSize: 14,
    fontWeight: '800',
  },
  name: {
    fontSize: 11,
    marginTop: 1,
  },
  quoteRight: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
  },
  change: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  moverRow: {
    gap: spacing.sm,
  },
  moverCard: {
    width: 132,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
  },
  moverSymbol: {
    fontSize: 14,
    fontWeight: '800',
  },
  moverPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  moverChange: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  moverVol: {
    fontSize: 10,
    marginTop: 4,
  },
});
