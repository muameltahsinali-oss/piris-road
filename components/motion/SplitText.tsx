'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { useGsap, isRtlDocument } from '@/lib/motion';
import { useMotion } from './MotionProvider';

type Variant = 'flip' | 'rise' | 'words';

/**
 * Headline text effects from the theme, reproduced with the same GSAP plugin
 * (SplitText) and the same parameters:
 *
 *  flip  — `.wa_title_spilt_1`: characters start at opacity 0, rotateX(-80deg)
 *          around a point 10px behind them, and turn up to face the reader.
 *          1s (0.3s under 768px), power3.out, 0.05s stagger radiating from the
 *          centre. Fires when the heading reaches 80% of the viewport.
 *  rise  — `.wa_split_up`: characters rise 50px from transparent, 0.3s each,
 *          0.15s stagger; reverses when scrolled back above (86% line).
 *  words — `.wa_title_split_2`: words drift up 20px out of a 5px blur, 0.75s,
 *          0.02s stagger, once.
 *
 * Like the theme, these only run on LTR pages — Arabic is shown unsplit.
 * Headline-level effects wait for the preloader, as `afterPreloader()` did.
 */
export function SplitText({
  children,
  as: Tag = 'span',
  variant = 'flip',
  delay = 0,
  speed = 1,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  delay?: number;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  const animate = ready && !reduced;

  // Nothing to split (Arabic, reduced motion): just reveal the text, no GSAP needed.
  const reveal = () => {
    if (ref.current) ref.current.style.visibility = 'visible';
  };
  useEffect(() => {
    if (reduced || (ready && isRtlDocument())) reveal();
  }, [ready, reduced]);

  useGsap(
    ({ gsap, SplitText: GsapSplitText }) => {
      const el = ref.current;
      if (!el || isRtlDocument()) return;

      gsap.set(el, { autoAlpha: 1 });

      if (variant === 'flip') {
        const split = GsapSplitText.create(el, { type: 'words,chars', wordsClass: 'split-word', charsClass: 'split-char' });
        const duration = window.innerWidth <= 768 ? speed * 0.3 : speed;
        gsap.set(el, { perspective: 1000, transformStyle: 'preserve-3d' });
        gsap.set(split.words, { perspective: 1000, transformStyle: 'preserve-3d', willChange: 'transform' });
        gsap.set(split.chars, { opacity: 0, rotateX: -80, transformOrigin: 'center center -10px', willChange: 'transform' });
        gsap.to(split.chars, {
          scrollTrigger: { trigger: el, start: 'top 80%' },
          opacity: 1,
          rotateX: 0,
          duration,
          delay,
          ease: 'power3.out',
          stagger: { each: 0.05, from: 'center', grid: 'auto' },
        });
        return () => split.revert();
      }

      if (variant === 'rise') {
        const split = GsapSplitText.create(el, { type: 'lines,words,chars', linesClass: 'split-line' });
        gsap.set(el, { perspective: 400 });
        gsap.set(split.chars, { y: 50, opacity: 0 });
        gsap.to(split.chars, {
          scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' },
          y: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.15,
          delay,
        });
        return () => split.revert();
      }

      const split = GsapSplitText.create(el, { type: 'words' });
      gsap.from(split.words, {
        y: 20,
        filter: 'blur(5px)',
        duration: 0.75,
        stagger: 0.02,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 100%', once: true },
      });
      return () => split.revert();
    },
    [variant, delay, speed],
    { enabled: animate && !isRtlDocument(), split: true, onError: reveal },
  );

  // Hidden until the effect takes over (avoids a flash of un-split text);
  // `.js-motion` is only set when JS runs, so no-JS visitors still see it.
  return (
    <Tag ref={ref} className={`split-pending ${className ?? ''}`}>
      {children}
    </Tag>
  );
}
