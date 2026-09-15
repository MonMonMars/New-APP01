export type WeatherIcon = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rain' | 'storm' | 'wind';

export type WeatherDay = {
  id: string;
  label: string;
  highC: number;
  lowC: number;
  icon: WeatherIcon;
};

export type WeatherSnapshot = {
  city: string;
  region: string;
  tempC: number;
  feelsLikeC: number;
  condition: string;
  icon: WeatherIcon;
  humidityPct: number;
  windKph: number;
  uvIndex: number;
  highC: number;
  lowC: number;
  updatedLabel: string;
  forecast: WeatherDay[];
};

export const defaultWeatherSnapshot: WeatherSnapshot = {
  city: 'Bristol',
  region: 'South West · UK',
  tempC: 18,
  feelsLikeC: 17,
  condition: 'Partly cloudy',
  icon: 'partly-cloudy',
  humidityPct: 62,
  windKph: 14,
  uvIndex: 4,
  highC: 20,
  lowC: 12,
  updatedLabel: 'Updated just now',
  forecast: [
    { id: 'd0', label: 'Today', highC: 20, lowC: 12, icon: 'partly-cloudy' },
    { id: 'd1', label: 'Wed', highC: 19, lowC: 11, icon: 'cloudy' },
    { id: 'd2', label: 'Thu', highC: 17, lowC: 10, icon: 'rain' },
    { id: 'd3', label: 'Fri', highC: 21, lowC: 13, icon: 'sunny' },
    { id: 'd4', label: 'Sat', highC: 22, lowC: 14, icon: 'sunny' },
    { id: 'd5', label: 'Sun', highC: 20, lowC: 12, icon: 'partly-cloudy' },
  ],
};

/** WMO weather code → icon + label (Open-Meteo). */
export function weatherFromWmoCode(code: number): { icon: WeatherIcon; condition: string } {
  if (code === 0) {
    return { icon: 'sunny', condition: 'Clear sky' };
  }
  if (code <= 3) {
    return { icon: 'partly-cloudy', condition: 'Partly cloudy' };
  }
  if (code <= 48) {
    return { icon: 'cloudy', condition: 'Cloudy' };
  }
  if (code <= 67 || code === 80 || code === 81) {
    return { icon: 'rain', condition: 'Rain showers' };
  }
  if (code <= 99) {
    return { icon: 'storm', condition: 'Thunderstorms' };
  }
  return { icon: 'wind', condition: 'Windy' };
}
