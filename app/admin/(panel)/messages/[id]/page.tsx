import Link from 'next/link';
import { notFound } from 'next/navigation';
import { list } from '@/lib/admin/store';
import { formatDateTime, messageStatus, quoteStatus, route } from '@/lib/admin/format';
import { ButtonLink, Card, inputClass, PageTitle, StatusBadge, StatusForm, Timeline } from '@/components/admin/ui';
import { ConfirmSubmit, SubmitButton } from '@/components/admin/client';
import { Icon } from '@/components/admin/icons';
import { deleteRecord, saveNotes, setStatus } from '@/app/admin/actions';

export const metadata = { title: 'تفاصيل الرسالة' };

export default async function MessageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [messages, quotes] = await Promise.all([list('messages'), list('quotes')]);
  const m = messages.find((r) => r.id === id);
  if (!m) notFound();
  const email = m.data.email.toLowerCase();
  const related = quotes.filter((q) => q.data.email?.toLowerCase() === email);
  const otherMessages = messages.filter((r) => r.id !== m.id && r.data.email.toLowerCase() === email);

  return (
    <>
      <Link href="/admin/messages" className="mb-3 inline-block text-sm text-slate-500 hover:text-brand">
        → كل الرسائل
      </Link>
      <PageTitle
        title={m.data.name}
        subtitle={`${m.data.email} · ${formatDateTime(m.createdAt)}`}
        actions={
          <>
            <StatusBadge meta={messageStatus[m.status]} />
            <ButtonLink variant="primary" href={`mailto:${m.data.email}?subject=${encodeURIComponent('Re: Piris Road')}`} external>
              <Icon name="mail" /> الرد بالبريد
            </ButtonLink>
            {m.status === 'new' && (
              <form action={setStatus}>
                <input type="hidden" name="collection" value="messages" />
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="status" value="read" />
                <button type="submit" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  تحديد كمقروءة
                </button>
              </form>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="نص الرسالة">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">{m.data.message || <span className="text-slate-400">(بدون نص)</span>}</p>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              {m.data.newsletter ? 'وافق على الاشتراك في النشرة البريدية.' : 'لم يشترك في النشرة البريدية.'}
            </p>
          </Card>
          <Card title="سجل النشاط">
            <Timeline events={m.history ?? []} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="الحالة">
            <StatusForm collection="messages" id={m.id} current={m.status} options={messageStatus} />
          </Card>

          <Card title="ملاحظات داخلية">
            <form key={m.notes} action={saveNotes} className="space-y-3">
              <input type="hidden" name="collection" value="messages" />
              <input type="hidden" name="id" value={m.id} />
              <textarea name="notes" rows={5} defaultValue={m.notes} maxLength={5000} className={inputClass} placeholder="ما تم الرد به، الخطوة التالية…" />
              <SubmitButton>حفظ الملاحظات</SubmitButton>
            </form>
          </Card>

          {(related.length > 0 || otherMessages.length > 0) && (
            <Card title="تاريخ هذا العميل">
              <ul className="-my-2 divide-y divide-slate-100 text-sm">
                {related.map((q) => (
                  <li key={q.id}>
                    <Link href={`/admin/quotes/${q.id}`} className="flex items-center justify-between gap-2 py-2">
                      <span className="truncate">طلب سعر: {route(q.data.loading_country, q.data.unloading_country)}</span>
                      <StatusBadge meta={quoteStatus[q.status]} />
                    </Link>
                  </li>
                ))}
                {otherMessages.map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/messages/${r.id}`} className="flex items-center justify-between gap-2 py-2">
                      <span className="truncate">رسالة: {r.data.message.slice(0, 40) || '—'}</span>
                      <StatusBadge meta={messageStatus[r.status]} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="منطقة الخطر">
            <form action={deleteRecord}>
              <input type="hidden" name="collection" value="messages" />
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="redirect" value="/admin/messages" />
              <ConfirmSubmit message="حذف هذه الرسالة نهائياً؟">حذف الرسالة</ConfirmSubmit>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
