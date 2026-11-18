/**
 * Phase 3 Search Discovery regression suite
 *
 * Verifies idle discovery state, suggested queries, script indicator,
 * and active search state all function correctly.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import SearchScreen from '../../src/app/(tabs)/index';
import * as OnboardingStorage from '../../src/storage/onboarding';

// Pre-mark onboarding complete so we see the full search screen
beforeEach(async () => {
  await AsyncStorage.clear();
  await OnboardingStorage.setOnboardingCompleted();
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  (useLocalSearchParams as jest.Mock).mockReturnValue({});
});

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

describe('Phase 3 — Search Discovery', () => {
  // 1. Idle state renders discovery content
  it('1. Idle state renders WORD OF THE DAY and suggested queries', async () => {
    const { getByText } = render(<SearchScreen />);
    await waitFor(() => {
      expect(getByText('WORD OF THE DAY')).toBeTruthy();
    });
    // Suggested queries section heading
    expect(getByText('Try a sample query')).toBeTruthy();
  });

  // 2. ScriptIndicator is hidden when query is empty (idle)
  it('2. Script indicator is not shown when query is empty', async () => {
    const { queryByText } = render(<SearchScreen />);
    await waitFor(() => {
      // Neither DEVANAGARI nor ROMAN badge should appear initially
      expect(queryByText('DEVANAGARI')).toBeNull();
      expect(queryByText('ROMAN')).toBeNull();
    });
  });

  // 3. Suggested query chips execute search when tapped
  it('3. Tapping a suggested query chip executes search', async () => {
    const { getByText, queryByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('dharma')).toBeTruthy();
    });

    // Find and press the chip (specifically the button role)
    fireEvent.press(getByText('dharma'));

    // Discovery content should collapse (WOTD is hidden when hasQuery)
    await waitFor(() => {
      expect(queryByText('WORD OF THE DAY')).toBeNull();
    });
  });

  // 4. Clearing search restores idle discovery
  it('4. Clearing search restores idle discovery state', async () => {
    const { getByText, getByLabelText, queryByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('WORD OF THE DAY')).toBeTruthy();
    });

    // Type something to trigger active search
    const input = getByLabelText('Search Hindi words in Devanagari, Roman, or English');
    fireEvent.changeText(input, 'dharma');

    await waitFor(() => {
      expect(queryByText('WORD OF THE DAY')).toBeNull();
    });

    // Clear search
    fireEvent.changeText(input, '');

    await waitFor(() => {
      expect(getByText('WORD OF THE DAY')).toBeTruthy();
    });
  });

  // 5. ALL VERIFIED WORDS section heading is visible in idle
  it('5. ALL VERIFIED WORDS section heading is visible in idle state', async () => {
    const { getByText } = render(<SearchScreen />);
    await waitFor(() => {
      expect(getByText('ALL VERIFIED WORDS')).toBeTruthy();
    });
  });

  // 6. SEARCH RESULTS heading appears when typing
  it('6. SEARCH RESULTS heading appears when query is active', async () => {
    const { getByText, getByLabelText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(getByText('ALL VERIFIED WORDS')).toBeTruthy();
    });

    const input = getByLabelText('Search Hindi words in Devanagari, Roman, or English');
    fireEvent.changeText(input, 'dharma');

    await waitFor(() => {
      expect(getByText('SEARCH RESULTS')).toBeTruthy();
    });
  });

  // 7. No-results state shows helpful message
  it('7. No-results state shows helpful message for unmatched query', async () => {
    const { getByLabelText, getByText } = render(<SearchScreen />);

    const input = getByLabelText('Search Hindi words in Devanagari, Roman, or English');
    fireEvent.changeText(input, 'zzzzzzzzzzzzzzzzzzz');

    await waitFor(() => {
      expect(getByText("That word isn't here yet.")).toBeTruthy();
    });
  });

  // 8. History route parameter still populates search
  it('8. History route parameter populates the search input', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ q: 'karma' });
    const { getByDisplayValue, getAllByDisplayValue } = render(<SearchScreen />);
    // At least one input should have value "karma"
    const inputs = getAllByDisplayValue('karma');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
