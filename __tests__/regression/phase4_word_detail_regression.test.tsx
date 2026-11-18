import * as Clipboard from 'expo-clipboard';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Share } from 'react-native';
import EntryDetailScreen from '../../src/app/entry/[id]';
import { formatEntryText } from '../../src/components/EntryDetail';
import entriesData from '../../src/data/entries.json';
import * as BookmarksStorage from '../../src/storage/bookmarks';
import { DictionaryEntry } from '../../src/types/dictionary';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

describe('Phase 4 — Premium Word Detail Regression Suite', () => {
  const mockBack = jest.fn();
  const mockPush = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      push: mockPush,
    });
  });

  // 1. All 70 dictionary entries can be formatted into clean text without error
  it('1. Formats every single entry in the dataset cleanly without exception', () => {
    for (const entry of entriesData as DictionaryEntry[]) {
      const text = formatEntryText(entry);
      expect(text).toContain(entry.headword);
      expect(text).toContain(`Transliteration: ${entry.transliteration}`);
      expect(text).toContain(`Part of speech: ${entry.pos}`);
      expect(text).toContain('Meanings:\n1.');
      expect(text).toContain(`Example:\n${entry.example}`);
      expect(text).toContain('Romanized spellings:');
    }
  });

  // 2. Word Detail renders complete hero and content for entry #1
  it('2. Renders complete hero, POS, numbered meanings, and example for entry #1 (शिक्षा)', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });

    const { getByText } = render(<EntryDetailScreen />);

    expect(getByText('शिक्षा')).toBeTruthy();
    expect(getByText('śikṣā')).toBeTruthy();
    expect(getByText('noun (f.)')).toBeTruthy();
    expect(getByText('1.')).toBeTruthy();
    expect(getByText('education')).toBeTruthy();
    expect(getByText('2.')).toBeTruthy();
    expect(getByText('learning')).toBeTruthy();
    expect(getByText('शिक्षा हर बच्चे का अधिकार है।')).toBeTruthy();
  });

  // 3. Search source displays "WHY THIS MATCHED" card with match explanation and badge
  it('3. Displays "WHY THIS MATCHED" card when navigated from active search', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: '1',
      query: 'shiksha',
      matchType: 'exact_roman',
      matchedField: 'romanised',
      matchExplanation: 'Exact Roman spelling: "shiksha"',
    });

    const { getByText } = render(<EntryDetailScreen />);

    expect(getByText('WHY THIS MATCHED')).toBeTruthy();
    expect(getByText('Exact match')).toBeTruthy();
    expect(getByText('Exact Roman spelling: "shiksha"')).toBeTruthy();
  });

  // 4. Non-search source (Lexicon/Saved/WOTD) hides "WHY THIS MATCHED" card
  it('4. Hides "WHY THIS MATCHED" card when navigated from Lexicon or Saved without query', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });

    const { queryByText } = render(<EntryDetailScreen />);

    expect(queryByText('WHY THIS MATCHED')).toBeNull();
  });

  // 5. Copy Word copies only headword
  it('5. Copy Word copies exclusively the headword to clipboard', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });

    const { getByLabelText, getByText } = render(<EntryDetailScreen />);

    fireEvent.press(getByLabelText('Copy word'));

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('शिक्षा');
    await waitFor(() => {
      expect(getByText('Headword copied to clipboard')).toBeTruthy();
    });
  });

  // 6. Copy Entry copies full formatted dictionary record
  it('6. Copy Entry copies structured text to clipboard', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });

    const { getByLabelText, getByText } = render(<EntryDetailScreen />);

    fireEvent.press(getByLabelText('Copy full entry'));

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('शिक्षा')
    );
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('Transliteration: śikṣā')
    );
    await waitFor(() => {
      expect(getByText('Full entry copied to clipboard')).toBeTruthy();
    });
  });

  // 7. Share Entry invokes native Share.share
  it('7. Share Entry calls Share.share with formatted entry', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
    const spyShare = jest.spyOn(Share, 'share');

    const { getByLabelText } = render(<EntryDetailScreen />);

    fireEvent.press(getByLabelText('Share entry'));

    expect(spyShare).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'शिक्षा',
        message: expect.stringContaining('शिक्षा'),
      })
    );
  });

  // 8. Bookmark toggle persists immediately
  it('8. Bookmark toggle updates state and persists through storage', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
    jest.spyOn(BookmarksStorage, 'toggleBookmark').mockResolvedValue([1]);

    const { getByText } = render(<EntryDetailScreen />);

    const saveBtn = getByText('SAVE WORD');
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(BookmarksStorage.toggleBookmark).toHaveBeenCalledWith(1);
    });
  });

  // 9. Back navigation calls router.back
  it('9. Back button returns to caller screen/tab', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });

    const { getByText } = render(<EntryDetailScreen />);

    fireEvent.press(getByText('← BACK'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  // 10. Invalid ID renders error state with go back button
  it('10. Invalid ID safely shows not found state without crashing', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '-5' });

    const { getByText } = render(<EntryDetailScreen />);

    expect(getByText('Word not found')).toBeTruthy();
    fireEvent.press(getByText('← Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
