import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslate } from '@/lib/i18n';
import { services } from '@/content/services';
import { PageHeader } from '@/components/layout/PageHeader';
import { ServiceCards } from '@/components/blocks/ServiceCards';
import { ProvenBlock } from '@/components/blocks/CeoMessage';

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'From small commercial shipments to complex industrial transport, Piris Road provides full-scope logistics solutions customized to business needs.',
  alternates: { canonical: '/services' },
};

/**
 * Our Services — as on staging: eyebrow + watermark title, the first four
 * services and the last three as two staggered grids (the original's two
 * widgets), then the client quote / proven-performance block.
 */
export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getTranslate(locale);

  return (
    <>
      <PageHeader t={t} title={t('Our Services')} crumbs={[{ label: t('Our Services') }]} />
      <div className="pt-16 sm:pt-20 lg:pt-[100px]">
        <ServiceCards t={t} eyebrow="Services" bigTitle="Our Services" items={services.slice(0, 4)} imageKind="featured" />
      </div>
      <ServiceCards t={t} items={services.slice(4)} imageKind="featured" />
      <ProvenBlock t={t} />
    </>
  );
}
