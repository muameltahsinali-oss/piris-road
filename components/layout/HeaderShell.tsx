'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { ArrowBox } from '@/components/ui/Button';
import { SocialIcons } from '@/components/ui/SocialIcons';
import { HoverSplit, Magnetic } from '@/components/motion/Interactions';
import { LanguageSwitcher } from './LanguageSwitcher';
import { siteConfig, headerGallery } from '@/content/site';
import { cn } from '@/lib/utils';

export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

export type HeaderStrings = {
  quoteCta: string;
  socialHeading: string;
  galleryHeading: string;
  openMenu: string;
  closeMenu: string;
  skipToContent: string;
};

/**
 * Header 1 (wp post 2582) with the theme's behaviour:
 *
 *  - `.as-header-1-area` is absolutely positioned 30px from the top, so it
 *    scrolls away with the hero rather than sticking.
 *  - ≥1200px: the hamburger (`.as-header-1-menu-toggle-btn`) morphs into an ×
 *    and slides the menu open *inside* the white pill — width 0 → 450px over
 *    0.5s (--as-cube-1), links fading in from 10px after a 0.3s delay. Menu
 *    links flip their letters on hover (`.menu_1_split`). "Our Services" opens
 *    its dropdown on hover.
 *  - <1200px: the toggle opens the off-canvas panel (`.wa-offcanvas-area`),
 *    which slides in from 105% over 0.5s on an 80% black overlay.
 *  - "Get a Quote" is magnetic with the letter-bounce hover (`wa_magnetic_btn_1`
 *    + `wa_btn_split_1`).
 *  - <1025px the original used a second, mobile-only header widget
 *    (`.mobilehaed`): a white bar fixed to the top (55px) with the logo at the
 *    start and, at the end, a bordered box holding "Get a Quote" and a square
 *    bordered menu button (`.sr-offcanvas-btn-1`). Measured from staging.
 */
