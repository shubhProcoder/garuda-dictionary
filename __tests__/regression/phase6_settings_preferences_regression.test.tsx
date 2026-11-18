import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { useColorScheme } from 'react-native';
import HistoryScreen from '../../src/app/(tabs)/history';
import LexiconScreen from '../../src/app/(tabs)/lexicon';
import SavedScreen from '../../src/app/(tabs)/saved';
import SearchScreen from '../../src/app/(tabs)/index';
import SettingsScreen, { getAppVersion } from '../../src/app/settings';
import RootLayout from '../../src/app/_layout';
import { EntryCard } from '../../src/components/EntryCard';
import { ThemeProvider, usePreferences, useReadingSize, useTheme } from '../../src/context/ThemeContext';
import {
  isOnboardingCompleted,
  setOnboardingCompleted,
} from '../../src/storage/onboarding';
import {
  getAllSettings,
  getDevanagariReadingSize,
  getThemePreference,
  resetSettings,
  setDevanagariReadingSize,
  setThemePreference,
} from '../../src/storage/settings';
import { darkThemeColors, DEVANAGARI_SCALES, lightThemeColors, scaleDevanagari, typography } from '../../src/theme/tokens';
import { DictionaryEntry } from '../../src/types/dictionary';

jest.mock('expo-router', () => {
  const React = require('react');
  const MockStack: any = ({ children }: any) => React.createElement(React.Fragment, null, children);
  MockStack.Screen = () => null;
  return {
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn().mockReturnValue({}),
    Stack: MockStack,
  };
});

const sampleEntry: DictionaryEntry = {
  id: 1,
  headword: 'धर्म',
  transliteration: 'dharma',
  romanised: ['dharma', 'dharm'],
  pos: 'noun (masculine)',
  meanings: ['righteousness', 'moral duty'],
  example: 'सत्य और धर्म का मार्ग कठिन है। (The path of truth and righteousness is difficult.)',
};

