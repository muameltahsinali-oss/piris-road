import { Link } from '@/i18n/navigation';
import { HoverSplit, Magnetic } from '@/components/motion/Interactions';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * Buttons as the Avista theme draws them on the staging site: an 8px-radius
 * label, optionally followed by a square "arrow box" in a contrasting colour
 * (e.g. yellow "Contact Us" + blue box, black "More Services" + white box).
 */
type Variant = 'brand' | 'accent' | 'dark' | 'light' | 'outline-light';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, { btn: string; box: 'brand' | 'light' | 'dark' }> = {
  brand: { btn: 'bg-brand text-white hover:bg-heading', box: 'light' },
  accent: { btn: 'bg-accent text-heading hover:brightness-105', box: 'brand' },
  dark: { btn: 'bg-heading text-white hover:bg-brand', box: 'light' },  // .as-pr-btn-1 → brand on hover
  light: { btn: 'bg-white text-heading hover:bg-paper', box: 'dark' },
  'outline-light': { btn: 'border border-white/70 text-white hover:bg-white hover:text-heading', box: 'light' },
};

const sizes: Record<Size, string> = {
  sm: 'min-h-9 ps-3 text-sm',
  md: 'min-h-11 ps-4 text-[15px]',
  lg: 'min-h-12 ps-5 text-base',
};

type Props = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  /** Show the square arrow box after the label. */
  arrow?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  full?: boolean;
  /** `.wa_magnetic_btn_1` pull toward the pointer (on by default, as on staging). */
  magnetic?: boolean;
};

export function Button({
  children,
  href,
  variant = 'brand',
  size = 'md',
  arrow = true,
  className,
  type = 'button',
  disabled,
  full,
  magnetic = true,
}: Props) {
  const v = variants[variant];
  const classes = cn(
    'group inline-flex items-center justify-between gap-3 rounded-lg p-1 font-medium tracking-snug transition-all duration-500 ease-cube',
    'disabled:pointer-events-none disabled:opacity-60',
    sizes[size],
    arrow ? '' : 'pe-4',
    full && 'w-full justify-center',
    v.btn,
    className,
  );
  const inner = (
    <>
      <span className={cn(arrow ? 'pe-1' : '')}>
        {typeof children === 'string' ? <HoverSplit>{children}</HoverSplit> : children}
      </span>
      {arrow ? <ArrowBox tone={v.box} className={size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-10 w-10' : 'h-9 w-9'} /> : null}
    </>
  );

  let el: ReactNode;
  if (href) {
    el = /^(https?:|mailto:|tel:)/.test(href) ? (
      <a href={href} className={classes} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  } else {
    el = (
      <button type={type} className={classes} disabled={disabled}>
        {inner}
      </button>
    );
  }
  return magnetic ? <Magnetic className={full ? 'w-full' : undefined}>{el}</Magnetic> : el;
}

export function ArrowBox({ tone = 'light', className }: { tone?: 'brand' | 'light' | 'dark'; className?: string }) {
  const tones = {
    brand: 'bg-brand text-white',
    light: 'bg-white text-heading',
    dark: 'bg-heading text-white',
  } as const;
  return (
    <span className={cn('relative grid shrink-0 place-items-center overflow-hidden rounded-md', tones[tone], className)} aria-hidden>
      {/* .as-pr-btn-1 .icon: the arrow slides out and its twin slides in (0.5s, --as-cube-1) */}
      <ArrowIcon className="transition-transform duration-500 ease-cube group-hover:translate-x-[30px] rtl:group-hover:-translate-x-[30px]" />
      <ArrowIcon className="absolute -translate-x-[30px] transition-transform duration-500 ease-cube group-hover:translate-x-0 rtl:translate-x-[30px] rtl:group-hover:translate-x-0" />
    </span>
  );
}

/** Arrow that flips with text direction. */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={cn('h-4 w-4 rtl:-scale-x-100', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}
