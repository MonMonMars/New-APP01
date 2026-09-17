import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { WeatherIcon, WeatherSnapshot } from '../../data/disguiseWeather';
import { radii, spacing } from '../../theme';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseWeatherPanelProps = {
  weather: WeatherSnapshot;
  isLive?: boolean;
  onPress?: () => void;
};

function weatherIconName(icon: WeatherIcon): keyof typeof Ionicons.glyphMap {
  switch (icon) {
    case 'sunny':
      return 'sunny-outline';
    case 'partly-cloudy':
      return 'partly-sunny-outline';
    case 'cloudy':
      return 'cloud-outline';
    case 'rain':
      return 'rainy-outline';
    case 'storm':
      return 'thunderstorm-outline';
    case 'wind':
      return 'flag-outline';
    default: {
      const _exhaustive: never = icon;
      return _exhaustive;
    }
  }
}

export function DisguiseWeatherPanel({ weather, isLive = false, onPress }: DisguiseWeatherPanelProps) {
  const { colors } = useTheme();
  const { preferences } = useApp();
  const accent = disguiseWorldMeta(preferences.sparkSection).accent;

  return (
    <AnimatedPressable
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Weather in ${weather.city}`}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.city, { color: colors.text }]}>{weather.city}</Text>
          <Text style={[styles.region, { color: colors.textMuted }]}>{weather.region}</Text>
        </View>
        <View style={styles.livePill}>
          {isLive ? <View style={styles.liveDot} /> : null}
          <Text style={styles.liveText}>{isLive ? 'Live' : 'Forecast'}</Text>
        </View>
      </View>

      <View style={styles.currentRow}>
        <Ionicons name={weatherIconName(weather.icon)} size={42} color={accent} />
        <View style={styles.tempBlock}>
          <Text style={[styles.temp, { color: colors.text }]}>{weather.tempC}°</Text>
          <Text style={[styles.condition, { color: colors.textMuted }]}>{weather.condition}</Text>
        </View>
        <View style={styles.highLow}>
          <Text style={[styles.highLowText, { color: colors.text }]}>
            H {weather.highC}° · L {weather.lowC}°
          </Text>
          <Text style={[styles.feelsLike, { color: colors.textMuted }]}>
            Feels {weather.feelsLikeC}°
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat icon="water-outline" label="Humidity" value={`${weather.humidityPct}%`} color={accent} />
        <Stat icon="flag-outline" label="Wind" value={`${weather.windKph} km/h`} color={accent} />
        <Stat icon="sunny-outline" label="UV" value={`${weather.uvIndex}`} color={accent} />
      </View>

      <View style={styles.forecastRow}>
        {weather.forecast.map((day) => (
          <View key={day.id} style={styles.forecastCell}>
            <Text style={[styles.forecastLabel, { color: colors.textMuted }]}>{day.label}</Text>
            <Ionicons name={weatherIconName(day.icon)} size={16} color={accent} />
            <Text style={[styles.forecastHigh, { color: colors.text }]}>{day.highC}°</Text>
            <Text style={[styles.forecastLow, { color: colors.textMuted }]}>{day.lowC}°</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.updated, { color: colors.textMuted }]}>{weather.updatedLabel}</Text>
    </AnimatedPressable>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  city: {
    fontSize: 18,
    fontWeight: '800',
  },
  region: {
    fontSize: 12,
    marginTop: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34,197,94,0.14)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.button,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  liveText: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tempBlock: {
    flex: 1,
  },
  temp: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  condition: {
    fontSize: 14,
    fontWeight: '600',
  },
  highLow: {
    alignItems: 'flex-end',
  },
  highLowText: {
    fontSize: 13,
    fontWeight: '700',
  },
  feelsLike: {
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  stat: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  forecastCell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  forecastLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  forecastHigh: {
    fontSize: 12,
    fontWeight: '800',
  },
  forecastLow: {
    fontSize: 10,
    fontWeight: '600',
  },
  updated: {
    fontSize: 10,
    marginTop: spacing.sm,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});
