import Link from 'next/link';
import { list, QUOTE_STATUSES, type QuoteRecord } from '@/lib/admin/store';
import {
  dayKey,
  delta,
  followUpLabel,
  followUpState,
  formatDay,
  formatDuration,
  formatMoney,
  formatNumber,
  formatShortDay,
  firstResponseHours,
  messageStatus,
  priorityMeta,
  quoteStatus,
  route,
  timeAgo,
  toneDot,
} from '@/lib/admin/format';
import { BarChart, Card, countBy, Empty, Kpi, PageTitle, parseRange, RangeTabs, RankList, StatusBadge } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

export const metadata = { title: 'نظرة عامة' };

const DAY = 86_400_000;
const OPEN = new Set(['new', 'in_progress', 'quoted']);

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export default async function Overview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = parseRange((await searchParams).range);
  const [quotes, messages, subscribers] = await Promise.all([list('quotes'), list('messages'), list('subscribers')]);

  const now = Date.now();
  const inWindow = (iso: string, from: number, to: number) => {
    const t = new Date(iso).getTime();
    return t >= from && t < to;
  };
  const cur = <T extends { createdAt: string }>(rows: T[]) => rows.filter((r) => inWindow(r.createdAt, now - range * DAY, now + DAY));
  const prev = <T extends { createdAt: string }>(rows: T[]) => rows.filter((r) => inWindow(r.createdAt, now - 2 * range * DAY, now - range * DAY));

  const qCur = cur(quotes);
  const qPrev = prev(quotes);
  const mCur = cur(messages);
  const sCur = cur(subscribers);

  const responseCur = avg(qCur.map(firstResponseHours).filter((h): h is number => h != null));
  const responsePrev = avg(qPrev.map(firstResponseHours).filter((h): h is number => h != null));

  // Pipeline value in USD only (amounts in other currencies are listed per quote).
  const usd = (rows: QuoteRecord[]) => rows.filter((q) => q.deal?.amount != null && (q.deal.currency ?? 'USD') === 'USD').reduce((s, q) => s + (q.deal!.amount ?? 0), 0);
  const openValue = usd(quotes.filter((q) => OPEN.has(q.status)));
  const wonCur = qCur.filter((q) => q.status === 'won');
  const closedCur = qCur.filter((q) => q.status === 'won' || q.status === 'lost');

  // Chart: daily for ≤ 90 days, monthly for a year.
  const bars =
    range <= 90
      ? Array.from({ length: range }, (_, i) => {
          const d = new Date(now - (range - 1 - i) * DAY);
          const key = dayKey(d);
          return { key, label: formatShortDay(d), value: qCur.filter((q) => dayKey(q.createdAt) === key).length };
        })
      : Array.from({ length: 12 }, (_, i) => {
          const d = new Date();
          d.setUTCDate(1);
          d.setUTCMonth(d.getUTCMonth() - (11 - i));
          const key = dayKey(d).slice(0, 7);
          const label = new Intl.DateTimeFormat('ar', { month: 'short', year: '2-digit', numberingSystem: 'latn' }).format(d);
          return { key, label, value: qCur.filter((q) => dayKey(q.createdAt).startsWith(key)).length };
        });

  const followUps = quotes
    .filter((q) => OPEN.has(q.status) && q.deal?.followUpAt)
    .map((q) => ({ q, state: followUpState(q.deal!.followUpAt)! }))
    .filter((f) => f.state !== 'upcoming' || f.q.deal!.followUpAt! <= dayKey(new Date(now + 7 * DAY)))
    .sort((a, b) => a.q.deal!.followUpAt!.localeCompare(b.q.deal!.followUpAt!))
    .slice(0, 6);

  const urgent = quotes.filter((q) => OPEN.has(q.status) && (q.deal?.priority === 'urgent' || q.deal?.priority === 'high')).length;

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
      href: `/admin/messages/${m.id}`,
      kind: 'رسالة',
      title: m.data.message.slice(0, 70) || '(بدون نص)',
      who: m.data.name,
      badge: messageStatus[m.status],
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 7);

  const label = `آخر ${range === 365 ? 'سنة' : `${range} يوماً`}`;

  return (
    <>
      <PageTitle
        title="نظرة عامة"
        subtitle={`أداء نماذج الموقع خلال ${label} مقارنةً بالفترة السابقة.`}
        actions={<RangeTabs base="/admin" current={range} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="طلبات الأسعار"
          icon="quote"
          value={formatNumber(qCur.length)}
          change={delta(qCur.length, qPrev.length)}
          sub={<span>{quotes.filter((q) => q.status === 'new').length} بانتظار المراجعة</span>}
          href="/admin/quotes"
        />
        <Kpi
          label="قيمة الصفقات المفتوحة"
          icon="chart"
          value={formatMoney(openValue)}
          sub={<span>المقبول في الفترة: {formatMoney(usd(wonCur))}</span>}
          href="/admin/quotes?status=quoted"
        />
        <Kpi
          label="متوسط زمن الاستجابة"
          icon="clock"
          value={formatDuration(responseCur)}
          change={responseCur != null && responsePrev != null ? delta(Math.round(responseCur), Math.round(responsePrev)) : null}
          invert
          sub={<span>من الورود حتى أول تغيير حالة</span>}
        />
        <Kpi
          label="نسبة القبول"
          icon="check"
          value={closedCur.length ? `${Math.round((wonCur.length / closedCur.length) * 100)}%` : '—'}
          sub={
            <span>
              {wonCur.length} مقبول من {closedCur.length} مغلق
            </span>
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat label="رسائل جديدة" value={mCur.length} note={`${messages.filter((m) => m.status === 'new').length} غير مقروءة`} href="/admin/messages?status=new" />
        <MiniStat label="مشتركون جدد" value={sCur.length} note={`${subscribers.filter((s) => s.status === 'active').length} نشط إجمالاً`} href="/admin/subscribers" />
        <MiniStat label="طلبات عالية الأولوية" value={urgent} note="مفتوحة (عاجلة أو عالية)" href="/admin/quotes?sort=priority" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title={`طلبات الأسعار — ${label}`} className="xl:col-span-2">
          {quotes.length === 0 ? (
            <Empty>لا توجد طلبات أسعار بعد. ستظهر هنا فور وصول أول طلب من صفحة «اطلب عرض سعر».</Empty>
          ) : (
            <BarChart bars={bars} />
          )}
        </Card>

        <Card title="مسار الطلبات" action={<Link href="/admin/quotes" className="text-xs text-brand hover:underline">عرض الكل</Link>}>
          <ul className="space-y-3">
            {QUOTE_STATUSES.map((s) => {
              const n = quotes.filter((q) => q.status === s).length;
              return (
                <li key={s}>
                  <Link href={`/admin/quotes?status=${s}`} className="block rounded-md hover:bg-slate-50">
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
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="المتابعات القريبة" action={<Link href="/admin/follow-ups" className="text-xs text-brand hover:underline">كل المتابعات</Link>}>
          {followUps.length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد متابعات مستحقة خلال الأسبوع. حدّد «موعد المتابعة» داخل أي طلب سعر.</p>
          ) : (
            <ul className="-my-2 divide-y divide-slate-100">
              {followUps.map(({ q, state }) => (
                <li key={q.id}>
                  <Link href={`/admin/quotes/${q.id}`} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{q.data.company_name || q.data.your_name || route(q.data.loading_country, q.data.unloading_country)}</p>
                      <p className="text-xs text-slate-500">
                        {formatDay(q.deal!.followUpAt!)}
                        {q.deal?.assignee && ` · ${q.deal.assignee}`}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                        state === 'overdue' ? 'bg-rose-50 text-rose-700' : state === 'today' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {followUpLabel[state]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="أحدث النشاطات" className="xl:col-span-2">
          {activity.length === 0 ? (
            <Empty>لا يوجد نشاط بعد.</Empty>
          ) : (
            <ul className="-my-2 divide-y divide-slate-100">
              {activity.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="flex items-center justify-between gap-4 py-2.5">
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
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="أكثر المسارات طلباً">
          <RankList rows={countBy(qCur, (q) => route(q.data.loading_country, q.data.unloading_country), 5)} total={qCur.length} />
        </Card>
        <Card title="أكثر أنواع البضائع">
          <RankList rows={countBy(qCur, (q) => q.data.commodity, 5)} total={qCur.length} />
        </Card>
        <Card title="الطلبات حسب الأولوية">
          <RankList
            rows={(['urgent', 'high', 'normal', 'low'] as const)
              .map((p) => [priorityMeta[p].label, qCur.filter((q) => (q.deal?.priority ?? 'normal') === p).length] as [string, number])
              .filter(([, n]) => n > 0)}
            total={qCur.length}
          />
        </Card>
      </div>
    </>
  );
}

function MiniStat({ label, value, note, href }: { label: string; value: number; note: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{note}</p>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-slate-900">{formatNumber(value)}</p>
    </Link>
  );
}
