import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addBookmark,
  clearBookmarks,
  getBookmarks,
  isBookmarked,
  removeBookmark,
  toggleBookmark,
} from '../../src/storage/bookmarks';

describe('Bookmarks Storage Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts with an empty array of bookmarks', async () => {
    const bookmarks = await getBookmarks();
    expect(bookmarks).toEqual([]);
  });

  it('adds a bookmark and avoids duplicate IDs', async () => {
    await addBookmark(11);
    let bookmarks = await getBookmarks();
    expect(bookmarks).toEqual([11]);

    await addBookmark(11); // Duplicate add
    bookmarks = await getBookmarks();
    expect(bookmarks).toEqual([11]);

    await addBookmark(1);
    bookmarks = await getBookmarks();
    expect(bookmarks).toEqual([1, 11]);
  });

  it('removes a bookmark', async () => {
    await addBookmark(11);
    await addBookmark(1);
    const updated = await removeBookmark(11);
    expect(updated).toEqual([1]);
    expect(await isBookmarked(11)).toBe(false);
    expect(await isBookmarked(1)).toBe(true);
  });

  it('toggles bookmark on and off', async () => {
    expect(await isBookmarked(5)).toBe(false);

    await toggleBookmark(5);
    expect(await isBookmarked(5)).toBe(true);

    await toggleBookmark(5);
    expect(await isBookmarked(5)).toBe(false);
  });

  it('clears all bookmarks', async () => {
    await addBookmark(1);
    await addBookmark(2);
    await clearBookmarks();
    expect(await getBookmarks()).toEqual([]);
  });
});
