import Link from 'next/link';
import { list } from '@/lib/admin/store';
import { formatDateTime, messageStatus, quoteStatus, route, subscriberStatus } from '@/lib/admin/format';
import { Card, Empty, PageTitle, StatusBadge } from '@/components/admin/ui';

export const metadata = { title: 'بحث' };

const LIMIT = 20;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').trim();
  const needle = q.toLowerCase();
  const [quotes, messages, subscribers] = await Promise.all([list('quotes'), list('messages'), list('subscribers')]);

  const has = (...vals: Array<string | undefined>) => vals.some((v) => v?.toLowerCase().includes(needle));
  const qHits = needle ? quotes.filter((r) => has(...Object.values(r.data).map(String), r.notes, r.deal?.assignee, r.id)) : [];
  const mHits = needle ? messages.filter((r) => has(r.data.name, r.data.email, r.data.message, r.notes)) : [];
  const sHits = needle ? subscribers.filter((r) => has(r.email)) : [];
  const total = qHits.length + mHits.length + sHits.length;

  return (
    <>
      <PageTitle title="البحث الشامل" subtitle={q ? `${total} نتيجة لـ «${q}»` : 'اكتب في مربع البحث أعلى الصفحة.'} />

      {q && total === 0 && (
        <Card>
          <Empty>لا توجد نتائج مطابقة.</Empty>
        </Card>
      )}

      <div className="space-y-6">
        {qHits.length > 0 && (
          <Card title={`طلبات الأسعار (${qHits.length})`} action={<Link href={`/admin/quotes?q=${encodeURIComponent(q)}`} className="text-xs text-brand hover:underline">فتح في القائمة</Link>}>
            <ul className="-my-2 divide-y divide-slate-100">
              {qHits.slice(0, LIMIT).map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/quotes/${r.id}`} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{route(r.data.loading_country, r.data.unloading_country)} — {r.data.commodity}</p>
                      <p className="truncate text-xs text-slate-500">
                        {r.data.company_name || r.data.your_name || r.data.email || '—'} · {formatDateTime(r.createdAt)}
                      </p>
                    </div>
                    <StatusBadge meta={quoteStatus[r.status]} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {mHits.length > 0 && (
          <Card title={`الرسائل (${mHits.length})`}>
            <ul className="-my-2 divide-y divide-slate-100">
              {mHits.slice(0, LIMIT).map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/messages/${r.id}`} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{r.data.name}</p>
                      <p className="truncate text-xs text-slate-500">{r.data.message.slice(0, 90) || '—'}</p>
                    </div>
                    <StatusBadge meta={messageStatus[r.status]} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {sHits.length > 0 && (
          <Card title={`المشتركون (${sHits.length})`}>
            <ul className="-my-2 divide-y divide-slate-100">
              {sHits.slice(0, LIMIT).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/subscribers?q=${encodeURIComponent(r.email)}`} className="text-sm text-slate-900 hover:text-brand" dir="ltr">
                    {r.email}
                  </Link>
                  <StatusBadge meta={subscriberStatus[r.status]} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
