'use client';

import { useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

/**
 * `as-accordion-item` behaviour: one item open at a time (the first by
 * default); the open item gains a faint border (`.wa_accordion_item.active`);
 * closed titles sit at 40% opacity and turn brand blue on hover while their
 * round icon fills blue; the icon's plus rotates 135° into an × when open;
 * panels expand smoothly. Each item rises in on scroll (`wow fadeInUp2`).
 */
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);

  return (
    <ul className="mt-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <Reveal
            as="li"
            key={item.q}
            animation="fadeInUp2"
            className={cn('border transition-colors duration-500', isOpen ? 'border-white/10' : 'border-transparent')}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="group flex w-full items-center gap-5 px-5 py-6 text-start sm:gap-[30px] sm:px-[25px]"
              >
                <span
                  className={cn(
                    'flex flex-1 items-baseline gap-3 text-lg font-medium leading-snug tracking-snug text-white transition-all duration-500 ease-cube sm:text-2xl',
                    isOpen ? 'opacity-100' : 'opacity-40 group-hover:text-brand group-hover:opacity-100',
                  )}
                >
                  <span className="font-mono text-sm sm:text-base">{String(i + 1).padStart(2, '0')}.</span>
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#3d3d3d] text-white transition-all duration-500 ease-cube',
                    !isOpen && 'group-hover:bg-brand group-hover:text-black',
                  )}
                >
                  <svg viewBox="0 0 16 16" className={cn('h-4 w-4 transition-transform duration-500', isOpen && 'rotate-[135deg]')} fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M8 2v12M2 8h12" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>
            <div className={cn('grid transition-[grid-template-rows] duration-500 ease-cube', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <p className="px-5 pb-6 ps-[3.25rem] text-[15px] font-medium leading-[1.7] tracking-snug text-white/60 sm:px-[25px] sm:ps-[4.6rem]">{item.a}</p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}
