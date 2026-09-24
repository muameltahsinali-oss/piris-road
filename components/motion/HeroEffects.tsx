'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { loadMotion, canHover, prefersReducedMotion } from '@/lib/motion';
import { useMotion } from './MotionProvider';

/**
 * Hero pointer effects from the theme's `.as-hero-1-area`:
 *
 *  - `.wa_tilt` / `.wa_tilt_elm`: moving across the hero turns the container
 *    image in 3D — rotateY up to ±5.5° (range 11), perspective 1000px — and it
 *    straightens again when the pointer leaves.
 *  - `#wa_cursor_noise`: every mouse move scatters 60 dark 2px particles in a
 *    250px radius that drift outward and fade over ~50 frames.
 *
 * Both are desktop-pointer only.
 */
export function HeroInteractive({ children, className }: { children: ReactNode; className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas || !canHover() || prefersReducedMotion()) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const tiltTarget = section.querySelector<HTMLElement>('[data-tilt]');

    type P = { x: number; y: number; vx: number; vy: number; a: number; life: number };
    let particles: P[] = [];
    let raf = 0;
    let running = false;

    const resize = () => {
      const r = section.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      particles = particles.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.a = Math.max(0, p.a - 0.02);
        ctx.globalAlpha = p.a;
        ctx.fillRect(p.x, p.y, 2, 2);
        return p.life <= 60 && p.a > 0;
      });
      ctx.globalAlpha = 1;
      if (particles.length) raf = requestAnimationFrame(loop);
      else running = false;
    };

    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;

      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 250;
        particles.push({
          x: mx + Math.cos(angle) * dist,
          y: my + Math.sin(angle) * dist,
          vx: Math.cos(angle),
          vy: Math.sin(angle),
          a: 1,
          life: 0,
        });
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }

      if (tiltTarget) {
        const rotateY = (mx / r.width - 0.5) * 11;
        tiltTarget.style.transform = `perspective(1000px) rotateY(${rotateY}deg)`;
      }
    };
    const onLeave = () => {
      if (tiltTarget) tiltTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    };

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className={className}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 -z-[1] h-full w-full" />
      {children}
    </section>
  );
}

/**
 * `#wa_liquid_img` — the theme renders the hero image through PixiJS with a
 * displacement filter driven by a noise texture, animating the displacement
 * from 220 down to 0 over 2s so the container "condenses" out of static on
 * load (desktop ≥1200px only). Reproduced here with an SVG turbulence +
 * displacement filter animated by GSAP over the same range and duration.
 */
export function LiquidImage({ children, className }: { children: ReactNode; className?: string }) {
  const id = useId().replace(/:/g, '');
  const mapRef = useRef<SVGFEDisplacementMapElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotion();

  useEffect(() => {
    const map = mapRef.current;
    const wrap = wrapRef.current;
    if (!map || !wrap) return;
    if (!ready) return;
    if (reduced || !window.matchMedia('(min-width: 1200px)').matches) {
      wrap.style.filter = 'none';
      return;
    }
    let disposed = false;
    let kill: (() => void) | undefined;
    loadMotion().then(
      ({ gsap }) => {
        if (disposed) return;
        const state = { scale: 220 };
        wrap.style.filter = `url(#${id})`;
        const tween = gsap.to(state, {
          scale: 0,
          duration: 2,
          ease: 'power1.out',
          onUpdate: () => map.setAttribute('scale', String(state.scale)),
          onComplete: () => {
            wrap.style.filter = 'none';
          },
        });
        kill = () => tween.kill();
      },
      () => {
        wrap.style.filter = 'none';
      },
    );
    return () => {
      disposed = true;
      kill?.();
    };
  }, [ready, reduced, id]);

  return (
    <div ref={wrapRef} className={className} data-tilt style={{ transformStyle: 'preserve-3d' }}>
      <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap ref={mapRef} in="SourceGraphic" in2="noise" scale="220" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {children}
    </div>
  );
}
