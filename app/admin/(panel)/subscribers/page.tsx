import { list, SUBSCRIBER_STATUSES } from '@/lib/admin/store';
import { formatDateTime, subscriberStatus } from '@/lib/admin/format';
import { ButtonLink, Card, Empty, PageTitle, Pagination, paginate, SearchBox, StatusBadge, StatusTabs } from '@/components/admin/ui';
import { ConfirmSubmit } from '@/components/admin/client';
import { deleteRecord, setStatus } from '@/app/admin/actions';

export const metadata = { title: 'المشتركون' };

type Search = { status?: string; q?: string; page?: string };

const SOURCE = { newsletter: 'نموذج النشرة', contact: 'نموذج التواصل' } as const;

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { status = '', q = '', page } = await searchParams;
  const all = await list('subscribers');

  const needle = q.trim().toLowerCase();
  const matches = needle ? all.filter((s) => s.email.includes(needle)) : all;
  const filtered = status ? matches.filter((s) => s.status === status) : matches;
  const { rows, page: current, pages } = paginate(filtered, page);

  return (
    <>
      <PageTitle
        title="مشتركو النشرة البريدية"
        subtitle="من نموذج النشرة في تذييل الموقع، ومن اختار الاشتراك في نموذج التواصل."
        actions={<ButtonLink href="/api/admin/export/subscribers">تصدير CSV</ButtonLink>}
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <StatusTabs
            base="/admin/subscribers"
            current={status}
            q={q}
            items={[
              { value: '', label: 'الكل', count: matches.length },
              ...SUBSCRIBER_STATUSES.map((s) => ({ value: s, label: subscriberStatus[s].label, count: matches.filter((r) => r.status === s).length })),
            ]}
          />
          <SearchBox q={q} status={status} placeholder="بحث بالبريد…" />
        </div>

        {rows.length === 0 ? (
          <Empty>{all.length ? 'لا توجد نتائج مطابقة.' : 'لا يوجد مشتركون بعد.'}</Empty>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50 text-xs text-slate-500">
                  <th className="px-5 py-2.5 text-start font-medium">البريد الإلكتروني</th>
                  <th className="px-3 py-2.5 text-start font-medium">المصدر</th>
                  <th className="px-3 py-2.5 text-start font-medium">تاريخ الاشتراك</th>
                  <th className="px-3 py-2.5 text-start font-medium">الحالة</th>
                  <th className="px-5 py-2.5 text-end font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-medium text-slate-900" dir="ltr">
                      <span className="block text-end">{s.email}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{SOURCE[s.source]}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{formatDateTime(s.createdAt)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge meta={subscriberStatus[s.status]} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <form action={setStatus}>
                          <input type="hidden" name="collection" value="subscribers" />
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="status" value={s.status === 'active' ? 'unsubscribed' : 'active'} />
                          <button type="submit" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                            {s.status === 'active' ? 'إلغاء الاشتراك' : 'إعادة التفعيل'}
                          </button>
                        </form>
                        <form action={deleteRecord}>
                          <input type="hidden" name="collection" value="subscribers" />
                          <input type="hidden" name="id" value={s.id} />
                          <ConfirmSubmit message="حذف هذا المشترك نهائياً؟" className="px-3 py-1.5 text-xs">
                            حذف
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination base="/admin/subscribers" page={current} pages={pages} params={{ status, q }} />
      </Card>
    </>
  );
}
