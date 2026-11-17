import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { EntryCard } from '../../src/components/EntryCard';
import { DictionaryEntry, SearchResult } from '../../src/types/dictionary';

describe('EntryCard component tests', () => {
  const mockEntry: DictionaryEntry = {
    id: 11,
    headword: 'धर्म',
    transliteration: 'dharma',
    romanised: ['dharma', 'dharm'],
    pos: 'noun (m.)',
    meanings: ['duty', 'religion', 'moral way of life'],
    example: 'धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।',
  };

  it('renders headword, transliteration, meaning, and POS badge', () => {
    const { getByText } = render(
      <EntryCard entry={mockEntry} onPress={jest.fn()} />
    );

    expect(getByText('धर्म')).toBeTruthy();
    expect(getByText('dharma')).toBeTruthy();
    expect(getByText('duty')).toBeTruthy();
    expect(getByText('noun')).toBeTruthy();
  });

  it('displays match explanation when search result is provided', () => {
    const searchResult: SearchResult = {
      entry: mockEntry,
      score: 95,
      matchType: 'exact_meaning',
      matchedField: 'meanings',
      matchExplanation: 'Exact English meaning: "duty"',
    };

    const { getByText } = render(
      <EntryCard entry={mockEntry} searchResult={searchResult} onPress={jest.fn()} />
    );

    expect(getByText('Exact English meaning: "duty"')).toBeTruthy();
  });

  it('fires onPress callback when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EntryCard entry={mockEntry} onPress={onPress} />
    );

    fireEvent.press(getByText('धर्म'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows bookmark star when bookmarked', () => {
    const { getByText } = render(
      <EntryCard entry={mockEntry} isBookmarked={true} onPress={jest.fn()} />
    );

    expect(getByText('★')).toBeTruthy();
  });
});
