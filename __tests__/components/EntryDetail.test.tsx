import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { EntryDetail } from '../../src/components/EntryDetail';
import { DictionaryEntry } from '../../src/types/dictionary';

describe('EntryDetail component tests', () => {
  const mockEntry: DictionaryEntry = {
    id: 11,
    headword: 'धर्म',
    transliteration: 'dharma',
    romanised: ['dharma', 'dharm'],
    pos: 'noun (m.)',
    meanings: ['duty', 'religion', 'moral way of life'],
    example: 'धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।',
  };

  it('renders complete word details including meanings and example', () => {
    const { getByText, getAllByText } = render(
      <EntryDetail
        entry={mockEntry}
        isBookmarked={false}
        onToggleBookmark={jest.fn()}
      />
    );

    expect(getByText('धर्म')).toBeTruthy();
    expect(getAllByText('dharma').length).toBeGreaterThanOrEqual(1);
    expect(getByText('noun (m.)')).toBeTruthy();
    expect(getByText('duty')).toBeTruthy();
    expect(getByText('religion')).toBeTruthy();
    expect(getByText('moral way of life')).toBeTruthy();
    expect(getByText('dharm')).toBeTruthy();
    expect(getByText('धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।')).toBeTruthy();
  });

  it('toggles bookmark button and calls callback', () => {
    const onToggleBookmark = jest.fn();
    const { getByText } = render(
      <EntryDetail
        entry={mockEntry}
        isBookmarked={false}
        onToggleBookmark={onToggleBookmark}
      />
    );

    const button = getByText('SAVE WORD');
    fireEvent.press(button);
    expect(onToggleBookmark).toHaveBeenCalledTimes(1);
  });

  it('renders saved state when isBookmarked is true', () => {
    const { getByText } = render(
      <EntryDetail
        entry={mockEntry}
        isBookmarked={true}
        onToggleBookmark={jest.fn()}
      />
    );

    expect(getByText('SAVED')).toBeTruthy();
  });
});
