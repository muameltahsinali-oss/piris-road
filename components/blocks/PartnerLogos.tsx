import Image from 'next/image';
import { Container, Eyebrow } from '@/components/ui/Section';
import { SplitText } from '@/components/motion/SplitText';
import { Reveal } from '@/components/motion/Reveal';
import { ScrollScene } from '@/components/motion/ScrollScene';
import { partnersSection } from '@/content/company';
import { partners } from '@/content/site';
import type { Translate } from '@/lib/i18n';

/**
 * `as-partner-1`: partner logos in a bordered grid with mono index numbers,
 * and on the other side the rotating "Piris Road" badge, clouds, the 3D
 * container and the hand-drawn "We Manage / Every Step" labels.
 */
export function PartnerLogos({ t }: { t: Translate }) {
  return (
    <section className="overflow-hidden bg-white pb-16 pt-6 sm:pb-20 lg:pb-[100px]">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">
          <div>
            <Eyebrow>{t(partnersSection.eyebrow)}</Eyebrow>
            <h2 className="mt-3 max-w-[440px] text-display font-medium text-heading">
              <SplitText>{t(partnersSection.title)}</SplitText>
            </h2>
            <ul className="mt-10 grid grid-cols-2 ps-px pt-px sm:grid-cols-3">
              {partners.map((p, i) => (
                <Reveal
                  as="li"
                  key={p.src}
                  animation="fadeInRight2"
                  delay={0.1}
                  // .as-partner-1-logo-single:hover — white fill, black border, two blurred
                  // blue glows slide in, logo tinted blue, index number to full opacity
                  className="group relative isolate -ms-px -mt-px grid h-[130px] place-items-center overflow-hidden border border-[#C4C4C4] bg-transparent p-6 transition-all duration-500 ease-cube hover:z-10 hover:border-black hover:bg-white sm:h-[165px]"
                >
                  <span aria-hidden className="absolute -end-[15%] top-[19%] -z-10 h-20 w-20 rounded-full bg-[#3F8CC7] opacity-0 blur-[41px] transition-all duration-500 ease-cube group-hover:-end-[5%] group-hover:top-[9%] group-hover:opacity-100" />
                  <span aria-hidden className="absolute -bottom-[17%] -start-[13%] -z-10 h-20 w-20 rounded-full bg-brand opacity-0 blur-[41px] transition-all duration-500 ease-cube group-hover:-bottom-[7%] group-hover:-start-[3%] group-hover:opacity-100" />
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={220}
                    height={90}
                    className="h-auto max-h-[96px] w-[78%] object-contain transition-all duration-500 ease-cube group-hover:[filter:sepia(1)_saturate(600%)_hue-rotate(195deg)_brightness(0.95)]"
                  />
                  <span className="absolute bottom-2.5 end-5 font-mono text-sm text-black opacity-50 transition-opacity duration-500 group-hover:opacity-100">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>

          <ScrollScene scene="partner" className="relative mx-auto h-[380px] w-full max-w-[420px] sm:h-[440px]">
            {/* rotating badge */}
            <div className="absolute start-0 top-0 z-20 grid h-[150px] w-[150px] place-items-center rounded-full bg-black sm:h-[180px] sm:w-[180px]">
              {/* .circle-text — wa-rotated 20s linear infinite */}
              <Image src="/decor/badge-ring.png" alt="" width={160} height={159} className="absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)] animate-[spinSlow_20s_linear_infinite]" />
              <Image src="/logos/logo-3d.webp" alt="" width={120} height={120} className="h-[62px] w-[62px] sm:h-[74px] sm:w-[74px]" />
            </div>
            {/* container resting on clouds */}
            <div data-scene="rocket" className="absolute end-[-10%] top-[6%] z-10 w-[62%] will-change-transform">
              <Image src="/hero/container-3d.webp" alt="" width={600} height={450} className="h-auto w-full" />
            </div>
            <div data-scene="cloud-1" className="absolute bottom-[4%] end-[2%] z-[11] w-[78%] will-change-transform">
              <Image src="/decor/cloud-1.webp" alt="" width={421} height={307} className="h-auto w-full" />
            </div>
            <div data-scene="cloud-2" className="absolute bottom-[26%] end-[36%] w-[40%] opacity-90 will-change-transform">
              <Image src="/decor/cloud-2.webp" alt="" width={305} height={223} className="h-auto w-full" />
            </div>
            <Image src="/decor/arrow.webp" alt="" width={57} height={72} className="absolute bottom-[34%] end-[26%] z-20 w-[36px] rtl:-scale-x-100" />
            <span className="absolute bottom-[21%] end-[2%] z-20 -rotate-3 rounded-md border border-black/20 bg-white px-2.5 py-1 text-lg font-medium italic tracking-snug text-heading">
              {t(partnersSection.tagOne)}
            </span>
            <span className="absolute bottom-[11%] end-[6%] z-20 rotate-2 rounded-md border border-black/20 bg-white px-2.5 py-1 text-lg font-medium italic tracking-snug text-heading">
              {t(partnersSection.tagTwo)}
            </span>
          </ScrollScene>
        </div>
      </Container>
    </section>
  );
}
