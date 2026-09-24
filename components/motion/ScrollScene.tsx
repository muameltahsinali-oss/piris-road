'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { useGsap, isRtlDocument } from '@/lib/motion';
import { useMotion } from './MotionProvider';

export type SceneName = 'partner' | 'servicesPin' | 'cta' | 'process' | 'industries' | 'testimonials';

/**
 * Scroll-scrubbed scenes from the theme (avista-core.js), one per section.
 * Each runs only above the breakpoint the theme used, inside gsap.matchMedia so
 * it tears down cleanly on resize. Parts are addressed with `data-scene="…"`.
 * Horizontal offsets are mirrored on RTL pages.
 *
 *  partner      ≥1200  clouds slide in from ±150px, container rises 300px and
 *                      untwists from -30° — scrubbed from "top 90%" to "top -10%".
 *  servicesPin  ≥992   section heading pins while the service cards scroll up
 *                      over it; the huge pale title shrinks to 50%.
 *  cta          ≥992   hands, photos, "Let's Work / Together!" and buttons drift
 *                      into place, scrubbed from "top 50%" to "top top".
 *  process      ≥992   section pins for 900px while step cards 2 and 3 slide
 *                      left and stack onto card 1.
 *  industries   ≥1600  the first four photo cards fly in from the About block
 *                      (top-right) at 70% scale.
 *  testimonials ≥1400  review cards converge from above, below and the side.
 */
export function ScrollScene({
  scene,
  children,
  className,
  as: Tag = 'div',
  id,
}: {
  scene: SceneName;
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();

  useGsap(
    ({ gsap, ScrollTrigger }) => {
      const root = ref.current;
      if (!root) return;
      const dir = isRtlDocument() ? -1 : 1;
      const q = (name: string) => root.querySelectorAll<HTMLElement>(`[data-scene="${name}"]`);
      const one = (name: string) => root.querySelector<HTMLElement>(`[data-scene="${name}"]`);
      const mm = gsap.matchMedia();

      if (scene === 'partner') {
        mm.add('(min-width: 1200px)', () => {
          gsap
            .timeline({ scrollTrigger: { trigger: root, start: 'top 90%', end: 'top -10%', scrub: true } })
            .from(q('cloud-1'), { x: 150 * dir })
            .from(q('cloud-2'), { x: -150 * dir }, '<')
            .from(q('rocket'), { y: 300, x: 100 * dir, rotation: -30 * dir }, '<10%');
        });
      }

      if (scene === 'servicesPin') {
        mm.add('(min-width: 992px)', () => {
          const pin = one('pin');
          if (!pin) return;
          ScrollTrigger.create({ trigger: root, start: 'top 10%', end: 'bottom 85%', pin, pinSpacing: false });
          gsap
            .timeline({ scrollTrigger: { trigger: root, start: 'top 10%', end: 'bottom bottom', scrub: true } })
            .to(q('big-title'), { scale: 0.5 });
        });
      }

      if (scene === 'cta') {
        mm.add('(min-width: 992px)', () => {
          gsap
            .timeline({ scrollTrigger: { trigger: root, start: 'top 50%', end: 'top top', scrub: true } })
            .from(q('hand-1'), { x: 150 * dir, y: 150 })
            .from(q('hand-2'), { x: -150 * dir, y: -150 }, '<')
            .from(q('img-1'), { x: 250 * dir, rotation: 30 * dir, opacity: 0 }, '<10%')
            .from(q('img-2'), { x: -250 * dir, y: 150, rotation: -30 * dir, opacity: 0 }, '<10%')
            .from(q('title-1'), { x: 100 * dir, y: -50, opacity: 0 }, '<10%')
            .from(q('title-2'), { x: 250 * dir, y: -150, opacity: 0 }, '<10%')
            .from(q('buttons'), { x: 250 * dir, y: -150, opacity: 0 }, '<10%');
        });
      }

      if (scene === 'process') {
        mm.add('(min-width: 992px)', () => {
          const cards = Array.from(q('card'));
          if (cards.length < 3) return;
          const step = () => (cards[0].offsetWidth + parseFloat(getComputedStyle(cards[0].parentElement!).columnGap || '0')) * -dir;
          ScrollTrigger.create({ trigger: root, start: 'top top', end: '+=900', pin: true, pinSpacing: true });
          gsap
            .timeline({ scrollTrigger: { trigger: root, start: 'top top', end: '+=900', scrub: true, invalidateOnRefresh: true } })
            .to(cards[1], { x: () => step() })
            .to(cards[2], { x: () => step() }, '<')
            .to(cards[2], { x: () => step() * 2 });
        });
      }

      if (scene === 'industries') {
        mm.add('(min-width: 1600px)', () => {
          const members = Array.from(q('member')).slice(0, 4);
          const offsets = [1187, 830, 460, 100];
          const trigger = document.getElementById('about-intro') ?? root;
          const tl = gsap.timeline({ scrollTrigger: { trigger, start: 'top 10%', end: 'top -70%', scrub: true } });
          members.forEach((m, i) => tl.from(m, { x: offsets[i] * dir, y: -828, scale: 0.7 }, i === 0 ? 0 : '<50%'));
        });
      }

      if (scene === 'testimonials') {
        mm.add('(min-width: 1400px)', () => {
          gsap
            .timeline({ scrollTrigger: { trigger: root, start: 'top 40%', end: 'bottom bottom', scrub: true } })
            .from(q('t-1'), { yPercent: 60 })
            .from(q('t-2'), { yPercent: 60 }, '<')
            .from(q('t-3'), { yPercent: -130 }, '<')
            .from(q('t-4'), { xPercent: -100 * dir }, '<');
        });
      }

      return () => mm.revert();
    },
    [scene],
    { enabled: ready && !reduced },
  );

  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}
