'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';
import { FLASH_COOKIE } from '@/lib/admin/flash';
import { Icon, type IconName } from './icons';

export function NavLink({ href, icon, children, badge }: { href: string; icon: IconName; children: React.ReactNode; badge?: number }) {
  const pathname = usePathname();
  const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
        active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white',
      )}
    >
      <Icon name={icon} className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-accent' : '')} />
      <span className="flex-1">{children}</span>
      {badge ? (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-900">{badge}</span>
      ) : null}
    </Link>
  );
}

/** Submit button that asks before a destructive action and shows progress. */
export function ConfirmSubmit({
  children,
  message,
  className,
  ...rest
}: { children: React.ReactNode; message: string; className?: string } & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'name' | 'value' | 'formNoValidate'>) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      {...rest}
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

/** Primary submit button with a pending state. */
export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:opacity-60',
        className,
      )}
    >
      {pending ? 'جارٍ الحفظ…' : children}
    </button>
  );
}

/** Toast for the one-shot flash cookie set by server actions. */
export function Toast({ id, message }: { id: string; message: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    document.cookie = `${FLASH_COOKIE}=; Max-Age=0; path=/admin`;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, [id]);
  if (!visible) return null;
  return (
    <div role="status" className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
      <Icon name="check" className="h-4 w-4 text-emerald-400" />
      {message}
    </div>
  );
}

/**
 * Bulk-selection bar for list pages. Rows render
 * <input type="checkbox" name="ids" form={formId}>; this keeps the "select
 * all" box and the selected count in sync and only shows the actions when
 * something is selected.
 */
export function BulkBar({ formId, children }: { formId: string; children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const allRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const boxes = () => Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="ids"][form="${formId}"]`));
    const sync = () => {
      const all = boxes();
      const n = all.filter((b) => b.checked).length;
      setCount(n);
      if (allRef.current) {
        allRef.current.checked = n > 0 && n === all.length;
        allRef.current.indeterminate = n > 0 && n < all.length;
      }
    };
    // React resets the form after the action runs; re-count once it has.
    const onReset = () => setTimeout(sync);
    document.addEventListener('change', sync);
    document.addEventListener('reset', onReset);
    sync();
    return () => {
      document.removeEventListener('change', sync);
      document.removeEventListener('reset', onReset);
    };
  }, [formId]);

  const toggleAll = (checked: boolean) => {
    document.querySelectorAll<HTMLInputElement>(`input[name="ids"][form="${formId}"]`).forEach((b) => (b.checked = checked));
    document.dispatchEvent(new Event('change'));
  };

  return (
    <div className="flex min-h-[40px] flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input ref={allRef} type="checkbox" onChange={(e) => toggleAll(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-brand" />
        تحديد الكل
      </label>
      {count > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-900">{count} محدد</span>
          {children}
        </div>
      )}
    </div>
  );
}

/** Prints the current page (the quote sheet has print styles). */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 print:hidden"
    >
      <Icon name="print" />
      طباعة
    </button>
  );
}
