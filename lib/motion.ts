'use client';

import { useEffect, type DependencyList } from 'react';
import type { gsap as GsapInstance } from 'gsap';
import type { ScrollTrigger as ScrollTriggerClass } from 'gsap/ScrollTrigger';
import type { SplitText as SplitTextClass } from 'gsap/SplitText';

/**
 * Motion setup shared by every animated component.
 *
 * All timings, eases and offsets used by the components are taken from the
 * Avista theme's own scripts as served by the staging site
 * (themes/avista/assets/js/avista-core.js) and its CSS (avista-core.css).
 * Nothing is eyeballed.
 *
 * GSAP, its plugins and Lenis are loaded on demand rather than bundled into
 * every page's first-load JavaScript: nothing animates before the preloader
 * lifts on `window.load` anyway, and SplitText is only fetched when an LTR
 * page actually splits text (Arabic pages never need it).
 */

export type Gsap = typeof GsapInstance;
export type Motion = { gsap: Gsap; ScrollTrigger: typeof ScrollTriggerClass };
export type MotionWithSplit = Motion & { SplitText: typeof SplitTextClass };

let motionPromise: Promise<Motion> | undefined;
export function loadMotion(): Promise<Motion> {
  motionPromise ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ nullTargetWarn: false });
    return { gsap, ScrollTrigger };
  });
  return motionPromise;
}

let splitPromise: Promise<MotionWithSplit> | undefined;
export function loadSplitText(): Promise<MotionWithSplit> {
  splitPromise ??= Promise.all([loadMotion(), import('gsap/SplitText')]).then(([motion, { SplitText }]) => {
    motion.gsap.registerPlugin(SplitText);
    return { ...motion, SplitText };
  });
  return splitPromise;
}

/**
 * Runs `setup` once GSAP (and optionally SplitText) has loaded, inside a
 * gsap.context so every tween, ScrollTrigger and matchMedia it creates is
 * reverted when the dependencies change or the component unmounts.
 * `setup` may return an extra cleanup (e.g. `split.revert()`).
 * `onError` runs if the chunks fail to load, so content can still be shown.
 */
export function useGsap<S extends boolean = false>(
  setup: (motion: S extends true ? MotionWithSplit : Motion) => void | (() => void),
  deps: DependencyList,
  { enabled = true, split, onError }: { enabled?: boolean; split?: S; onError?: () => void } = {},
) {
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let ctx: ReturnType<Gsap['context']> | undefined;
    let cleanup: void | (() => void);
    (split ? loadSplitText() : loadMotion()).then(
      (motion) => {
        if (disposed) return;
        ctx = motion.gsap.context(() => {
          cleanup = setup(motion as S extends true ? MotionWithSplit : Motion);
        });
      },
      () => {
        if (!disposed) onError?.();
      },
    );
    return () => {
      disposed = true;
      cleanup?.();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}

/** --as-cube-1 from the theme CSS, used by nearly every hover transition. */
export const CUBE_1 = 'cubic-bezier(0.23, 1, 0.32, 1)';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The theme only runs its SplitText effects when the document is LTR
 * (`if (getComputedStyle(document.body).direction !== "rtl")`). Splitting
 * Arabic into characters would also break letter joining, so we keep that rule.
 */
export const isRtlDocument = () => typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

export const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
