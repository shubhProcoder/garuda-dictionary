export const DEVANAGARI_RE = /[\u0900-\u097F]/u;

/**
 * Checks if the text contains Devanagari characters.
 */
export function isDevanagari(value: unknown): boolean {
  return DEVANAGARI_RE.test(String(value ?? ''));
}

/**
 * Convert IAST and everyday Roman spellings to a forgiving search key.
 * This intentionally merges common Hindi/Sanskrit spelling distinctions:
 * long vowels, dental/retroflex consonants, and sh/ṣ/ś spellings.
 */
export function normalizeRoman(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/kṣ/g, 'ksh')
    .replace(/jñ/g, 'gy')
    .replace(/[śṣ]/g, 'sh')
    .replace(/ṭ/g, 't')
    .replace(/ḍ/g, 'd')
    .replace(/ṇ/g, 'n')
    .replace(/[ṛṝ]/g, 'ri')
    .replace(/ḷ/g, 'l')
    .replace(/ṃ/g, 'm')
    .replace(/ḥ/g, 'h')
    .replace(/[ā]/g, 'a')
    .replace(/[ī]/g, 'i')
    .replace(/[ū]/g, 'u')
    .replace(/[ē]/g, 'e')
    .replace(/[ō]/g, 'o')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/w/g, 'v')
    .replace(/([aeiou])\1+/g, '$1')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Normalize Devanagari text by applying Unicode NFC, stripping zero-width joiners/non-joiners,
 * byte order marks, and Hindi/Sanskrit dandas.
 */
export function normalizeDevanagari(value: unknown): string {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/[\u200c\u200d\uFEFF]/g, '')
    .replace(/[।॥]/g, '')
    .trim();
}

/**
 * Normalizes English words for meaning lookup:
 * lowercases, removes non-alphanumeric punctuation, trims extra whitespace.
 */
export function normalizeEnglish(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
