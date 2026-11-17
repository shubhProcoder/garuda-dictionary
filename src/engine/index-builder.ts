import { DictionaryEntry, DictionaryIndex } from '../types/dictionary';
import { normalizeDevanagari, normalizeEnglish, normalizeRoman } from './normalize';

/**
 * Generate normalized Roman search keys for an entry.
 * Hindi users often omit the final inherent "a": dharma → dharm.
 */
export function buildRomanKeys(entry: DictionaryEntry): string[] {
  const keys = new Set<string>();
  const forms = [entry.transliteration, ...(entry.romanised ?? [])];

  for (const form of forms) {
    const key = normalizeRoman(form);
    if (!key) continue;
    keys.add(key);
    if (key.length > 3 && key.endsWith('a')) {
      keys.add(key.slice(0, -1));
    }
  }

  return Array.from(keys);
}

/**
 * Pre-computes indexes across all entries to eliminate O(n) key recomputations on each search.
 */
export function buildDictionaryIndex(entries: DictionaryEntry[]): DictionaryIndex {
  const entryById = new Map<number, DictionaryEntry>();
  const romanKeysByEntryId = new Map<number, string[]>();
  const devanagariByEntryId = new Map<number, string>();
  const meaningsByEntryId = new Map<
    number,
    Array<{ original: string; normalized: string; words: string[] }>
  >();

  for (const entry of entries) {
    entryById.set(entry.id, entry);
    romanKeysByEntryId.set(entry.id, buildRomanKeys(entry));
    devanagariByEntryId.set(entry.id, normalizeDevanagari(entry.headword));

    const meaningsList = (entry.meanings ?? []).map((meaning) => {
      const normalized = normalizeEnglish(meaning);
      const words = normalized.split(/\s+/).filter(Boolean);
      return {
        original: meaning,
        normalized,
        words,
      };
    });
    meaningsByEntryId.set(entry.id, meaningsList);
  }

  return {
    entries,
    entryById,
    romanKeysByEntryId,
    devanagariByEntryId,
    meaningsByEntryId,
  };
}
