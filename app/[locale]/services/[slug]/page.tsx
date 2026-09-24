import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getTranslate, translateAs, type Translate } from '@/lib/i18n';
import { truncate } from '@/lib/utils';
import { services, getService, getServiceNeighbours, type Service } from '@/content/services';
import { serviceDetail } from '@/content/company';
import { Container } from '@/components/ui/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContactBlock } from '@/components/blocks/ContactBlock';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => services.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: truncate(service.summary, 160),
    alternates: { canonical: `/services/${service.slug}` },
    keywords: service.tags,
  };
}

/**
 * Service detail, laid out as on staging: large featured image, "About This
 * Service" copy, the "Why Choose Us" row of four icon columns with numbered
 * markers on a shared rule, the contact block, and the next/previous service card.
 */
export default async function ServiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = getTranslate(locale);

  const service = getService(slug);
  if (!service) notFound();
  const { prev, next } = getServiceNeighbours(slug);

  return (
    <>
      <PageHeader t={t} title={t(service.title)} crumbs={[{ label: t('Services'), href: '/services' }, { label: t(service.title) }]} />

      {/* Staging: 100px section padding, 15px-radius image, 30px/700 heading 35px below it, 18px grey copy. */}
      <section className="bg-white pt-16 sm:pt-20 min-[992px]:pt-[100px]">
        <Container>
          <div className="overflow-hidden rounded-[15px] bg-paper">
            <Image src={service.image} alt={t(service.title)} width={1600} height={1130} priority sizes="(min-width: 1320px) 1290px, 100vw" className="h-auto w-full" />
          </div>

          <h2 className="mt-[35px] text-[28px] font-bold leading-[1.2] text-black min-[992px]:text-[30px]">
            <SplitText>{t(serviceDetail.about)}</SplitText>
          </h2>
          <div className="text-[18px] leading-7 text-[#7a7a7a]">
            {service.body.split('\n\n').map((para, i) => (
              <p key={i} className="mb-4">
                {t(para)}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <WhyChooseUs t={t} service={service} />
      <ContactBlock t={t} />
      <ServiceNav t={t} prev={prev} next={next} />
    </>
  );
}

/**
 * `.as-process-2-area` on staging: "• Why Choice Us •" subtitle (15px, 4px dots),
 * then 1–3–4 columns (375 / 768 / ≥992px) of items with a 1px #c6c6c6 start
 * border, a shared bottom rule, 60px icons, 22px titles, 16px #515151 copy,
 * and 52px black step numbers centred on the start border at the rule.
 * (Staging's large tagline beside the subtitle is Avista demo copy —
 * "…exceptional digital results" — and is not reproduced.)
 */
function WhyChooseUs({ t, service }: { t: Translate; service: Service }) {
  return (
    <section className="bg-white pb-20 pt-20 min-[992px]:pb-[160px] min-[992px]:pt-[130px]">
      <Container>
        <p className="inline-flex items-center gap-x-2.5 rounded-[4px] bg-white px-5 py-0.5 text-[15px] font-medium leading-6 tracking-[0.01em] text-black">
          <span className="h-1 w-1 rounded-full bg-black" aria-hidden />
          {translateAs(t, serviceDetail.why, serviceDetail.whyKey)}
          <span className="h-1 w-1 rounded-full bg-black" aria-hidden />
        </p>

        <ol className="relative mt-[70px] grid ps-[26px] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[#c6c6c6] md:grid-cols-3 min-[992px]:grid-cols-4 min-[1400px]:ps-0">
          {service.featureCards.map((card, i) => (
            <li key={card.title} className="group relative border-s border-[#c6c6c6] px-[22px] py-11 min-[992px]:px-8 min-[992px]:pb-[55px]">
              {/* .as-process-2-item:hover .icon — swing */}
              <Image src={serviceDetail.icons[i]} alt="" width={60} height={60} className="hover-swing mb-[45px] h-[60px] w-auto" aria-hidden />
              <h3 className="mb-5 text-[22px] font-medium leading-[1.272] text-black">{t(card.title)}</h3>
              <p className="text-base leading-[1.555] text-muted">{t(card.content)}</p>
              {/* step numbers slide in from the side (wow slideInRight2) */}
              <span className="absolute -bottom-[26px] -start-[26px] z-10">
                <Reveal as="span" animation="slideInRight2" className="grid h-[52px] w-[52px] place-items-center rounded-full bg-black text-[18px] text-white">
                  {String(i + 1).padStart(2, '0')}
                </Reveal>
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** Replaces the `[services_nav]` shortcode (Code Snippet #5). */
function ServiceNav({ t, prev, next }: { t: Translate; prev?: Service; next?: Service }) {
  if (!prev && !next) return null;
  return (
    <section className="bg-white pb-16 sm:pb-20 min-[992px]:pb-[100px]">
      <Container>
        {/* `.service-navigation`: 1140px row, light-blue top rule, 50px above the cards. */}
        <nav aria-label={t('Services')} className="mx-auto flex max-w-[1140px] flex-col gap-5 border-t border-brand-soft pt-[50px] sm:flex-row">
          {prev ? <NavCard t={t} service={prev} kind="prev" /> : <span className="hidden flex-1 sm:block" />}
          {next ? <NavCard t={t} service={next} kind="next" /> : <span className="hidden flex-1 sm:block" />}
        </nav>
      </Container>
    </section>
  );
}

function NavCard({ t, service, kind }: { t: Translate; service: Service; kind: 'prev' | 'next' }) {
  const label = kind === 'next' ? t(serviceDetail.next) : t(serviceDetail.prev);
  return (
    <Link
      href={`/services/${service.slug}`}
      className={`group relative flex-1 overflow-hidden border border-brand-soft bg-white px-[30px] py-7 text-start ${kind === 'next' ? 'sm:text-end' : ''}`}
    >
      <span className="absolute inset-0 origin-left scale-x-0 bg-brand-sweep transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" aria-hidden />
      <span className="absolute bottom-0 start-0 h-1 w-0 bg-accent transition-all duration-300 group-hover:w-full" aria-hidden />
      <span className="relative block">
        <small className="block text-[18px] leading-7 text-black transition group-hover:text-white">{label}</small>
        <span className="block text-[20px] font-semibold leading-7 text-ink transition group-hover:text-white">{t(service.title)}</span>
      </span>
    </Link>
  );
}
