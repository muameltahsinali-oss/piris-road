import dictionary from '@/content/ar-dictionary.json';
import type { Locale } from '@/i18n/routing';
import { captureSource, getTextOverrides } from '@/lib/text-overrides';

/**
 * Translation via recovered TranslatePress data.
 *
 * TranslatePress translated by matching the rendered English source string.
 * We do the same, with a dictionary built from two sources:
 *  - 361 translations from the .wpress backup (wp_trp_dictionary_en_us_ar);
 *  - translations harvested from the staging site's /ar/ pages for copy that
 *    was added after the backup (backup wins wherever the two disagree).
 * Anything never translated falls back to English, as on the live site.
 *
 * Edits made in the admin dashboard (lib/text-overrides.ts) win over both the
 * English source and the dictionary.
 */
const ar = dictionary as Record<string, string>;

export type Translate = (source: string) => string;

export function getTranslate(locale: Locale | string): Translate {
  const overrides = getTextOverrides();
  if (locale !== 'ar') {
    return (s) => {
      captureSource(s);
      return overrides.en[s] ?? s;
    };
  }
  return (s) => {
    captureSource(s);
    return overrides.ar[s] ?? ar[s] ?? ar[s.trim()] ?? s;
  };
}

/** The built-in Arabic for a source string (dictionary only, no overrides). */
export const defaultArabic = (source: string): string | undefined => ar[source] ?? ar[source.trim()];

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
