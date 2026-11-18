import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_READING_SIZE,
  DEFAULT_THEME_PREFERENCE,
  READING_SIZE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  getAllSettings,
  getReadingSize,
  getThemePreference,
  resetSettings,
  sanitizeReadingSize,
  sanitizeThemePreference,
  setReadingSize,
  setThemePreference,
} from '../../src/storage/settings';

describe('Settings Storage Module', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    await resetSettings();
  });

  describe('Default values and sanitization', () => {
    it('returns default light theme on clean launch', async () => {
      const theme = await getThemePreference();
      expect(theme).toBe(DEFAULT_THEME_PREFERENCE);
    });

    it('returns default medium reading size on clean launch', async () => {
      const size = await getReadingSize();
      expect(size).toBe(DEFAULT_READING_SIZE);
    });

    it('sanitizes valid and invalid theme values', () => {
      expect(sanitizeThemePreference('light')).toBe('light');
      expect(sanitizeThemePreference('dark')).toBe('dark');
      expect(sanitizeThemePreference('system')).toBe('system');
      expect(sanitizeThemePreference('neon')).toBe('light');
      expect(sanitizeThemePreference(null)).toBe('light');
      expect(sanitizeThemePreference(123)).toBe('light');
    });

    it('sanitizes valid and invalid reading sizes', () => {
      expect(sanitizeReadingSize('small')).toBe('small');
      expect(sanitizeReadingSize('medium')).toBe('medium');
      expect(sanitizeReadingSize('large')).toBe('large');
      expect(sanitizeReadingSize('extra-large')).toBe('medium');
      expect(sanitizeReadingSize(undefined)).toBe('medium');
    });
  });

  describe('Persistence and updates', () => {
    it('persists and retrieves dark theme preference', async () => {
      await setThemePreference('dark');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');

      const current = await getThemePreference();
      expect(current).toBe('dark');
    });

    it('persists and retrieves system theme preference', async () => {
      await setThemePreference('system');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'system');

      const current = await getThemePreference();
      expect(current).toBe('system');
    });

    it('persists and retrieves small and large reading sizes', async () => {
      await setReadingSize('small');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(READING_SIZE_STORAGE_KEY, 'small');
      expect(await getReadingSize()).toBe('small');

      await setReadingSize('large');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(READING_SIZE_STORAGE_KEY, 'large');
      expect(await getReadingSize()).toBe('large');
    });

    it('retrieves combined settings via getAllSettings', async () => {
      await setThemePreference('dark');
      await setReadingSize('large');

      const settings = await getAllSettings();
      expect(settings).toEqual({
        themePreference: 'dark',
        devanagariReadingSize: 'large',
      });
    });

    it('resets settings to defaults via resetSettings', async () => {
      await setThemePreference('dark');
      await setReadingSize('large');

      await resetSettings();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        THEME_STORAGE_KEY,
        READING_SIZE_STORAGE_KEY,
      ]);

      const settings = await getAllSettings();
      expect(settings.themePreference).toBe('light');
      expect(settings.devanagariReadingSize).toBe('medium');
    });
  });

  describe('Error handling & in-memory fallbacks', () => {
    it('handles AsyncStorage read errors gracefully', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Disk failure'));

      // Should not throw, should return fallback default
      const theme = await getThemePreference();
      expect(theme).toBe('light');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('handles AsyncStorage write errors gracefully without crashing', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Write error'));

      // Should not throw
      await expect(setThemePreference('dark')).resolves.not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
