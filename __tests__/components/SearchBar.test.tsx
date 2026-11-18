import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SearchBar } from '../../src/components/SearchBar';

describe('SearchBar component tests', () => {
  it('renders search input with placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} onClear={jest.fn()} />
    );
    expect(getByPlaceholderText('Search dharma, धर्म or duty...')).toBeTruthy();
  });

  it('calls onChangeText when typing text', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={onChangeText} onClear={jest.fn()} />
    );

    fireEvent.changeText(getByPlaceholderText('Search dharma, धर्म or duty...'), 'dharma');
    expect(onChangeText).toHaveBeenCalledWith('dharma');
  });

  it('renders clear button when value is non-empty and fires onClear', () => {
    const onClear = jest.fn();
    const { getByLabelText } = render(
      <SearchBar value="dharma" onChangeText={jest.fn()} onClear={onClear} />
    );

    const clearButton = getByLabelText('Clear search text');
    expect(clearButton).toBeTruthy();
    fireEvent.press(clearButton);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not render clear button when value is empty', () => {
    const { queryByLabelText } = render(
      <SearchBar value="" onChangeText={jest.fn()} onClear={jest.fn()} />
    );
    expect(queryByLabelText('Clear search text')).toBeNull();
  });
});