describe('Phase 6 — Settings, Theme System and Reading Preferences Regression Suite', () => {
  const mockBack = jest.fn();
  const mockPush = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    (useColorScheme as jest.Mock).mockReturnValue('light');
    await AsyncStorage.clear();
    await resetSettings();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      push: mockPush,
    });
  });

  describe('1. Global Theme System & Tokens', () => {
    it('matches the exact approved Garuda Light Palette tokens', () => {
      expect(lightThemeColors.canvasPaper).toBe('#FAF7F2');
      expect(lightThemeColors.elevatedSurface).toBe('#FFFFFF');
      expect(lightThemeColors.primaryCobalt).toBe('#2B4AE8');
      expect(lightThemeColors.phoneticViolet).toBe('#7B3FE4');
      expect(lightThemeColors.semanticEmerald).toBe('#059669');
      expect(lightThemeColors.warningAmber).toBe('#D97706');
      expect(lightThemeColors.primaryText).toBe('#111827');
      expect(lightThemeColors.limeHighlight).toBe('#C8F36B');
    });

    it('maintains deep reading surfaces with WCAG AA/AAA contrast in dark theme', () => {
      expect(darkThemeColors.canvasPaper).toBe('#121316');
      expect(darkThemeColors.elevatedSurface).toBe('#1C1D22');
      expect(darkThemeColors.primaryCobalt).toBe('#5B7BFA');
      expect(darkThemeColors.phoneticViolet).toBe('#A78BFA');
      expect(darkThemeColors.primaryText).toBe('#F3F4F6');
    });

    it('initializes ThemeProvider without flashing when cached settings exist', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <ThemeProvider initialTheme="dark" initialReadingSize="large">
            {children}
          </ThemeProvider>
        ),
      });

      expect(result.current.themePreference).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(result.current.isReady).toBe(true);
      expect(result.current.colors.canvasPaper).toBe(darkThemeColors.canvasPaper);
    });

    it('provides light theme colors by default with correct semantic values', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.themePreference).toBe('light');
      });

      expect(result.current.isDark).toBe(false);
      expect(result.current.colors.canvasPaper).toBe(lightThemeColors.canvasPaper);
      expect(result.current.colors.primaryText).toBe(lightThemeColors.primaryText);
      expect(result.current.colors.primaryCobalt).toBe(lightThemeColors.primaryCobalt);
    });

    it('updates to dark theme when setThemePreference("dark") is called', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await act(async () => {
        await result.current.setThemePreference('dark');
      });

      expect(result.current.themePreference).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors.canvasPaper).toBe(darkThemeColors.canvasPaper);
      expect(result.current.colors.primaryText).toBe(darkThemeColors.primaryText);
      expect(result.current.colors.elevatedSurface).toBe(darkThemeColors.elevatedSurface);
    });

    it('follows system appearance when themePreference is "system"', async () => {
      (useColorScheme as jest.Mock).mockReturnValue('dark');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await act(async () => {
        await result.current.setThemePreference('system');
      });

      expect(result.current.themePreference).toBe('system');
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors.canvasPaper).toBe(darkThemeColors.canvasPaper);
    });

    it('persists theme preference to AsyncStorage and reloads on fresh mount', async () => {
      await setThemePreference('dark');
      const saved = await getThemePreference();
      expect(saved).toBe('dark');

      // Fresh hook mount should read 'dark' from storage
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.themePreference).toBe('dark');
        expect(result.current.isDark).toBe(true);
      });
    });

    it('updates appearance when OS changes from light to dark while stored preference remains "system"', async () => {
      await setThemePreference('system');
      expect(await getThemePreference()).toBe('system');

      // Start in light mode
      (useColorScheme as jest.Mock).mockReturnValue('light');

      const { result, rerender } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.themePreference).toBe('system');
      });
      expect(result.current.isDark).toBe(false);

      // Device changes to dark mode
      (useColorScheme as jest.Mock).mockReturnValue('dark');
      rerender({});

      expect(result.current.themePreference).toBe('system');
      expect(result.current.isDark).toBe(true);

      // Stored preference in AsyncStorage remains 'system'
      const stored = await getThemePreference();
      expect(stored).toBe('system');
    });

    it('eventually hides native splash screen when RootLayout is rendered and theme is ready', async () => {
      render(<RootLayout />);

      await waitFor(() => {
        expect(SplashScreen.hideAsync).toHaveBeenCalled();
      });
    });

    it('handles delayed AsyncStorage hydration on cold start without flashing Light when Dark is persisted', async () => {
      // Simulate cold start with empty memory cache but persisted Dark preference
      await resetSettings();
      await AsyncStorage.setItem('@garuda:settings:theme:v1', 'dark');

      let resolveGetItem: ((val: string | null) => void) | null = null;
      const delayedGetItemPromise = new Promise<string | null>((resolve) => {
        resolveGetItem = resolve;
      });

      const originalImpl = (AsyncStorage.getItem as jest.Mock).getMockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string, callback?: any) => {
        if (key === '@garuda:settings:theme:v1') {
          return delayedGetItemPromise;
        }
        return originalImpl ? originalImpl(key, callback) : (AsyncStorage as any).__INTERNAL_MOCK_STORAGE__[key] ?? null;
      });

      try {
        // Render RootLayout while AsyncStorage is still pending (delayed beyond 1500ms)
        const root = render(<RootLayout />);

        // While isReady is false, RootNavigation returns null to prevent premature Light theme flash
        expect(root.toJSON()).toBeNull();

        // Resolve delayed AsyncStorage with 'dark'
        await act(async () => {
          if (resolveGetItem) (resolveGetItem as any)('dark');
        });

        // Upon resolving, RootLayout renders and hides native splash
        await waitFor(() => {
          expect(SplashScreen.hideAsync).toHaveBeenCalled();
        });
      } finally {
        (AsyncStorage.getItem as jest.Mock).mockImplementation(originalImpl);
      }
    });

    it('renders Light theme upon cold start when Light preference is persisted', async () => {
      await resetSettings();
      await AsyncStorage.setItem('@garuda:settings:theme:v1', 'light');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.themePreference).toBe('light');
      expect(result.current.isDark).toBe(false);
      expect(result.current.colors.canvasPaper).toBe(lightThemeColors.canvasPaper);
    });

    it('resolves device appearance on cold start when System preference is persisted', async () => {
      await resetSettings();
      await AsyncStorage.setItem('@garuda:settings:theme:v1', 'system');
      (useColorScheme as jest.Mock).mockReturnValue('dark');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
        expect(result.current.themePreference).toBe('system');
      });

      expect(result.current.isDark).toBe(true);
      expect(result.current.colors.canvasPaper).toBe(darkThemeColors.canvasPaper);
    });

    it('ensures splash eventually hides and application recovers on AsyncStorage failure', async () => {
      await resetSettings();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage failure'));

      render(<RootLayout />);

      await waitFor(() => {
        expect(SplashScreen.hideAsync).toHaveBeenCalled();
      });
    });
  });

  describe('2. Devanagari Reading Size Preference & Headword Scaling', () => {
    it('defaults to medium (1.00x) reading size and scale factor', async () => {
      const { result } = renderHook(() => useReadingSize(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.devanagariReadingSize).toBe('medium');
      });

      expect(result.current.devanagariScale).toBe(1.0);
    });

    it('scales small (0.90x), medium (1.00x), and large (1.15x) accurately with scaleDevanagari()', () => {
      expect(DEVANAGARI_SCALES.small).toBe(0.9);
      expect(DEVANAGARI_SCALES.medium).toBe(1.0);
      expect(DEVANAGARI_SCALES.large).toBe(1.15);

      const baseDisplay = typography.fontSize.display; // 32
      expect(scaleDevanagari(baseDisplay, 'small')).toBe(Math.round(32 * 0.9)); // 29
      expect(scaleDevanagari(baseDisplay, 'medium')).toBe(32);
      expect(scaleDevanagari(baseDisplay, 'large')).toBe(Math.round(32 * 1.15)); // 37

      // Numeric scale factor variant
      expect(scaleDevanagari(baseDisplay, 0.9)).toBe(29);
      expect(scaleDevanagari(baseDisplay, 1.15)).toBe(37);
    });

    it('applies scaled Devanagari font size to EntryCard headword while keeping transliteration constant', async () => {
      const { getByText } = render(
        <ThemeProvider initialReadingSize="large">
          <EntryCard entry={sampleEntry} onPress={jest.fn()} />
        </ThemeProvider>
      );

      await waitFor(() => {
        const headwordElement = getByText('धर्म');
        expect(headwordElement).toBeTruthy();
        const styles = headwordElement.props.style;
        const flattened = Array.isArray(styles) ? Object.assign({}, ...styles) : styles;
        // base heading is 22, 22 * 1.15 = 25.3 -> 25
        expect(flattened.fontSize).toBe(Math.round(typography.fontSize.heading * 1.15));
      });

      // Transliteration should NOT scale with Devanagari scale
      const transElement = getByText('dharma');
      const transStyles = Array.isArray(transElement.props.style)
        ? Object.assign({}, ...transElement.props.style)
        : transElement.props.style;
      expect(transStyles.fontSize).toBe(typography.fontSize.caption); // 12
    });

    it('persists reading size preference to AsyncStorage and reloads on fresh mount', async () => {
      await setDevanagariReadingSize('large');
      const saved = await getDevanagariReadingSize();
      expect(saved).toBe('large');

      const { result } = renderHook(() => useReadingSize(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.devanagariReadingSize).toBe('large');
        expect(result.current.devanagariScale).toBe(1.15);
      });
    });
  });

  describe('3. Settings Preference Screen Integration', () => {
    it('renders all sections: Appearance, Reading Size, Dictionary, and About', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <SettingsScreen />
        </ThemeProvider>
      );

      // Section titles
      expect(getByText('APPEARANCE')).toBeTruthy();
      expect(getByText('DEVANAGARI READING SIZE')).toBeTruthy();
      expect(getByText('DICTIONARY DATASET')).toBeTruthy();
      expect(getByText('ABOUT')).toBeTruthy();

      // Theme options
      expect(getByText('Light')).toBeTruthy();
      expect(getByText('Dark')).toBeTruthy();
      expect(getByText('System')).toBeTruthy();

      // Reading size options
      expect(getByText('Small')).toBeTruthy();
      expect(getByText('Medium')).toBeTruthy();
      expect(getByText('Large')).toBeTruthy();

      // Devanagari preview headword
      expect(getByText(/धर्म · ज्ञान · प्रकाश/)).toBeTruthy();

      // Dictionary count (70 entries verified)
      expect(getByText(/70 WORDS/)).toBeTruthy();
      expect(getByText('Verified Entries')).toBeTruthy();

      // About application version display
      expect(getByText(getAppVersion())).toBeTruthy();
    });

    it('resolves the actual application version dynamically and defaults to neutral fallback when metadata is absent', () => {
      // 1. When runtime metadata is absent, neutral fallback is returned (never fake '1.0.0')
      expect(getAppVersion({} as any)).toBe('Version unavailable');

      // 2. Default invocation with bare Constants fallback in test environment
      expect(getAppVersion()).toBe('Version unavailable');

      // 3. Dynamically reflects Constants.expoConfig.version
      expect(getAppVersion({ expoConfig: { version: '2.5.1' } } as any)).toBe('2.5.1');

      // 4. Dynamically reflects Constants.manifest2.extra.expoClient.version
      expect(
        getAppVersion({
          manifest2: { extra: { expoClient: { version: '3.0.0-beta.1' } } },
        } as any)
      ).toBe('3.0.0-beta.1');

      // 5. Dynamically reflects manifest.version
      expect(getAppVersion({ manifest: { version: '1.8.2' } } as any)).toBe('1.8.2');

      // 6. Dynamically reflects nativeAppVersion
      expect(getAppVersion({ nativeAppVersion: '1.0.4' } as any)).toBe('1.0.4');
    });

    it('allows changing theme preference from Settings UI', async () => {
      const { getByText, getByLabelText } = render(
        <ThemeProvider>
          <SettingsScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByText('APPEARANCE')).toBeTruthy();
      });

      const darkOption = getByLabelText(/Dark theme/);
      expect(darkOption).toBeTruthy();

      await act(async () => {
        fireEvent.press(darkOption);
      });

      await waitFor(async () => {
        const savedTheme = await getThemePreference();
        expect(savedTheme).toBe('dark');
      });
    });

    it('allows changing reading size preference from Settings UI', async () => {
      const { getByText, getByLabelText } = render(
        <ThemeProvider>
          <SettingsScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByText('DEVANAGARI READING SIZE')).toBeTruthy();
      });

      const largeOption = getByLabelText(/Large Devanagari reading size/);
      expect(largeOption).toBeTruthy();

      await act(async () => {
        fireEvent.press(largeOption);
      });

      await waitFor(async () => {
        const savedSize = await getDevanagariReadingSize();
        expect(savedSize).toBe('large');
      });
    });

    it('navigates back when back button is pressed', () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <SettingsScreen />
        </ThemeProvider>
      );

      const backButton = getByLabelText('Go back');
      fireEvent.press(backButton);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. Full App Screen Theming Integration', () => {
    it('renders SearchScreen, LexiconScreen, SavedScreen, and HistoryScreen cleanly inside ThemeProvider', async () => {
      // Search Screen
      const searchRes = render(
        <ThemeProvider>
          <SearchScreen />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(searchRes.getByText('GARUDA')).toBeTruthy();
      });

      // Lexicon Screen
      const lexiconRes = render(
        <ThemeProvider>
          <LexiconScreen />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(lexiconRes.getByText('THE COLLECTION')).toBeTruthy();
      });

      // Saved Screen
      const savedRes = render(
        <ThemeProvider>
          <SavedScreen />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(savedRes.getByText('YOUR COLLECTION')).toBeTruthy();
      });

      // History Screen
      const historyRes = render(
        <ThemeProvider>
          <HistoryScreen />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(historyRes.getByText('SEARCH LOG')).toBeTruthy();
      });
    });
  });

  describe('5. Resilience and Edge Cases', () => {
    it('falls back to default settings when AsyncStorage contains corrupt data', async () => {
      await AsyncStorage.setItem('@garuda:settings:theme:v1', 'invalid_theme');
      await AsyncStorage.setItem('@garuda:settings:devanagari-size:v1', 'giant_size');

      const all = await getAllSettings();
      expect(all.themePreference).toBe('light');
      expect(all.devanagariReadingSize).toBe('medium');
    });

    it('usePreferences provides all settings properties in a single consolidated hook', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.themePreference).toBe('light');
        expect(result.current.devanagariReadingSize).toBe('medium');
      });

      expect(typeof result.current.setThemePreference).toBe('function');
      expect(typeof result.current.setDevanagariReadingSize).toBe('function');
      expect(result.current.isDark).toBe(false);
      expect(result.current.devanagariScale).toBe(1.0);
    });

    it('preserves first-launch onboarding status independently of theme preferences', async () => {
      expect(await isOnboardingCompleted()).toBe(false);
      await setOnboardingCompleted();
      expect(await isOnboardingCompleted()).toBe(true);

      // Changing theme does not reset onboarding status
      await setThemePreference('dark');
      expect(await isOnboardingCompleted()).toBe(true);
    });
  });
});
