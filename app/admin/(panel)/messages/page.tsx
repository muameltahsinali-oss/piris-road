import { list, MESSAGE_STATUSES } from '@/lib/admin/store';
import { formatDateTime, messageStatus } from '@/lib/admin/format';
import { ButtonLink, Card, Empty, PageTitle, Pagination, paginate, SearchBox, StatusBadge, StatusForm, StatusTabs } from '@/components/admin/ui';
import { ConfirmSubmit } from '@/components/admin/client';
import { deleteRecord } from '@/app/admin/actions';

export const metadata = { title: 'الرسائل' };

type Search = { status?: string; q?: string; page?: string };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { status = '', q = '', page } = await searchParams;
  const all = await list('messages');

  const needle = q.trim().toLowerCase();
  const matches = needle
    ? all.filter((m) => [m.data.name, m.data.email, m.data.message].some((v) => v.toLowerCase().includes(needle)))
    : all;
  const filtered = status ? matches.filter((m) => m.status === status) : matches;
  const { rows, page: current, pages } = paginate(filtered, page);

  return (
    <>
      <PageTitle
        title="الرسائل"
        subtitle="رسائل نموذج «تحتاج مساعدة إضافية؟» في صفحات الموقع."
        actions={<ButtonLink href="/api/admin/export/messages">تصدير CSV</ButtonLink>}
      />

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

      {rows.length === 0 ? (
        <Card>
          <Empty>{all.length ? 'لا توجد نتائج مطابقة.' : 'لا توجد رسائل بعد.'}</Empty>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((m) => (
            <article key={m.id} id={m.id} className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">{m.data.name}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    <a href={`mailto:${m.data.email}`} className="hover:text-brand" dir="ltr">
                      {m.data.email}
                    </a>{' '}
                    · {formatDateTime(m.createdAt)}
                    {m.data.newsletter && ' · اشترك في النشرة'}
                  </p>
                </div>
                <StatusBadge meta={messageStatus[m.status]} />
              </header>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {m.data.message || <span className="text-slate-400">(بدون نص)</span>}
              </p>
              <footer className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                <StatusForm collection="messages" id={m.id} current={m.status} options={messageStatus} />
                <ButtonLink href={`mailto:${m.data.email}?subject=${encodeURIComponent('Re: Piris Road')}`} external>
                  رد بالبريد
                </ButtonLink>
                <form action={deleteRecord} className="ms-auto">
                  <input type="hidden" name="collection" value="messages" />
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmSubmit message="حذف هذه الرسالة نهائياً؟">حذف</ConfirmSubmit>
                </form>
              </footer>
            </article>
          ))}
        </div>
      )}
      <Pagination base="/admin/messages" page={current} pages={pages} params={{ status, q }} />
    </>
  );
}
