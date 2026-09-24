'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const names: Record<string, string> = { en: 'English', ar: 'العربية' };
const flags: Record<string, string> = { en: '🇺🇸', ar: '🇮🇶' };

/**
 * EN / AR switcher.
 *
 * `floating` reproduces the TranslatePress floating switcher from the live and
 * staging sites: fixed to the bottom corner, #3558e6 background, 14px radius,
 * current language shown, the other one revealed above it. The inline variant is
 * used inside the off-canvas menu.
 */
export function LanguageSwitcher({ floating = false, className }: { floating?: boolean; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const current = (params?.locale as string) ?? routing.defaultLocale;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const go = (loc: string) => {
    setOpen(false);
    router.replace(pathname, { locale: loc });
  };

  if (!floating) {
    return (
      <div className={cn('flex gap-2', className)}>
        {routing.locales.map((loc) => (
          <button
            key={loc}
            type="button"
            lang={loc}
            onClick={() => go(loc)}
            aria-current={loc === current ? 'true' : undefined}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition',
              loc === current ? 'border-brand bg-brand text-white' : 'border-black/10 text-heading hover:border-brand',
            )}
          >
            {names[loc]}
          </button>
        ))}
      </div>
    );
  }

  const others = routing.locales.filter((l) => l !== current);

  return (
    <div ref={ref} className={cn('fixed bottom-5 end-5 z-[60]', className)}>
      {open ? (
        <ul className="mb-2 overflow-hidden rounded-xl bg-[#3558e6] py-1 shadow-[0_10px_30px_rgba(0,0,0,.25)]">
          {others.map((loc) => (
            <li key={loc}>
              <button
                type="button"
                lang={loc}
                onClick={() => go(loc)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                <span aria-hidden>{flags[loc]}</span>
                {names[loc]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label="Language"
        className="flex items-center gap-2 rounded-[14px] bg-[#3558e6] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#2f4fd1]"
      >
        <span aria-hidden>{flags[current]}</span>
        {names[current]}
      </button>
    </div>
  );
}
