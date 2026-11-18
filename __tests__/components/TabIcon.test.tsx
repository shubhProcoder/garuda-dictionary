import { render } from '@testing-library/react-native';
import React from 'react';
import { TabIcon } from '../../src/components/TabIcon';

describe('TabIcon', () => {
  it('renders appropriate glyphs for each tab', () => {
    const { getByText: getSearch } = render(
      <TabIcon name="search" color="#2B4AE8" focused={true} />
    );
    expect(getSearch('⌕', { includeHiddenElements: true })).toBeTruthy();

    const { getByText: getLexicon } = render(
      <TabIcon name="lexicon" color="#2B4AE8" focused={true} />
    );
    expect(getLexicon('📖', { includeHiddenElements: true })).toBeTruthy();

    const { getByText: getSavedFocused } = render(
      <TabIcon name="saved" color="#2B4AE8" focused={true} />
    );
    expect(getSavedFocused('★', { includeHiddenElements: true })).toBeTruthy();

    const { getByText: getSavedUnfocused } = render(
      <TabIcon name="saved" color="#77796F" focused={false} />
    );
    expect(getSavedUnfocused('☆', { includeHiddenElements: true })).toBeTruthy();

    const { getByText: getHistory } = render(
      <TabIcon name="history" color="#2B4AE8" focused={true} />
    );
    expect(getHistory('◷', { includeHiddenElements: true })).toBeTruthy();
  });
});
