import { useCallback, useEffect, useState } from 'react';
import {
  getBookmarks,
  isBookmarked as checkIsBookmarked,
  toggleBookmark as toggleBookmarkStorage,
} from '../storage/bookmarks';
import { DictionaryEntry } from '../types/dictionary';

export interface UseBookmarksReturn {
  bookmarks: number[];
  isLoading: boolean;
  toggleBookmark: (id: number) => Promise<void>;
  isBookmarked: (id: number) => boolean;
  getSavedEntries: (allEntries: DictionaryEntry[]) => DictionaryEntry[];
}

export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getBookmarks().then((loaded) => {
      if (mounted) {
        setBookmarks(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggle = useCallback(async (id: number) => {
    const updated = await toggleBookmarkStorage(id);
    setBookmarks(updated);
  }, []);

  const isBookmarked = useCallback(
    (id: number) => {
      return bookmarks.includes(id);
    },
    [bookmarks]
  );

  const getSavedEntries = useCallback(
    (allEntries: DictionaryEntry[]) => {
      const set = new Set(bookmarks);
      return allEntries.filter((entry) => set.has(entry.id));
    },
    [bookmarks]
  );

  return {
    bookmarks,
    isLoading,
    toggleBookmark: toggle,
    isBookmarked,
    getSavedEntries,
  };
}
