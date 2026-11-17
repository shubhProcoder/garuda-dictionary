import {
  DictionaryEntry,
  DictionaryIndex,
  MatchedField,
  MatchType,
  SearchResult,
} from '../types/dictionary';
import { buildDictionaryIndex } from './index-builder';
import {
  isDevanagari,
  normalizeDevanagari,
  normalizeEnglish,
  normalizeRoman,
} from './normalize';

/**
 * Calculates Damerau-Levenshtein distance with early exit threshold.
 * Counts insertions, deletions, substitutions, and adjacent transpositions.
 */
export function damerauLevenshteinWithin(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  if (a === b) return 0;
  if (a.length === 0) return b.length <= limit ? b.length : limit + 1;
  if (b.length === 0) return a.length <= limit ? a.length : limit + 1;

  const la = a.length;
  const lb = b.length;

  // Matrix of size (la + 2) x (lb + 2)
  const d: number[][] = Array.from({ length: la + 2 }, () =>
    new Array<number>(lb + 2).fill(0)
  );

  const maxDist = la + lb;
  d[0][0] = maxDist;

  for (let i = 0; i <= la; i++) {
    d[i + 1][0] = maxDist;
    d[i + 1][1] = i;
  }
  for (let j = 0; j <= lb; j++) {
    d[0][j + 1] = maxDist;
    d[1][j + 1] = j;
  }

  const lastSeen: Record<string, number> = {};

  for (let i = 1; i <= la; i++) {
    let db = 0;
    for (let j = 1; j <= lb; j++) {
      const i1 = lastSeen[b[j - 1]] || 0;
      const j1 = db;
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
        db = j;
      }

      d[i + 1][j + 1] = Math.min(
        d[i][j + 1] + 1, // deletion
        d[i + 1][j] + 1, // insertion
        d[i][j] + cost, // substitution
        d[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1) // transposition
      );
    }
    lastSeen[a[i - 1]] = i;
  }

  const result = d[la + 1][lb + 1];
  return result <= limit ? result : limit + 1;
}

interface MatchCandidate {
  score: number;
  matchType: MatchType;
  matchedField: MatchedField;
  matchExplanation: string;
}

function scoreRomanMatch(query: string, keys: string[]): MatchCandidate | null {
  let best: MatchCandidate | null = null;

  for (const key of keys) {
    if (key === query) {
      return {
        score: 100,
        matchType: 'exact_roman',
        matchedField: 'romanised',
        matchExplanation: `Exact Roman match (${key})`,
      };
    }

    if (key.startsWith(query)) {
      if (!best || best.score < 80) {
        best = {
          score: 80,
          matchType: 'prefix_roman',
          matchedField: 'romanised',
          matchExplanation: `Starts with "${query}" (${key})`,
        };
      }
    } else if (key.includes(query)) {
      if (!best || best.score < 65) {
        best = {
          score: 65,
          matchType: 'substring_roman',
          matchedField: 'romanised',
          matchExplanation: `Contains "${query}" (${key})`,
        };
      }
    } else if (query.length >= 4) {
      // Damerau-Levenshtein allows transposition ("dhrama" -> "dharma") as 1 step
      const maxDistance = query.length >= 8 ? 2 : 1;
      const distance = damerauLevenshteinWithin(query, key, maxDistance);
      if (distance <= maxDistance) {
        const score = 48 - distance * 4;
        if (!best || best.score < score) {
          best = {
            score,
            matchType: 'fuzzy_roman',
            matchedField: 'romanised',
            matchExplanation: `Similar spelling to "${key}"`,
          };
        }
      }
    }
  }

  return best;
}

