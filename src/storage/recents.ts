import AsyncStorage from '@react-native-async-storage/async-storage';

export const RECENTS_STORAGE_KEY = '@garuda:recents:v1';
export const MAX_RECENT_SEARCHES = 6;

/**
 * Retrieve recent search query strings.
 */
export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];
  } catch (error) {
    console.warn('Failed to load recent searches from AsyncStorage:', error);
    return [];
  }
}

/**
 * Add a search query to recents (case-insensitive deduplication, up to MAX_RECENT_SEARCHES).
 */
export async function addRecentSearch(rawQuery: string): Promise<string[]> {
  const query = String(rawQuery ?? '').trim();
  if (!query) {
    return getRecentSearches();
  }

  try {
    const current = await getRecentSearches();
    const filtered = current.filter((item) => item.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    await AsyncStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Failed to add recent search:', error);
    return [];
  }
}

/**
 * Clears recent searches.
 */
export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENTS_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear recent searches:', error);
  }
}
