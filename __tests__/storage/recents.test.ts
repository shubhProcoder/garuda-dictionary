import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  MAX_RECENT_SEARCHES,
} from '../../src/storage/recents';

describe('Recent Searches Storage Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts with empty recent searches', async () => {
    expect(await getRecentSearches()).toEqual([]);
  });

  it('adds recent searches and keeps latest at the front', async () => {
    await addRecentSearch('dharma');
    await addRecentSearch('peace');
    expect(await getRecentSearches()).toEqual(['peace', 'dharma']);
  });

  it('deduplicates case-insensitively and updates order', async () => {
    await addRecentSearch('dharma');
    await addRecentSearch('peace');
    await addRecentSearch('DHARMA'); // Re-search with different casing
    expect(await getRecentSearches()).toEqual(['DHARMA', 'peace']);
  });

  it('limits to MAX_RECENT_SEARCHES (6 items)', async () => {
    const items = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
    for (const item of items) {
      await addRecentSearch(item);
    }
    const recents = await getRecentSearches();
    expect(recents).toHaveLength(MAX_RECENT_SEARCHES);
    expect(recents[0]).toBe('eight');
    expect(recents).not.toContain('one');
  });

  it('ignores empty or whitespace queries', async () => {
    await addRecentSearch('valid');
    await addRecentSearch('');
    await addRecentSearch('   ');
    expect(await getRecentSearches()).toEqual(['valid']);
  });

  it('clears recent searches', async () => {
    await addRecentSearch('test');
    await clearRecentSearches();
    expect(await getRecentSearches()).toEqual([]);
  });
});
