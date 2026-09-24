import Image from 'next/image';
import { Container } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';
import { Odometer } from '@/components/motion/Odometer';
import { Magnetic } from '@/components/motion/Interactions';
import { ScrollScene } from '@/components/motion/ScrollScene';
import { ctaBand } from '@/content/company';
import { siteConfig } from '@/content/site';
import type { Translate } from '@/lib/i18n';

/**
 * `as-cta-1` with the theme's motion:
 *  - "5+" odometer; industry chips slide in from the start side, staggered
 *    .2/.1/0/.1s; chips turn brand blue on hover;
 *  - social links slide in from both sides and are magnetic;
 *  - scrubbed from "top 50%" to "top top" (≥992px): the two hands close in
 *    diagonally from 150px, the two photos swing in from ±250px / ±30°, then
 *    "Let's Work" (189px), "Together!" and the buttons drift into place;
 *  - the "Go Down" cue's line bounces (bounce2 2s) and the pill fills blue on hover.
 */
export function CtaBanner({ t }: { t: Translate }) {
  const chipDelays = [0.2, 0.1, 0, 0.1];
  const socialAnim = [
    { a: 'fadeInLeft2' as const, d: 0.2 },
    { a: 'fadeInLeft2' as const, d: 0.1 },
    { a: 'fadeInRight2' as const, d: 0 },
    { a: 'fadeInRight2' as const, d: 0.1 },
  ];

  return (
    <section className="relative">
      <Container className="relative z-10">
        <div className="rounded-[20px] bg-[#efefef] px-5 py-10 text-center sm:px-8">
          <p className="flex items-baseline justify-center gap-2 text-2xl font-medium tracking-[-0.05em] text-heading sm:text-[28px]">
            <span className="inline-flex font-mono text-[40px] font-extrabold leading-none text-brand" dir="ltr">
              <Odometer value={ctaBand.industriesCount} />+
            </span>
            {t(ctaBand.industriesLabel)}
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-3">
            {ctaBand.industryChips.map((c, i) => (
              <Reveal as="li" key={c} animation="fadeInLeft2" delay={chipDelays[i]}>
                <span className="block cursor-default rounded-md bg-white px-[25px] py-2 text-base font-medium tracking-snug text-heading shadow-[0_1px_18px_rgba(0,0,0,.13)] transition-all duration-500 ease-cube hover:bg-brand hover:text-white sm:text-xl">
                  {t(c)}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>

      <div className="relative -mt-20 overflow-hidden rounded-b-hero-sm bg-black pb-12 pt-[140px] text-white sm:rounded-b-section">
        <ScrollScene scene="cta" className="relative isolate">
          <Container>
            <ul className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              {siteConfig.social.map((s, i) => (
                <Reveal as="li" key={s.label} animation={socialAnim[i]?.a ?? 'fadeInRight2'} delay={socialAnim[i]?.d ?? 0}>
                  <Magnetic>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-1 text-[15px] font-medium tracking-snug text-white transition-all duration-500 ease-cube hover:border-transparent hover:bg-brand"
                    >
                      {s.label}
                      <span aria-hidden className="rtl:-scale-x-100">
                        →
                      </span>
                    </a>
                  </Magnetic>
                </Reveal>
              ))}
            </ul>
          </Container>

          <div className="relative mt-10 min-h-[520px] sm:min-h-[640px] lg:min-h-[760px]">
            <div data-scene="hand-1" className="absolute start-0 top-0 -z-10 w-[62%] will-change-transform sm:start-[50px] sm:w-[51%]" aria-hidden>
              <Image src="/decor/hand-1.webp" alt="" width={885} height={468} className="h-auto w-full rtl:-scale-x-100" />
            </div>
            <div data-scene="hand-2" className="absolute bottom-[6%] end-0 -z-10 w-[60%] will-change-transform sm:w-[49%]" aria-hidden>
              <Image src="/decor/hand-2.webp" alt="" width={853} height={544} className="h-auto w-full rtl:-scale-x-100" />
            </div>

            <Container className="relative flex min-h-[inherit] flex-col items-center justify-center text-center">
              <div data-scene="img-1" className="absolute bottom-[53%] start-[4%] -z-[5] hidden h-[175px] w-[260px] rounded-[10px] bg-[linear-gradient(106deg,#fff,transparent)] p-1 will-change-transform lg:block xl:start-[8%]" aria-hidden>
                <Image src={ctaBand.imageLeft} alt="" width={520} height={350} className="h-full w-full rounded-[8px] object-cover" />
              </div>
              <div data-scene="img-2" className="absolute end-[6%] top-[21%] -z-[5] hidden h-[175px] w-[260px] rounded-[10px] bg-[linear-gradient(106deg,#fff,transparent)] p-1 will-change-transform lg:block xl:end-[12%]" aria-hidden>
                <Image src={ctaBand.imageRight} alt="" width={520} height={350} className="h-full w-full rounded-[8px] object-cover" />
              </div>

              <h2 className="font-medium">
                <span data-scene="title-1" className="block text-[clamp(4rem,13vw,11.8rem)] leading-none tracking-[-0.05em] text-white will-change-transform">
                  {t(ctaBand.titleOne)}
                </span>
                <span data-scene="title-2" className="mb-10 block text-[clamp(2.75rem,6.7vw,6rem)] leading-[1.1] tracking-[-0.05em] text-brand will-change-transform">
                  {t(ctaBand.titleTwo)}
                </span>
              </h2>

              <div data-scene="buttons" className="flex flex-wrap justify-center gap-[30px] will-change-transform">
                <Button href="/contact" variant="accent" size="lg">
                  {t(ctaBand.primary)}
                </Button>
                <Button href="/quote" variant="light" size="lg">
                  {t(ctaBand.secondary)}
                </Button>
              </div>
            </Container>
          </div>

          <a href="#philosophy" className="group relative mx-auto mt-2 flex w-max flex-col items-center gap-2 text-sm font-medium text-white">
            <span className="relative z-[1] h-[50px] w-[30px] rounded-full border border-brand bg-black transition-colors duration-500 ease-cube group-hover:bg-brand">
              <span className="bounce2 absolute left-[45%] top-[30%] h-[18px] w-[2px] bg-white opacity-70" />
            </span>
            {t(ctaBand.scroll)}
          </a>
        </ScrollScene>
      </div>
    </section>
  );
}
