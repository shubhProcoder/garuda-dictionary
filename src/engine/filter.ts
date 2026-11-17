import { DictionaryEntry, POSFilterValue, SearchResult } from '../types/dictionary';

/**
 * Filters dictionary entries by part of speech.
 * 'all' returns all entries.
 * 'noun' matches any POS starting with 'noun' (both masculine and feminine).
 */
export function filterByPartOfSpeech(
  entries: DictionaryEntry[],
  filter: POSFilterValue | string
): DictionaryEntry[] {
  if (!filter || filter === 'all') {
    return [...entries];
  }
  if (filter === 'noun') {
    return entries.filter((entry) => entry.pos.toLowerCase().startsWith('noun'));
  }
  return entries.filter((entry) => entry.pos.toLowerCase() === filter.toLowerCase());
}

/**
 * Filters search results by part of speech.
 */
export function filterSearchResultsByPOS(
  results: SearchResult[],
  filter: POSFilterValue | string
): SearchResult[] {
  if (!filter || filter === 'all') {
    return [...results];
  }
  if (filter === 'noun') {
    return results.filter((res) => res.entry.pos.toLowerCase().startsWith('noun'));
  }
  return results.filter((res) => res.entry.pos.toLowerCase() === filter.toLowerCase());
}
