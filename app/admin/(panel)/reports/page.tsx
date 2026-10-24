import { list, QUOTE_STATUSES } from '@/lib/admin/store';
import { dayKey, firstResponseHours, formatDuration, formatMoney, formatNumber, quoteStatus } from '@/lib/admin/format';
import { BarChart, Card, countBy, Empty, PageTitle, RankList } from '@/components/admin/ui';
import { Icon } from '@/components/admin/icons';

export const metadata = { title: 'التقارير' };

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const monthLabel = (d: Date) => new Intl.DateTimeFormat('ar', { month: 'short', year: '2-digit', numberingSystem: 'latn', timeZone: 'UTC' }).format(d);

export default async function ReportsPage() {
  const [quotes, messages, subscribers] = await Promise.all([list('quotes'), list('messages'), list('subscribers')]);

  // Last 12 calendar months, oldest first.
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - (11 - i));
    return { key: dayKey(d).slice(0, 7), label: monthLabel(d) };
  });
  const perMonth = <T extends { createdAt: string }>(rows: T[]) =>
    months.map((m) => ({ ...m, value: rows.filter((r) => dayKey(r.createdAt).startsWith(m.key)).length }));

  const quoteMonths = perMonth(quotes);
  const winByMonth = months.map((m) => {
    const closed = quotes.filter((q) => dayKey(q.createdAt).startsWith(m.key) && (q.status === 'won' || q.status === 'lost'));
    const won = closed.filter((q) => q.status === 'won').length;
    return { ...m, value: closed.length ? Math.round((won / closed.length) * 100) : 0 };
  });

  const weekdays = WEEKDAYS.map((label, i) => ({
    key: String(i),
    label,
    value: quotes.filter((q) => new Date(new Date(q.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Baghdad' })).getDay() === i).length,
  }));

  const responses = quotes.map(firstResponseHours).filter((h): h is number => h != null).sort((a, b) => a - b);
  const median = responses.length ? responses[Math.floor(responses.length / 2)] : null;
  const within24 = responses.length ? Math.round((responses.filter((h) => h <= 24).length / responses.length) * 100) : null;

  const usd = quotes.filter((q) => q.deal?.amount != null && (q.deal.currency ?? 'USD') === 'USD');
  const wonValue = usd.filter((q) => q.status === 'won').reduce((s, q) => s + q.deal!.amount!, 0);
  const avgQuote = usd.length ? usd.reduce((s, q) => s + q.deal!.amount!, 0) / usd.length : undefined;

  const assignees = countBy(quotes.filter((q) => q.deal?.assignee), (q) => q.deal!.assignee!, 8);

  return (
    <>
      <PageTitle
        title="التقارير"
        subtitle="تحليل طلبات الأسعار والرسائل والمشتركين على مدى 12 شهراً."
        actions={
          <a href="/api/admin/export/quotes" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Icon name="download" /> تصدير البيانات الخام
          </a>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['إجمالي طلبات الأسعار', formatNumber(quotes.length)],
          ['قيمة المقبول (USD)', formatMoney(wonValue)],
          ['متوسط قيمة العرض (USD)', formatMoney(avgQuote)],
          ['وسيط زمن الاستجابة', formatDuration(median)],
          ['استجابة خلال 24 ساعة', within24 == null ? '—' : `${within24}%`],
          ['إجمالي الرسائل', formatNumber(messages.length)],
          ['المشتركون النشطون', formatNumber(subscribers.filter((s) => s.status === 'active').length)],
          ['نسبة إلغاء الاشتراك', subscribers.length ? `${Math.round((subscribers.filter((s) => s.status === 'unsubscribed').length / subscribers.length) * 100)}%` : '—'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {quotes.length === 0 ? (
        <Card className="mt-6">
          <Empty>ستظهر التقارير بعد وصول أول طلبات الأسعار.</Empty>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="طلبات الأسعار شهرياً">
              <BarChart bars={quoteMonths} />
            </Card>
            <Card title="نسبة القبول شهرياً (من الطلبات المغلقة)">
              <BarChart bars={winByMonth} max={100} format={(n) => `${n}%`} />
            </Card>
            <Card title="الرسائل شهرياً">
              <BarChart bars={perMonth(messages)} height="h-40" />
            </Card>
            <Card title="المشتركون الجدد شهرياً">
              <BarChart bars={perMonth(subscribers)} height="h-40" />
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <Card title="بلدان التحميل">
              <RankList rows={countBy(quotes, (q) => q.data.loading_country, 8)} total={quotes.length} />
            </Card>
            <Card title="بلدان التفريغ">
              <RankList rows={countBy(quotes, (q) => q.data.unloading_country, 8)} total={quotes.length} />
            </Card>
            <Card title="أنواع البضائع">
              <RankList rows={countBy(quotes, (q) => q.data.commodity, 8)} total={quotes.length} />
            </Card>
            <Card title="الطلبات حسب يوم الأسبوع">
              <BarChart bars={weekdays} height="h-36" />
            </Card>
            <Card title="توزيع الحالات">
              <RankList
                rows={QUOTE_STATUSES.map((s) => [quoteStatus[s].label, quotes.filter((q) => q.status === s).length] as [string, number]).filter(([, n]) => n > 0)}
                total={quotes.length}
              />
            </Card>
            <Card title="الطلبات حسب المسؤول">
              <RankList rows={assignees} total={quotes.length} empty="لم يُسند أي طلب لموظف بعد." />
            </Card>
          </div>
        </>
      )}
    </>
  );
}