export function HeaderShell({ nav, strings }: { nav: NavItem[]; strings: HeaderStrings }) {
  const [inlineOpen, setInlineOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setPanelOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelOpen(false);
        setInlineOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = panelOpen ? 'hidden' : '';
  }, [panelOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  const toggle = () => {
    if (window.matchMedia('(min-width: 1200px)').matches) setInlineOpen((o) => !o);
    else setPanelOpen(true);
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-28 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-brand"
      >
        {strings.skipToContent}
      </a>

      {/* Mobile/tablet header (<1025px), fixed like staging's `.mobilehaed`. */}
      <header className="fixed inset-x-0 top-px z-50 flex h-[55px] items-center justify-between bg-white px-3 min-[1025px]:hidden">
        <Link href="/" aria-label={siteConfig.name} className="flex items-center ps-2">
          <Image src={siteConfig.logos.header} alt={siteConfig.name} width={320} height={117} priority className="h-9 w-auto" />
        </Link>
        <div className="flex h-[55px] items-center gap-[5px] rounded-[10px] border border-black/10 bg-white px-2.5 py-[5px]">
          <Magnetic>
            <Link
              href="/quote"
              className="rounded-lg bg-brand px-[15px] py-[7px] text-base font-medium tracking-snug text-white transition-colors duration-500 ease-cube hover:bg-black"
            >
              <HoverSplit>{strings.quoteCta}</HoverSplit>
            </Link>
          </Magnetic>
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            aria-label={strings.openMenu}
            aria-expanded={panelOpen}
            className="grid h-[42px] w-[42px] place-items-center rounded-md border border-heading text-heading transition-colors duration-500 ease-cube hover:border-brand hover:bg-brand hover:text-white"
          >
            {/* fa-solid fa-bars */}
            <svg viewBox="0 0 448 512" className="h-5 w-[17.5px]" fill="currentColor" aria-hidden="true">
              <path d="M0 96c0-17.7 14.3-32 32-32h384c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zm0 160c0-17.7 14.3-32 32-32h384c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zm448 160c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h384c17.7 0 32 14.3 32 32z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop header (≥1025px) */}
      <header className="absolute inset-x-0 top-[30px] z-50 hidden min-[1025px]:block">
        <div className="flex items-start justify-between px-[30px]">
          <Link href="/" aria-label={siteConfig.name} className="rounded-[10px] bg-white p-2 sm:p-2.5">
            <Image src={siteConfig.logos.header} alt={siteConfig.name} width={320} height={117} priority className="h-8 w-auto sm:h-10" />
          </Link>

          <div className="flex h-[52px] items-center rounded-[10px] border border-black/10 bg-white pe-2 ps-5 sm:h-[58px] sm:ps-[30px]">
            {/* Inline desktop menu */}
            <nav
              aria-label="Main"
              aria-hidden={!inlineOpen}
              className={cn(
                'hidden overflow-hidden transition-all duration-500 ease-cube xl:block',
                inlineOpen ? 'me-6 w-[470px] overflow-visible' : '-ms-[30px] w-0',
              )}
            >
              <ul
                className={cn(
                  'flex items-center gap-7 whitespace-nowrap transition-all duration-500 ease-cube',
                  inlineOpen ? 'visible translate-x-0 opacity-100 delay-300' : 'invisible translate-x-[10px] opacity-0 delay-0',
                )}
              >
                {nav.map((item) => (
                  <li key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      tabIndex={inlineOpen ? 0 : -1}
                      className={cn(
                        'block py-2 text-base font-medium tracking-snug transition-colors duration-300 hover:text-brand',
                        isActive(item.href) ? 'text-brand' : 'text-heading',
                      )}
                    >
                      <HoverSplit effect="flip">{item.label}</HoverSplit>
                    </Link>
                    {item.children?.length ? (
                      <ul className="invisible absolute start-0 top-full z-10 w-[300px] translate-y-3 rounded-[10px] border border-black/10 bg-white p-2 opacity-0 shadow-[0_20px_50px_rgba(0,0,0,.12)] transition-all duration-500 ease-cube group-hover:visible group-hover:translate-y-1 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              tabIndex={inlineOpen ? 0 : -1}
                              className="block whitespace-normal rounded-md px-3 py-2 text-sm font-medium text-body transition hover:bg-paper hover:text-brand"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>

            <button
              type="button"
              onClick={toggle}
              aria-label={inlineOpen ? strings.closeMenu : strings.openMenu}
              aria-expanded={inlineOpen || panelOpen}
              className="group me-5 flex h-8 w-[26px] flex-col justify-center gap-[7px] sm:me-6"
            >
              <span
                className={cn(
                  'h-[2px] w-full bg-heading transition-all duration-500 ease-cube group-hover:bg-brand',
                  inlineOpen && 'translate-x-[5px] translate-y-[5px] rotate-45',
                )}
              />
              <span
                className={cn(
                  'h-[2px] w-full bg-heading transition-all duration-500 ease-cube group-hover:bg-brand',
                  inlineOpen && '-translate-y-[4px] translate-x-[3px] -rotate-45',
                )}
              />
            </button>

            <Magnetic>
              <Link
                href="/quote"
                className="rounded-lg bg-brand px-[15px] py-[7px] text-[15px] font-medium tracking-snug text-white transition-colors duration-500 ease-cube hover:bg-black sm:text-base"
              >
                <HoverSplit>{strings.quoteCta}</HoverSplit>
              </Link>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* Off-canvas (below 1200px) */}
      <div
        className={cn(
          'fixed inset-0 z-[65] bg-black/80 transition-opacity duration-500',
          panelOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setPanelOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 end-0 z-[66] flex w-full max-w-[450px] flex-col overflow-y-auto bg-white px-8 pb-10 pt-8 transition-[transform,opacity,visibility] duration-500 ease-in-out sm:px-[50px] sm:pt-[50px]',
          panelOpen ? 'visible translate-x-0 opacity-100' : 'invisible translate-x-[105%] opacity-0 rtl:-translate-x-[105%]',
        )}
        aria-label="Menu"
        {...(panelOpen ? {} : { 'aria-hidden': true, inert: true })}
      >
        <div className="flex items-center justify-between">
          <Image src={siteConfig.logos.dark} alt={siteConfig.name} width={150} height={50} className="h-9 w-auto" />
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            aria-label={strings.closeMenu}
            className="group relative grid h-[25px] w-[25px] place-items-center"
          >
            <span className="absolute h-[3px] w-full rotate-45 bg-black transition-transform duration-300 group-hover:rotate-0" />
            <span className="absolute h-[3px] w-full -rotate-45 bg-black transition-transform duration-300 group-hover:rotate-0" />
          </button>
        </div>

        <nav aria-label="Mobile" className="mt-10">
          <ul>
            {nav.map((item) => (
              <li key={item.href} className="border-b border-black/10">
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={cn('flex-1 py-3.5 text-base font-medium tracking-snug transition hover:text-brand', isActive(item.href) ? 'text-brand' : 'text-heading')}
                  >
                    {item.label}
                  </Link>
                  {item.children?.length ? (
                    <button
                      type="button"
                      aria-label={item.label}
                      aria-expanded={expanded === item.href}
                      onClick={() => setExpanded(expanded === item.href ? null : item.href)}
                      className="grid h-9 w-9 place-items-center text-heading"
                    >
                      <svg viewBox="0 0 20 20" className={cn('h-4 w-4 transition duration-300 rtl:-scale-x-100', expanded === item.href && 'rotate-90')} fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 5l5 5-5 5" />
                      </svg>
                    </button>
                  ) : null}
                </div>
                {item.children?.length ? (
                  <div className={cn('grid transition-[grid-template-rows] duration-500 ease-cube', expanded === item.href ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <ul className="overflow-hidden ps-4">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block py-2 text-sm text-body hover:text-brand">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10">
          <p className="mb-4 text-base font-medium tracking-snug text-heading">{strings.galleryHeading}</p>
          <ul className="grid grid-cols-2 gap-2.5">
            {headerGallery.map((img) => (
              <li key={img.src} className="pointer-events-none overflow-hidden rounded-[6px] bg-paper">
                <Image src={img.src} alt={img.alt} width={300} height={240} className="aspect-[5/4] w-full object-cover transition duration-300 hover:scale-[1.02]" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <p className="mb-4 text-base font-medium tracking-snug text-heading">{strings.socialHeading}</p>
          <SocialIcons />
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-black/10 pt-6">
          <LanguageSwitcher />
          <Link href="/quote" className="group inline-flex items-center gap-2 text-sm font-medium text-brand">
            {strings.quoteCta}
            <ArrowBox className="h-7 w-7" tone="brand" />
          </Link>
        </div>
      </aside>
    </>
  );
}
