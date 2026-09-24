import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslate } from '@/lib/i18n';
import { aboutPage } from '@/content/company';
import { PageHeader } from '@/components/layout/PageHeader';
import { AboutIntro } from '@/components/blocks/AboutIntro';
import { IndustryGrid } from '@/components/blocks/IndustryGrid';
import { ProcessSteps } from '@/components/blocks/ProcessSteps';
import { CeoMessage, Testimonials } from '@/components/blocks/CeoMessage';
import { ContactBlock } from '@/components/blocks/ContactBlock';

export const metadata: Metadata = {
  title: 'About',
  description: aboutPage.description,
  alternates: { canonical: '/about' },
};

/** About — staging order: intro · industries · timeline · CEO message · testimonials · contact block. */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getTranslate(locale);

  return (
    <>
      <PageHeader t={t} title={t('About')} crumbs={[{ label: t('About') }]} />
      <AboutIntro t={t} variant="page" />
      <IndustryGrid t={t} />
      <ProcessSteps t={t} variant="timeline" />
      <CeoMessage t={t} />
      <Testimonials t={t} />
      <ContactBlock t={t} />
    </>
  );
}
