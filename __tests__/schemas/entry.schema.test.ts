import entriesJson from '../../src/data/entries.json';
import { entrySchema, validateEntries } from '../../src/schemas/entry.schema';

describe('Zod Entry Schema Validation', () => {
  it('validates all 70 entries in the bundled dataset', () => {
    const validated = validateEntries(entriesJson);
    expect(validated).toHaveLength(70);
  });

  it('verifies all entry IDs are sequential and unique', () => {
    const ids = entriesJson.map((e) => e.id);
    expect(new Set(ids).size).toBe(entriesJson.length);
    ids.forEach((id, index) => {
      expect(id).toBe(index + 1);
    });
  });

  it('validates entry 7 has properly split meanings array', () => {
    const entry7 = entriesJson.find((e) => e.id === 7);
    expect(entry7).toBeDefined();
    expect(entry7?.meanings).toEqual(['action', 'deed', 'duty']);
  });

  it('rejects entries with empty or non-Devanagari headwords', () => {
    expect(() =>
      entrySchema.parse({
        id: 100,
        headword: 'dharma', // English, not Devanagari
        transliteration: 'dharma',
        romanised: ['dharma'],
        pos: 'noun (m.)',
        meanings: ['duty'],
        example: 'example sentence',
      })
    ).toThrow();
  });

  it('rejects entries with missing required fields', () => {
    expect(() =>
      entrySchema.parse({
        id: 101,
        headword: 'धर्म',
        // missing transliteration
        romanised: ['dharma'],
        pos: 'noun (m.)',
        meanings: ['duty'],
        example: 'example',
      })
    ).toThrow();
  });

  it('rejects entries with empty arrays', () => {
    expect(() =>
      entrySchema.parse({
        id: 102,
        headword: 'धर्म',
        transliteration: 'dharma',
        romanised: [], // empty
        pos: 'noun (m.)',
        meanings: ['duty'],
        example: 'example',
      })
    ).toThrow();
  });
});
