'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Odometer.js counter as the theme uses it (`.odometer` + jQuery appear): when
 * it scrolls into view each digit column rolls upward from 0 to its value in a
 * 2s CSS transition (odometer-theme-default).
 */
export function Odometer({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  const digits = String(value).split('').map(Number);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`inline-flex overflow-hidden leading-none ${className ?? ''}`} dir="ltr" aria-label={String(value)}>
      {digits.map((d, i) => (
        <span key={i} className="relative inline-block h-[1em] overflow-hidden" aria-hidden>
          <span className="invisible">0</span>
          <span
            className="absolute inset-x-0 top-0 flex flex-col"
            style={{
              transform: `translateY(-${on ? d * 10 : 0}%)`,
              transition: 'transform 2s ease',
            }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block h-[1em] text-center">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
