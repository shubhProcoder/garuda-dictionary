import { useEffect, useMemo, useState } from 'react';
import { filterSearchResultsByPOS } from '../engine/filter';
import { searchEntries } from '../engine/search';
import { DictionaryIndex, POSFilterValue, SearchResult } from '../types/dictionary';

export interface UseSearchOptions {
  index: DictionaryIndex | null;
  debounceMs?: number;
}

export interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  clearQuery: () => void;
  posFilter: POSFilterValue;
  setPosFilter: (pos: POSFilterValue) => void;
  results: SearchResult[];
  isSearching: boolean;
  hasQuery: boolean;
}

export function useSearch({ index, debounceMs = 150 }: UseSearchOptions): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [posFilter, setPosFilter] = useState<POSFilterValue>('all');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  const rawResults = useMemo(() => {
    if (!index || !debouncedQuery.trim()) {
      return [];
    }
    return searchEntries(index, debouncedQuery);
  }, [index, debouncedQuery]);

  const results = useMemo(() => {
    return filterSearchResultsByPOS(rawResults, posFilter);
  }, [rawResults, posFilter]);

  const clearQuery = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  return {
    query,
    setQuery,
    clearQuery,
    posFilter,
    setPosFilter,
    results,
    isSearching,
    hasQuery: query.trim().length > 0,
  };
}
