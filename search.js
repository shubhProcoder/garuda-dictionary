const DEVANAGARI_RE = /[\u0900-\u097F]/u;

/**
 * Convert IAST and everyday Roman spellings to a forgiving search key.
 * This intentionally merges common Hindi/Sanskrit spelling distinctions:
 * long vowels, dental/retroflex consonants, and sh/ṣ/ś spellings.
 */
export function normalizeRoman(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/kṣ/g, "ksh")
    .replace(/jñ/g, "gy")
    .replace(/[śṣ]/g, "sh")
    .replace(/ṭ/g, "t")
    .replace(/ḍ/g, "d")
    .replace(/ṇ/g, "n")
    .replace(/[ṛṝ]/g, "ri")
    .replace(/ḷ/g, "l")
    .replace(/ṃ/g, "m")
    .replace(/ḥ/g, "h")
    .replace(/[ā]/g, "a")
    .replace(/[ī]/g, "i")
    .replace(/[ū]/g, "u")
    .replace(/[ē]/g, "e")
    .replace(/[ō]/g, "o")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/w/g, "v")
    .replace(/([aeiou])\1+/g, "$1")
    .replace(/[^a-z0-9]/g, "");
}

export function normalizeDevanagari(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[\u200c\u200d\uFEFF]/g, "")
    .replace(/[।॥]/g, "")
    .trim();
}

function romanKeys(entry) {
  const keys = new Set();
  const forms = [entry.transliteration, ...(entry.romanised ?? [])];

  for (const form of forms) {
    const key = normalizeRoman(form);
    if (!key) continue;
    keys.add(key);
    // Hindi users often omit the final inherent "a": dharma → dharm.
    if (key.length > 3 && key.endsWith("a")) keys.add(key.slice(0, -1));
  }
  return [...keys];
}

function editDistanceWithin(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  if (a === b) return 0;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
      current[j] = value;
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length];
}

function scoreRomanMatch(query, keys) {
  let best = 0;
  for (const key of keys) {
    if (key === query) best = Math.max(best, 100);
    else if (key.startsWith(query)) best = Math.max(best, 80);
    else if (key.includes(query)) best = Math.max(best, 65);
    else if (query.length >= 4) {
      const maxDistance = query.length >= 8 ? 2 : 1;
      const distance = editDistanceWithin(query, key, maxDistance);
      if (distance <= maxDistance) best = Math.max(best, 45 - distance);
    }
  }
  return best;
}

/** Search by Devanagari, IAST, common Roman spellings, or near-typos. */
export function searchEntries(entries, rawQuery) {
  const query = String(rawQuery ?? "").trim();
  if (!query) return [...entries];

  if (DEVANAGARI_RE.test(query)) {
    const normalizedQuery = normalizeDevanagari(query);
    const exact = [];
    const partial = [];

    for (const entry of entries) {
      const word = normalizeDevanagari(entry.headword);
      if (word === normalizedQuery) exact.push(entry);
      else if (word.includes(normalizedQuery)) partial.push(entry);
    }
    return [...exact, ...partial];
  }

  const normalizedQuery = normalizeRoman(query);
  if (!normalizedQuery) return [];

  return entries
    .map((entry) => ({ entry, score: scoreRomanMatch(normalizedQuery, romanKeys(entry)) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.headword.localeCompare(b.entry.headword, "hi"))
    .map((result) => result.entry);
}

export function filterByPartOfSpeech(entries, filter) {
  if (!filter || filter === "all") return [...entries];
  if (filter === "noun") return entries.filter((entry) => entry.pos.startsWith("noun"));
  return entries.filter((entry) => entry.pos === filter);
}
