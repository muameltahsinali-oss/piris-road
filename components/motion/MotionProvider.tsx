'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { loadMotion, prefersReducedMotion, type Motion } from '@/lib/motion';

/**
 * Site-wide motion runtime, mirroring the theme's boot sequence:
 *
 *  1. Lenis smooth scrolling — `duration: 1`, easing `1 - (1 - t)^4`,
 *     no smoothing on touch; in-page `#anchor` links glide over 1.2s.
 *  2. The preloader ("L[logo]ADING...") shows until `window.load`, then fades
 *     (0.5s) with the letters lifting 100px, and is removed after 1.5s.
 *  3. Only after that does `afterPreloader()` run — the headline split-text
 *     intros. Components read `ready` from this context to wait for it.
 *
 * With prefers-reduced-motion everything is skipped and content shows at once.
 * GSAP and Lenis are fetched in parallel with the page load (see lib/motion.ts);
 * if they fail to load, the preloader still lifts and content shows unanimated.
 */

const MotionContext = createContext<{ ready: boolean; reduced: boolean }>({ ready: false, reduced: false });
export const useMotion = () => useContext(MotionContext);

export function MotionProvider({ children, logo }: { children: React.ReactNode; logo: string }) {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [preloader, setPreloader] = useState<'on' | 'leaving' | 'gone'>('on');
  const lenisRef = useRef<Lenis | null>(null);
  const motionRef = useRef<Motion | null>(null);
  const pathname = usePathname();

  // Boot: load GSAP + Lenis, start smooth scrolling, run the preloader.
  useEffect(() => {
    const isReduced = prefersReducedMotion();
    setReduced(isReduced);

    if (isReduced) {
      setPreloader('gone');
      setReady(true);
      return;
    }

    let disposed = false;
    let teardown: (() => void) | undefined;
    let removeTimer: ReturnType<typeof setTimeout>;

    const finish = () => {
      if (disposed) return;
      setPreloader('leaving');
      setReady(true);
      removeTimer = setTimeout(() => setPreloader('gone'), 1500);
      motionRef.current?.ScrollTrigger.refresh();
    };

    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', () => resolve(), { once: true });
    });

    Promise.all([loadMotion(), import('lenis'), pageLoaded])
      .then(([motion, { default: LenisClass }]) => {
        if (disposed) return;
        const { gsap, ScrollTrigger } = motion;
        motionRef.current = motion;

        const lenis = new LenisClass({
          duration: 1,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
          smoothWheel: true,
          syncTouch: false,
        });
        lenisRef.current = lenis;
        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        const onAnchor = (e: MouseEvent) => {
          const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
          if (!a) return;
          const target = document.querySelector(a.getAttribute('href') || '');
          if (!target) return;
          e.preventDefault();
          lenis.scrollTo(target as HTMLElement, {
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        };
        document.addEventListener('click', onAnchor);

        teardown = () => {
          document.removeEventListener('click', onAnchor);
          gsap.ticker.remove(tick);
          lenis.destroy();
          lenisRef.current = null;
        };
        requestAnimationFrame(finish);
      })
      .catch((err) => {
        // A failed chunk must not leave the page behind the preloader.
        console.error('[motion] failed to load', err);
        pageLoaded.then(finish);
      });

    return () => {
      disposed = true;
      clearTimeout(removeTimer);
      teardown?.();
    };
  }, []);

  // Client-side navigation: jump to top and re-measure scroll scenes.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    lenisRef.current?.scrollTo(0, { immediate: true });
    const id = requestAnimationFrame(() => motionRef.current?.ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <MotionContext.Provider value={{ ready, reduced }}>
      {preloader !== 'gone' ? <Preloader logo={logo} leaving={preloader === 'leaving'} /> : null}
      {children}
    </MotionContext.Provider>
  );
}

/** `.as-preloader` — white overlay with the bouncing "L[logo]ADING..." letters. */
function Preloader({ logo, leaving }: { logo: string; leaving: boolean }) {
  const letters = ['L', 'logo', 'A', 'D', 'I', 'N', 'G', '.', '.', '.'];
  return (
    <div
      aria-hidden
      className={`preloader-root fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-[opacity,visibility] duration-500 ease-out ${
        leaving ? 'pointer-events-none invisible opacity-0' : 'opacity-100'
      }`}
    >
      <div
        dir="ltr"
        className={`flex items-end text-[2rem] font-medium leading-none text-black transition-transform duration-500 ${
          leaving ? '-translate-y-[100px]' : ''
        }`}
      >
        {letters.map((l, i) => (
          <span
            key={i}
            className="preloader-letter inline-block px-[0.2em] uppercase"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {l === 'logo' ? <Image src={logo} alt="" width={46} height={46} priority className="h-[1em] w-[1em]" /> : l}
          </span>
        ))}
      </div>
    </div>
  );
}
