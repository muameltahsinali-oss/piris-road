import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslate } from '@/lib/i18n';
import { siteConfig } from '@/content/site';
import { movingText, servicesHome } from '@/content/company';
import { services } from '@/content/services';
import { Hero } from '@/components/blocks/Hero';
import { AboutIntro } from '@/components/blocks/AboutIntro';
import { IndustryGrid } from '@/components/blocks/IndustryGrid';
import { CrossingMarquee } from '@/components/ui/Marquee';
import { Features } from '@/components/blocks/Features';
import { PartnerLogos } from '@/components/blocks/PartnerLogos';
import { ServiceCards } from '@/components/blocks/ServiceCards';
import { CtaBanner } from '@/components/blocks/CtaBanner';
import { Philosophy } from '@/components/blocks/Philosophy';
import { ProcessSteps } from '@/components/blocks/ProcessSteps';
import { FaqSection } from '@/components/blocks/FaqSection';
import { HomeInsights } from '@/components/blocks/PostGrid';

export const metadata: Metadata = {
  title: { absolute: 'Home - Piris Road' },
  description: siteConfig.description,
  alternates: { canonical: '/' },
};

/**
 * Home — section order follows the staging site:
 * hero · about · industries · marquee · features · partners · services ·
 * CTA band · philosophy · process · awards/FAQ · insights.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getTranslate(locale);

  return (
    <>
      <Hero t={t} />
      <AboutIntro t={t} variant="home" />
      <IndustryGrid t={t} />
      <CrossingMarquee rowOne={movingText.rowOne.map(t)} rowTwo={movingText.rowTwo.map(t)} />
      <Features t={t} />
      <PartnerLogos t={t} />
      <ServiceCards
        t={t}
        eyebrow={servicesHome.eyebrow}
        title={servicesHome.title}
        bigTitle={servicesHome.bigTitle}
        items={services.slice(0, 4)}
        withStat
      />
      <CtaBanner t={t} />
      <Philosophy t={t} />
      <ProcessSteps t={t} />
      <FaqSection t={t} />
      <HomeInsights t={t} locale={locale} />
    </>
  );
}
