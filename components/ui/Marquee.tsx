'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * `as-marquee-text-1`: two crossing bands — black rotated +4°, brand blue −4°
 * (transform-origin 25% 50%) — scrolling in opposite directions with ✦
 * separators. The theme drives them with jQuery.Marquee
 * (`wa_marquee_left_nopause` / `wa_marquee_right_nopause`: 20px per second,
 * no pause on hover); the loop duration here is computed from the measured
 * width so the speed matches.
 */
export function CrossingMarquee({ rowOne, rowTwo }: { rowOne: string[]; rowTwo: string[] }) {
  return (
    <section className="relative flex h-[240px] flex-col justify-center overflow-hidden bg-white sm:h-[306px]" aria-label={[...rowOne, ...rowTwo].join(', ')}>
      <Band items={rowOne} className="rotate-[4deg] bg-black py-2.5" />
      <Band items={rowTwo} reverse className="-mt-6 -rotate-[4deg] bg-brand py-[15px] sm:-mt-8" />
    </section>
  );
}

function Band({ items, reverse, className }: { items: string[]; reverse?: boolean; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const set = () => {
      const half = track.scrollWidth / 2;
      track.style.animationDuration = `${Math.max(20, half / 20)}s`;
    };
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);

  const doubled = [...items, ...items, ...items, ...items];
  return (
    <div className={cn('-mx-2.5 origin-[25%_50%] overflow-hidden', className)} aria-hidden>
      <div
        ref={trackRef}
        className={cn('flex w-max items-center whitespace-nowrap', reverse ? 'animate-marquee-reverse' : 'animate-marquee')}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center text-xl font-medium tracking-snug text-white sm:text-[28px]">
            <span className="px-6 sm:px-8">{item}</span>
            <span className="text-lg sm:text-2xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
