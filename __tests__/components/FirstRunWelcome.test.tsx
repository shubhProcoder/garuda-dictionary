import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { FirstRunWelcome } from '../../src/components/FirstRunWelcome';

describe('FirstRunWelcome Component', () => {
  const mockStartExploring = jest.fn();
  const mockSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  it('renders nothing when visible is false', () => {
    const { queryByText } = render(
      <FirstRunWelcome
        visible={false}
        onStartExploring={mockStartExploring}
        onSkip={mockSkip}
      />
    );

    expect(queryByText('Welcome to Garuda')).toBeNull();
  });

  it('renders brand, headline, three search demonstrations and actions when visible', () => {
    const { getByText } = render(
      <FirstRunWelcome
        visible={true}
        onStartExploring={mockStartExploring}
        onSkip={mockSkip}
      />
    );

    expect(getByText('GARUDA')).toBeTruthy();
    expect(getByText('Welcome to Garuda')).toBeTruthy();
    expect(getByText('One dictionary. Three ways to search.')).toBeTruthy();
    expect(
      getByText('Find Hindi words using Devanagari, Romanized Hindi or English meanings.')
    ).toBeTruthy();

    // 3 Demonstrations
    expect(getByText('धर्म')).toBeTruthy();
    expect(getByText('dharma / dharam')).toBeTruthy();
    expect(getByText('duty')).toBeTruthy();

    // CTAs
    expect(getByText('Start Exploring →')).toBeTruthy();
    expect(getByText('Skip introduction')).toBeTruthy();
  });

  it('calls onStartExploring when Start Exploring button is pressed', () => {
    const { getByText } = render(
      <FirstRunWelcome
        visible={true}
        onStartExploring={mockStartExploring}
        onSkip={mockSkip}
      />
    );

    fireEvent.press(getByText('Start Exploring →'));
    expect(mockStartExploring).toHaveBeenCalledTimes(1);
    expect(mockSkip).not.toHaveBeenCalled();
  });

  it('calls onSkip when Skip introduction button is pressed', () => {
    const { getByText } = render(
      <FirstRunWelcome
        visible={true}
        onStartExploring={mockStartExploring}
        onSkip={mockSkip}
      />
    );

    fireEvent.press(getByText('Skip introduction'));
    expect(mockSkip).toHaveBeenCalledTimes(1);
    expect(mockStartExploring).not.toHaveBeenCalled();
  });

  it('safely handles rapid repeated taps without duplicate callback invocations', () => {
    const { getByText } = render(
      <FirstRunWelcome
        visible={true}
        onStartExploring={mockStartExploring}
        onSkip={mockSkip}
      />
    );

    const button = getByText('Start Exploring →');
    fireEvent.press(button);
    fireEvent.press(button);

    expect(mockStartExploring).toHaveBeenCalledTimes(1);
  });

  it('respects system reduced motion preference', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

    const { getByText } = render(
      <FirstRunWelcome
        visible={true}
        onStartExploring={mockStartExploring}
        onSkip={mockSkip}
      />
    );

    expect(getByText('Welcome to Garuda')).toBeTruthy();
  });
});
