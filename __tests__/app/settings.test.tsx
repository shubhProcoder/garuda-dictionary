import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ThemeProvider } from '../../src/context/ThemeContext';
import SettingsScreen from '../../src/app/settings';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('SettingsScreen', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
  });

  it('renders application details and dictionary entry count', () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText('Garuda Dictionary')).toBeTruthy();
    expect(getByText('70 WORDS')).toBeTruthy();
    expect(getByText('100% OFFLINE READY')).toBeTruthy();
    expect(getByText('1.0.0')).toBeTruthy();
  });

  it('calls router.back when back button is pressed', () => {
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText('← BACK'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('renders theme selector options (Light, Dark, System) and updates on selection', async () => {
    const { getByText, getByLabelText } = render(
      <ThemeProvider>
        <SettingsScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('APPEARANCE')).toBeTruthy();
    });

    expect(getByText('Choose how Garuda looks on your device.')).toBeTruthy();

    const darkOption = getByLabelText('Dark theme: Comfortable low-light reading');
    expect(darkOption).toBeTruthy();
    fireEvent.press(darkOption);

    const systemOption = getByLabelText('System theme: Follow device appearance');
    expect(systemOption).toBeTruthy();
    fireEvent.press(systemOption);

    const lightOption = getByLabelText('Light theme: Garuda warm paper identity');
    expect(lightOption).toBeTruthy();
    fireEvent.press(lightOption);
  });

  it('renders Devanagari reading size options (Small, Medium, Large) and live preview', async () => {
    const { getByText, getByLabelText } = render(
      <ThemeProvider>
        <SettingsScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('DEVANAGARI READING SIZE')).toBeTruthy();
    });

    expect(getByText('Adjust the size of Hindi words throughout the app.')).toBeTruthy();
    expect(getByText('LIVE DEVANAGARI PREVIEW')).toBeTruthy();
    expect(getByText('धर्म · ज्ञान · प्रकाश')).toBeTruthy();

    const smallOption = getByLabelText('Small Devanagari reading size (90%)');
    expect(smallOption).toBeTruthy();
    fireEvent.press(smallOption);
    expect(getByText(/Sample headword rendering at small scale/)).toBeTruthy();

    const largeOption = getByLabelText('Large Devanagari reading size (115%)');
    expect(largeOption).toBeTruthy();
    fireEvent.press(largeOption);
    expect(getByText(/Sample headword rendering at large scale/)).toBeTruthy();

    const mediumOption = getByLabelText('Medium Devanagari reading size (100%)');
    expect(mediumOption).toBeTruthy();
    fireEvent.press(mediumOption);
    expect(getByText(/Sample headword rendering at medium scale/)).toBeTruthy();
  });
});
