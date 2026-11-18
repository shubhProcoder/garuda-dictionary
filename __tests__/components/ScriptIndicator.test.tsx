/**
 * ScriptIndicator unit tests
 */
import { render } from '@testing-library/react-native';
import React from 'react';
import { ScriptIndicator } from '../../src/components/ScriptIndicator';

describe('ScriptIndicator', () => {
  it('renders nothing when query is empty', () => {
    const { toJSON } = render(<ScriptIndicator query="" />);
    expect(toJSON()).toBeNull();
  });

  it('shows DEVANAGARI badge when query contains Devanagari characters', () => {
    const { getByText } = render(<ScriptIndicator query="धर्म" />);
    expect(getByText('DEVANAGARI')).toBeTruthy();
  });

  it('shows ROMAN badge when query uses Latin characters', () => {
    const { getByText } = render(<ScriptIndicator query="dharma" />);
    expect(getByText('ROMAN')).toBeTruthy();
  });

  it('shows DEVANAGARI for mixed query starting with Devanagari', () => {
    const { getByText } = render(<ScriptIndicator query="धर्म dharma" />);
    expect(getByText('DEVANAGARI')).toBeTruthy();
  });
});
