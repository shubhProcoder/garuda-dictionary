import entriesJson from '../../src/data/entries.json';
import { buildDictionaryIndex } from '../../src/engine/index-builder';
import { damerauLevenshteinWithin, searchEntries } from '../../src/engine/search';

describe('Search Engine Tests', () => {
  const index = buildDictionaryIndex(entriesJson);
  const first = (q: string) => searchEntries(index, q)[0];

  describe('Damerau-Levenshtein distance', () => {
    it('accurately calculates substitution and transposition', () => {
      expect(damerauLevenshteinWithin('dharma', 'dharma', 2)).toBe(0);
      expect(damerauLevenshteinWithin('dharma', 'dharm', 2)).toBe(1); // omission
      expect(damerauLevenshteinWithin('dharma', 'dhrama', 2)).toBe(1); // transposition ar -> ra
      expect(damerauLevenshteinWithin('dharma', 'dhrm', 2)).toBe(2); // 2 omissions
    });
  });

  describe('Devanagari Search', () => {
    it('finds exact Devanagari entry for धर्म (id 11)', () => {
      const results = searchEntries(index, 'धर्म');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].entry.id).toBe(11);
      expect(results[0].matchType).toBe('exact_devanagari');
      expect(results[0].score).toBe(100);
      expect(results[0].matchedField).toBe('headword');
    });

    it('finds exact Devanagari entry for भाषा (id 2)', () => {
      const result = first('भाषा');
      expect(result).toBeDefined();
      expect(result.entry.id).toBe(2);
      expect(result.matchType).toBe('exact_devanagari');
    });

    it('finds substring Devanagari matches', () => {
      const results = searchEntries(index, 'शा');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((r) => r.entry.headword.includes('शा'))).toBe(true);
    });
  });

  describe('Roman and IAST Search', () => {
    it('resolves dharma and dharm to धर्म (id 11)', () => {
      expect(first('dharma')?.entry.id).toBe(11);
      expect(first('dharm')?.entry.id).toBe(11);
    });

    it('normalizes IAST diacritics and common Roman spellings', () => {
      expect(first('śikṣā')?.entry.id).toBe(1);
      expect(first('shiksha')?.entry.id).toBe(1);
      expect(first('siksha')?.entry.id).toBe(1);
      // Shortened variant not explicitly listed in romanised array
      expect(first('shiksh')?.entry.id).toBe(1);
      expect(first('bhāṣā')?.entry.id).toBe(2);
    });

    it('handles short Roman typos', () => {
      const result = first('dhrm');
      expect(result).toBeDefined();
      expect(result.entry.id).toBe(11);
      expect(result.matchType).toBe('fuzzy_roman');
    });

    it('tolerates letter transposition typos (dhrama -> dharma)', () => {
      const result = first('dhrama');
      expect(result).toBeDefined();
      expect(result.entry.id).toBe(11);
      expect(result.matchType).toBe('fuzzy_roman');
    });
  });

  describe('English Meaning Lookup', () => {
    it('finds entries by English meaning "duty"', () => {
      const results = searchEntries(index, 'duty');
      expect(results.length).toBeGreaterThanOrEqual(1);
      // Dharma has meaning "duty"
      expect(results.some((r) => r.entry.id === 11)).toBe(true);
      const dharma = results.find((r) => r.entry.id === 11)!;
      expect(dharma.matchType).toBe('exact_meaning');
      expect(dharma.matchedField).toBe('meanings');
      expect(dharma.matchExplanation).toContain('duty');
    });

    it('finds entries by English meaning "education"', () => {
      const result = first('education');
      expect(result).toBeDefined();
      expect(result.entry.id).toBe(1); // शिक्षा
      expect(result.matchType).toBe('exact_meaning');
    });

    it('finds entries by English meaning "peace"', () => {
      const result = first('peace');
      expect(result).toBeDefined();
      expect(result.entry.id).toBe(8); // शांति
    });

    it('finds entries by English meaning "water"', () => {
      const results = searchEntries(index, 'water');
      expect(results.length).toBeGreaterThanOrEqual(1);
      const ids = results.map((r) => r.entry.id);
      expect(ids).toContain(17); // जल
      expect(ids).toContain(31); // पानी
    });

    it('finds entries by English meaning "friend"', () => {
      const result = first('friend');
      expect(result).toBeDefined();
      expect(result.entry.id).toBe(13); // मित्र
    });

    it('finds entries by English meaning "love"', () => {
      const result = first('love');
      expect(result).toBeDefined();
      expect(result.entry.id).toBe(9); // प्रेम
    });
  });

  describe('Empty and Edge Case Queries', () => {
    it('returns empty array [] for empty string', () => {
      expect(searchEntries(index, '')).toEqual([]);
    });

    it('returns empty array [] for whitespace-only query', () => {
      expect(searchEntries(index, '   ')).toEqual([]);
    });

    it('returns empty array [] for null or undefined', () => {
      expect(searchEntries(index, null)).toEqual([]);
      expect(searchEntries(index, undefined)).toEqual([]);
    });

    it('returns empty array [] for unknown nonsensical query', () => {
      expect(searchEntries(index, 'qzxvnotaword')).toEqual([]);
    });

    it('works seamlessly when passed raw DictionaryEntry[] array', () => {
      const results = searchEntries(entriesJson, 'धर्म');
      expect(results).toHaveLength(1);
      expect(results[0].entry.id).toBe(11);
    });
  });
});
