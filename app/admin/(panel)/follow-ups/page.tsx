import Link from 'next/link';
import { list, type QuoteRecord } from '@/lib/admin/store';
import { followUpState, formatDay, formatMoney, priorityMeta, quoteStatus, route } from '@/lib/admin/format';
import { Card, Empty, PageTitle, StatusBadge } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

export const metadata = { title: 'المتابعات' };

const OPEN = new Set(['new', 'in_progress', 'quoted']);

const GROUPS = [
  { key: 'overdue', title: 'متأخرة', tone: 'border-rose-200', dot: 'bg-rose-600' },
  { key: 'today', title: 'اليوم', tone: 'border-amber-200', dot: 'bg-amber-500' },
  { key: 'upcoming', title: 'قادمة', tone: 'border-slate-200', dot: 'bg-slate-400' },
] as const;

export default async function FollowUpsPage() {
  const quotes = (await list('quotes')).filter((q) => OPEN.has(q.status));
  const scheduled = quotes
    .filter((q) => q.deal?.followUpAt)
    .sort((a, b) => a.deal!.followUpAt!.localeCompare(b.deal!.followUpAt!));
  const unscheduled = quotes.filter((q) => !q.deal?.followUpAt);

  return (
    <>
      <PageTitle title="المتابعات" subtitle="طلبات الأسعار المفتوحة مرتّبة حسب موعد المتابعة. حدّد الموعد والمسؤول من صفحة الطلب." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {GROUPS.map((g) => {
          const rows = scheduled.filter((q) => followUpState(q.deal!.followUpAt) === g.key);
          return (
            <Card key={g.key} title={`${g.title} (${rows.length})`} className={cn('border-t-4', g.tone)}>
              {rows.length === 0 ? <p className="text-sm text-slate-500">لا شيء هنا.</p> : <Rows rows={rows} />}
            </Card>
          );
        })}
      </div>

      <Card title={`مفتوحة بدون موعد متابعة (${unscheduled.length})`} className="mt-6">
        {unscheduled.length === 0 ? <Empty>كل الطلبات المفتوحة لها موعد متابعة.</Empty> : <Rows rows={unscheduled} />}
      </Card>
    </>
  );
}

function Rows({ rows }: { rows: QuoteRecord[] }) {
  return (
    <ul className="-my-2 divide-y divide-slate-100">
      {rows.map((q) => (
        <li key={q.id}>
          <Link href={`/admin/quotes/${q.id}`} className="block py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-slate-900">{q.data.company_name || q.data.your_name || q.data.email || '—'}</p>
              <StatusBadge meta={quoteStatus[q.status]} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {route(q.data.loading_country, q.data.unloading_country)}
              {q.deal?.followUpAt && ` · ${formatDay(q.deal.followUpAt)}`}
              {q.deal?.assignee && ` · ${q.deal.assignee}`}
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>الأولوية: {priorityMeta[q.deal?.priority ?? 'normal'].label}</span>
              {q.deal?.amount != null && <span>· {formatMoney(q.deal.amount, q.deal.currency)}</span>}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
