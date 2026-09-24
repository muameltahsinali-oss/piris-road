import dictionary from '@/content/ar-dictionary.json';
import type { Locale } from '@/i18n/routing';

/**
 * Translation via recovered TranslatePress data.
 *
 * TranslatePress translated by matching the rendered English source string.
 * We do the same, with a dictionary built from two sources:
 *  - 361 translations from the .wpress backup (wp_trp_dictionary_en_us_ar);
 *  - translations harvested from the staging site's /ar/ pages for copy that
 *    was added after the backup (backup wins wherever the two disagree).
 * Anything never translated falls back to English, as on the live site.
 */
const ar = dictionary as Record<string, string>;

export type Translate = (source: string) => string;

export function getTranslate(locale: Locale | string): Translate {
  if (locale !== 'ar') return (s) => s;
  return (s) => ar[s] ?? ar[s.trim()] ?? s;
}

export const isRtl = (locale: string) => locale === 'ar';
export const dirFor = (locale: string) => (isRtl(locale) ? 'rtl' : 'ltr');

/**
 * Translate by one key but display different English. Used where the original
 * copy had a typo ("Why Choice Us", "Get a Qoute", "Shipment and Risk
 * Assessmen"): English shows the corrected text, Arabic still finds its entry.
 */
export function translateAs(t: Translate, display: string, key: string): string {
  const r = t(key);
  return r === key ? display : r;
}

/**
 * Translate a source string that contained <br> tags in the original markup,
 * returning the display lines.
 */
export function translateLines(t: Translate, source: string): string[] {
  return t(source)
    .split(/<br\s*\/?>|\r?\n/i)
    .map((line) => line.trim())
    .filter(Boolean);
}
