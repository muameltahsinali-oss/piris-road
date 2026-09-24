import { getLocale } from 'next-intl/server';
import { Container } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { getTranslate } from '@/lib/i18n';

/**
 * 404. Copy recovered from the theme options:
 *   tx_error_title_1 = "404"
 *   tx_error_title_2 = "Oops! Page Not Found."
 *   tx_error_link_text = "Go Back to Home "
 * RECOVERY-GAP: tx_error_image was empty, so no illustration existed.
 * See RECOVERY_REPORT.md §6.
 */
export default async function NotFound() {
  const locale = await getLocale();
  const t = getTranslate(locale);

  return (
    <Container className="pb-24 pt-40 text-center sm:pb-32 sm:pt-48">
      <p className="text-[clamp(5rem,18vw,11rem)] font-semibold leading-none text-brand">404</p>
      <h1 className="mt-4 text-display font-medium text-heading">{t('Oops! Page Not Found.')}</h1>
      <div className="mt-9 flex justify-center">
        <Button href="/" size="lg">
          {t('Go Back to Home')}
        </Button>
      </div>
    </Container>
  );
}
