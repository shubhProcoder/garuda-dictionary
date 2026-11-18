import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import LexiconScreen from '../../../src/app/(tabs)/lexicon';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('LexiconScreen (Tab 2)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders all 70 entries and POS filter chips with exact counts', async () => {
    const { getByText } = render(<LexiconScreen />);

    expect(getByText('THE COLLECTION')).toBeTruthy();
    expect(getByText('Lexicon')).toBeTruthy();
    expect(getByText('70 of 70')).toBeTruthy();
    expect(getByText('All types')).toBeTruthy();
    expect(getByText('Nouns')).toBeTruthy();
    expect(getByText('Verbs')).toBeTruthy();
    expect(getByText('Adjectives')).toBeTruthy();

    // Verify exact calculated counts from actual dictionary data (47 nouns, 14 verbs, 9 adjectives)
    expect(getByText('70')).toBeTruthy();
    expect(getByText('47')).toBeTruthy();
    expect(getByText('14')).toBeTruthy();
    expect(getByText('9')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('शिक्षा')).toBeTruthy();
    });
  });

  it('filters entries when a POS chip is selected', async () => {
    const { getByText } = render(<LexiconScreen />);

    // Tap 'Verbs' filter chip
    fireEvent.press(getByText('Verbs'));

    // Should now show 14 verbs of 70
    await waitFor(() => {
      expect(getByText('14 of 70')).toBeTruthy();
    });
  });

  it('filters entries with scoped local search input', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<LexiconScreen />);

    const searchInput = getByPlaceholderText('Filter words in lexicon...');
    expect(searchInput).toBeTruthy();

    // Search for 'dharma'
    fireEvent.changeText(searchInput, 'dharma');

    await waitFor(() => {
      expect(getByText('धर्म')).toBeTruthy();
      expect(getByText('1 of 70')).toBeTruthy();
      // Unrelated entry should not be shown
      expect(queryByText('शिक्षा')).toBeNull();
    });
  });

  it('shows empty filter state and resets on button press', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<LexiconScreen />);

    const searchInput = getByPlaceholderText('Filter words in lexicon...');
    fireEvent.changeText(searchInput, 'nonexistentwordxyz');

    await waitFor(() => {
      expect(getByText('0 of 70')).toBeTruthy();
      expect(getByText('No matching words found.')).toBeTruthy();
      expect(getByText('Reset filters ↗')).toBeTruthy();
    });

    // Press reset filters
    fireEvent.press(getByText('Reset filters ↗'));

    await waitFor(() => {
      expect(getByText('70 of 70')).toBeTruthy();
      expect(queryByText('No matching words found.')).toBeNull();
    });
  });

  it('navigates to word detail when an entry card is tapped', async () => {
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
