import Link from 'next/link';
import { list, QUOTE_STATUSES } from '@/lib/admin/store';
import { dayKey, route, formatNumber, formatShortDay, messageStatus, quoteStatus, timeAgo, toneDot } from '@/lib/admin/format';
import { Card, Empty, PageTitle, StatusBadge } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

export const metadata = { title: 'نظرة عامة' };

const DAYS = 30;

function countBy<T>(rows: T[], key: (r: T) => string, limit = 5) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r).trim();
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export default async function Overview() {
  const [quotes, messages, subscribers] = await Promise.all([list('quotes'), list('messages'), list('subscribers')]);

  const since = Date.now() - DAYS * 86400_000;
  const recent = <T extends { createdAt: string }>(rows: T[]) => rows.filter((r) => new Date(r.createdAt).getTime() >= since).length;

  const newQuotes = quotes.filter((q) => q.status === 'new').length;
  const unread = messages.filter((m) => m.status === 'new').length;
  const activeSubs = subscribers.filter((s) => s.status === 'active').length;
  const closed = quotes.filter((q) => q.status === 'won' || q.status === 'lost').length;
  const won = quotes.filter((q) => q.status === 'won').length;

  // Daily quote requests, oldest → newest (RTL: oldest on the right).
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(Date.now() - (DAYS - 1 - i) * 86400_000);
    return { key: dayKey(d), label: formatShortDay(d), count: 0 };
  });
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const q of quotes) {
    const d = byKey.get(dayKey(q.createdAt));
    if (d) d.count++;
  }
  const peak = Math.max(1, ...days.map((d) => d.count));

  const routes = countBy(quotes, (q) => route(q.data.loading_country, q.data.unloading_country));
  const commodities = countBy(quotes, (q) => q.data.commodity);

  const activity = [
    ...quotes.map((q) => ({
      at: q.createdAt,
      href: `/admin/quotes/${q.id}`,
      kind: 'طلب سعر',
      title: route(q.data.loading_country, q.data.unloading_country),
      who: q.data.company_name || q.data.your_name || q.data.email || '—',
      badge: quoteStatus[q.status],
    })),
    ...messages.map((m) => ({
      at: m.createdAt,
      href: `/admin/messages#${m.id}`,
      kind: 'رسالة',
      title: m.data.message.slice(0, 60) || '(بدون نص)',
      who: m.data.name,
      badge: messageStatus[m.status],
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  const kpis = [
    { label: 'طلبات أسعار جديدة', value: newQuotes, sub: `${formatNumber(quotes.length)} طلب إجمالاً`, href: '/admin/quotes?status=new' },
    { label: 'طلبات آخر 30 يوماً', value: recent(quotes), sub: 'طلبات أسعار واردة', href: '/admin/quotes' },
    { label: 'رسائل غير مقروءة', value: unread, sub: `${formatNumber(recent(messages))} رسالة آخر 30 يوماً`, href: '/admin/messages?status=new' },
    { label: 'مشتركون نشطون', value: activeSubs, sub: `${formatNumber(recent(subscribers))} جديد آخر 30 يوماً`, href: '/admin/subscribers' },
  ];

  return (
    <>
      <PageTitle title="نظرة عامة" subtitle="ملخص نشاط نماذج الموقع: طلبات الأسعار، رسائل التواصل، والنشرة البريدية." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
            <p className="text-sm text-slate-500">{k.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{formatNumber(k.value)}</p>
            <p className="mt-1 text-xs text-slate-500">{k.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="طلبات الأسعار اليومية — آخر 30 يوماً" className="xl:col-span-2">
          {quotes.length === 0 ? (
            <Empty>لا توجد طلبات أسعار بعد. ستظهر هنا فور وصول أول طلب من صفحة «اطلب عرض سعر».</Empty>
          ) : (
            <figure>
              <div className="relative h-48">
                {/* Recessive gridlines at 0 / 50% / 100% of the peak. */}
                {[0, 0.5, 1].map((f) => (
                  <div key={f} className="pointer-events-none absolute inset-x-0 border-t border-slate-100" style={{ bottom: `${f * 100}%` }}>
                    {(f !== 0.5 || peak >= 4) && (
                      <span className="absolute -top-2.5 end-full me-2 text-[11px] tabular-nums text-slate-400">{Math.round(f * peak)}</span>
                    )}
                  </div>
                ))}
                <div className="absolute inset-0 ms-6 flex items-end gap-[2px]">
                  {days.map((d) => (
                    <div key={d.key} className="group relative flex h-full flex-1 items-end" tabIndex={0} aria-label={`${d.label}: ${d.count}`}>
                      <div
                        className={cn('w-full rounded-t-[4px] bg-brand transition-colors group-hover:bg-brand-dark', d.count === 0 && 'bg-transparent')}
                        style={{ height: `${(d.count / peak) * 100}%` }}
                      />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block group-focus:block">
                        {d.label}: <span className="font-semibold tabular-nums">{d.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ms-6 mt-2 flex justify-between text-[11px] text-slate-400">
                <span>{days[0].label}</span>
                <span>{days[days.length - 1].label}</span>
              </div>
              <figcaption className="mt-3 text-xs text-slate-500">
                الإجمالي خلال الفترة: <span className="font-semibold tabular-nums text-slate-700">{recent(quotes)}</span> · أعلى يوم:{' '}
                <span className="font-semibold tabular-nums text-slate-700">{Math.max(...days.map((d) => d.count))}</span>
              </figcaption>
            </figure>
          )}
        </Card>

        <Card title="مسار طلبات الأسعار">
          <ul className="space-y-3">
            {QUOTE_STATUSES.map((s) => {
              const n = quotes.filter((q) => q.status === s).length;
              return (
                <li key={s}>
                  <Link href={`/admin/quotes?status=${s}`} className="block">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className={cn('h-2 w-2 rounded-full', toneDot[quoteStatus[s].tone])} aria-hidden />
                        {quoteStatus[s].label}
                      </span>
                      <span className="tabular-nums text-slate-900">{n}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-slate-700" style={{ width: `${quotes.length ? (n / quotes.length) * 100 : 0}%` }} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
            نسبة القبول من الطلبات المغلقة:{' '}
            <span className="font-semibold tabular-nums text-slate-900">{closed ? `${Math.round((won / closed) * 100)}%` : '—'}</span>
          </p>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card title="أحدث النشاطات" className="xl:col-span-2">
          {activity.length === 0 ? (
            <Empty>لا يوجد نشاط بعد.</Empty>
          ) : (
            <ul className="-my-2 divide-y divide-slate-100">
              {activity.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="flex items-center justify-between gap-4 py-3 hover:bg-slate-50/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{a.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {a.kind} · {a.who} · {timeAgo(a.at)}
                      </p>
                    </div>
                    <StatusBadge meta={a.badge} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <TopList title="أكثر المسارات طلباً" rows={routes} />
          <TopList title="أكثر أنواع البضائع" rows={commodities} />
        </div>
      </div>
    </>
  );
}

function TopList({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  return (
    <Card title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">لا توجد بيانات بعد.</p>
      ) : (
        <ol className="space-y-2">
          {rows.map(([label, n]) => (
            <li key={label} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-slate-700">{label}</span>
              <span className="tabular-nums font-medium text-slate-900">{n}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
