import { fireEvent, render } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import EntryDetailScreen from '../../../src/app/entry/[id]';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

describe('EntryDetailScreen route (entry/[id])', () => {
  const mockBack = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      push: mockPush,
    });
  });

  it('renders word details for a valid entry id', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '11' });

    const { getByText, getAllByText } = render(<EntryDetailScreen />);

    expect(getByText('धर्म')).toBeTruthy();
    expect(getAllByText('dharma').length).toBeGreaterThanOrEqual(1);
    expect(getByText('noun (m.)')).toBeTruthy();
  });

  it('renders "Word not found" state with back button when id does not exist', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '9999' });

    const { getByText } = render(<EntryDetailScreen />);

    expect(getByText('Word not found')).toBeTruthy();
    expect(
      getByText('Entry #9999 does not exist in the dictionary.')
    ).toBeTruthy();

    const backButton = getByText('← Go back');
    fireEvent.press(backButton);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('renders "Word not found" state when id is not numeric', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'invalid-word' });

    const { getByText } = render(<EntryDetailScreen />);

    expect(getByText('Word not found')).toBeTruthy();
  });

  it('renders "WHY THIS MATCHED" card when opened with search match metadata', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: '11',
      query: 'duty',
      matchType: 'exact_meaning',
      matchedField: 'meanings',
      matchExplanation: 'Exact English meaning: "duty"',
    });

    const { getByText } = render(<EntryDetailScreen />);

    expect(getByText('WHY THIS MATCHED')).toBeTruthy();
    expect(getByText('Meaning match')).toBeTruthy();
    expect(getByText('Exact English meaning: "duty"')).toBeTruthy();
  });

  it('hides "WHY THIS MATCHED" card when opened without search parameters (e.g. from Lexicon)', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: '11',
    });

    const { queryByText } = render(<EntryDetailScreen />);

    expect(queryByText('WHY THIS MATCHED')).toBeNull();
  });

  it('calls router.back when the detail header back button is pressed', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '11' });

    const { getByText } = render(<EntryDetailScreen />);

    fireEvent.press(getByText('← BACK'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
