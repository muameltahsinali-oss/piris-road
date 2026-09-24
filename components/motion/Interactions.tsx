'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { loadMotion, loadSplitText, isRtlDocument, canHover, prefersReducedMotion, type Gsap } from '@/lib/motion';

/**
 * `.wa_magnetic_btn_1` — the element leans toward the pointer (±5px, i.e.
 * strength 10 across its box) with `elastic.out(1, 0.3)` over 1s, and springs
 * back the same way on leave. Used on almost every button on the staging site.
 */
export function Magnetic({
  children,
  strength = 10,
  className,
  as: Tag = 'span',
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover() || prefersReducedMotion()) return;
    let gsap: Gsap | undefined;
    loadMotion().then((m) => (gsap = m.gsap), () => {});
    const move = (e: MouseEvent) => {
      if (!gsap) return;
      const b = el.getBoundingClientRect();
      gsap.to(el, {
        x: ((e.clientX - b.left) / el.offsetWidth - 0.5) * strength,
        y: ((e.clientY - b.top) / el.offsetHeight - 0.5) * strength,
        duration: 1,
        ease: 'elastic.out(1,0.3)',
      });
    };
    const leave = () => gsap?.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,0.3)' });
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
      gsap?.killTweensOf(el);
    };
  }, [strength]);

  return (
    <Tag ref={ref} className={`inline-flex will-change-transform ${className ?? ''}`}>
      {children}
    </Tag>
  );
}

/**
 * `.wa_magnetic_1_trigger` / `.wa_magnetic_1_elm` — while the pointer is over
 * the trigger (a card), elements marked `data-magnetic` inside it drift up to
 * 15px toward the pointer (strength 30), 1s ease, and settle back on leave.
 * On staging this moves the photos inside service and blog cards.
 */
export function MagneticArea({
  children,
  strength = 30,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover() || prefersReducedMotion()) return;
    let gsap: Gsap | undefined;
    loadMotion().then((m) => (gsap = m.gsap), () => {});
    const targets = () => Array.from(el.querySelectorAll<HTMLElement>('[data-magnetic]'));
    const move = (e: MouseEvent) => {
      if (!gsap) return;
      const b = el.getBoundingClientRect();
      const x = ((e.clientX - b.left) / el.offsetWidth - 0.5) * strength;
      const y = ((e.clientY - b.top) / el.offsetHeight - 0.5) * strength;
      gsap.to(targets(), { x, y, duration: 1, ease: 'power1.out' });
    };
    const leave = () => gsap?.to(targets(), { x: 0, y: 0, duration: 1, ease: 'power1.out' });
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    };
  }, [strength]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Hover character effects on text:
 *  bounce — `.wa_btn_split_1`: on pointer enter, letters drop in alternately
 *           from ±30px, 0.4s power2.out, 0.05s apart (buttons).
 *  flip   — `.menu_1_split`: letters spin in alternately from rotateY ±180°,
 *           0.6s (header menu links).
 * LTR only, like the theme.
 */
export function HoverSplit({
  children,
  effect = 'bounce',
  className,
  triggerParent = true,
}: {
  children: ReactNode;
  effect?: 'bounce' | 'flip';
  className?: string;
  /** Listen on the closest link/button rather than the text span itself. */
  triggerParent?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover() || prefersReducedMotion() || isRtlDocument()) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    loadSplitText().then(
      ({ gsap, SplitText }) => {
        if (disposed) return;
        const split = SplitText.create(el, { type: 'words,chars' });
        const trigger = (triggerParent && (el.closest('a,button') as HTMLElement)) || el;
        const enter = () => {
          split.chars.forEach((char, i) => {
            if (effect === 'bounce') {
              gsap.fromTo(char, { y: i % 2 === 0 ? -30 : 30 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', delay: i * 0.05 });
            } else {
              gsap.fromTo(char, { rotateY: i % 2 === 0 ? -180 : 180 }, { rotateY: 0, opacity: 1, duration: 0.6 });
            }
          });
        };
        trigger.addEventListener('mouseenter', enter);
        cleanup = () => {
          trigger.removeEventListener('mouseenter', enter);
          split.revert();
        };
      },
      () => {},
    );
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [effect, triggerParent]);

  return (
    <span ref={ref} className={className} style={effect === 'flip' ? { perspective: 400 } : undefined}>
      {children}
    </span>
  );
}

/**
 * `.wa_placeholder` — once the field is half visible, its placeholder types
 * itself out one character every 70ms.
 */
export function useTypedPlaceholder(text: string) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.placeholder = text;
      return;
    }
    el.placeholder = '';
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const type = () => {
      if (i < text.length) {
        el.placeholder += text.charAt(i++);
        timer = setTimeout(type, 70);
      }
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          type();
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [text]);
  return ref;
}
