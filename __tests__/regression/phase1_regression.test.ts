import { buildDictionaryIndex } from '../../src/engine/index-builder';
import { filterByPartOfSpeech } from '../../src/engine/filter';
import { searchEntries } from '../../src/engine/search';
import {
  addBookmark,
  clearBookmarks,
  getBookmarks,
  isBookmarked,
  removeBookmark,
  toggleBookmark,
} from '../../src/storage/bookmarks';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
} from '../../src/storage/recents';
import { validateEntries } from '../../src/schemas/entry.schema';
import rawEntries from '../../src/data/entries.json';

describe('Phase 1 Regression and Functionality Verification', () => {
  const entries = validateEntries(rawEntries);
  const index = buildDictionaryIndex(entries);

  beforeEach(async () => {
    await clearBookmarks();
    await clearRecentSearches();
  });

  // 1. Search for धर्म
  it('1. Search for धर्म finds Dharma (id 11) with score 100', () => {
    const results = searchEntries(index, 'धर्म');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.id).toBe(11);
    expect(results[0].score).toBe(100);
    expect(results[0].matchType).toBe('exact_devanagari');
  });

  // 2. Search for dharma
  it('2. Search for dharma finds Dharma (id 11) with score 100', () => {
    const results = searchEntries(index, 'dharma');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.id).toBe(11);
    expect(results[0].score).toBe(100);
    expect(results[0].matchType).toBe('exact_roman');
  });

  // 3. Search for dhrama (transposition typo)
  it('3. Search for dhrama resolves via Damerau-Levenshtein to Dharma (id 11)', () => {
    const results = searchEntries(index, 'dhrama');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.id).toBe(11);
    expect(results[0].matchType).toBe('fuzzy_roman');
  });

  // 4. Search for duty (English meaning)
  it('4. Search for duty finds entries with English meaning duty', () => {
    const results = searchEntries(index, 'duty');
    expect(results.length).toBeGreaterThan(0);
    const dharmaResult = results.find((r) => r.entry.id === 11);
    expect(dharmaResult).toBeDefined();
    expect(dharmaResult?.matchType).toBe('exact_meaning');
  });

  // 5. Open a search result
  it('5. Search results map accurately to dictionary entry objects', () => {
    const results = searchEntries(index, 'shiksha');
    expect(results.length).toBeGreaterThan(0);
    const entry = results[0].entry;
    expect(entry.id).toBe(1);
    expect(entry.headword).toBe('शिक्षा');
    expect(entry.transliteration).toBe('śikṣā');
    expect(entry.meanings).toContain('education');
  });

  // 6. Save and unsave an entry
  it('6. Save and unsave an entry persists to storage', async () => {
    expect(await isBookmarked(11)).toBe(false);

    await addBookmark(11);
    expect(await isBookmarked(11)).toBe(true);

    await removeBookmark(11);
    expect(await isBookmarked(11)).toBe(false);

    await toggleBookmark(11);
    expect(await isBookmarked(11)).toBe(true);

    await toggleBookmark(11);
    expect(await isBookmarked(11)).toBe(false);
  });

  // 8. View all 70 dictionary entries
  it('8. All 70 dictionary entries are loaded and validated', () => {
    expect(entries.length).toBe(70);
    const ids = new Set(entries.map((e) => e.id));
    expect(ids.size).toBe(70);
  });

  // 9. Filter Lexicon by part of speech
  it('9. Filters entries accurately by POS (All, Noun, Verb, Adjective)', () => {
    const all = filterByPartOfSpeech(entries, 'all');
    expect(all.length).toBe(70);

    const nouns = filterByPartOfSpeech(entries, 'noun');
    expect(nouns.length).toBe(47); // 34 m. + 13 f.

    const verbs = filterByPartOfSpeech(entries, 'verb');
    expect(verbs.length).toBe(14);

    const adjectives = filterByPartOfSpeech(entries, 'adjective');
    expect(adjectives.length).toBe(9);

    expect(nouns.length + verbs.length + adjectives.length).toBe(70);
  });

  // 10. Verify Saved displays bookmarked entries
  it('10. Resolves saved bookmark IDs back to full entry records', async () => {
    await addBookmark(1);
    await addBookmark(11);

    const savedIds = await getBookmarks();
    const savedEntries = entries.filter((e) => savedIds.includes(e.id));

    expect(savedEntries.length).toBe(2);
    expect(savedEntries.map((e) => e.id)).toEqual(expect.arrayContaining([1, 11]));
  });

  // 11. Verify History displays recent searches
  it('11. Recent searches are saved and capped at 6 with deduplication', async () => {
    await addRecentSearch('dharma');
    await addRecentSearch('shiksha');
    await addRecentSearch('peace');
    await addRecentSearch('water');
    await addRecentSearch('satya');
    await addRecentSearch('gyan');
    await addRecentSearch('karma'); // 7th entry

    const recents = await getRecentSearches();
    expect(recents.length).toBe(6);
    expect(recents[0]).toBe('karma'); // most recent first
    expect(recents).not.toContain('dharma'); // oldest pushed out
  });

  // 12. Tap a History item and verify Search executes it
  it('12. Re-searching with a query from recents produces ranked results', async () => {
    await addRecentSearch('dharma');
    const recents = await getRecentSearches();
    const query = recents[0];

    const results = searchEntries(index, query);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.id).toBe(11);
  });

  // 15. Restart the app and verify bookmarks and history persist
  it('15. Storage persists bookmarks and history across sequential reads', async () => {
    await addBookmark(25);
    await addRecentSearch('surya');

    // Simulate new session
    const restoredBookmarks = await getBookmarks();
    const restoredRecents = await getRecentSearches();

    expect(restoredBookmarks).toContain(25);
    expect(restoredRecents).toContain('surya');
  });
});
