import Link from 'next/link';
import { list, QUOTE_STATUSES, type QuoteRecord } from '@/lib/admin/store';
import {
  followUpLabel,
  followUpState,
  formatDateTime,
  formatDay,
  formatMoney,
  priorityMeta,
  PRIORITY_RANK,
  quoteStatus,
  route,
} from '@/lib/admin/format';
import { ButtonLink, Card, Empty, PageTitle, Pagination, paginate, SearchBox, selectClass, StatusBadge, StatusTabs } from '@/components/admin/ui';
import { BulkBar, ConfirmSubmit } from '@/components/admin/client';
import { Icon } from '@/components/admin/icons';
import { bulkAction } from '@/app/admin/actions';
import { cn } from '@/lib/utils';

export const metadata = { title: 'طلبات الأسعار' };

type Search = { status?: string; q?: string; page?: string; sort?: string };

const SORTS = {
  newest: { label: 'الأحدث', fn: (a: QuoteRecord, b: QuoteRecord) => b.createdAt.localeCompare(a.createdAt) },
  oldest: { label: 'الأقدم', fn: (a: QuoteRecord, b: QuoteRecord) => a.createdAt.localeCompare(b.createdAt) },
  priority: {
    label: 'الأولوية',
    fn: (a: QuoteRecord, b: QuoteRecord) =>
      PRIORITY_RANK[a.deal?.priority ?? 'normal'] - PRIORITY_RANK[b.deal?.priority ?? 'normal'] || b.createdAt.localeCompare(a.createdAt),
  },
  followup: {
    label: 'موعد المتابعة',
    fn: (a: QuoteRecord, b: QuoteRecord) => (a.deal?.followUpAt ?? '9999').localeCompare(b.deal?.followUpAt ?? '9999'),
  },
  value: { label: 'القيمة', fn: (a: QuoteRecord, b: QuoteRecord) => (b.deal?.amount ?? -1) - (a.deal?.amount ?? -1) },
} as const;

type SortKey = keyof typeof SORTS;

const FORM_ID = 'bulk-quotes';

export default async function QuotesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { status = '', q = '', page, sort: sortParam = 'newest' } = await searchParams;
  const sort: SortKey = sortParam in SORTS ? (sortParam as SortKey) : 'newest';
  const all = await list('quotes');

  const needle = q.trim().toLowerCase();
  const matches = needle
    ? all.filter((r) =>
        [...Object.values(r.data), r.notes, r.deal?.assignee ?? ''].some((v) => String(v).toLowerCase().includes(needle)),
      )
    : all;
  const filtered = (status ? matches.filter((r) => r.status === status) : matches).sort(SORTS[sort].fn);
  const { rows, page: current, pages } = paginate(filtered, page);

  return (
    <>
      <PageTitle
        title="طلبات الأسعار"
        subtitle="الطلبات الواردة من صفحة «اطلب عرض سعر». تابع كل طلب حتى الإغلاق، وحدّد قيمته وأولويته وموعد متابعته."
        actions={
          <ButtonLink href="/api/admin/export/quotes">
            <Icon name="download" /> تصدير CSV
          </ButtonLink>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <StatusTabs
            base="/admin/quotes"
            current={status}
            q={q}
            items={[
              { value: '', label: 'الكل', count: matches.length },
              ...QUOTE_STATUSES.map((s) => ({ value: s, label: quoteStatus[s].label, count: matches.filter((r) => r.status === s).length })),
            ]}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <form className="flex items-center gap-2">
              {status && <input type="hidden" name="status" value={status} />}
              {q && <input type="hidden" name="q" value={q} />}
              <label htmlFor="sort" className="whitespace-nowrap text-sm text-slate-500">
                ترتيب
              </label>
              <select id="sort" name="sort" defaultValue={sort} className={selectClass}>
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                تطبيق
              </button>
            </form>
            <SearchBox q={q} status={status} placeholder="بحث بالاسم، الشركة، البلد، المسؤول…" />
          </div>
        </div>

        <form id={FORM_ID} action={bulkAction} className="mb-3 border-b border-slate-100 pb-3">
          <input type="hidden" name="collection" value="quotes" />
          <BulkBar formId={FORM_ID}>
            <select name="op" defaultValue="" required aria-label="إجراء جماعي" className={selectClass}>
              <option value="" disabled>
                تغيير الحالة إلى…
              </option>
              {QUOTE_STATUSES.map((s) => (
                <option key={s} value={`status:${s}`}>
                  {quoteStatus[s].label}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
              تطبيق
            </button>
            <ConfirmSubmit name="delete" value="1" formNoValidate message="حذف الطلبات المحددة نهائياً؟" className="px-3 py-1.5">
              حذف المحدد
            </ConfirmSubmit>
          </BulkBar>
        </form>

        {rows.length === 0 ? (
          <Empty>{all.length ? 'لا توجد نتائج مطابقة.' : 'لا توجد طلبات أسعار بعد.'}</Empty>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50 text-xs text-slate-500">
                  <th className="w-10 px-5 py-2.5" aria-label="تحديد" />
                  <th className="px-3 py-2.5 text-start font-medium">المسار</th>
                  <th className="px-3 py-2.5 text-start font-medium">العميل</th>
                  <th className="px-3 py-2.5 text-start font-medium">البضاعة</th>
                  <th className="px-3 py-2.5 text-start font-medium">الأولوية</th>
                  <th className="px-3 py-2.5 text-start font-medium">القيمة</th>
                  <th className="px-3 py-2.5 text-start font-medium">المتابعة</th>
                  <th className="px-3 py-2.5 text-start font-medium">الحالة</th>
                  <th className="px-5 py-2.5 text-start font-medium">الورود</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const fu = r.status === 'won' || r.status === 'lost' ? null : followUpState(r.deal?.followUpAt);
                  return (
                    <tr key={r.id} className={cn('hover:bg-slate-50/70', r.status === 'new' && 'bg-blue-50/30')}>
                      <td className="px-5 py-3">
                        <input type="checkbox" name="ids" value={r.id} form={FORM_ID} aria-label="تحديد الطلب" className="h-4 w-4 rounded border-slate-300 accent-brand" />
                      </td>
                      <td className="px-3 py-3">
                        <Link href={`/admin/quotes/${r.id}`} className="font-medium text-slate-900 hover:text-brand">
                          {route(r.data.loading_country, r.data.unloading_country)}
                        </Link>
                        <p className="text-xs text-slate-500">{route(r.data.loading_place, r.data.unloading_place)}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-slate-900">{r.data.company_name || r.data.your_name || '—'}</p>
                        {r.deal?.assignee && <p className="text-xs text-slate-500">المسؤول: {r.deal.assignee}</p>}
                      </td>
                      <td className="max-w-[160px] truncate px-3 py-3 text-slate-700">{r.data.commodity}</td>
                      <td className="px-3 py-3">
                        <StatusBadge meta={priorityMeta[r.deal?.priority ?? 'normal']} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-700">{formatMoney(r.deal?.amount, r.deal?.currency)}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {r.deal?.followUpAt ? (
                          <span className={cn('text-xs', fu === 'overdue' ? 'font-medium text-rose-700' : fu === 'today' ? 'font-medium text-amber-700' : 'text-slate-600')}>
                            {formatDay(r.deal.followUpAt)}
                            {fu && fu !== 'upcoming' && ` (${followUpLabel[fu]})`}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge meta={quoteStatus[r.status]} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">{formatDateTime(r.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination base="/admin/quotes" page={current} pages={pages} params={{ status, q, sort: sort === 'newest' ? undefined : sort }} />
      </Card>
    </>
  );
}
