import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import HistoryScreen from '../../../src/app/(tabs)/history';
import { useRecentSearches } from '../../../src/hooks/useRecentSearches';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../src/hooks/useRecentSearches');

describe('HistoryScreen (Tab 4)', () => {
  const mockPush = jest.fn();
  const mockClearRecents = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders empty state when no recent searches exist', () => {
    (useRecentSearches as jest.Mock).mockReturnValue({
      recents: [],
      isLoading: false,
      addRecent: jest.fn(),
      clearRecents: mockClearRecents,
    });

    const { getByText } = render(<HistoryScreen />);

    expect(getByText('NO RECENT SEARCHES')).toBeTruthy();
    expect(getByText('Your history is clean.')).toBeTruthy();
    expect(getByText('Start Searching ↗')).toBeTruthy();
  });

  it('renders recent searches and navigates to Search tab with query parameter on tap', () => {
    (useRecentSearches as jest.Mock).mockReturnValue({
      recents: ['dharma', 'shiksha'],
      isLoading: false,
      addRecent: jest.fn(),
      clearRecents: mockClearRecents,
    });

    const { getByText } = render(<HistoryScreen />);

    expect(getByText('dharma')).toBeTruthy();
    expect(getByText('shiksha')).toBeTruthy();

    fireEvent.press(getByText('dharma'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(tabs)',
      params: { q: 'dharma' },
    });
  });

  it('calls clearRecents when Clear all button is pressed', () => {
    (useRecentSearches as jest.Mock).mockReturnValue({
      recents: ['dharma'],
      isLoading: false,
      addRecent: jest.fn(),
      clearRecents: mockClearRecents,
    });

    const { getByText } = render(<HistoryScreen />);

    fireEvent.press(getByText('Clear all'));

    expect(mockClearRecents).toHaveBeenCalledTimes(1);
  });
});
