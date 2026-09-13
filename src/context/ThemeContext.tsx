import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ColorPalette, darkColors, lightColors } from '../theme';
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
}: {
  children: ReactNode;
  mode?: ThemeMode;
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
      colors: resolvedMode === 'light' ? lightColors : darkColors,
      setMode,
    }),
    [mode, resolvedMode, setMode],
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
