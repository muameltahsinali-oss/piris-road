import Link from 'next/link';
import { notFound } from 'next/navigation';
import { get } from '@/lib/admin/store';
import { formatDateTime, phoneDigits, quoteStatus, route } from '@/lib/admin/format';
import { ButtonLink, buttonClass, Card, inputClass, PageTitle, StatusBadge, StatusForm } from '@/components/admin/ui';
import { ConfirmSubmit } from '@/components/admin/client';
import { deleteRecord, saveNotes } from '../../../actions';

export const metadata = { title: 'تفاصيل طلب السعر' };

function Fields({ rows }: { rows: Array<[string, string | undefined]> }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-slate-500">{label}</dt>
          <dd className="mt-0.5 break-words text-sm text-slate-900">{value || <span className="text-slate-400">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await get('quotes', id);
  if (!quote) notFound();
  const d = quote.data;
  const dims = [d.length, d.width, d.height].filter(Boolean).join(' × ');

  return (
    <>
      <Link href="/admin/quotes" className="mb-3 inline-block text-sm text-slate-500 hover:text-brand">
        → كل طلبات الأسعار
      </Link>
      <PageTitle
        title={route(d.loading_country, d.unloading_country)}
        subtitle={`ورد ${formatDateTime(quote.createdAt)} · آخر تحديث ${formatDateTime(quote.updatedAt)}`}
        actions={
          <>
            <StatusBadge meta={quoteStatus[quote.status]} />
            {d.email && (
              <ButtonLink variant="primary" href={`mailto:${d.email}?subject=${encodeURIComponent(`Quote: ${d.loading_country} → ${d.unloading_country}`)}`} external>
                الرد بالبريد
              </ButtonLink>
            )}
            {d.phone && (
              <ButtonLink href={`https://wa.me/${phoneDigits(d.phone).replace(/^\+/, '')}`} external>
                واتساب
              </ButtonLink>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="معلومات الشحنة">
            <Fields
              rows={[
                ['مكان التحميل', d.loading_place],
                ['بلد التحميل', d.loading_country],
                ['مكان التفريغ', d.unloading_place],
                ['بلد التفريغ', d.unloading_country],
                ['عدد الطرود', d.number_of_colli],
                ['الوزن (كغ)', d.weight],
                ['الأبعاد (ط × ع × ار)', dims],
                ['نوع البضاعة', d.commodity],
              ]}
            />
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">معلومات إضافية</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">{d.additional_info}</p>
            </div>
          </Card>

          <Card title="معلومات الشركة والتواصل">
            <Fields
              rows={[
                ['الاسم', d.your_name],
                ['الشركة', d.company_name],
                ['البريد الإلكتروني', d.email],
                ['الهاتف', d.phone],
                ['الرقم الضريبي', d.vat_number],
                ['العنوان', d.address],
                ['الرمز البريدي', d.postal_number],
                ['المدينة', d.city],
                ['البلد', d.country],
              ]}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="الحالة">
            <StatusForm collection="quotes" id={quote.id} current={quote.status} options={quoteStatus} />
            <p className="mt-3 text-xs text-slate-500">
              إشعار البريد:{' '}
              {quote.delivered === true ? 'أُرسل' : quote.delivered === false ? 'فشل الإرسال' : 'غير مفعّل (لا يوجد مفتاح Resend)'}
            </p>
          </Card>

          <Card title="ملاحظات داخلية">
            <form key={quote.notes} action={saveNotes} className="space-y-3">
              <input type="hidden" name="collection" value="quotes" />
              <input type="hidden" name="id" value={quote.id} />
              <textarea name="notes" rows={6} defaultValue={quote.notes} maxLength={5000} placeholder="السعر المقترح، المتابعات، ملاحظات الفريق…" className={inputClass} />
              <button type="submit" className={buttonClass}>
                حفظ الملاحظات
              </button>
            </form>
          </Card>

          <Card title="حذف">
            <form action={deleteRecord}>
              <input type="hidden" name="collection" value="quotes" />
              <input type="hidden" name="id" value={quote.id} />
              <input type="hidden" name="redirect" value="/admin/quotes" />
              <ConfirmSubmit message="حذف هذا الطلب نهائياً؟">حذف الطلب</ConfirmSubmit>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
