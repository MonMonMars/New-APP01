import { Platform } from 'react-native';

import { mapCenterForCity } from '../utils/searchMapTiles';
import type { GeoPoint } from '../utils/geoMap';

export type UserLocationResult = {
  coords: GeoPoint;
  source: 'device' | 'passport' | 'default';
};

/** Best-effort device location; falls back to passport city or NYC. */
export async function resolveUserLocation(passportCity?: string | null): Promise<UserLocationResult> {
  const fallback = mapCenterForCity(passportCity);
  try {
    const Location = await import('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return passportCity
        ? { coords: fallback, source: 'passport' }
        : { coords: fallback, source: 'default' };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Platform.OS === 'web' ? Location.Accuracy.Balanced : Location.Accuracy.High,
    });

    return {
      coords: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      source: 'device',
    };
  } catch {
    return passportCity
      ? { coords: fallback, source: 'passport' }
      : { coords: fallback, source: 'default' };
  }
}
