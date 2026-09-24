import Image from 'next/image';
import { Container, Eyebrow } from '@/components/ui/Section';
import { SplitText } from '@/components/motion/SplitText';
import { Reveal } from '@/components/motion/Reveal';
import { aboutHome, aboutPage } from '@/content/company';
import type { Translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const badges = [
  { src: '/certifications/iso-14001.webp', alt: 'ISO 14001' },
  { src: '/certifications/iso-9001.jpeg', alt: 'ISO 9001' },
  { src: '/certifications/iso-45001.webp', alt: 'ISO 45001' },
  { src: '/certifications/sgs.png', alt: 'SGS' },
];

/**
 * `as-about-1` — two columns: heading, rule, copy and the laurel-framed
 * certification badges on one side; "Our Values" as white cards inside a
 * #f2f2f2 tray on the other. Home uses the staging copy; the About page keeps
 * its own (older) copy plus the 4.9 rating, as on staging.
 */
export function AboutIntro({ t, variant = 'home' }: { t: Translate; variant?: 'home' | 'page' }) {
  const c = variant === 'home' ? aboutHome : aboutPage;

  return (
    <section id="about-intro" className="bg-white pb-12 pt-16 sm:pt-20 lg:pb-[50px] lg:pt-[100px]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-[30px]">
          <div className="lg:pe-6">
            <Eyebrow>{t(c.eyebrow)}</Eyebrow>
            <h2 className="mt-4 text-display font-medium text-heading">
              <SplitText>{t(c.title)}</SplitText>
            </h2>
            <hr className="my-8 border-black/25" />
            <Reveal as="p" animation="fadeInUp2" className="text-copy">
              {t(c.description)}
            </Reveal>

            <div className="mt-8 flex items-center gap-3">
              <Image src="/decor/laurel-left.webp" alt="" width={54} height={84} className="h-[68px] w-auto rtl:-scale-x-100" aria-hidden />
              <ul className="flex flex-wrap items-center gap-3">
                {badges.map((b, i) => (
                  <Reveal as="li" key={b.alt} animation="fadeInRight2" delay={i * 0.1}>
                    <Image src={b.src} alt={b.alt} width={120} height={60} className="h-9 w-auto object-contain" />
                  </Reveal>
                ))}
              </ul>
              <Image src="/decor/laurel-right.webp" alt="" width={54} height={84} className="h-[68px] w-auto rtl:-scale-x-100" aria-hidden />
            </div>

            {variant === 'page' ? (
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <Stars staggered />
                  <Reveal as="span" animation="fadeInRight2" className="text-lg font-semibold tracking-snug text-heading">
                    {t(aboutPage.rating)}
                  </Reveal>
                </div>
                <Reveal as="p" animation="fadeInUp2" delay={0.3} className="mt-2 text-sm font-medium text-muted">
                  {t(aboutPage.ratingTitle)}
                </Reveal>
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-[2rem] font-medium leading-tight tracking-tightest text-heading">{t(c.valuesHeading)}</h3>
            <ul className="mt-6 flex flex-col gap-1 rounded-[10px] bg-paper p-1.5">
              {c.values.map((v, i) => (
                <Reveal as="li" key={v.title} animation="fadeInUp2" delay={0.1 * (i + 1)} className="rounded-[10px] bg-white px-[25px] py-5">
                  {/* .as-about-1-features-single .item-title:hover — turns brand blue, 0.4s */}
                  <h4 className="text-title font-medium text-heading transition-colors duration-[400ms] ease-cube hover:text-brand">{t(v.title)}</h4>
                  <p className="mt-2.5 text-[15px] font-medium leading-6 tracking-snug text-body">{t(v.text)}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Stars({ className, tone = 'brand', staggered = false }: { className?: string; tone?: 'brand' | 'accent'; staggered?: boolean }) {
  const star = (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.8l6.1-.7z" />
    </svg>
  );
  return (
    <span className={cn('flex gap-0.5', tone === 'brand' ? 'text-brand' : 'text-accent', className)} aria-label="5 stars">
      {Array.from({ length: 5 }).map((_, i) =>
        // About page: each star fades in 0.1s after the previous (`wow fadeIn`, .1s–.5s)
        staggered ? (
          <Reveal as="span" key={i} animation="fadeIn" delay={0.1 * (i + 1)}>
            {star}
          </Reveal>
        ) : (
          <span key={i}>{star}</span>
        ),
      )}
    </span>
  );
}
