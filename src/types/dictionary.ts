export type POSFilterValue = 'all' | 'noun' | 'verb' | 'adjective';

export interface DictionaryEntry {
  id: number;
  headword: string;
  transliteration: string;
  romanised: string[];
  pos: string;
  meanings: string[];
  example: string;
}

export type MatchType =
  | 'exact_devanagari'
  | 'partial_devanagari'
  | 'exact_roman'
  | 'prefix_roman'
  | 'substring_roman'
  | 'fuzzy_roman'
  | 'exact_meaning'
  | 'partial_meaning';

export type MatchedField = 'headword' | 'transliteration' | 'romanised' | 'meanings';

export interface SearchResult {
  entry: DictionaryEntry;
  score: number;
  matchType: MatchType;
  matchedField: MatchedField;
  matchExplanation: string;
}

export interface DictionaryIndex {
  entries: DictionaryEntry[];
  entryById: Map<number, DictionaryEntry>;
  romanKeysByEntryId: Map<number, string[]>;
  devanagariByEntryId: Map<number, string>;
  meaningsByEntryId: Map<
    number,
    Array<{
      original: string;
      normalized: string;
      words: string[];
    }>
  >;
}
