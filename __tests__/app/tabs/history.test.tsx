import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
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
    expect(getByText('Your search history is empty.')).toBeTruthy();
    expect(getByText('Your recent dictionary searches will appear here.')).toBeTruthy();
    expect(getByText(/Start searching/i)).toBeTruthy();
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

  it('prompts confirmation and calls clearRecents when Clear all button is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    (useRecentSearches as jest.Mock).mockReturnValue({
      recents: ['dharma'],
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

    // Trigger the confirmation action callback
    const buttons = alertSpy.mock.calls[0][2];
    const confirmBtn = buttons?.find((btn: any) => btn.text === 'Clear All');
    confirmBtn?.onPress?.();

    expect(mockClearRecents).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('renders matching entry preview for recognized dictionary headword query', async () => {
    (useRecentSearches as jest.Mock).mockReturnValue({
      recents: ['dharma'],
      isLoading: false,
      addRecent: jest.fn(),
      clearRecents: mockClearRecents,
    });

    const { findByText, getByText } = render(<HistoryScreen />);

    expect(getByText('dharma')).toBeTruthy();
    // Since 'dharma' matches entry id 11, it shows preview containing headword and transliteration
    expect(await findByText(/धर्म \(dharma\)/)).toBeTruthy();
  });
});
