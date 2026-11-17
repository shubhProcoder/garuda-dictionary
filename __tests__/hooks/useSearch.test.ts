import { act, renderHook } from '@testing-library/react-native';
import entriesJson from '../../src/data/entries.json';
import { buildDictionaryIndex } from '../../src/engine/index-builder';
import { useSearch } from '../../src/hooks/useSearch';

describe('useSearch hook tests', () => {
  const index = buildDictionaryIndex(entriesJson);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with empty query and empty results', () => {
    const { result } = renderHook(() => useSearch({ index, debounceMs: 50 }));
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.hasQuery).toBe(false);
  });

  it('debounces search input and returns results', () => {
    const { result } = renderHook(() => useSearch({ index, debounceMs: 50 }));

    act(() => {
      result.current.setQuery('dharma');
    });

    expect(result.current.query).toBe('dharma');
    expect(result.current.results).toEqual([]);

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.results.length).toBeGreaterThan(0);
    expect(result.current.results[0].entry.id).toBe(11);
  });

  it('clears query and results', () => {
    const { result } = renderHook(() => useSearch({ index, debounceMs: 50 }));

    act(() => {
      result.current.setQuery('dharma');
    });
    act(() => {
      jest.runAllTimers();
    });
    expect(result.current.results.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearQuery();
    });
    act(() => {
      jest.runAllTimers();
    });
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
  });

  it('filters results by part of speech', () => {
    const { result } = renderHook(() => useSearch({ index, debounceMs: 50 }));

    act(() => {
      result.current.setQuery('duty');
    });
    act(() => {
      jest.runAllTimers();
    });

    const initialCount = result.current.results.length;
    expect(initialCount).toBeGreaterThan(0);

    // Apply verb filter
    act(() => {
      result.current.setPosFilter('verb');
    });
    expect(result.current.results.length).toBe(0);

    // Switch back to noun
    act(() => {
      result.current.setPosFilter('noun');
    });
    expect(result.current.results.length).toBe(initialCount);
  });
});
