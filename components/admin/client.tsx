'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';

export function NavLink({ href, children, badge }: { href: string; children: React.ReactNode; badge?: number }) {
  const pathname = usePathname();
  const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
        active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white',
      )}
    >
      <span>{children}</span>
      {badge ? (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-900">{badge}</span>
      ) : null}
    </Link>
  );
}

/** Submit button that asks before a destructive action and shows progress. */
export function ConfirmSubmit({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60',
        className,
      )}
    >
      {pending ? '...' : children}
    </button>
  );
}
