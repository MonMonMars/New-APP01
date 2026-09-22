import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ColorPalette, darkColors, lightColors, paletteForSection } from '../theme';
import { ThemeMode } from '../types/settings';

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedMode: 'dark' | 'light';
  colors: ColorPalette;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  mode: externalMode = 'dark',
  world = 'spark',
  disguise = false,
}: {
  children: ReactNode;
  mode?: ThemeMode;
  world?: 'spark' | 'ember';
  disguise?: boolean;
}) {
  const [mode, setModeState] = useState<ThemeMode>(externalMode);

  useEffect(() => {
    setModeState(externalMode);
  }, [externalMode]);

  const resolvedMode: 'dark' | 'light' = mode === 'system' ? 'dark' : mode;

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      colors: paletteForSection(
        resolvedMode === 'light' ? lightColors : darkColors,
        world,
        disguise,
      ),
      setMode,
    }),
    [disguise, mode, resolvedMode, setMode, world],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      mode: 'dark' as ThemeMode,
      resolvedMode: 'dark' as const,
      colors: darkColors,
      setMode: () => undefined,
    };
  }
  return context;
}
