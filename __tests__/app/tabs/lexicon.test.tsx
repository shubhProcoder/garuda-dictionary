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

  it('renders all 70 entries and POS filter chips', async () => {
    const { getByText } = render(<LexiconScreen />);

    expect(getByText('THE COLLECTION')).toBeTruthy();
    expect(getByText('Lexicon')).toBeTruthy();
    expect(getByText('70 of 70')).toBeTruthy();
    expect(getByText('All types')).toBeTruthy();
    expect(getByText('Nouns')).toBeTruthy();
    expect(getByText('Verbs')).toBeTruthy();
    expect(getByText('Adjectives')).toBeTruthy();

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
