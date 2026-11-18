/**
 * WordOfTheDay unit tests
 */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { WordOfTheDay, getTodayIndex } from '../../src/components/WordOfTheDay';
import { DictionaryEntry } from '../../src/types/dictionary';

const mockEntries: DictionaryEntry[] = [
  {
    id: 1,
    headword: 'शिक्षा',
    transliteration: 'śikṣā',
    romanised: ['shiksha'],
    pos: 'noun (f.)',
    meanings: ['education', 'learning'],
    example: 'शिक्षा हर बच्चे का अधिकार है।',
  },
  {
    id: 7,
    headword: 'कर्म',
    transliteration: 'karma',
    romanised: ['karma', 'karm'],
    pos: 'noun (m.)',
    meanings: ['action', 'deed'],
    example: 'अच्छे कर्म का फल अच्छा होता है।',
  },
  {
    id: 11,
    headword: 'धर्म',
    transliteration: 'dharma',
    romanised: ['dharma', 'dharm'],
    pos: 'noun (m.)',
    meanings: ['duty', 'religion'],
    example: 'धर्म का अर्थ केवल पूजा नहीं।',
  },
];

describe('getTodayIndex', () => {
  it('returns 0 when total is 0 (safe empty guard)', () => {
    expect(getTodayIndex(0)).toBe(0);
  });

  it('returns a value within bounds of the dataset', () => {
    const idx = getTodayIndex(mockEntries.length);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(mockEntries.length);
  });

  it('is deterministic for the same Date.now() day', () => {
    // Fix the date so we can verify stability
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const idx1 = getTodayIndex(70);
    const idx2 = getTodayIndex(70);
    expect(idx1).toBe(idx2);
    jest.restoreAllMocks();
  });

  it('changes index when the day changes', () => {
    const day0Ms = 0 * 86_400_000;   // day 0
    const day1Ms = 1 * 86_400_000;   // day 1

    jest.spyOn(Date, 'now').mockReturnValue(day0Ms);
    const idxDay0 = getTodayIndex(70);
    jest.spyOn(Date, 'now').mockReturnValue(day1Ms);
    const idxDay1 = getTodayIndex(70);

    expect(idxDay0).not.toBe(idxDay1);
    jest.restoreAllMocks();
  });
});

describe('WordOfTheDay component', () => {
  it('renders nothing when entries is empty', () => {
    const { toJSON } = render(
      <WordOfTheDay entries={[]} onPress={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders the WORD OF THE DAY label', () => {
    const { getByText } = render(
      <WordOfTheDay entries={mockEntries} onPress={jest.fn()} />
    );
    expect(getByText('WORD OF THE DAY')).toBeTruthy();
  });

  it('renders a real entry headword from the dataset', () => {
    const { queryByText } = render(
      <WordOfTheDay entries={mockEntries} onPress={jest.fn()} />
    );
    // One of these headwords must appear
    const headwords = mockEntries.map((e) => e.headword);
    const found = headwords.some((hw) => queryByText(hw) !== null);
    expect(found).toBe(true);
  });

  it('calls onPress with the entry when the card is tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <WordOfTheDay entries={mockEntries} onPress={onPress} />
    );

    fireEvent.press(getByText('WORD OF THE DAY'));
    expect(onPress).toHaveBeenCalledTimes(1);
    // Called with a DictionaryEntry object
    expect(onPress).toHaveBeenCalledWith(expect.objectContaining({ id: expect.any(Number) }));
  });

  it('renders the bookmark icon', () => {
    const { queryByText } = render(
      <WordOfTheDay entries={mockEntries} onPress={jest.fn()} />
    );
    // Either filled (★) or empty (☆) star should appear
    const filled = queryByText('★');
    const empty = queryByText('☆');
    expect(filled !== null || empty !== null).toBe(true);
  });
});
