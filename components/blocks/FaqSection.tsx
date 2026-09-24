import Image from 'next/image';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/motion/Reveal';
import { FaqAccordion } from './FaqAccordion';
import { faqSection as f } from '@/content/company';
import type { Translate } from '@/lib/i18n';

/**
 * `as-faqs-1` with the theme's motion:
 *  - Awards: the two laurels sway on 3s loops (one 2s behind — h3partnerLeaf),
 *    the colour glow behind them spins every 5s (asFaqsColor), and each ISO
 *    title shoots up from far below at 70% scale then settles (`backInUp2`);
 *  - FAQs: the active tab's underline is drawn in; questions are an animated
 *    accordion (see FaqAccordion).
 */
export function FaqSection({ t }: { t: Translate }) {
  return (
    <section className="overflow-hidden bg-night py-16 text-white sm:py-20 lg:py-[110px]">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t(f.awardsEyebrow)} title={t(f.awardsTitle)} align="center" tone="dark" />
            <div className="relative isolate mx-auto mt-10 flex h-[340px] max-w-[460px] flex-col items-center justify-center gap-5">
              <div className="glow-spin absolute left-1/2 top-1/2 -z-10 -ml-[150px] -mt-[150px] h-[300px] w-[300px]" aria-hidden>
                <Image src="/decor/faq-glow.webp" alt="" width={434} height={430} className="h-full w-full opacity-90 blur-2xl" />
              </div>
              <Image src="/decor/laurel-lg-left.webp" alt="" width={210} height={326} className="leaf-sway-late absolute -bottom-10 start-0 -z-10 h-[240px] w-auto opacity-25 invert rtl:-scale-x-100" aria-hidden />
              <Image src="/decor/laurel-lg-right.webp" alt="" width={210} height={326} className="leaf-sway absolute -bottom-10 end-0 -z-10 h-[240px] w-auto opacity-25 invert rtl:-scale-x-100" aria-hidden />
              {f.certifications.map((c) => (
                <Reveal key={c} animation="backInUp2" delay={0.1} className="text-[28px] font-medium tracking-[-0.05em] text-white">
                  <span dir="ltr">{c}</span>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading eyebrow={t(f.faqEyebrow)} title={t(f.faqTitle)} align="center" tone="dark" />
            <div className="relative mt-8">
              <span className="absolute inset-x-0 bottom-0 h-px bg-[#494949] opacity-80" aria-hidden />
              <span className="relative inline-block px-[15px] py-[15px] text-2xl font-medium text-brand sm:text-[30px]">
                {t(f.tab)}
                <span className="absolute -bottom-0.5 left-0 h-1 w-full rounded-full bg-brand" aria-hidden />
              </span>
            </div>
            <FaqAccordion items={f.items.map((it) => ({ q: t(it.q), a: t(it.a) }))} />
          </div>
        </div>
      </Container>
    </section>
  );
}
