import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

/**
 * next-intl is used here for locale routing, RTL direction and locale-aware
 * <Link>s only. String translation goes through the recovered TranslatePress
 * dictionary instead (see lib/i18n.ts) — that dictionary is keyed by the
 * English source string, which is exactly how the original site worked, and it
 * means every Arabic word on this site came out of the backup rather than being
 * machine-translated.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return { locale, messages: {} };
});
