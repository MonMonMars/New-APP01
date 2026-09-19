import { useEffect, useMemo, useState } from 'react';

import {
  defaultWeatherSnapshot,
  WeatherDay,
  WeatherSnapshot,
  weatherFromWmoCode,
} from '../data/disguiseWeather';
import { getWeatherDayLabel, localizeWeatherSnapshot } from '../i18n/labels';
import { AppLocale, resolveAppLocale } from '../types/locale';
import { getPassportCoordinates } from '../utils/passportFilter';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
};

function buildForecast(response: OpenMeteoResponse, locale: AppLocale): WeatherDay[] {
  const times = response.daily?.time ?? [];
  const highs = response.daily?.temperature_2m_max ?? [];
  const lows = response.daily?.temperature_2m_min ?? [];
  const codes = response.daily?.weather_code ?? [];

  return times.slice(0, 6).map((isoDate, index) => {
    const date = new Date(isoDate);
    const rawLabel = index === 0 ? 'Today' : DAY_LABELS[date.getDay()] ?? 'Day';
    const mapped = weatherFromWmoCode(codes[index] ?? 1);

    return {
      id: `forecast-${index}`,
      label: getWeatherDayLabel(locale, rawLabel),
      highC: Math.round(highs[index] ?? 0),
      lowC: Math.round(lows[index] ?? 0),
      icon: mapped.icon,
    };
  });
}

async function fetchLiveWeather(
  passportCity: string | undefined,
  locale: AppLocale,
): Promise<WeatherSnapshot | null> {
  const { lat, lon, region } = getPassportCoordinates(passportCity);
  const cityLabel = passportCity?.split(',')[0] ?? 'New York';

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m' +
    '&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=6';

  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const currentCode = data.current?.weather_code ?? 1;
  const mapped = weatherFromWmoCode(currentCode);
  const forecast = buildForecast(data, locale);
  const todayHigh = forecast[0]?.highC ?? defaultWeatherSnapshot.highC;
  const todayLow = forecast[0]?.lowC ?? defaultWeatherSnapshot.lowC;

  const snapshot: WeatherSnapshot = {
    city: cityLabel,
    region,
    tempC: Math.round(data.current?.temperature_2m ?? defaultWeatherSnapshot.tempC),
    feelsLikeC: Math.round(data.current?.apparent_temperature ?? defaultWeatherSnapshot.feelsLikeC),
    condition: mapped.condition,
    icon: mapped.icon,
    humidityPct: Math.round(data.current?.relative_humidity_2m ?? defaultWeatherSnapshot.humidityPct),
    windKph: Math.round(data.current?.wind_speed_10m ?? defaultWeatherSnapshot.windKph),
    uvIndex: defaultWeatherSnapshot.uvIndex,
    highC: todayHigh,
    lowC: todayLow,
    updatedLabel: 'Live · Open-Meteo',
    forecast: forecast.length > 0 ? forecast : defaultWeatherSnapshot.forecast,
  };

  return localizeWeatherSnapshot(locale, snapshot, passportCity);
}

export function useDisguiseWeather(passportCity?: string, locale?: AppLocale | null) {
  const resolvedLocale = resolveAppLocale(locale);
  const [weather, setWeather] = useState<WeatherSnapshot>(() =>
    localizeWeatherSnapshot(resolvedLocale, defaultWeatherSnapshot, passportCity),
  );
  const [isLive, setIsLive] = useState(false);

  const localizedFallback = useMemo(
    () => localizeWeatherSnapshot(resolvedLocale, defaultWeatherSnapshot, passportCity),
    [resolvedLocale, passportCity],
  );

  useEffect(() => {
    setWeather(localizedFallback);
    setIsLive(false);
  }, [localizedFallback]);

  useEffect(() => {
    let cancelled = false;

    void fetchLiveWeather(passportCity, resolvedLocale)
      .then((snapshot) => {
        if (!cancelled && snapshot) {
          setWeather(snapshot);
          setIsLive(true);
        }
      })
      .catch(() => {
        // Keep seeded fallback data.
      });

    return () => {
      cancelled = true;
    };
  }, [passportCity, resolvedLocale]);

  return { weather, isLive };
}
