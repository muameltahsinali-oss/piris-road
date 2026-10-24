import Link from 'next/link';
import { list, MESSAGE_STATUSES } from '@/lib/admin/store';
import { messageStatus, timeAgo } from '@/lib/admin/format';
import { ButtonLink, Card, Empty, PageTitle, Pagination, paginate, SearchBox, selectClass, StatusBadge, StatusTabs } from '@/components/admin/ui';
import { BulkBar, ConfirmSubmit } from '@/components/admin/client';
import { Icon } from '@/components/admin/icons';
import { bulkAction } from '@/app/admin/actions';
import { cn } from '@/lib/utils';

export const metadata = { title: 'الرسائل' };

type Search = { status?: string; q?: string; page?: string };

const FORM_ID = 'bulk-messages';

export default async function MessagesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { status = '', q = '', page } = await searchParams;
  const all = await list('messages');

  const needle = q.trim().toLowerCase();
  const matches = needle
    ? all.filter((m) => [m.data.name, m.data.email, m.data.message, m.notes].some((v) => v.toLowerCase().includes(needle)))
    : all;
  const filtered = status ? matches.filter((m) => m.status === status) : matches;
  const { rows, page: current, pages } = paginate(filtered, page);

  return (
    <>
      <PageTitle
        title="الرسائل"
        subtitle="رسائل نموذج «تحتاج مساعدة إضافية؟» في صفحات الموقع."
        actions={
          <ButtonLink href="/api/admin/export/messages">
            <Icon name="download" /> تصدير CSV
          </ButtonLink>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <StatusTabs
            base="/admin/messages"
            current={status}
            q={q}
            items={[
              { value: '', label: 'الكل', count: matches.length },
              ...MESSAGE_STATUSES.map((s) => ({ value: s, label: messageStatus[s].label, count: matches.filter((m) => m.status === s).length })),
            ]}
          />
          <SearchBox q={q} status={status} placeholder="بحث بالاسم، البريد، النص…" />
        </div>

        <form id={FORM_ID} action={bulkAction} className="mb-1 border-b border-slate-100 pb-3">
          <input type="hidden" name="collection" value="messages" />
          <BulkBar formId={FORM_ID}>
            <select name="op" defaultValue="" required aria-label="إجراء جماعي" className={selectClass}>
              <option value="" disabled>
                تحديد كـ…
              </option>
              {MESSAGE_STATUSES.map((s) => (
                <option key={s} value={`status:${s}`}>
                  {messageStatus[s].label}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
              تطبيق
            </button>
            <ConfirmSubmit name="delete" value="1" formNoValidate message="حذف الرسائل المحددة نهائياً؟" className="px-3 py-1.5">
              حذف المحدد
            </ConfirmSubmit>
          </BulkBar>
        </form>

        {rows.length === 0 ? (
          <div className="pt-3">
            <Empty>{all.length ? 'لا توجد نتائج مطابقة.' : 'لا توجد رسائل بعد.'}</Empty>
          </div>
        ) : (
          <ul className="-mx-5 divide-y divide-slate-100">
            {rows.map((m) => (
              <li key={m.id} className={cn('flex items-start gap-4 px-5 py-4 hover:bg-slate-50/70', m.status === 'new' && 'bg-blue-50/30')}>
                <input type="checkbox" name="ids" value={m.id} form={FORM_ID} aria-label="تحديد الرسالة" className="mt-1 h-4 w-4 rounded border-slate-300 accent-brand" />
                <Link href={`/admin/messages/${m.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className={cn('truncate text-sm text-slate-900', m.status === 'new' ? 'font-semibold' : 'font-medium')}>
                      {m.data.name} <span className="font-normal text-slate-500" dir="ltr">&lt;{m.data.email}&gt;</span>
                    </p>
                    <span className="shrink-0 text-xs text-slate-500">{timeAgo(m.createdAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{m.data.message || <span className="text-slate-400">(بدون نص)</span>}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge meta={messageStatus[m.status]} />
                    {m.data.newsletter && <span className="text-xs text-slate-500">اشترك في النشرة</span>}
                    {m.notes && <span className="text-xs text-slate-500">· فيها ملاحظات</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Pagination base="/admin/messages" page={current} pages={pages} params={{ status, q }} />
      </Card>
    </>
  );
}
