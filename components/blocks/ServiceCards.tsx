import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Container, Eyebrow } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { SplitText } from '@/components/motion/SplitText';
import { Reveal } from '@/components/motion/Reveal';
import { Odometer } from '@/components/motion/Odometer';
import { MagneticArea, Magnetic } from '@/components/motion/Interactions';
import { ScrollScene } from '@/components/motion/ScrollScene';
import { services as allServices, type Service } from '@/content/services';
import { servicesHome } from '@/content/company';
import type { Translate } from '@/lib/i18n';

/**
 * `as-portfolio-1` with the theme's motion:
 *  - the heading block (eyebrow, flip-in title and the outsized pale title)
 *    pins at 10% from the top while the cards scroll up over it, and the pale
 *    title shrinks to half size as you go (≥992px; `portfolio1_pin_elm`);
 *  - each card is a magnetic trigger: the photo drifts toward the pointer;
 *    keyword tags are magnetic buttons that turn brand blue on hover;
 *  - the "{350+ Business}" odometer rolls, copy and button slide in from the side.
 */
export function ServiceCards({
  t,
  eyebrow,
  title,
  bigTitle,
  items = allServices,
  imageKind = 'card',
  withStat = false,
}: {
  t: Translate;
  eyebrow?: string;
  title?: string;
  bigTitle?: string;
  items?: Service[];
  /** "card" = the photographic cards used on Home; "featured" = the images the Services page used. */
  imageKind?: 'card' | 'featured';
  withStat?: boolean;
}) {
  // Column-first, like the theme: the first half fills the start column.
  const half = Math.ceil(items.length / 2);
  const left = items.slice(0, half);
  const right = items.slice(half);
  const hasHeading = Boolean(eyebrow || title || bigTitle);

  const grid = (
    <div className="relative z-10 mt-12 grid gap-8 md:grid-cols-2 md:gap-x-[clamp(2rem,9vw,7.5rem)]">
      <ul className="flex flex-col gap-8 md:gap-[140px]">
        {left.map((s) => (
          <li key={s.slug}>
            <ServiceCard t={t} service={s} imageKind={imageKind} />
          </li>
        ))}
      </ul>
      <ul className="flex flex-col gap-8 md:gap-[140px] md:pt-[180px]">
        {right.map((s) => (
          <li key={s.slug}>
            <ServiceCard t={t} service={s} imageKind={imageKind} />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section className="overflow-hidden bg-white pb-16 pt-4 sm:pb-20 lg:pb-[100px]">
      <Container>
        {hasHeading ? (
          <ScrollScene scene="servicesPin">
            <div data-scene="pin" className="text-center">
              {eyebrow ? <Eyebrow>{t(eyebrow)}</Eyebrow> : null}
              {title ? (
                <h2 className="mx-auto mt-3 max-w-[700px] text-display font-medium text-heading">
                  <SplitText>{t(title)}</SplitText>
                </h2>
              ) : null}
              {bigTitle ? (
                <p
                  data-scene="big-title"
                  aria-hidden
                  className="pointer-events-none mt-6 origin-top select-none text-[clamp(3.5rem,13vw,15rem)] font-bold leading-none tracking-[-0.06em] text-[#e6e6e6]"
                >
                  <SplitText>{t(bigTitle)}</SplitText>
                </p>
              ) : null}
            </div>
            {grid}
          </ScrollScene>
        ) : (
          grid
        )}

        {withStat ? (
          <div className="relative z-10 mt-20 flex flex-col items-center justify-center gap-8 bg-white text-center md:flex-row md:gap-12 md:text-start">
            <p className="flex items-center font-mono text-black" dir="ltr">
              <span className="text-[72px] font-extralight leading-none text-brand">{'{'}</span>
              <span className="px-1 text-[56px] font-medium leading-none tracking-[-0.06em]">
                <Odometer value={servicesHome.stat.value} />
              </span>
              <span className="flex flex-col self-center">
                <span className="font-sans text-[28px] font-medium leading-none text-brand">{servicesHome.stat.suffix}</span>
                <span className="font-sans text-sm font-medium text-muted">{t(servicesHome.stat.label)}</span>
              </span>
              <span className="text-[72px] font-extralight leading-none text-brand">{'}'}</span>
            </p>
            <Reveal as="p" animation="fadeInRight2" className="max-w-[300px] text-[15px] font-medium leading-6 tracking-snug text-body">
              {t(servicesHome.description)}
            </Reveal>
            <Reveal animation="fadeInRight2">
              <Button href="/services" variant="dark">
                {t(servicesHome.button)}
              </Button>
            </Reveal>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

export function ServiceCard({
  t,
  service,
  imageKind = 'card',
}: {
  t: Translate;
  service: Service;
  imageKind?: 'card' | 'featured';
}) {
  const img = imageKind === 'card' ? service.cardImage ?? service.image : service.image;
  return (
    <MagneticArea as="article" className="rounded-[10px] border-[10px] border-white bg-white shadow-card">
      <div className="relative aspect-[540/310] overflow-hidden rounded-[6px] bg-paper">
        <Link href={`/services/${service.slug}`} className="absolute inset-0 block" aria-label={t(service.cardTitle)}>
          <span data-magnetic className="absolute -inset-4 block">
            <Image src={img} alt={t(service.cardTitle)} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </span>
        </Link>
        {service.tags.length ? (
          <ul className="absolute end-3 top-3 flex max-w-[92%] flex-wrap justify-end gap-1.5">
            {service.tags.slice(0, imageKind === 'card' ? 3 : 4).map((tag) => (
              <li key={tag}>
                <Magnetic>
                  <span className="rounded-lg bg-white/80 px-[11px] py-[5px] text-sm font-medium leading-[1.625] tracking-snug text-heading backdrop-blur transition-all duration-500 ease-cube hover:bg-brand hover:text-white">
                    {t(tag)}
                  </span>
                </Magnetic>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="px-3.5 pb-3 pt-5">
        <h3 className="text-[22px] font-semibold leading-[1.1] tracking-[-0.05em] text-heading">
          <Link href={`/services/${service.slug}`} className="transition-colors duration-[400ms] ease-cube hover:text-brand">
            {t(service.cardTitle)}
          </Link>
        </h3>
        <p className="mt-2.5 text-base font-medium leading-[1.625] tracking-snug text-body">{t(service.summary)}</p>
      </div>
    </MagneticArea>
  );
}
