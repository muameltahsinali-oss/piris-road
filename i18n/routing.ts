import { defineRouting } from 'next-intl/routing';

/**
 * The original site was bilingual via TranslatePress: English (default, no
 * prefix) and Arabic. Recovered translations live in messages/ar.json — 361
 * human-written strings pulled out of wp_trp_dictionary_en_us_ar.
 */
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
