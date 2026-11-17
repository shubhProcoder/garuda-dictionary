import AsyncStorage from '@react-native-async-storage/async-storage';

export const BOOKMARKS_STORAGE_KEY = '@garuda:bookmarks:v1';

/**
 * Retrieve saved bookmark IDs.
 */
export async function getBookmarks(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : [];
  } catch (error) {
    console.warn('Failed to load bookmarks from AsyncStorage:', error);
    return [];
  }
}

/**
 * Add an entry ID to bookmarks.
 */
export async function addBookmark(id: number): Promise<number[]> {
  try {
    const current = await getBookmarks();
    if (current.includes(id)) return current;
    const updated = [id, ...current];
    await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Failed to save bookmark:', error);
    return [];
  }
}

/**
 * Remove an entry ID from bookmarks.
 */
export async function removeBookmark(id: number): Promise<number[]> {
  try {
    const current = await getBookmarks();
    const updated = current.filter((item) => item !== id);
    await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Failed to remove bookmark:', error);
    return [];
  }
}

/**
 * Toggle bookmark status for an entry ID.
 */
export async function toggleBookmark(id: number): Promise<number[]> {
  const current = await getBookmarks();
  if (current.includes(id)) {
    return removeBookmark(id);
  } else {
    return addBookmark(id);
  }
}

/**
 * Check if an entry ID is bookmarked.
 */
export async function isBookmarked(id: number): Promise<boolean> {
  const current = await getBookmarks();
  return current.includes(id);
}

/**
 * Clears all bookmarks.
 */
export async function clearBookmarks(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BOOKMARKS_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear bookmarks:', error);
  }
}
