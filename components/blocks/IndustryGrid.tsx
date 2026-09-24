import Image from 'next/image';
import { Container, Eyebrow } from '@/components/ui/Section';
import { SplitText } from '@/components/motion/SplitText';
import { MagneticArea } from '@/components/motion/Interactions';
import { ScrollScene } from '@/components/motion/ScrollScene';
import { industries, industriesSection } from '@/content/company';
import type { Translate } from '@/lib/i18n';

/**
 * `as-team-1`, repurposed as the industries grid, with the theme's motion:
 *  - heading flips in (`.wa_title_spilt_1`);
 *  - ≥1600px the first four cards fly in from the About block (scroll scene);
 *  - each card is a magnetic trigger — the photo drifts toward the pointer;
 *  - hover: the 6px frame turns white, a rotated brand-blue square rises from
 *    below, and the sector name slides up into view (0.5s, --as-cube-1).
 */
export function IndustryGrid({ t }: { t: Translate }) {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-[70px]">
      <Container>
        <div className="text-center">
          <Eyebrow>{t(industriesSection.eyebrow)}</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[760px] text-display font-medium text-heading">
            <SplitText>{t(industriesSection.title)}</SplitText>
          </h2>
        </div>

        <ScrollScene scene="industries" as="ul" className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {industries.map((ind) => (
            <li key={ind.key} data-scene="member" className="will-change-transform">
              <MagneticArea className="group relative aspect-[318/475] overflow-hidden rounded-[10px] border-[6px] border-transparent bg-paper transition-colors duration-500 ease-cube hover:border-white">
                <div data-magnetic className="absolute -inset-4">
                  <Image
                    src={ind.image}
                    alt={t(ind.name)}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
                {/* member-img::after — the rotated blue square that rises on hover */}
                <span
                  aria-hidden
                  className="absolute bottom-[-73%] start-[39%] h-1/2 w-3/4 -translate-x-1/2 rotate-45 rounded-[20px] bg-brand opacity-0 transition-all duration-500 ease-cube group-hover:bottom-[-53%] group-hover:opacity-100 rtl:translate-x-1/2"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-center transition-all duration-500 ease-cube sm:p-6 lg:translate-y-full lg:bg-none lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                  <h3 className="text-lg font-medium leading-tight tracking-tightest text-white sm:text-[26px]">{t(ind.name)}</h3>
                </div>
              </MagneticArea>
            </li>
          ))}
        </ScrollScene>
      </Container>
    </section>
  );
}
