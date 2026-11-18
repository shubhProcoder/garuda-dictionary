import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import {
  ThemeProvider,
  usePreferences,
  useReadingSize,
  useTheme,
} from '../../src/context/ThemeContext';
import * as SettingsStorage from '../../src/storage/settings';
import { darkThemeColors, lightThemeColors } from '../../src/theme/tokens';

jest.mock('../../src/storage/settings');

describe('ThemeContext and Preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SettingsStorage.getAllSettings as jest.Mock).mockResolvedValue({
      themePreference: 'light',
      devanagariReadingSize: 'medium',
    });
    (SettingsStorage.setThemePreference as jest.Mock).mockResolvedValue(undefined);
    (SettingsStorage.setReadingSize as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Theme behavior', () => {
    it('defaults to light theme', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.themePreference).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
      expect(result.current.isDark).toBe(false);
      expect(result.current.colors.canvasPaper).toBe(lightThemeColors.canvasPaper);
      expect(result.current.colors.primaryText).toBe(lightThemeColors.primaryText);
    });

    it('updates to dark theme when setThemePreference is called', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      await act(async () => {
        await result.current.setThemePreference('dark');
      });

      expect(result.current.themePreference).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors.canvasPaper).toBe(darkThemeColors.canvasPaper);
      expect(result.current.colors.primaryText).toBe(darkThemeColors.primaryText);
      expect(SettingsStorage.setThemePreference).toHaveBeenCalledWith('dark');
    });

    it('restores light theme when setThemePreference("light") is selected', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <ThemeProvider initialTheme="dark">{children}</ThemeProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.isDark).toBe(true);

      await act(async () => {
        await result.current.setThemePreference('light');
      });

      expect(result.current.themePreference).toBe('light');
      expect(result.current.isDark).toBe(false);
      expect(result.current.colors.canvasPaper).toBe(lightThemeColors.canvasPaper);
    });

    it('follows system scheme when themePreference is system', async () => {
      // Mock device dark mode
      (useColorScheme as jest.Mock).mockReturnValue('dark');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <ThemeProvider initialTheme="system">{children}</ThemeProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.themePreference).toBe('system');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors.canvasPaper).toBe(darkThemeColors.canvasPaper);
    });

    it('falls back to default context values safely when used outside ThemeProvider', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.themePreference).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
      expect(result.current.isDark).toBe(false);
      expect(result.current.colors).toEqual(lightThemeColors);
    });
  });

  describe('Devanagari Reading Size behavior', () => {
    it('defaults to medium (1.00x scale)', async () => {
      const { result } = renderHook(() => useReadingSize(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.readingSize).toBe('medium');
      });

      expect(result.current.readingSize).toBe('medium');
      expect(result.current.devanagariScale).toBe(1.0);
      expect(result.current.getDevanagariFontSize(40)).toBe(40);
      expect(result.current.getDevanagariFontSize(22)).toBe(22);
    });

    it('scales Devanagari sizes for small preference (0.90x)', async () => {
      const { result } = renderHook(() => useReadingSize(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.readingSize).toBe('medium');
      });

      await act(async () => {
        await result.current.setReadingSize('small');
      });

      expect(result.current.readingSize).toBe('small');
      expect(result.current.devanagariScale).toBe(0.9);
      expect(result.current.getDevanagariFontSize(40)).toBe(36); // 40 * 0.9 = 36
      expect(result.current.getDevanagariFontSize(22)).toBe(20); // 22 * 0.9 = 19.8 -> 20
      expect(SettingsStorage.setReadingSize).toHaveBeenCalledWith('small');
    });

    it('scales Devanagari sizes for large preference (1.15x)', async () => {
      const { result } = renderHook(() => useReadingSize(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.readingSize).toBe('medium');
      });

      await act(async () => {
        await result.current.setReadingSize('large');
      });

      expect(result.current.readingSize).toBe('large');
      expect(result.current.devanagariScale).toBe(1.15);
      expect(result.current.getDevanagariFontSize(40)).toBe(46); // 40 * 1.15 = 46
      expect(result.current.getDevanagariFontSize(22)).toBe(25); // 22 * 1.15 = 25.3 -> 25
      expect(SettingsStorage.setReadingSize).toHaveBeenCalledWith('large');
    });

    it('falls back to default reading size values safely when used outside ThemeProvider', () => {
      const { result } = renderHook(() => useReadingSize());

      expect(result.current.readingSize).toBe('medium');
      expect(result.current.devanagariScale).toBe(1.0);
      expect(result.current.getDevanagariFontSize(40)).toBe(40);
    });
  });
});
