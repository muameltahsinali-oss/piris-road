import Image from 'next/image';
import { Container, Eyebrow } from '@/components/ui/Section';
import { SplitText } from '@/components/motion/SplitText';
import { Reveal } from '@/components/motion/Reveal';
import { ScrollScene } from '@/components/motion/ScrollScene';
import { ceoMessage, testimonials, provenBlock } from '@/content/company';
import { siteConfig } from '@/content/site';
import type { Translate } from '@/lib/i18n';

/**
 * About — "CEO Message" (staging copy): pale grey band with the quote and
 * signature on the start side, Vision and Mission as white cards on the other.
 */
export function CeoMessage({ t }: { t: Translate }) {
  return (
    <section className="relative overflow-hidden bg-[#e7e7e7] py-16 sm:py-20 lg:py-[90px]">
      <Image src="/decor/ceo-wave.webp" alt="" width={575} height={275} className="absolute bottom-0 end-0 w-[45%] opacity-70" aria-hidden />
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-0">
          <div className="lg:border-e lg:border-black/15 lg:pe-10">
            <p className="flex items-center gap-2 text-[15px] font-medium text-heading">
              <span className="h-2 w-2 rounded-[2px] bg-accent" aria-hidden />
              {t(ceoMessage.eyebrow)}
            </p>
            <blockquote className="mt-8 text-[1.5rem] leading-[1.15] tracking-[-0.04em] text-heading">
              <strong className="font-semibold">{t(ceoMessage.quoteLead)}</strong> {t(ceoMessage.quoteRest)}
            </blockquote>
            <div className="mt-8 flex items-center gap-3">
              <Image src="/logos/logo-3d.webp" alt="" width={56} height={56} className="h-12 w-12" />
              <div>
                <p className="text-lg font-semibold tracking-snug text-heading">{t(ceoMessage.author)}</p>
                <p className="text-xs text-body">{t(ceoMessage.role)}</p>
              </div>
            </div>
          </div>

          <ul className="grid content-center gap-5 sm:grid-cols-2 lg:ps-10">
            {ceoMessage.cards.map((c, i) => (
              <Reveal as="li" key={c.title} animation="fadeInRight2" delay={i * 0.2} className="group rounded-[24px] bg-white/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,.05)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  {/* .as-about-3-card: title nudges 3px on hover; icon rubber-bands */}
                  <h3 className="text-lg font-bold tracking-snug text-heading transition-all duration-300 hover:translate-x-[3px] hover:text-brand">{t(c.title)}</h3>
                  <Image src={c.icon} alt="" width={47} height={47} className="hover-rubber h-10 w-10 opacity-70" aria-hidden />
                </div>
                <p className="mt-5 text-sm leading-[1.7] text-body">{t(c.text)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/**
 * About — client reviews laid out as overlapping cards around a pale
 * "Testimonial" watermark, as on staging.
 */
export function Testimonials({ t }: { t: Translate }) {
  const offsets = ['lg:mt-[160px]', 'lg:mt-0', 'lg:mt-[160px]', 'lg:-mt-[40px] lg:col-start-2'];
  // Staging order: item1 Mohammad Dawd and item2 Ali sulaiman rise, item3 (top
  // centre) drops from above, item4 Safwan slides in from the side.
  const sceneKeys = ['t-1', 't-3', 't-2', 't-4'];
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-[100px]">
      <Container className="relative">
        <div className="text-center">
          <Eyebrow>{t(testimonials.eyebrow)}</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[760px] text-display font-medium text-heading">
            <SplitText>{t(testimonials.title)}</SplitText>
          </h2>
        </div>
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[48%] select-none text-center text-[clamp(5rem,16vw,15rem)] font-semibold leading-none tracking-[-0.06em] text-[#efefef]"
        >
          {t(testimonials.watermark)}
        </p>

        {/* at 1400px and up the four cards converge as the section scrolls */}
        <ScrollScene scene="testimonials" as="ul" className="relative mx-auto mt-12 grid max-w-[980px] gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.items.map((item, i) => (
            <li key={i} className={offsets[i]} data-scene={sceneKeys[i]}>
              <figure className="flex h-full flex-col rounded-[16px] border border-black/5 bg-white p-7 shadow-[0_6px_30px_rgba(0,0,0,.07)]">
                <div className="flex items-start justify-between gap-4">
                  <figcaption>
                    {item.name ? <p className="font-semibold tracking-snug text-heading">{item.name}</p> : null}
                    <p className="text-sm text-muted">{t(testimonials.label)}</p>
                  </figcaption>
                  {item.avatar ? (
                    <Image src={item.avatar} alt={item.name || ''} width={72} height={72} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-base font-semibold text-brand-dark" aria-hidden>
                      {item.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}
                </div>
                <svg viewBox="0 0 40 28" className="mt-10 h-7 w-10 text-[#cfcfcf]" fill="currentColor" aria-hidden>
                  <path d="M0 28V17C0 7 5 1.5 15 0l1.5 4C11 5.5 8.5 8.5 8.5 13H16v15zm22 0V17c0-10 5-15.5 15-17l1.5 4C33 5.5 30.5 8.5 30.5 13H38v15z" />
                </svg>
                <blockquote className="mt-5 text-[17px] leading-[1.35] tracking-[-0.02em] text-heading">{item.quote}</blockquote>
              </figure>
            </li>
          ))}
        </ScrollScene>
      </Container>
    </section>
  );
}

/**
 * Our Services — client quote, experience panel, industries panel and photo
 * strip (staging copy).
 */
export function ProvenBlock({ t }: { t: Translate }) {
  return (
    <section className="bg-white pb-16 sm:pb-20 lg:pb-[100px]">
      <Container>
        {/* minmax(0,…) tracks: the endless photo strip below is wider than any
            column, and an `auto` track would stretch to fit it and widen the page. */}
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-2.5 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-[6px] bg-[#dedede] p-8 sm:p-10">
            <Image src="/decor/dots.webp" alt="" width={607} height={364} className="absolute bottom-0 start-[20%] w-[60%] opacity-60" aria-hidden />
            <blockquote className="relative text-[20px] font-medium leading-[1.3] tracking-snug text-body">{t(provenBlock.quote)}</blockquote>
          </div>
          <div className="relative flex flex-col justify-end overflow-hidden rounded-[6px] bg-black p-6 text-white sm:p-8">
            {/* .as-about-4-growth .img-elm wipes in over 2s when scrolled into view (wa_add_class) */}
            <Reveal className="clip-reveal absolute inset-0">
              <Image src="/misc/proven-2.webp" alt="" fill sizes="30vw" className="object-cover opacity-30" />
            </Reveal>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-brand-dark/50" />
            <h3 className="relative text-[35px] font-bold leading-none tracking-[-0.05em] text-white">
              <SplitText>{t(provenBlock.experienceTitle)}</SplitText>
            </h3>
            <p className="relative mt-5 text-[18px] font-medium leading-[1.625] tracking-snug text-[#b2b1b1]">{t(provenBlock.experienceText)}</p>
          </div>
        </div>

        <div className="mx-auto mt-2.5 grid max-w-[1120px] grid-cols-1 gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)]">
          <div className="relative overflow-hidden rounded-[6px] bg-[#232323] p-6 text-white sm:p-8">
            <Image src="/blog/containers-bg.webp" alt="" fill sizes="30vw" className="object-cover opacity-25" aria-hidden />
            <h3 className="relative text-[30px] font-semibold leading-[1.11] tracking-[-0.05em] text-white">
              <SplitText>{t(provenBlock.performanceTitle)}</SplitText>
            </h3>
            <p className="relative mt-4 text-[18px] font-medium leading-[1.625] tracking-snug text-[#b4b4b4]">{t(provenBlock.performanceText)}</p>
          </div>
          <div className="rounded-[6px] bg-[#dedede] p-2.5">
            {/* photo strip scrolls sideways endlessly (wa_marquee_left_nopause) */}
            <div className="h-full overflow-hidden rounded-[4px] bg-white p-2.5">
              <ul className="flex h-full min-h-[120px] w-max animate-marquee-slow gap-2.5">
                {[...provenBlock.images, ...provenBlock.images].map((src, i) => (
                  <li key={i} className="relative min-h-[120px] w-[180px] shrink-0 overflow-hidden rounded-[6px]">
                    <Image src={src} alt={i < provenBlock.images.length ? siteConfig.name : ''} fill sizes="180px" className="object-cover" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
