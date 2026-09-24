import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-content px-5 sm:px-6', className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
  tone = 'light',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'light' | 'paper' | 'dark' | 'black';
}) {
  const tones = {
    light: 'bg-white',
    paper: 'bg-paper',
    dark: 'bg-night text-white',
    black: 'bg-black text-white',
  } as const;
  return (
    <section id={id} className={cn('py-16 sm:py-20 lg:py-[100px]', tones[tone], className)}>
      {children}
    </section>
  );
}

/**
 * The theme's section label: Geist Mono, preceded by a blue dot in braces —
 * rendered on the staging site as `{●} About US`.
 */
export function Eyebrow({
  children,
  tone = 'light',
  variant = 'braces',
  className,
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
  variant?: 'braces' | 'brackets';
  className?: string;
}) {
  const dark = tone === 'dark';
  if (variant === 'brackets') {
    return <p className={cn('font-mono text-sm font-medium tracking-snug text-brand', className)}>{children}</p>;
  }
  return (
    <p
      className={cn(
        'inline-flex items-center font-mono text-base font-medium tracking-snug',
        dark ? 'text-white' : 'text-black',
        className,
      )}
    >
      <span className="text-brand" aria-hidden>
        {'{'}
      </span>
      <span className="mx-[3px] inline-block h-2 w-2 rounded-full bg-brand ring-2 ring-brand/30" aria-hidden />
      <span className="me-2 text-brand" aria-hidden>
        {'}'}
      </span>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'start',
  tone = 'light',
  className,
  titleClassName,
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  align?: 'start' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
  titleClassName?: string;
}) {
  const dark = tone === 'dark';
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      {title ? (
        <h2
          className={cn(
            'mt-3 text-display font-medium',
            dark ? 'text-white' : 'text-heading',
            align === 'center' && 'mx-auto max-w-[760px]',
            titleClassName,
          )}
        >
          {title}
        </h2>
      ) : null}
      {description ? (
        <p
          className={cn(
            'mt-4 text-base font-medium leading-[1.625] tracking-snug',
            dark ? 'text-white/70' : 'text-body',
            align === 'center' && 'mx-auto max-w-[520px]',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Render a string that used <br> in the original as separate lines. */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
    </>
  );
}
