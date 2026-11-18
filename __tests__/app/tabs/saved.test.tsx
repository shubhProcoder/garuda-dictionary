import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import SavedScreen from '../../../src/app/(tabs)/saved';
import { useBookmarks } from '../../../src/hooks/useBookmarks';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../src/hooks/useBookmarks');

describe('SavedScreen (Tab 3)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders empty state when no words are bookmarked', () => {
    (useBookmarks as jest.Mock).mockReturnValue({
      bookmarks: [],
      isLoading: false,
      isBookmarked: jest.fn().mockReturnValue(false),
      getSavedEntries: jest.fn().mockReturnValue([]),
      toggleBookmark: jest.fn(),
    });

    const { getByText } = render(<SavedScreen />);

    expect(getByText('YOUR SAVED WORDS')).toBeTruthy();
    expect(getByText('Your collection starts here.')).toBeTruthy();
    expect(getByText('0 saved')).toBeTruthy();
  });

  it('renders bookmarked entry cards and navigates on tap', async () => {
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
      toggleBookmark: jest.fn(),
    });

    const { getByText } = render(<SavedScreen />);

    expect(getByText('1 saved')).toBeTruthy();
    expect(getByText('धर्म')).toBeTruthy();

    fireEvent.press(getByText('धर्म'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/entry/[id]',
      params: { id: '11' },
    });
  });
});
