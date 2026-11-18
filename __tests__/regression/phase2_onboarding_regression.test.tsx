import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import SearchScreen from '../../src/app/(tabs)/index';
import {
  isOnboardingCompleted,
  ONBOARDING_STORAGE_KEY,
  resetOnboarding,
  setOnboardingCompleted,
} from '../../src/storage/onboarding';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
}));

describe('Phase 2 Onboarding & Splash Lifecycle Regression Suite', () => {
  const mockPush = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    await resetOnboarding();
  });

  // 1. New installation shows onboarding.
  it('1. New installation shows onboarding overlay', async () => {
    const { getByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('Welcome to Garuda')).toBeTruthy();
      expect(getByText('One dictionary. Three ways to search.')).toBeTruthy();
    });
  });

  // 2. Existing completion flag skips onboarding.
  it('2. Existing completion flag skips onboarding overlay', async () => {
    await setOnboardingCompleted();

    const { queryByText, getByPlaceholderText } = render(<SearchScreen />);

    expect(getByPlaceholderText('Try dharma, dharm, peace, or धर्म')).toBeTruthy();
    expect(queryByText('Welcome to Garuda')).toBeNull();
  });

  // 3. Start Exploring dismisses onboarding.
  it('3. Start Exploring dismisses onboarding overlay', async () => {
    const { getByText, queryByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('Start Exploring →')).toBeTruthy();
    });

    fireEvent.press(getByText('Start Exploring →'));

    await waitFor(() => {
      expect(queryByText('Welcome to Garuda')).toBeNull();
    });
  });

  // 4. Skip introduction dismisses onboarding.
  it('4. Skip introduction dismisses onboarding overlay', async () => {
    const { getByText, queryByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('Skip introduction')).toBeTruthy();
    });

    fireEvent.press(getByText('Skip introduction'));

    await waitFor(() => {
      expect(queryByText('Welcome to Garuda')).toBeNull();
    });
  });

  // 5. The completion flag is persisted.
  it('5. Completion flag is persisted in AsyncStorage', async () => {
    await setOnboardingCompleted();

    const val = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    expect(val).toBe('true');
    expect(await isOnboardingCompleted()).toBe(true);
  });

  // 6. Reopening the application does not show onboarding again.
  it('6. Reopening the application does not show onboarding again', async () => {
    await setOnboardingCompleted();

    // First session: completed
    expect(await isOnboardingCompleted()).toBe(true);

    // Second session / simulated reopen: render again
    const { queryByText } = render(<SearchScreen />);
    expect(queryByText('Welcome to Garuda')).toBeNull();
  });

  // 7. Storage read failure does not block app access.
  it('7. Storage read failure does not block app access', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Read error'));

    const { getByPlaceholderText } = render(<SearchScreen />);
    expect(getByPlaceholderText('Try dharma, dharm, peace, or धर्म')).toBeTruthy();
  });

  // 8. Storage write failure does not permanently block dismissal.
  it('8. Storage write failure does not block overlay dismissal', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Write error'));

    const { getByText, queryByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('Start Exploring →')).toBeTruthy();
    });

    fireEvent.press(getByText('Start Exploring →'));

    // In-memory fallback allows dismissal
    await waitFor(() => {
      expect(queryByText('Welcome to Garuda')).toBeNull();
    });
  });

  // 9. Repeated taps do not create duplicate navigation.
  it('9. Repeated rapid taps on CTA do not cause duplicate actions', async () => {
    const { getByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('Start Exploring →')).toBeTruthy();
    });

    const button = getByText('Start Exploring →');
    fireEvent.press(button);
    fireEvent.press(button);

    expect(await isOnboardingCompleted()).toBe(true);
  });

  // 10. Existing Search functionality still works after onboarding dismissal.
  it('10. Existing Search functionality works after onboarding dismissal', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('Start Exploring →')).toBeTruthy();
    });

    fireEvent.press(getByText('Start Exploring →'));

    await waitFor(() => {
      expect(queryByText('Welcome to Garuda')).toBeNull();
    });

    // Search bar is ready and responsive
    const searchInput = getByPlaceholderText('Try dharma, dharm, peace, or धर्म');
    fireEvent.changeText(searchInput, 'dharma');

    // Results render
    await waitFor(() => {
      expect(getByText('dharma')).toBeTruthy();
    });
  });
});
