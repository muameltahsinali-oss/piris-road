import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDateTime, toneClass, toneDot } from '@/lib/admin/format';
import { setStatus } from '@/app/admin/actions';
import type { CollectionName, HistoryEvent } from '@/lib/admin/store';
import { Icon, type IconName } from './icons';

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
      <select name="status" defaultValue={current} aria-label="الحالة" className={selectClass}>
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

/** KPI tile with an optional change vs. the previous period. */
export function Kpi({
  label,
  value,
  sub,
  change,
  href,
  icon,
  invert,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  change?: number | null;
  href?: string;
  icon?: IconName;
  /** For metrics where lower is better (e.g. response time). */
  invert?: boolean;
}) {
  const good = change != null && change !== 0 && (change > 0) !== Boolean(invert);
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        {icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600">
            <Icon name={icon} />
          </span>
        )}
      </div>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {change != null && (
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 font-medium tabular-nums',
              change === 0 ? 'bg-slate-100 text-slate-600' : good ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
            )}
          >
            <span dir="ltr">
              {change > 0 ? '▲' : change < 0 ? '▼' : '•'} {Math.abs(change)}%
            </span>
          </span>
        )}
        {sub}
      </div>
    </>
  );
  const cls = 'block rounded-xl border border-slate-200 bg-white p-5 transition';
  return href ? (
    <Link href={href} className={cn(cls, 'hover:border-slate-300 hover:shadow-sm')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export const RANGES = [
  { value: '7', label: '7 أيام' },
  { value: '30', label: '30 يوماً' },
  { value: '90', label: '90 يوماً' },
  { value: '365', label: 'سنة' },
] as const;

export function parseRange(v: string | undefined) {
  return RANGES.some((r) => r.value === v) ? Number(v) : 30;
}

/** Segmented period selector (links, so it works without JS). */
export function RangeTabs({ base, current }: { base: string; current: number }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5" role="group" aria-label="الفترة">
      {RANGES.map((r) => {
        const active = Number(r.value) === current;
        return (
          <Link
            key={r.value}
            href={`${base}?range=${r.value}`}
            aria-current={active ? 'true' : undefined}
            className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition', active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}
          >
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}

const EVENT_ICON: Record<HistoryEvent['type'], IconName> = {
  created: 'inbox',
  status: 'flag',
  note: 'note',
  deal: 'chart',
  email: 'mail',
};

export function Timeline({ events }: { events: HistoryEvent[] }) {
  if (!events.length) return <p className="text-sm text-slate-500">لا يوجد سجل نشاط لهذا العنصر.</p>;
  return (
    <ol className="relative space-y-4 border-s border-slate-200 ps-5">
      {[...events].reverse().map((e, i) => (
        <li key={`${e.at}-${i}`} className="relative">
          <span className="absolute -start-[31px] top-0 grid h-5 w-5 place-items-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
            <Icon name={EVENT_ICON[e.type]} className="h-3 w-3" />
          </span>
          <p className="text-sm text-slate-800">{e.text}</p>
          <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(e.at)}</p>
        </li>
      ))}
    </ol>
  );
}

/** Single-series vertical bar chart with hover/focus tooltips. */
export function BarChart({
  bars,
  height = 'h-48',
  format = (n: number) => String(n),
  max,
}: {
  bars: Array<{ key: string; label: string; value: number }>;
  height?: string;
  format?: (n: number) => string;
  /** Fixed top of the scale (e.g. 100 for percentages); defaults to the data peak. */
  max?: number;
}) {
  const peak = max ?? Math.max(1, ...bars.map((b) => b.value));
  const dense = bars.length > 40;
  return (
    <figure>
      <div className={cn('relative', height)}>
        {[0, 0.5, 1].map((f) => (
          <div key={f} className="pointer-events-none absolute inset-x-0 border-t border-slate-100" style={{ bottom: `${f * 100}%` }}>
            {(f !== 0.5 || peak >= 4) && <span className="absolute -top-2.5 end-full me-2 text-[11px] tabular-nums text-slate-400">{format(Math.round(f * peak))}</span>}
          </div>
        ))}
        <div className={cn('absolute inset-0 ms-8 flex items-end', dense ? 'gap-px' : 'gap-[2px]')}>
          {bars.map((b) => (
            <div key={b.key} className="group relative flex h-full flex-1 items-end outline-none" tabIndex={0} aria-label={`${b.label}: ${format(b.value)}`}>
              <div
                className={cn('w-full rounded-t-[4px] transition-colors', b.value ? 'bg-brand group-hover:bg-brand-dark group-focus:bg-brand-dark' : 'bg-slate-100')}
                style={{ height: b.value ? `${(b.value / peak) * 100}%` : '2px' }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block group-focus:block">
                {b.label}: <span className="font-semibold tabular-nums">{format(b.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ms-8 mt-2 flex justify-between text-[11px] text-slate-400">
        <span>{bars[0]?.label}</span>
        <span>{bars[bars.length - 1]?.label}</span>
      </div>
    </figure>
  );
}

/** Ranked horizontal bars: label, count and share of the total. */
export function RankList({ rows, total, empty = 'لا توجد بيانات بعد.' }: { rows: Array<[string, number]>; total: number; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <ol className="space-y-3">
      {rows.map(([label, n]) => (
        <li key={label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-slate-700">{label}</span>
            <span className="shrink-0 tabular-nums text-slate-900">
              {n} <span className="text-xs text-slate-400">({total ? Math.round((n / total) * 100) : 0}%)</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full bg-brand" style={{ width: `${total ? (n / total) * 100 : 0}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function countBy<T>(rows: T[], key: (r: T) => string, limit = 6): Array<[string, number]> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r).trim();
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/** Compact select for toolbars (inputClass is full-width). */
export const selectClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';
