import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { POSFilter } from '../../src/components/POSFilter';

describe('POSFilter component tests', () => {
  it('renders all filter options', () => {
    const { getByText } = render(<POSFilter value="all" onChange={jest.fn()} />);

    expect(getByText('All types')).toBeTruthy();
    expect(getByText('Nouns')).toBeTruthy();
    expect(getByText('Verbs')).toBeTruthy();
    expect(getByText('Adjectives')).toBeTruthy();
  });

  it('calls onChange with selected value', () => {
    const onChange = jest.fn();
    const { getByText } = render(<POSFilter value="all" onChange={onChange} />);

    fireEvent.press(getByText('Nouns'));
    expect(onChange).toHaveBeenCalledWith('noun');

    fireEvent.press(getByText('Verbs'));
    expect(onChange).toHaveBeenCalledWith('verb');
  });
});
