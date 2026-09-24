import Image from 'next/image';
import { Container, Eyebrow, Lines } from '@/components/ui/Section';
import { SplitText } from '@/components/motion/SplitText';
import { ScrollScene } from '@/components/motion/ScrollScene';
import { workingProcess, storyTimeline } from '@/content/company';
import { translateAs, type Translate } from '@/lib/i18n';

type Step = { label: string; title: string; key?: string; text: string };

/**
 * `as-process-1` with the theme's motion (≥992px): the section pins for 900px
 * of scrolling while step card 2 slides left onto card 1 and card 3 follows,
 * stacking all three (`p1_pin_elm` / `p1_ani_elm`). Hovering a card slides a
 * blurred brand-blue glow in from its top corner. Below 992px the cards simply
 * scroll sideways.
 *
 * Home shows the three workflow steps; About reuses it for the 2018/2020/2023
 * timeline (the About version's heading also flips in).
 */
export function ProcessSteps({ t, variant = 'process' }: { t: Translate; variant?: 'process' | 'timeline' }) {
  const data = variant === 'process' ? workingProcess : storyTimeline;
  const steps: readonly Step[] = variant === 'process' ? workingProcess.steps : storyTimeline.milestones;
  const description = variant === 'process' ? workingProcess.description : null;

  return (
    <ScrollScene scene="process" as="section" className="overflow-hidden bg-night text-white">
      <Container className="flex min-h-0 flex-col justify-center py-16 sm:py-20 lg:min-h-screen lg:py-[110px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.57fr)] lg:gap-8">
          <div className="lg:pt-6">
            <Eyebrow variant="brackets">{t(data.eyebrow)}</Eyebrow>
            <h2 className="mt-5 text-display font-medium text-white">
              {variant === 'timeline' ? (
                data.titleLines.map((l) => (
                  <SplitText key={l} className="block">
                    {t(l)}
                  </SplitText>
                ))
              ) : (
                <Lines lines={data.titleLines.map(t)} />
              )}
            </h2>
            {description ? (
              <p className="mt-5 max-w-[340px] text-[15px] font-medium leading-6 tracking-snug text-white/65 lg:text-justify">{t(description)}</p>
            ) : null}
          </div>

          <ol className="no-scrollbar -me-5 flex min-w-0 snap-x snap-mandatory gap-6 overflow-x-auto pb-2 pe-5 sm:-me-6 sm:pe-6 lg:me-0 lg:snap-none lg:overflow-visible lg:pe-0">
            {steps.map((s, i) => (
              <li
                key={s.label}
                data-scene="card"
                style={{ zIndex: i + 1 }}
                className="group relative isolate flex min-h-[340px] w-[min(510px,82vw)] shrink-0 snap-start flex-col overflow-hidden rounded-[10px] bg-card p-[30px] will-change-transform lg:min-h-[369px] lg:w-[min(510px,34vw)]"
              >
                <Image src="/decor/card-grid-dark.webp" alt="" fill className="-z-10 object-cover opacity-60" aria-hidden />
                <span
                  aria-hidden
                  className="absolute -start-[18%] -top-[22%] -z-10 h-[150px] w-[150px] rounded-full bg-brand opacity-0 blur-[40px] transition-all duration-500 ease-cube group-hover:-start-[8%] group-hover:-top-[12%] group-hover:opacity-100"
                />
                <p className="flex items-start gap-2 text-[22px] font-medium tracking-[-0.05em] text-white">
                  {s.label}
                  <span className="-translate-y-2 text-[25px] leading-none text-brand" aria-hidden>
                    ✦
                  </span>
                </p>
                <h3 className="mt-8 text-[clamp(1.875rem,3vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.05em] text-white">
                  {s.key ? translateAs(t, s.title, s.key) : t(s.title)}
                </h3>
                <div className="mt-auto pt-8">
                  <hr className="mb-5 border-white/10" />
                </div>
                <p className="text-[15px] font-medium leading-6 tracking-snug text-white/50">{t(s.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </ScrollScene>
  );
}
