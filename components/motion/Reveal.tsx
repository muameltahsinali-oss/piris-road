'use client';

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

export type RevealAnimation =
  | 'fadeInUp2'
  | 'fadeInRight2'
  | 'fadeInLeft2'
  | 'backInUp2'
  | 'slideInRight2'
  | 'zoomIn'
  | 'bounceInUp'
  | 'fadeIn';

/**
 * WOW.js reveal, as the theme configures it (`offset: 50, mobile: true`):
 * the element stays `visibility: hidden` until it comes within 50px of the
 * viewport bottom, then plays its animate.css-style keyframe once — 1s, with an
 * optional delay (the theme's `data-wow-delay`). The keyframes themselves live
 * in globals.css and are copied from avista-core.css / animate.css.
 *
 * In RTL, horizontal entrances are mirrored so content still arrives from the
 * reading-start side.
 */
export function Reveal({
  children,
  animation = 'fadeInUp2',
  delay = 0,
  as: Tag = 'div',
  className,
  style,
}: {
  children: ReactNode;
  animation?: RevealAnimation;
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('wow-done');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.classList.add('wow-in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -50px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`wow wow-${animation} ${className ?? ''}`}
      style={{ ...style, ['--wow-delay' as string]: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}
