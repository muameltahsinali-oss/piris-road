import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { SplitText } from '@/components/motion/SplitText';
import { Reveal } from '@/components/motion/Reveal';
import { HeroInteractive, LiquidImage } from '@/components/motion/HeroEffects';
import { hero } from '@/content/company';
import { siteConfig } from '@/content/site';
import type { Translate } from '@/lib/i18n';

/**
 * Home hero (`as-hero-1`) with the staging site's motion:
 *
 *  - vertical labels scroll upward forever (`.wa_marquee_down_top`, 30s loop);
 *  - the giant "PirisRoad" rises letter by letter, 0.7s after the preloader
 *    (`.wa_split_up`, data-split-delay .7s);
 *  - the headline flips up character by character from the centre
 *    (`.wa_title_spilt_1`);
 *  - the description drifts in word by word out of a blur, 1.5s in
 *    (`.wa_title_split_2`, data-delay 1.5);
 *  - the white CTA card zooms in 0.5s in (`wow zoomIn`), with two blurred
 *    colour blobs bobbing behind it;
 *  - the container condenses out of a liquid distortion, tilts toward the
 *    pointer, and mouse movement scatters particle "noise" over the section.
 */
export function Hero({ t }: { t: Translate }) {
  const labels = hero.marqueeLabels.map(t);

  return (
    <HeroInteractive className="relative isolate overflow-hidden rounded-b-hero-sm bg-[#3361e5] text-white lg:min-h-[800px] lg:rounded-b-hero">
      {/* Vertical brand band */}
      <div className="absolute inset-y-0 start-0 hidden w-[150px] overflow-hidden bg-[#2d58dc] lg:flex" aria-hidden>
        <div className="relative h-full w-[46px] overflow-hidden border-e border-white/10">
          <div className="animate-marquee-y flex flex-col">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex flex-col">
                {labels.map((l) => (
                  <span key={l} className="whitespace-nowrap py-4 ps-3 text-[15px] font-medium tracking-snug text-white/85" style={{ writingMode: 'vertical-rl' }}>
                    {l}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex h-full flex-1 items-center justify-center">
          <Image src="/decor/noise.gif" alt="" fill unoptimized className="object-cover opacity-20 mix-blend-multiply" />
          <SplitText
            variant="rise"
            delay={0.7}
            className="relative block select-none text-[96px] font-bold leading-none tracking-[-0.05em] text-white/20 [transform:rotate(180deg)] [writing-mode:vertical-rl]"
          >
            {hero.verticalBrand}
          </SplitText>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-content flex-col px-5 pb-16 pt-32 sm:px-6 lg:min-h-[800px] lg:justify-center lg:pb-24 lg:pt-28 lg:ps-[230px] xl:ps-[400px]">
        <div className="relative z-10 max-w-[640px]">
          <h1 className="text-hero font-semibold text-white">
            {hero.titleLines.map((line) => (
              <SplitText key={line} variant="flip" className="block">
                {t(line)}
              </SplitText>
            ))}
          </h1>
          <SplitText
            as="p"
            variant="words"
            delay={1.5}
            className="mt-5 block max-w-[400px] text-[17px] font-semibold leading-[1.55] tracking-snug text-white sm:text-lg"
          >
            {t(hero.description)}
          </SplitText>

          <Reveal animation="zoomIn" delay={0.5} className="hero-cta-blobs relative isolate mt-10 w-full max-w-[355px]">
            <div className="rounded-[30px] bg-white/95 px-5 py-[30px] text-center text-black shadow-[0_30px_60px_rgba(10,30,120,.25)] backdrop-blur">
              <h2 className="text-lg font-medium tracking-snug text-black">{t(hero.ctaPrompt)}</h2>
              <div className="mt-4 flex justify-center">
                <Button href="/contact" variant="accent" size="md">
                  {t(hero.primaryCta)}
                </Button>
              </div>
              <p className="mt-4 text-[13px] leading-5 text-muted">
                {t(hero.emailPrefix)}
                <br />
                <a href={`mailto:${siteConfig.contact.emails.operations}`} dir="ltr" className="font-semibold text-black hover:text-brand">
                  {siteConfig.contact.emails.operations}
                </a>
              </p>
            </div>
          </Reveal>
        </div>

        <div className="pointer-events-none mx-auto mt-12 w-[78%] max-w-[420px] lg:absolute lg:bottom-[9%] lg:end-[2%] lg:mt-0 lg:w-[38%] lg:max-w-[560px]" style={{ perspective: '2000px' }}>
          <LiquidImage>
            <Image
              src={hero.image}
              alt={t('Shipping Container')}
              width={1200}
              height={900}
              priority
              sizes="(min-width: 1024px) 38vw, 78vw"
              className="h-auto w-full"
            />
          </LiquidImage>
        </div>
      </div>
    </HeroInteractive>
  );
}
