import {
  isDevanagari,
  normalizeDevanagari,
  normalizeEnglish,
  normalizeRoman,
} from '../../src/engine/normalize';

describe('normalize engine tests', () => {
  describe('isDevanagari', () => {
    it('detects Devanagari script', () => {
      expect(isDevanagari('धर्म')).toBe(true);
      expect(isDevanagari('भाषा')).toBe(true);
      expect(isDevanagari('dharma')).toBe(false);
      expect(isDevanagari('')).toBe(false);
      expect(isDevanagari(null)).toBe(false);
      expect(isDevanagari(undefined)).toBe(false);
    });
  });

  describe('normalizeDevanagari', () => {
    it('applies Unicode NFC normalization', () => {
      // Composed vs decomposed
      const decomposed = 'ध' + '\u0930' + '\u094D' + 'म';
      expect(normalizeDevanagari(decomposed)).toBe(normalizeDevanagari('धर्म'));
    });

    it('strips ZWJ and ZWNJ characters', () => {
      const withZwj = 'ध\u200Dर्म\u200C';
      expect(normalizeDevanagari(withZwj)).toBe('धर्म');
    });

    it('strips Hindi/Sanskrit dandas', () => {
      expect(normalizeDevanagari('धर्म।')).toBe('धर्म');
      expect(normalizeDevanagari('॥शान्तिः॥')).toBe('शान्तिः');
    });

    it('handles edge case inputs safely', () => {
      expect(normalizeDevanagari('')).toBe('');
      expect(normalizeDevanagari('   ')).toBe('');
      expect(normalizeDevanagari(null)).toBe('');
      expect(normalizeDevanagari(undefined)).toBe('');
    });
  });

  describe('normalizeRoman', () => {
    it('normalizes IAST diacritics', () => {
      expect(normalizeRoman('śikṣā')).toBe('shiksha');
      expect(normalizeRoman('bhāṣā')).toBe('bhasha');
      expect(normalizeRoman('jñāna')).toBe('gyana');
      expect(normalizeRoman('pṛthvī')).toBe('prithvi');
      expect(normalizeRoman('saṃskṛti')).toBe('samskriti');
    });

    it('normalizes common spelling variations', () => {
      expect(normalizeRoman('vriksh')).toBe('vriksh');
      expect(normalizeRoman('wriksh')).toBe('vriksh'); // w -> v
      expect(normalizeRoman('pariwar')).toBe('parivar'); // w -> v
    });

    it('deduplicates consecutive identical vowels', () => {
      expect(normalizeRoman('shikshaa')).toBe('shiksha');
      expect(normalizeRoman('gyaaaan')).toBe('gyan');
    });

    it('handles uppercase and whitespace', () => {
      expect(normalizeRoman('  DHARMA  ')).toBe('dharma');
      expect(normalizeRoman('ŚIKṢĀ')).toBe('shiksha');
    });

    it('strips non-alphanumeric punctuation', () => {
      expect(normalizeRoman('dhar-ma!')).toBe('dharma');
    });
  });

  describe('normalizeEnglish', () => {
    it('lowercases and cleans punctuation for search', () => {
      expect(normalizeEnglish('Duty, Religion!')).toBe('duty religion');
      expect(normalizeEnglish('   education   ')).toBe('education');
      expect(normalizeEnglish('peace & calm')).toBe('peace calm');
    });
  });
});
