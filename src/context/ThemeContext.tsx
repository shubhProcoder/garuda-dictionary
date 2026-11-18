import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  DevanagariReadingSize,
  ThemePreference,
  getAllSettings,
  setReadingSize as setReadingSizeStorage,
  setThemePreference as setThemePreferenceStorage,
} from '../storage/settings';
import {
  DEVANAGARI_SCALES,
  ThemeColors,
  darkThemeColors,
  lightThemeColors,
  scaleDevanagari,
} from '../theme/tokens';

export interface ThemeContextValue {
  themePreference: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  readingSize: DevanagariReadingSize;
  devanagariReadingSize: DevanagariReadingSize;
  devanagariScale: number;
  getDevanagariFontSize: (baseSize: number) => number;
  setReadingSize: (size: DevanagariReadingSize) => Promise<void>;
  setDevanagariReadingSize: (size: DevanagariReadingSize) => Promise<void>;
  isReady: boolean;
}

const defaultContextValue: ThemeContextValue = {
  themePreference: 'light',
  resolvedTheme: 'light',
  isDark: false,
  colors: lightThemeColors,
  setThemePreference: async () => {},
  readingSize: 'medium',
  devanagariReadingSize: 'medium',
  devanagariScale: 1.0,
  getDevanagariFontSize: (baseSize: number) => baseSize,
  setReadingSize: async () => {},
  setDevanagariReadingSize: async () => {},
  isReady: true,
};

const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemePreference;
  initialReadingSize?: DevanagariReadingSize;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme,
  initialReadingSize,
}) => {
  const systemColorScheme = useColorScheme();

  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    initialTheme ?? 'light'
  );
  const [readingSize, setReadingSizeState] = useState<DevanagariReadingSize>(
    initialReadingSize ?? 'medium'
  );
  const [isReady, setIsReady] = useState(false);

  const userChangedThemeRef = React.useRef(false);
  const userChangedSizeRef = React.useRef(false);

  // Load persisted preferences on mount
  useEffect(() => {
    let mounted = true;
    getAllSettings()
      .then((settings) => {
        if (mounted) {
          if (!initialTheme && !userChangedThemeRef.current) {
            setThemePreferenceState(settings.themePreference);
          }
          if (!initialReadingSize && !userChangedSizeRef.current) {
            setReadingSizeState(settings.devanagariReadingSize);
          }
          setIsReady(true);
        }
      })
      .catch((err) => {
        console.warn('Failed to load preferences in ThemeProvider:', err);
        if (mounted) {
          setIsReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [initialTheme, initialReadingSize]);

  // Compute resolved theme: 'system' tracks systemColorScheme; 'light'/'dark' are explicit
  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themePreference === 'dark' ? 'dark' : 'light';
  }, [themePreference, systemColorScheme]);

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? darkThemeColors : lightThemeColors;
  const devanagariScale = DEVANAGARI_SCALES[readingSize] ?? 1.0;

  const getDevanagariFontSize = useCallback(
    (baseSize: number) => scaleDevanagari(baseSize, readingSize),
    [readingSize]
  );

  const setThemePreference = useCallback(async (pref: ThemePreference) => {
    userChangedThemeRef.current = true;
    setThemePreferenceState(pref);
    await setThemePreferenceStorage(pref);
  }, []);

  const setReadingSize = useCallback(async (size: DevanagariReadingSize) => {
    userChangedSizeRef.current = true;
    setReadingSizeState(size);
    await setReadingSizeStorage(size);
  }, []);

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      isDark,
      colors,
      setThemePreference,
      readingSize,
      devanagariReadingSize: readingSize,
      devanagariScale,
      getDevanagariFontSize,
      setReadingSize,
      setDevanagariReadingSize: setReadingSize,
      isReady,
    }),
    [
      themePreference,
      resolvedTheme,
      isDark,
      colors,
      setThemePreference,
      readingSize,
      devanagariScale,
      getDevanagariFontSize,
      setReadingSize,
      isReady,
    ]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/**
 * Reusable hook to consume active theme tokens, theme mode, and theme setters.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  return {
    colors: context.colors,
    isDark: context.isDark,
    themePreference: context.themePreference,
    resolvedTheme: context.resolvedTheme,
    setThemePreference: context.setThemePreference,
    isReady: context.isReady,
  };
}

/**
 * Reusable hook to consume Devanagari reading size, scale factor, and reading size setters.
 */
export function useReadingSize() {
  const context = useContext(ThemeContext);
  return {
    readingSize: context.readingSize,
    devanagariReadingSize: context.devanagariReadingSize,
    devanagariScale: context.devanagariScale,
    getDevanagariFontSize: context.getDevanagariFontSize,
    setReadingSize: context.setReadingSize,
    setDevanagariReadingSize: context.setDevanagariReadingSize,
  };
}

/**
 * Reusable hook to consume both theme and reading size preferences.
 */
export function usePreferences() {
  return useContext(ThemeContext);
}
