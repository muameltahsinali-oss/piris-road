import Image from 'next/image';
import { Container, Eyebrow } from '@/components/ui/Section';
import { SplitText } from '@/components/motion/SplitText';
import { Odometer } from '@/components/motion/Odometer';
import { Stars } from './AboutIntro';
import { features } from '@/content/company';
import type { Translate } from '@/lib/i18n';

/**
 * `as-features-1` bento, as on staging: two tall photo cards (ship / aircraft)
 * framing a middle column with the blue "Precision Planning & Execution" card
 * over the grey "50+ Satisfied Clients" card.
 */
export function Features({ t }: { t: Translate }) {
  return (
    <section className="bg-white pb-16 pt-6 sm:pb-20 lg:pb-[100px]">
      <Container>
        <div className="text-center">
          <Eyebrow>{t(features.eyebrow)}</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[760px] text-display font-medium text-heading">
            {features.titleLines.map((l) => (
              <SplitText key={l} className="block">
                {t(l)}
              </SplitText>
            ))}
          </h2>
        </div>

        <div className="mt-12 grid gap-2 md:grid-cols-[1.18fr_1fr_1.18fr]">
          <PhotoCard t={t} {...features.why} />

          <div className="grid gap-2 md:grid-rows-[1.1fr_1fr]">
            <div className="flex flex-col rounded-[2px] bg-brand p-5 text-white sm:p-[22px]">
              <h3 className="text-[1.75rem] font-medium leading-[1.1] tracking-[-0.05em] text-white sm:text-[30px]">
                {t(features.precision.title)}
              </h3>
              <p className="mt-6 text-[15px] font-medium leading-[1.75] tracking-snug text-white md:ms-[30%]">
                {t(features.precision.text)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-[2px] bg-[#e5e5e5] p-6 text-center">
              <Stars className="[&_svg]:h-6 [&_svg]:w-6" />
              <p className="mt-4 flex items-baseline gap-3">
                <span className="inline-flex text-[36px] font-medium tracking-[-0.05em] text-heading" dir="ltr">
                  <Odometer value={features.clients.value} />
                  {features.clients.suffix}
                </span>
                <span className="text-2xl font-medium tracking-[-0.05em] text-muted">{t(features.clients.label)}</span>
              </p>
              <p className="mt-3 text-start text-[15px] font-medium leading-6 tracking-snug text-heading">
                {t(features.clients.join)} <strong dir="ltr" className="font-semibold">{features.clients.joinValue}</strong>
                <br />
                {t(features.clients.joinLabel)}
              </p>
            </div>
          </div>

          <PhotoCard t={t} {...features.certified} />
        </div>
      </Container>
    </section>
  );
}

function PhotoCard({ t, title, text, image }: { t: Translate; title: string; text: string; image: string }) {
  return (
    <article className="relative isolate flex min-h-[460px] flex-col overflow-hidden rounded-[2px] p-5 text-white sm:p-[22px] md:min-h-[640px]">
      <Image src={image} alt="" fill sizes="(min-width: 768px) 35vw, 100vw" className="-z-10 object-cover" />
      <div className="absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-black/25 to-transparent" />
      <h3 className="text-[1.75rem] font-medium leading-[1.1] tracking-[-0.05em] text-white sm:text-[30px]">{t(title)}</h3>
      <p className="mt-4 max-w-[380px] text-[15px] font-medium leading-[1.75] tracking-snug text-white">{t(text)}</p>
    </article>
  );
}
