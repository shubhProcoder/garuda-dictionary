/**
 * WordOfTheDay unit tests
 */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { WordOfTheDay, getTodayIndex, getLocalDayNumber } from '../../src/components/WordOfTheDay';
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

describe('Word of the Day — Local Date Logic', () => {
  it('returns 0 when total is 0 (safe empty guard)', () => {
    expect(getTodayIndex(0)).toBe(0);
  });

  it('returns a value within bounds of the dataset', () => {
    const idx = getTodayIndex(mockEntries.length);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(mockEntries.length);
  });

  // 1. Same local date produces the same selected entry (morning, noon, late night)
  it('1. Same local date produces the same selected entry throughout the day', () => {
    const morning = new Date(2026, 10, 18, 6, 30, 0); // 2026-11-18 06:30 AM
    const noon = new Date(2026, 10, 18, 12, 0, 0);    // 2026-11-18 12:00 PM
    const night = new Date(2026, 10, 18, 23, 59, 59); // 2026-11-18 11:59:59 PM

    const morningIdx = getTodayIndex(70, morning);
    const noonIdx = getTodayIndex(70, noon);
    const nightIdx = getTodayIndex(70, night);

    expect(morningIdx).toBe(noonIdx);
    expect(noonIdx).toBe(nightIdx);
  });

  // 2. Next local date produces the next deterministic selection (rotates after local midnight)
  it('2. Next local date produces the next deterministic selection after local midnight', () => {
    const day1BeforeMidnight = new Date(2026, 10, 18, 23, 59, 59);
    const day2AfterMidnight = new Date(2026, 10, 19, 0, 0, 1);

    const day1Num = getLocalDayNumber(day1BeforeMidnight);
    const day2Num = getLocalDayNumber(day2AfterMidnight);

    expect(day2Num).toBe(day1Num + 1);

    const idx1 = getTodayIndex(70, day1BeforeMidnight);
    const idx2 = getTodayIndex(70, day2AfterMidnight);
    expect(idx2).toBe((idx1 + 1) % 70);
  });

  // 3. Month boundary works
  it('3. Month boundary correctly advances the deterministic selection', () => {
    const lastDayOfOct = new Date(2026, 9, 31, 23, 30, 0); // Oct 31, 2026
    const firstDayOfNov = new Date(2026, 10, 1, 0, 30, 0);  // Nov 1, 2026

    const octNum = getLocalDayNumber(lastDayOfOct);
    const novNum = getLocalDayNumber(firstDayOfNov);

    expect(novNum).toBe(octNum + 1);

    const idxOct = getTodayIndex(70, lastDayOfOct);
    const idxNov = getTodayIndex(70, firstDayOfNov);
    expect(idxNov).toBe((idxOct + 1) % 70);
  });

  // 4. Year boundary works
  it('4. Year boundary correctly advances the deterministic selection', () => {
    const newYearsEve = new Date(2026, 11, 31, 23, 45, 0); // Dec 31, 2026
    const newYearsDay = new Date(2027, 0, 1, 0, 15, 0);    // Jan 1, 2027

    const eveNum = getLocalDayNumber(newYearsEve);
    const dayNum = getLocalDayNumber(newYearsDay);

    expect(dayNum).toBe(eveNum + 1);

    const idxEve = getTodayIndex(70, newYearsEve);
    const idxDay = getTodayIndex(70, newYearsDay);
    expect(idxDay).toBe((idxEve + 1) % 70);
  });

  // 5. The implementation uses local calendar components rather than UTC epoch-day division
  it('5. Uses local calendar components (getFullYear, getMonth, getDate) rather than raw UTC epoch-day division', () => {
    const testDate = new Date(2026, 5, 15, 14, 0, 0);
    const spyYear = jest.spyOn(testDate, 'getFullYear');
    const spyMonth = jest.spyOn(testDate, 'getMonth');
    const spyDate = jest.spyOn(testDate, 'getDate');

    getLocalDayNumber(testDate);

    expect(spyYear).toHaveBeenCalled();
    expect(spyMonth).toHaveBeenCalled();
    expect(spyDate).toHaveBeenCalled();

    spyYear.mockRestore();
    spyMonth.mockRestore();
    spyDate.mockRestore();
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
