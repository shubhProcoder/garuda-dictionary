import * as Clipboard from 'expo-clipboard';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Share } from 'react-native';
import {
  EntryDetail,
  formatEntryText,
  getMatchBadgeLabel,
} from '../../src/components/EntryDetail';
import { DictionaryEntry, MatchType } from '../../src/types/dictionary';

describe('EntryDetail component tests', () => {
  const mockEntry: DictionaryEntry = {
    id: 11,
    headword: 'धर्म',
    transliteration: 'dharma',
    romanised: ['dharma', 'dharm'],
    pos: 'noun (m.)',
    meanings: ['duty', 'religion', 'moral way of life'],
    example: 'धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatEntryText helper', () => {
    it('formats dictionary entry to clean plain text matching specified structure', () => {
      const formatted = formatEntryText(mockEntry);

      expect(formatted).toBe(
        'धर्म\n' +
        '\n' +
        'Transliteration: dharma\n' +
        'Part of speech: noun (m.)\n' +
        '\n' +
        'Meanings:\n' +
        '1. duty\n' +
        '2. religion\n' +
        '3. moral way of life\n' +
        '\n' +
        'Example:\n' +
        'धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।\n' +
        '\n' +
        'Romanized spellings:\n' +
        'dharma, dharm'
      );
    });

    it('deduplicates identical romanised variants in formatting', () => {
      const duplicateEntry: DictionaryEntry = {
        ...mockEntry,
        romanised: ['dharma', 'dharma', 'dharm'],
      };
      const formatted = formatEntryText(duplicateEntry);
      expect(formatted).toContain('Romanized spellings:\ndharma, dharm');
    });
  });

  describe('getMatchBadgeLabel helper', () => {
    it('maps every supported MatchType to the verified human-readable label', () => {
      expect(getMatchBadgeLabel('exact_devanagari')).toBe('Exact match');
      expect(getMatchBadgeLabel('exact_roman')).toBe('Exact match');
      expect(getMatchBadgeLabel('prefix_roman')).toBe('Spelling variant');
      expect(getMatchBadgeLabel('partial_devanagari')).toBe('Spelling variant');
      expect(getMatchBadgeLabel('substring_roman')).toBe('Sound-alike match');
      expect(getMatchBadgeLabel('exact_meaning')).toBe('Meaning match');
      expect(getMatchBadgeLabel('partial_meaning')).toBe('Meaning match');
      expect(getMatchBadgeLabel('fuzzy_roman')).toBe('Typo suggestion');
      expect(getMatchBadgeLabel(undefined)).toBeNull();
      expect(getMatchBadgeLabel('unknown' as unknown as MatchType)).toBeNull();
    });
  });

  describe('Core rendering', () => {
    it('renders complete word details including meanings and example', () => {
      const { getByText, getAllByText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={false}
          onToggleBookmark={jest.fn()}
        />
      );

      expect(getByText('धर्म')).toBeTruthy();
      expect(getAllByText('dharma').length).toBeGreaterThanOrEqual(1);
      expect(getByText('noun (m.)')).toBeTruthy();
      expect(getByText('duty')).toBeTruthy();
      expect(getByText('religion')).toBeTruthy();
      expect(getByText('moral way of life')).toBeTruthy();
      expect(getByText('dharm')).toBeTruthy();
      expect(
        getByText('धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।')
      ).toBeTruthy();
    });

    it('numbers each meaning sequentially starting at 1', () => {
      const { getByText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={false}
          onToggleBookmark={jest.fn()}
        />
      );

      expect(getByText('1.')).toBeTruthy();
      expect(getByText('2.')).toBeTruthy();
      expect(getByText('3.')).toBeTruthy();
    });

    it('toggles bookmark button and calls callback', () => {
      const onToggleBookmark = jest.fn();
      const { getByText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={false}
          onToggleBookmark={onToggleBookmark}
        />
      );

      const button = getByText('SAVE WORD');
      fireEvent.press(button);
      expect(onToggleBookmark).toHaveBeenCalledTimes(1);
    });

    it('renders saved state when isBookmarked is true', () => {
      const { getByText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={true}
          onToggleBookmark={jest.fn()}
        />
      );

      expect(getByText('SAVED')).toBeTruthy();
    });

    it('calls onBack when back button is pressed', () => {
      const onBack = jest.fn();
      const { getByText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={false}
          onToggleBookmark={jest.fn()}
          onBack={onBack}
        />
      );

      fireEvent.press(getByText('← BACK'));
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Match Explanation Card (WHY THIS MATCHED)', () => {
    it('displays "WHY THIS MATCHED" card when matchContext is provided', () => {
      const { getByText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={false}
          onToggleBookmark={jest.fn()}
          matchContext={{
            query: 'duty',
            matchType: 'exact_meaning',
            matchedField: 'meanings',
            matchExplanation: 'Exact English meaning: "duty"',
          }}
        />
      );

      expect(getByText('WHY THIS MATCHED')).toBeTruthy();
      expect(getByText('"duty"')).toBeTruthy();
      expect(getByText('Meaning match')).toBeTruthy();
      expect(getByText('Exact English meaning: "duty"')).toBeTruthy();
    });

    it('hides the entire match card when matchContext is not provided (e.g. from Lexicon or Saved)', () => {
      const { queryByText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={false}
          onToggleBookmark={jest.fn()}
        />
      );

      expect(queryByText('WHY THIS MATCHED')).toBeNull();
    });
  });

  describe('Copy and Share actions', () => {
    it('copies only the headword to clipboard when Copy word is pressed and shows toast', async () => {
      const { getByLabelText, getByText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={false}
          onToggleBookmark={jest.fn()}
        />
      );

      const copyWordBtn = getByLabelText('Copy word');
      fireEvent.press(copyWordBtn);

      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('धर्म');
      await waitFor(() => {
        expect(getByText('Headword copied to clipboard')).toBeTruthy();
      });
    });

    it('copies the formatted entry to clipboard when Copy entry is pressed and shows toast', async () => {
      const { getByLabelText, getByText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={false}
          onToggleBookmark={jest.fn()}
        />
      );

      const copyEntryBtn = getByLabelText('Copy full entry');
      fireEvent.press(copyEntryBtn);

      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
        formatEntryText(mockEntry)
      );
      await waitFor(() => {
        expect(getByText('Full entry copied to clipboard')).toBeTruthy();
      });
    });

    it('calls Share.share with formatted text when Share is pressed', () => {
      const spyShare = jest.spyOn(Share, 'share');

      const { getByLabelText } = render(
        <EntryDetail
          entry={mockEntry}
          isBookmarked={false}
          onToggleBookmark={jest.fn()}
        />
      );

      const shareBtn = getByLabelText('Share entry');
      fireEvent.press(shareBtn);

      expect(spyShare).toHaveBeenCalledWith({
        title: 'धर्म',
        message: formatEntryText(mockEntry),
      });
    });
  });
});
