import Link from 'next/link';
import { list, QUOTE_STATUSES } from '@/lib/admin/store';
import { formatDateTime, quoteStatus, route } from '@/lib/admin/format';
import { ButtonLink, Card, Empty, PageTitle, Pagination, paginate, SearchBox, StatusBadge, StatusTabs } from '@/components/admin/ui';

export const metadata = { title: 'طلبات الأسعار' };

type Search = { status?: string; q?: string; page?: string };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { status = '', q = '', page } = await searchParams;
  const all = await list('quotes');

  const needle = q.trim().toLowerCase();
  const matches = needle
    ? all.filter((r) => Object.values(r.data).some((v) => String(v).toLowerCase().includes(needle)))
    : all;
  const filtered = status ? matches.filter((r) => r.status === status) : matches;
  const { rows, page: current, pages } = paginate(filtered, page);

  return (
    <>
      <PageTitle
        title="طلبات الأسعار"
        subtitle="الطلبات الواردة من صفحة «اطلب عرض سعر». غيّر الحالة لمتابعة كل طلب حتى الإغلاق."
        actions={<ButtonLink href="/api/admin/export/quotes">تصدير CSV</ButtonLink>}
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
          <SearchBox q={q} status={status} placeholder="بحث بالاسم، الشركة، البلد، البضاعة…" />
        </div>

        {rows.length === 0 ? (
          <Empty>{all.length ? 'لا توجد نتائج مطابقة.' : 'لا توجد طلبات أسعار بعد.'}</Empty>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50 text-start text-xs font-medium text-slate-500">
                  <th className="px-5 py-2.5 text-start font-medium">التاريخ</th>
                  <th className="px-3 py-2.5 text-start font-medium">المسار</th>
                  <th className="px-3 py-2.5 text-start font-medium">البضاعة</th>
                  <th className="px-3 py-2.5 text-start font-medium">العميل</th>
                  <th className="px-3 py-2.5 text-start font-medium">الطرود / الوزن</th>
                  <th className="px-5 py-2.5 text-start font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                      <Link href={`/admin/quotes/${r.id}`} className="hover:text-brand">
                        {formatDateTime(r.createdAt)}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/admin/quotes/${r.id}`} className="font-medium text-slate-900 hover:text-brand">
                        {route(r.data.loading_country, r.data.unloading_country)}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {route(r.data.loading_place, r.data.unloading_place)}
                      </p>
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-3 text-slate-700">{r.data.commodity}</td>
                    <td className="px-3 py-3">
                      <p className="text-slate-900">{r.data.company_name || r.data.your_name || '—'}</p>
                      {r.data.email && <p className="text-xs text-slate-500" dir="ltr">{r.data.email}</p>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-700">
                      {r.data.number_of_colli}
                      {r.data.weight && <span className="text-slate-400"> / {r.data.weight} كغ</span>}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge meta={quoteStatus[r.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination base="/admin/quotes" page={current} pages={pages} params={{ status, q }} />
      </Card>
    </>
  );
}
