import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEME_STORAGE_KEY = '@garuda:settings:theme:v1';
export const READING_SIZE_STORAGE_KEY = '@garuda:settings:devanagari-size:v1';

export type ThemePreference = 'light' | 'dark' | 'system';
export type DevanagariReadingSize = 'small' | 'medium' | 'large';

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'light';
export const DEFAULT_READING_SIZE: DevanagariReadingSize = 'medium';

export const VALID_THEMES: ThemePreference[] = ['light', 'dark', 'system'];
export const VALID_READING_SIZES: DevanagariReadingSize[] = ['small', 'medium', 'large'];

export interface AppSettings {
  themePreference: ThemePreference;
  devanagariReadingSize: DevanagariReadingSize;
}

// In-memory fallbacks to guarantee the app remains functional even if AsyncStorage fails
let inMemoryTheme: ThemePreference | null = null;
let inMemoryReadingSize: DevanagariReadingSize | null = null;

/**
 * Validates a theme string against the supported preferences.
 * Falls back to DEFAULT_THEME_PREFERENCE ('light') for invalid or corrupted data.
 */
export function sanitizeThemePreference(val: unknown): ThemePreference {
  if (typeof val === 'string' && VALID_THEMES.includes(val as ThemePreference)) {
    return val as ThemePreference;
  }
  return DEFAULT_THEME_PREFERENCE;
}

/**
 * Validates a reading size string against the supported sizes.
 * Falls back to DEFAULT_READING_SIZE ('medium') for invalid or corrupted data.
 */
export function sanitizeReadingSize(val: unknown): DevanagariReadingSize {
  if (typeof val === 'string' && VALID_READING_SIZES.includes(val as DevanagariReadingSize)) {
    return val as DevanagariReadingSize;
  }
  return DEFAULT_READING_SIZE;
}

/**
 * Retrieves the stored theme preference.
 * Defaults to 'light' for new installations.
 */
export async function getThemePreference(): Promise<ThemePreference> {
  if (inMemoryTheme !== null) {
    return inMemoryTheme;
  }

  try {
    const raw = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    const sanitized = sanitizeThemePreference(raw);
    inMemoryTheme = sanitized;
    return sanitized;
  } catch (error) {
    console.warn('Failed to read theme preference from AsyncStorage:', error);
    return inMemoryTheme ?? DEFAULT_THEME_PREFERENCE;
  }
}

/**
 * Persists the user's theme preference.
 */
export async function setThemePreference(theme: ThemePreference): Promise<void> {
  const sanitized = sanitizeThemePreference(theme);
  inMemoryTheme = sanitized;

  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, sanitized);
  } catch (error) {
    console.warn('Failed to persist theme preference to AsyncStorage:', error);
  }
}

/**
 * Retrieves the stored Devanagari reading size.
 * Defaults to 'medium' for new installations.
 */
export async function getReadingSize(): Promise<DevanagariReadingSize> {
  if (inMemoryReadingSize !== null) {
    return inMemoryReadingSize;
  }

  try {
    const raw = await AsyncStorage.getItem(READING_SIZE_STORAGE_KEY);
    const sanitized = sanitizeReadingSize(raw);
    inMemoryReadingSize = sanitized;
    return sanitized;
  } catch (error) {
    console.warn('Failed to read reading size from AsyncStorage:', error);
    return inMemoryReadingSize ?? DEFAULT_READING_SIZE;
  }
}

/**
 * Persists the user's Devanagari reading size.
 */
export async function setReadingSize(size: DevanagariReadingSize): Promise<void> {
  const sanitized = sanitizeReadingSize(size);
  inMemoryReadingSize = sanitized;

  try {
    await AsyncStorage.setItem(READING_SIZE_STORAGE_KEY, sanitized);
  } catch (error) {
    console.warn('Failed to persist reading size to AsyncStorage:', error);
  }
}

export const getDevanagariReadingSize = getReadingSize;
export const setDevanagariReadingSize = setReadingSize;

/**
 * Retrieves all stored application settings.
 */
export async function getAllSettings(): Promise<AppSettings> {
  const [themePreference, devanagariReadingSize] = await Promise.all([
    getThemePreference(),
    getReadingSize(),
  ]);

  return {
    themePreference,
    devanagariReadingSize,
  };
}

/**
 * Resets settings to default values and clears in-memory cache (useful for tests or app reset).
 */
export async function resetSettings(): Promise<void> {
  inMemoryTheme = null;
  inMemoryReadingSize = null;

  try {
    await AsyncStorage.multiRemove([THEME_STORAGE_KEY, READING_SIZE_STORAGE_KEY]);
  } catch (error) {
    console.warn('Failed to reset settings in AsyncStorage:', error);
  }
}
