/**
 * SuggestedQueries unit tests
 */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SuggestedQueries } from '../../src/components/SuggestedQueries';

describe('SuggestedQueries', () => {
  it('renders all 6 suggestion chips', () => {
    const { getByText } = render(<SuggestedQueries onSelect={jest.fn()} />);
    expect(getByText('dharma')).toBeTruthy();
    expect(getByText('धर्म')).toBeTruthy();
    expect(getByText('duty')).toBeTruthy();
    expect(getByText('bhaasha')).toBeTruthy();
    expect(getByText('शिक्षा')).toBeTruthy();
    expect(getByText('education')).toBeTruthy();
  });

  it('calls onSelect with the correct query when a chip is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(<SuggestedQueries onSelect={onSelect} />);

    fireEvent.press(getByText('dharma'));
    expect(onSelect).toHaveBeenCalledWith('dharma');
  });

  it('calls onSelect with Devanagari query when Devanagari chip is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(<SuggestedQueries onSelect={onSelect} />);

    fireEvent.press(getByText('धर्म'));
    expect(onSelect).toHaveBeenCalledWith('धर्म');
  });
});
