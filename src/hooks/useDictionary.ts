import { useEffect, useState } from 'react';
import rawEntries from '../data/entries.json';
import { buildDictionaryIndex } from '../engine/index-builder';
import { validateEntries } from '../schemas/entry.schema';
import { DictionaryEntry, DictionaryIndex } from '../types/dictionary';

export interface UseDictionaryReturn {
  entries: DictionaryEntry[];
  index: DictionaryIndex | null;
  isLoading: boolean;
  error: string | null;
  getEntryById: (id: number) => DictionaryEntry | undefined;
}

export function useDictionary(): UseDictionaryReturn {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [index, setIndex] = useState<DictionaryIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const validated = validateEntries(rawEntries);
      const computedIndex = buildDictionaryIndex(validated);
      setEntries(validated);
      setIndex(computedIndex);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load or validate dictionary dataset:', err);
      setError(err?.message ?? 'Failed to load dictionary data');
      setIsLoading(false);
    }
  }, []);

  const getEntryById = (id: number): DictionaryEntry | undefined => {
    if (index) {
      return index.entryById.get(id);
    }
    return entries.find((e) => e.id === id);
  };

  return {
    entries,
    index,
    isLoading,
    error,
    getEntryById,
  };
}
