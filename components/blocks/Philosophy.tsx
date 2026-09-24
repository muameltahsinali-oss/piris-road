import Image from 'next/image';
import { Container, Eyebrow } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { SplitText } from '@/components/motion/SplitText';
import { Reveal } from '@/components/motion/Reveal';
import { philosophy } from '@/content/company';
import { translateAs, type Translate } from '@/lib/i18n';

const columnImages = ['/misc/row-1.webp', '/misc/row-2.webp', '/misc/our-philosophy.webp'];

/**
 * `as-price-1` with the theme's motion:
 *  - title flips in; the description rises (`fadeInUp2`, .3s);
 *  - the photo column scrolls upward endlessly (`.wa_marquee_down_top`, 30s loop);
 *  - hovering a card floods it brand blue and turns its text white
 *    (0.5s, --as-cube-1); the Values button switches from blue to black.
 */
export function Philosophy({ t }: { t: Translate }) {
  return (
    <section id="philosophy" className="bg-white py-16 sm:py-20 lg:py-[100px]">
      <Container>
        <div className="text-center">
          <Eyebrow>{t(philosophy.eyebrow)}</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[760px] text-display font-medium text-heading">
            <SplitText>{translateAs(t, philosophy.title, philosophy.titleKey)}</SplitText>
          </h2>
          <Reveal as="p" animation="fadeInUp2" delay={0.3} className="mx-auto mt-4 max-w-[520px] text-base font-medium leading-[1.625] tracking-snug text-body">
            {t(philosophy.description)}
          </Reveal>
        </div>

        <div className="mx-auto mt-12 grid max-w-[1120px] gap-6 lg:grid-cols-[0.7fr_1fr] lg:gap-8">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <div className="relative h-[420px] overflow-hidden rounded-[4px] border-[6px] border-white shadow-[0_0_1px_rgba(0,0,0,.4)] sm:h-[560px] lg:h-[calc(100vh-80px)] lg:max-h-[760px]">
              <div className="animate-marquee-y flex flex-col gap-1.5">
                {[...columnImages, ...columnImages].map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt={i === 2 ? t(philosophy.title) : ''}
                    width={1000}
                    height={1200}
                    sizes="(min-width: 1024px) 400px, 100vw"
                    className="h-auto w-full"
                  />
                ))}
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-6">
            {philosophy.panels.map((p, i) => (
              <li
                key={p.name}
                className="group relative overflow-hidden rounded-[10px] border-8 border-white bg-plan p-7 shadow-[0_0_1px_rgba(0,0,0,.4)] transition-colors duration-500 ease-cube hover:bg-brand sm:p-10"
              >
                <Image src="/decor/card-grid-light.webp" alt="" fill className="object-cover opacity-70" aria-hidden />
                <div className="relative">
                  <h3 className="text-plan-title font-medium text-maroon transition-colors duration-500 ease-cube group-hover:text-white">{t(p.name)}</h3>
                  <p className="mt-2 text-[17px] font-medium leading-[1.65] tracking-snug text-[#343434] transition-colors duration-500 ease-cube group-hover:text-white">
                    {t(p.text)}
                  </p>

                  {p.items.length ? (
                    <ul className="mt-12 space-y-2">
                      {p.items.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-[15px] font-medium tracking-snug text-heading transition-colors duration-500 ease-cube group-hover:text-white">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand group-hover:bg-white" aria-hidden />
                          {t(item)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="mt-14 block h-1.5 w-1.5 rounded-full bg-brand group-hover:bg-white" aria-hidden />
                  )}

                  {i === philosophy.panels.length - 1 ? (
                    <div className="mt-6">
                      <Button href="/contact" variant="brand" arrow={false} full className="group-hover:bg-black">
                        {t(philosophy.button)}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
