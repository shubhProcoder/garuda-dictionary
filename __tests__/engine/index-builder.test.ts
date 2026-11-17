import entriesJson from '../../src/data/entries.json';
import { buildDictionaryIndex, buildRomanKeys } from '../../src/engine/index-builder';

describe('index builder tests', () => {
  it('generates roman keys with final-a omission for Dharma', () => {
    const entry11 = entriesJson.find((e) => e.id === 11)!;
    const keys = buildRomanKeys(entry11);
    expect(keys).toContain('dharma');
    expect(keys).toContain('dharm');
  });

  it('builds full dictionary index successfully', () => {
    const index = buildDictionaryIndex(entriesJson);
    expect(index.entries).toHaveLength(70);
    expect(index.entryById.size).toBe(70);
    expect(index.romanKeysByEntryId.size).toBe(70);
    expect(index.devanagariByEntryId.size).toBe(70);
    expect(index.meaningsByEntryId.size).toBe(70);

    const dharmaKeys = index.romanKeysByEntryId.get(11);
    expect(dharmaKeys).toBeDefined();
    expect(dharmaKeys).toContain('dharma');
    expect(dharmaKeys).toContain('dharm');
  });
});
