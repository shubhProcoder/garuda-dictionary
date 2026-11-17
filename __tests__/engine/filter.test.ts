import entriesJson from '../../src/data/entries.json';
import { filterByPartOfSpeech, filterSearchResultsByPOS } from '../../src/engine/filter';
import { searchEntries } from '../../src/engine/search';

describe('part-of-speech filtering tests', () => {
  it('returns all entries when filter is all or empty', () => {
    expect(filterByPartOfSpeech(entriesJson, 'all')).toHaveLength(70);
    expect(filterByPartOfSpeech(entriesJson, '')).toHaveLength(70);
  });

  it('filters nouns (both masculine and feminine)', () => {
    const nouns = filterByPartOfSpeech(entriesJson, 'noun');
    expect(nouns.length).toBe(47); // 34 m. + 13 f.
    nouns.forEach((entry) => {
      expect(entry.pos.startsWith('noun')).toBe(true);
    });
  });

  it('filters verbs', () => {
    const verbs = filterByPartOfSpeech(entriesJson, 'verb');
    expect(verbs.length).toBe(14);
    verbs.forEach((entry) => {
      expect(entry.pos).toBe('verb');
    });
  });

  it('filters adjectives', () => {
    const adjectives = filterByPartOfSpeech(entriesJson, 'adjective');
    expect(adjectives.length).toBe(9);
    adjectives.forEach((entry) => {
      expect(entry.pos).toBe('adjective');
    });
  });

  it('filters search results correctly', () => {
    const results = searchEntries(entriesJson, 'duty');
    const filtered = filterSearchResultsByPOS(results, 'noun');
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((r) => {
      expect(r.entry.pos.startsWith('noun')).toBe(true);
    });
  });
});
