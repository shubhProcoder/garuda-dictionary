import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import HistoryScreen from '../../src/app/(tabs)/history';
import LexiconScreen from '../../src/app/(tabs)/lexicon';
import SavedScreen from '../../src/app/(tabs)/saved';
import { useBookmarks } from '../../src/hooks/useBookmarks';
import { useRecentSearches } from '../../src/hooks/useRecentSearches';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/hooks/useBookmarks');
jest.mock('../../src/hooks/useRecentSearches');

describe('Phase 5 — Lexicon, Saved Words, and Search History Regression Suite', () => {
  const mockPush = jest.fn();
  const mockClearRecents = jest.fn();
  const mockToggleBookmark = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useBookmarks as jest.Mock).mockReturnValue({
      bookmarks: [],
      isLoading: false,
      isBookmarked: jest.fn().mockReturnValue(false),
      getSavedEntries: jest.fn().mockReturnValue([]),
      toggleBookmark: mockToggleBookmark,
    });

    (useRecentSearches as jest.Mock).mockReturnValue({
      recents: [],
      isLoading: false,
      addRecent: jest.fn(),
      clearRecents: mockClearRecents,
    });
  });

  // --- 1. LEXICON TESTS ---
  describe('1. Lexicon Tab Refinements', () => {
    it('displays The Lexicon, total count (70 of 70), and dynamic POS filter counts', async () => {
      const { getByText } = render(<LexiconScreen />);

      expect(getByText('THE COLLECTION')).toBeTruthy();
      expect(getByText('The Lexicon')).toBeTruthy();
      expect(getByText('70 of 70')).toBeTruthy();

      // Check POS categories and their exact counts from the 70 verified records
      expect(getByText('All types')).toBeTruthy();
      expect(getByText('Nouns')).toBeTruthy();
      expect(getByText('Verbs')).toBeTruthy();
      expect(getByText('Adjectives')).toBeTruthy();

      expect(getByText('70')).toBeTruthy(); // All
      expect(getByText('47')).toBeTruthy(); // Nouns
      expect(getByText('14')).toBeTruthy(); // Verbs
      expect(getByText('9')).toBeTruthy();  // Adjectives

      await waitFor(() => {
        expect(getByText('शिक्षा')).toBeTruthy();
      });
    });

    it('filters entries when POS chip is toggled', async () => {
      const { getByText } = render(<LexiconScreen />);

      fireEvent.press(getByText('Verbs'));

      await waitFor(() => {
        expect(getByText('14 of 70')).toBeTruthy();
      });
    });

    it('filters locally using scoped SearchBar without leaving the screen', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<LexiconScreen />);

      const searchInput = getByPlaceholderText('Filter words in lexicon...');
      fireEvent.changeText(searchInput, 'shiksha');

      await waitFor(() => {
        expect(getByText('शिक्षा')).toBeTruthy();
        expect(getByText('1 of 70')).toBeTruthy();
        expect(queryByText('धर्म')).toBeNull();
      });
    });

    it('renders empty filter state and resets filters properly', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<LexiconScreen />);

      const searchInput = getByPlaceholderText('Filter words in lexicon...');
      fireEvent.changeText(searchInput, 'no_match_xyz');

      await waitFor(() => {
        expect(getByText('0 of 70')).toBeTruthy();
        expect(getByText('No matching words found.')).toBeTruthy();
        expect(getByText('Reset filters ↗')).toBeTruthy();
      });

      fireEvent.press(getByText('Reset filters ↗'));

      await waitFor(() => {
        expect(getByText('70 of 70')).toBeTruthy();
        expect(queryByText('No matching words found.')).toBeNull();
      });
    });

    it('navigates to word detail on entry press', async () => {
      const { getByText } = render(<LexiconScreen />);

      await waitFor(() => {
        expect(getByText('शिक्षा')).toBeTruthy();
      });

      fireEvent.press(getByText('शिक्षा'));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/entry/[id]',
        params: { id: '1' },
      });
    });
  });

  // --- 2. SAVED WORDS TESTS ---
  describe('2. Saved Words Personal Collection', () => {
    it('renders deliberate zero-bookmark empty state with navigation button', () => {
      const { getByText } = render(<SavedScreen />);

      expect(getByText('YOUR COLLECTION')).toBeTruthy();
      expect(getByText('Saved Words')).toBeTruthy();
      expect(getByText('0 saved')).toBeTruthy();
      expect(getByText('Your collection starts here.')).toBeTruthy();
      expect(getByText('Save words while exploring Garuda and they will appear here.')).toBeTruthy();

      const exploreBtn = getByText('Explore the dictionary ↗');
      expect(exploreBtn).toBeTruthy();

      fireEvent.press(exploreBtn);
      expect(mockPush).toHaveBeenCalledWith('/(tabs)/lexicon');
    });

    it('renders bookmarked entries with count badge and navigates on row tap', () => {
      const mockEntry = {
        id: 11,
        headword: 'धर्म',
        transliteration: 'dharma',
        romanised: ['dharma', 'dharm'],
        pos: 'noun (m.)',
        meanings: ['duty', 'religion', 'moral way of life'],
        example: 'धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।',
      };

      (useBookmarks as jest.Mock).mockReturnValue({
        bookmarks: [11],
        isLoading: false,
        isBookmarked: jest.fn().mockReturnValue(true),
        getSavedEntries: jest.fn().mockReturnValue([mockEntry]),
        toggleBookmark: mockToggleBookmark,
      });

      const { getByText } = render(<SavedScreen />);

      expect(getByText('1 saved')).toBeTruthy();
      expect(getByText('धर्म')).toBeTruthy();
      expect(getByText('dharma')).toBeTruthy();
      expect(getByText('duty')).toBeTruthy();

      fireEvent.press(getByText('धर्म'));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/entry/[id]',
        params: { id: '11' },
      });
    });

    it('removes bookmark immediately when removal button is tapped on row', () => {
      const mockEntry = {
        id: 11,
        headword: 'धर्म',
        transliteration: 'dharma',
        romanised: ['dharma', 'dharm'],
        pos: 'noun (m.)',
        meanings: ['duty', 'religion', 'moral way of life'],
        example: 'धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।',
      };

      (useBookmarks as jest.Mock).mockReturnValue({
        bookmarks: [11],
        isLoading: false,
        isBookmarked: jest.fn().mockReturnValue(true),
        getSavedEntries: jest.fn().mockReturnValue([mockEntry]),
        toggleBookmark: mockToggleBookmark,
      });

      const { getByLabelText } = render(<SavedScreen />);

      const removeAction = getByLabelText('Remove धर्म from saved words');
      expect(removeAction).toBeTruthy();

      fireEvent.press(removeAction);
      expect(mockToggleBookmark).toHaveBeenCalledWith(11);
    });
  });

  // --- 3. SEARCH HISTORY TESTS ---
  describe('3. Search History Screen Refinements', () => {
    it('renders empty history state and navigates to Search on action', () => {
      const { getByText } = render(<HistoryScreen />);

      expect(getByText('SEARCH LOG')).toBeTruthy();
      expect(getByText('Search History')).toBeTruthy();
      expect(getByText('Your search history is empty.')).toBeTruthy();
      expect(getByText('Your recent dictionary searches will appear here.')).toBeTruthy();

      const startSearchBtn = getByText('Start searching ↗');
      expect(startSearchBtn).toBeTruthy();

      fireEvent.press(startSearchBtn);
      expect(mockPush).toHaveBeenCalledWith('/(tabs)');
    });

    it('renders recent search queries and preserves storage order', () => {
      (useRecentSearches as jest.Mock).mockReturnValue({
        recents: ['dharma', 'shiksha'],
        isLoading: false,
        addRecent: jest.fn(),
        clearRecents: mockClearRecents,
      });

      const { getByText } = render(<HistoryScreen />);

      expect(getByText('2 recent')).toBeTruthy();
      expect(getByText('dharma')).toBeTruthy();
      expect(getByText('shiksha')).toBeTruthy();
    });

    it('navigates to Search tab with selected query parameter when query row is tapped', () => {
      (useRecentSearches as jest.Mock).mockReturnValue({
        recents: ['dharma', 'shiksha'],
        isLoading: false,
        addRecent: jest.fn(),
        clearRecents: mockClearRecents,
      });

      const { getByText } = render(<HistoryScreen />);

      fireEvent.press(getByText('dharma'));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(tabs)',
        params: { q: 'dharma' },
      });
    });

    it('renders lightweight secondary match preview for dictionary headword queries', async () => {
      (useRecentSearches as jest.Mock).mockReturnValue({
        recents: ['dharma'],
        isLoading: false,
        addRecent: jest.fn(),
        clearRecents: mockClearRecents,
      });

      const { findByText } = render(<HistoryScreen />);

      expect(await findByText(/धर्म \(dharma\)/)).toBeTruthy();
    });

    it('requests confirmation before clearing all search history', () => {
      const alertSpy = jest.spyOn(Alert, 'alert');

      (useRecentSearches as jest.Mock).mockReturnValue({
        recents: ['dharma', 'shiksha'],
        isLoading: false,
        addRecent: jest.fn(),
        clearRecents: mockClearRecents,
      });

      const { getByText } = render(<HistoryScreen />);

      fireEvent.press(getByText('Clear all'));

      expect(alertSpy).toHaveBeenCalledWith(
        'Clear Search History',
        'Are you sure you want to delete all recent search queries?',
        expect.any(Array)
      );

      // Verify destructive action execution
      const buttons = alertSpy.mock.calls[0][2];
      const clearBtn = buttons?.find((btn: any) => btn.text === 'Clear All');
      expect(clearBtn).toBeTruthy();

      clearBtn?.onPress?.();
      expect(mockClearRecents).toHaveBeenCalledTimes(1);

      alertSpy.mockRestore();
    });
  });
});
