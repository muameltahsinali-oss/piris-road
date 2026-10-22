import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toneClass, toneDot } from '@/lib/admin/format';
import { setStatus } from '@/app/admin/actions';
import type { CollectionName } from '@/lib/admin/store';

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, className, children }: { title?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white', className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatusBadge({ meta }: { meta: { label: string; tone: keyof typeof toneClass } }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', toneClass[meta.tone])}>
      <span className={cn('h-1.5 w-1.5 rounded-full', toneDot[meta.tone])} aria-hidden />
      {meta.label}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">{children}</p>;
}

export function ButtonLink({ href, children, variant = 'secondary', external }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary'; external?: boolean }) {
  const cls = cn(
    'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition',
    variant === 'primary' ? 'bg-brand text-white hover:bg-brand-dark' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  );
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  // API downloads (CSV export) need a real navigation, not a client transition.
  return href.startsWith('/api/') ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export const buttonClass = 'inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-dark';
export const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20';

/** Status changer: a plain form so it works without client JS. */
export function StatusForm({ collection, id, current, options }: { collection: CollectionName; id: string; current: string; options: Record<string, { label: string }> }) {
  return (
    // Keyed on the saved value: React resets forms to their initial defaults
    // after an action, which would otherwise show the old status.
    <form key={current} action={setStatus} className="flex items-center gap-2">
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={current} aria-label="الحالة" className={cn(inputClass, 'w-auto py-1.5')}>
        {Object.entries(options).map(([value, o]) => (
          <option key={value} value={value}>
            {o.label}
          </option>
        ))}
      </select>
      <button type="submit" className={cn(buttonClass, 'py-1.5')}>
        حفظ
      </button>
    </form>
  );
}

/** Filter chips that link to ?status=…, keeping the current search term. */
export function StatusTabs({ base, current, q, items }: { base: string; current: string; q?: string; items: Array<{ value: string; label: string; count: number }> }) {
  return (
    <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" aria-label="تصفية حسب الحالة">
      {items.map((it) => {
        const params = new URLSearchParams();
        if (it.value) params.set('status', it.value);
        if (q) params.set('q', q);
        const qs = params.toString();
        const active = current === it.value;
        return (
          <Link
            key={it.value || 'all'}
            href={qs ? `${base}?${qs}` : base}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition',
              active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {it.label} <span className={cn('ms-1 tabular-nums', active ? 'text-slate-300' : 'text-slate-400')}>{it.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SearchBox({ q, status, placeholder }: { q?: string; status?: string; placeholder: string }) {
  return (
    <form className="w-full sm:w-72" role="search">
      {status && <input type="hidden" name="status" value={status} />}
      <input type="search" name="q" defaultValue={q} placeholder={placeholder} aria-label={placeholder} className={inputClass} />
    </form>
  );
}

export function Pagination({ base, page, pages, params }: { base: string; page: number; pages: number; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => Boolean(e[1])));
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const link = 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50';
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>
        صفحة {page} من {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && <Link href={href(page - 1)} className={link}>السابق</Link>}
        {page < pages && <Link href={href(page + 1)} className={link}>التالي</Link>}
      </div>
    </div>
  );
}

export const PAGE_SIZE = 25;

export function paginate<T>(rows: T[], pageParam?: string) {
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(pageParam) || 1));
  return { page, pages, rows: rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
}
