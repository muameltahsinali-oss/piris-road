import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslate } from '@/lib/i18n';
import { Container } from '@/components/ui/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { QuoteForm } from '@/components/blocks/QuoteForm';

export const metadata: Metadata = {
  title: 'Get a Quote',
  description:
    'Request a freight quote from Piris Road — sea, air, road, cold chain, warehousing, customs clearance and project cargo.',
  alternates: { canonical: '/quote' },
};

/**
 * Get a Quote — rebuilt from WordPress page 3821 (original slug
 * /elementor-page-3821/, now redirected). The page held a single shortcode
 * widget rendering Contact Form 7 form 2478.
 *
 * Field labels below are the recovered CF7 labels verbatim, translated through
 * the recovered Arabic dictionary where a translation exists.
 * See RECOVERY_REPORT.md §4.5 and §8.
 */
export default async function QuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getTranslate(locale);

  const labels = {
    shippingInformation: t('Shipping Information'),
    companyInformation: t('Company Information'),
    loading_place: t('Loading place; postal code, city'),
    loading_country: t('Loading place; country'),
    unloading_place: t('Unloading place; postal code, city'),
    unloading_country: t('Unloading place; country'),
    number_of_colli: t('Number of Colli'),
    weight: t('Weight'),
    length: t('Length'),
    width: t('Width'),
    height: t('Height'),
    commodity: t('Kind of commodity'),
    additional_info: t('Additional Info'),
    company_name: t('Company Name'),
    vat_number: t('VAT Number'),
    address: t('Address'),
    postal_number: t('Postal Number'),
    city: t('City'),
    country: t('Country'),
    phone: t('Phone Number'),
    email: t('Email'),
    your_name: t('Your Name'),
    privacy_policy: t('Accept Privacy Policy'),
    send: t('Send'),
    sending: t('Sending…'),
    success: t('Thank you for your message. It has been sent.'),
    error: t('There was an error trying to send your message. Please try again later.'),
  };

  return (
    <>
      <PageHeader t={t} title={t('Get a Quote')} crumbs={[{ label: t('Get a Quote') }]} />

      {/* Staging: the CF7 form sits centred in a 1140px column, 159px below the banner. */}
      <section className="bg-white pb-[100px] pt-[129px]">
        <Container>
          <div className="mx-auto max-w-[1140px]">
            <QuoteForm labels={labels} />
          </div>
        </Container>
      </section>
    </>
  );
}
