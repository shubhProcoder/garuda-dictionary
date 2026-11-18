import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import SearchScreen from '../../../src/app/(tabs)/index';
import * as OnboardingStorage from '../../../src/storage/onboarding';

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
    jest.spyOn(OnboardingStorage, 'isOnboardingCompleted').mockResolvedValue(true);
    jest.spyOn(OnboardingStorage, 'setOnboardingCompleted').mockResolvedValue();
  });

  it('renders search bar, header, and idle discovery content initially for returning user', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<SearchScreen />);

    expect(getByPlaceholderText('Search dharma, धर्म or duty...')).toBeTruthy();
    expect(getByText('WORD OF THE DAY')).toBeTruthy();
    expect(getByText('Try a sample query')).toBeTruthy();
    expect(getByText('EXPLORE THE DICTIONARY')).toBeTruthy();

    // Returning user should NOT see onboarding modal
    expect(queryByText('Welcome to Garuda')).toBeNull();

    // Full 70-entry list is NOT on search home (it lives in Lexicon)
    expect(queryByText('ALL VERIFIED WORDS')).toBeNull();
  });

  it('navigates to word detail when Word of the Day is tapped', async () => {
    const { getByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('WORD OF THE DAY')).toBeTruthy();
    });

    fireEvent.press(getByText('WORD OF THE DAY'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/entry/[id]',
      params: { id: expect.any(String) },
    });
  });

  it('populates search query when passed via route params', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ q: 'peace' });

    const { getByDisplayValue } = render(<SearchScreen />);

    expect(getByDisplayValue('peace')).toBeTruthy();
  });

  it('displays onboarding overlay on first launch and dismisses on Start Exploring', async () => {
    jest.spyOn(OnboardingStorage, 'isOnboardingCompleted').mockResolvedValue(false);

    const { getByText, queryByText } = render(<SearchScreen />);

    // Onboarding should appear
    await waitFor(() => {
      expect(getByText('Welcome to Garuda')).toBeTruthy();
      expect(getByText('Start Exploring →')).toBeTruthy();
    });

    // Tap Start Exploring
    fireEvent.press(getByText('Start Exploring →'));

    // Should call setOnboardingCompleted
    expect(OnboardingStorage.setOnboardingCompleted).toHaveBeenCalledTimes(1);

    // Overlay dismissed
    await waitFor(() => {
      expect(queryByText('Welcome to Garuda')).toBeNull();
    });
  });

  it('dismisses onboarding and marks completed when Skip introduction is pressed', async () => {
    jest.spyOn(OnboardingStorage, 'isOnboardingCompleted').mockResolvedValue(false);

    const { getByText, queryByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('Welcome to Garuda')).toBeTruthy();
      expect(getByText('Skip introduction')).toBeTruthy();
    });

    fireEvent.press(getByText('Skip introduction'));

    expect(OnboardingStorage.setOnboardingCompleted).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(queryByText('Welcome to Garuda')).toBeNull();
    });
  });
});
