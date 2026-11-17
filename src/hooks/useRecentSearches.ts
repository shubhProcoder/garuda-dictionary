import { useCallback, useEffect, useState } from 'react';
import {
  addRecentSearch as addRecentStorage,
  clearRecentSearches as clearRecentStorage,
  getRecentSearches,
} from '../storage/recents';

export interface UseRecentSearchesReturn {
  recents: string[];
  isLoading: boolean;
  addRecent: (query: string) => Promise<void>;
  clearRecents: () => Promise<void>;
}

export function useRecentSearches(): UseRecentSearchesReturn {
  const [recents, setRecents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getRecentSearches().then((loaded) => {
      if (mounted) {
        setRecents(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const addRecent = useCallback(async (query: string) => {
    const updated = await addRecentStorage(query);
    setRecents(updated);
  }, []);

  const clearRecents = useCallback(async () => {
    await clearRecentStorage();
    setRecents([]);
  }, []);

  return {
    recents,
    isLoading,
    addRecent,
    clearRecents,
  };
}
