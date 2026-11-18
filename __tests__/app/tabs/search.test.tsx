import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import SearchScreen from '../../../src/app/(tabs)/index';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

describe('SearchScreen (Tab 1)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  it('renders search bar, header, and all entries initially', async () => {
    const { getByText, getByPlaceholderText } = render(<SearchScreen />);

    expect(getByPlaceholderText('Try dharma, dharm, peace, or धर्म')).toBeTruthy();
    expect(getByText('ALL VERIFIED WORDS')).toBeTruthy();
    expect(getByText('70 words')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('शिक्षा')).toBeTruthy();
    });
  });

  it('navigates to word detail when an entry card is tapped', async () => {
    const { getByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('शिक्षा')).toBeTruthy();
    });

    const entryCard = getByText('शिक्षा');
    fireEvent.press(entryCard);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/entry/[id]',
      params: { id: '1' },
    });
  });

  it('populates search query when passed via route params', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ q: 'peace' });

    const { getByDisplayValue } = render(<SearchScreen />);

    expect(getByDisplayValue('peace')).toBeTruthy();
  });
});
