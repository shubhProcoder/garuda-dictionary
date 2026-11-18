import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { AppHeader } from '../../src/components/AppHeader';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('AppHeader', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders branding and status with custom entry count', () => {
    const { getByText } = render(<AppHeader totalCount={70} />);

    expect(getByText('GARUDA')).toBeTruthy();
    expect(getByText('DICTIONARY')).toBeTruthy();
    expect(getByText('70 Entries · Offline Ready')).toBeTruthy();
  });

  it('navigates to settings when gear button is pressed', () => {
    const { getByLabelText } = render(<AppHeader totalCount={70} />);

    const settingsButton = getByLabelText('Open settings');
    fireEvent.press(settingsButton);

    expect(mockPush).toHaveBeenCalledWith('/settings');
  });
});
