import { z } from 'zod';
import { DictionaryEntry } from '../types/dictionary';

export const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

export const entrySchema = z.object({
  id: z.number().int().positive('ID must be a positive integer'),
  headword: z
    .string()
    .min(1, 'Headword cannot be empty')
    .refine((val) => DEVANAGARI_REGEX.test(val), {
      message: 'Headword must contain Devanagari script',
    }),
  transliteration: z.string().min(1, 'Transliteration cannot be empty'),
  romanised: z.array(z.string().min(1)).min(1, 'At least one romanised variant is required'),
  pos: z.string().min(1, 'Part of speech cannot be empty'),
  meanings: z.array(z.string().min(1)).min(1, 'At least one English meaning is required'),
  example: z.string().min(1, 'Example sentence cannot be empty'),
});

export const dictionaryDatasetSchema = z.array(entrySchema).min(1, 'Dictionary cannot be empty');

export function validateEntries(data: unknown): DictionaryEntry[] {
  return dictionaryDatasetSchema.parse(data);
}
