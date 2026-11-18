import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
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
    expect(getByText('1.0.0 (Phase 1 Native)')).toBeTruthy();
  });

  it('calls router.back when back button is pressed', () => {
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText('← BACK'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