function scoreEnglishMatch(
  query: string,
  meanings: Array<{ original: string; normalized: string; words: string[] }>
): MatchCandidate | null {
  let best: MatchCandidate | null = null;

  for (const item of meanings) {
    // Exact meaning match (e.g. "duty" === "duty")
    if (item.normalized === query) {
      return {
        score: 95,
        matchType: 'exact_meaning',
        matchedField: 'meanings',
        matchExplanation: `Exact English meaning: "${item.original}"`,
      };
    }

    // Exact word inside multi-word meaning (e.g. "duty" in "moral duty")
    if (item.words.includes(query)) {
      if (!best || best.score < 90) {
        best = {
          score: 90,
          matchType: 'exact_meaning',
          matchedField: 'meanings',
          matchExplanation: `English meaning contains word "${query}": "${item.original}"`,
        };
      }
    } else if (item.normalized.startsWith(query) || item.words.some((w) => w.startsWith(query))) {
      if (!best || best.score < 75) {
        best = {
          score: 75,
          matchType: 'partial_meaning',
          matchedField: 'meanings',
          matchExplanation: `English meaning starts with "${query}": "${item.original}"`,
        };
      }
    } else if (query.length >= 3 && item.normalized.includes(query)) {
      if (!best || best.score < 60) {
        best = {
          score: 60,
          matchType: 'partial_meaning',
          matchedField: 'meanings',
          matchExplanation: `English meaning contains "${query}": "${item.original}"`,
        };
      }
    }
  }

  return best;
}

/**
 * Searches dictionary entries with Devanagari, Romanized/IAST transliteration,
 * typo tolerance, and English meanings.
 *
 * An empty or whitespace-only query returns [] (browsing is handled by the UI layer).
 */
export function searchEntries(
  source: DictionaryEntry[] | DictionaryIndex,
  rawQuery: unknown
): SearchResult[] {
  const query = String(rawQuery ?? '').trim();
  if (!query) {
    return [];
  }

  const index: DictionaryIndex = Array.isArray(source)
    ? buildDictionaryIndex(source)
    : source;

  // 1. Devanagari search path
  if (isDevanagari(query)) {
    const normalizedQuery = normalizeDevanagari(query);
    const results: SearchResult[] = [];

    for (const entry of index.entries) {
      const headword = index.devanagariByEntryId.get(entry.id) ?? normalizeDevanagari(entry.headword);

      if (headword === normalizedQuery) {
        results.push({
          entry,
          score: 100,
          matchType: 'exact_devanagari',
          matchedField: 'headword',
          matchExplanation: 'Exact Devanagari match',
        });
      } else if (headword.includes(normalizedQuery)) {
        results.push({
          entry,
          score: 75,
          matchType: 'partial_devanagari',
          matchedField: 'headword',
          matchExplanation: `Devanagari contains "${query}"`,
        });
      }
    }

    return results.sort(
      (a, b) => b.score - a.score || a.entry.headword.localeCompare(b.entry.headword, 'hi')
    );
  }

  // 2. Romanized & English meanings search path
  const normalizedRomanQuery = normalizeRoman(query);
  const normalizedEnglishQuery = normalizeEnglish(query);

  if (!normalizedRomanQuery && !normalizedEnglishQuery) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const entry of index.entries) {
    const romanKeys = index.romanKeysByEntryId.get(entry.id) ?? [];
    const meanings = index.meaningsByEntryId.get(entry.id) ?? [];

    const romanMatch = normalizedRomanQuery
      ? scoreRomanMatch(normalizedRomanQuery, romanKeys)
      : null;

    const englishMatch = normalizedEnglishQuery
      ? scoreEnglishMatch(normalizedEnglishQuery, meanings)
      : null;

    // Pick highest scoring candidate for this entry
    let bestCandidate: MatchCandidate | null = null;
    if (romanMatch && englishMatch) {
      bestCandidate = romanMatch.score >= englishMatch.score ? romanMatch : englishMatch;
    } else {
      bestCandidate = romanMatch ?? englishMatch;
    }

    if (bestCandidate && bestCandidate.score > 0) {
      results.push({
        entry,
        score: bestCandidate.score,
        matchType: bestCandidate.matchType,
        matchedField: bestCandidate.matchedField,
        matchExplanation: bestCandidate.matchExplanation,
      });
    }
  }

  return results.sort(
    (a, b) => b.score - a.score || a.entry.headword.localeCompare(b.entry.headword, 'hi')
  );
}
