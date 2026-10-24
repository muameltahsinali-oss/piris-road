import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CURRENCIES, list, PRIORITIES } from '@/lib/admin/store';
import {
  followUpLabel,
  followUpState,
  formatDateTime,
  formatDuration,
  formatMoney,
  firstResponseHours,
  phoneDigits,
  priorityMeta,
  quoteStatus,
  route,
} from '@/lib/admin/format';
import { ButtonLink, Card, inputClass, PageTitle, StatusBadge, StatusForm, Timeline } from '@/components/admin/ui';
import { ConfirmSubmit, PrintButton, SubmitButton } from '@/components/admin/client';
import { Icon } from '@/components/admin/icons';
import { deleteRecord, saveDeal, saveNotes } from '@/app/admin/actions';
import { siteConfig } from '@/content/site';
import { cn } from '@/lib/utils';

export const metadata = { title: 'تفاصيل طلب السعر' };

function Fields({ rows }: { rows: Array<[string, string | undefined]> }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 print:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-slate-500">{label}</dt>
          <dd className="mt-0.5 break-words text-sm text-slate-900">{value || <span className="text-slate-400">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

const label = 'mb-1.5 block text-xs font-medium text-slate-600';

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await list('quotes');
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) notFound();
  const quote = all[index];
  const newer = all[index - 1];
  const older = all[index + 1];
  const d = quote.data;
  const deal = quote.deal ?? {};
  const dims = [d.length, d.width, d.height].filter(Boolean).join(' × ');
  const fu = quote.status === 'won' || quote.status === 'lost' ? null : followUpState(deal.followUpAt);
  const sameClient = d.email ? all.filter((r) => r.id !== quote.id && r.data.email && r.data.email.toLowerCase() === d.email.toLowerCase()) : [];

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3 print:hidden">
        <Link href="/admin/quotes" className="text-sm text-slate-500 hover:text-brand">
          → كل طلبات الأسعار
        </Link>
        <div className="flex gap-2 text-sm">
          {newer && (
            <Link href={`/admin/quotes/${newer.id}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
              الأحدث
            </Link>
          )}
          {older && (
            <Link href={`/admin/quotes/${older.id}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
              الأقدم
            </Link>
          )}
        </div>
      </div>

      {/* Letterhead shown only on the printed sheet. */}
      <div className="mb-6 hidden items-center justify-between border-b border-slate-300 pb-4 print:flex">
        <div>
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="text-xs text-slate-600">{siteConfig.contact.address}</p>
        </div>
        <p className="text-xs text-slate-600" dir="ltr">
          {siteConfig.contact.emails.general} · {siteConfig.contact.phones[0]}
        </p>
      </div>

      <PageTitle
        title={route(d.loading_country, d.unloading_country)}
        subtitle={`طلب رقم ${quote.id.slice(0, 8).toUpperCase()} · ورد ${formatDateTime(quote.createdAt)} · آخر تحديث ${formatDateTime(quote.updatedAt)}`}
        actions={
          <>
            <StatusBadge meta={quoteStatus[quote.status]} />
            <StatusBadge meta={priorityMeta[deal.priority ?? 'normal']} />
            <span className="flex flex-wrap gap-2 print:hidden">
              {d.email && (
                <ButtonLink variant="primary" href={`mailto:${d.email}?subject=${encodeURIComponent(`Quote: ${d.loading_country} → ${d.unloading_country}`)}`} external>
                  <Icon name="mail" /> الرد بالبريد
                </ButtonLink>
              )}
              {d.phone && (
                <>
                  <ButtonLink href={`https://wa.me/${phoneDigits(d.phone).replace(/^\+/, '')}`} external>
                    واتساب
                  </ButtonLink>
                  <ButtonLink href={`tel:${phoneDigits(d.phone)}`} external>
                    <Icon name="phone" /> اتصال
                  </ButtonLink>
                </>
              )}
              <PrintButton />
            </span>
          </>
        }
      />

      {fu && fu !== 'upcoming' && (
        <p className={cn('mb-6 rounded-lg px-4 py-3 text-sm print:hidden', fu === 'overdue' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-900')}>
          موعد المتابعة {followUpLabel[fu]}: {deal.followUpAt}
          {deal.assignee && ` — المسؤول: ${deal.assignee}`}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 print:block">
        <div className="space-y-6 xl:col-span-2 print:space-y-4">
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

          <Card title="عرض السعر" className="hidden print:block">
            <Fields
              rows={[
                ['القيمة', formatMoney(deal.amount, deal.currency)],
                ['الحالة', quoteStatus[quote.status].label],
                ['المسؤول', deal.assignee],
                ['ملاحظات', quote.notes],
              ]}
            />
          </Card>

          <Card title="سجل النشاط" className="print:hidden">
            <Timeline events={quote.history ?? []} />
          </Card>
        </div>

        <div className="space-y-6 print:hidden">
          <Card title="الحالة">
            <StatusForm collection="quotes" id={quote.id} current={quote.status} options={quoteStatus} />
            <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <div className="flex justify-between gap-2">
                <dt>زمن أول استجابة</dt>
                <dd className="text-slate-800">{formatDuration(firstResponseHours(quote))}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>إشعار البريد</dt>
                <dd className="text-slate-800">{quote.delivered === true ? 'أُرسل' : quote.delivered === false ? 'فشل الإرسال' : 'غير مفعّل'}</dd>
              </div>
            </dl>
          </Card>

          <Card title="بيانات الصفقة">
            <form key={quote.updatedAt} action={saveDeal} className="space-y-3">
              <input type="hidden" name="id" value={quote.id} />
              <div className="grid grid-cols-3 gap-2">
                <label className="col-span-2 block">
                  <span className={label}>قيمة العرض</span>
                  <input name="amount" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={deal.amount ?? ''} placeholder="0.00" className={inputClass} dir="ltr" />
                </label>
                <label className="block">
                  <span className={label}>العملة</span>
                  <select name="currency" defaultValue={deal.currency ?? 'USD'} className={inputClass}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className={label}>الأولوية</span>
                <select name="priority" defaultValue={deal.priority ?? 'normal'} className={inputClass}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {priorityMeta[p].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={label}>المسؤول عن الطلب</span>
                <input name="assignee" defaultValue={deal.assignee ?? ''} maxLength={80} placeholder="اسم الموظف" className={inputClass} />
              </label>
              <label className="block">
                <span className={label}>موعد المتابعة</span>
                <input name="followUpAt" type="date" defaultValue={deal.followUpAt ?? ''} className={inputClass} dir="ltr" />
              </label>
              <SubmitButton className="w-full">حفظ بيانات الصفقة</SubmitButton>
            </form>
          </Card>

          <Card title="ملاحظات داخلية">
            <form key={quote.notes} action={saveNotes} className="space-y-3">
              <input type="hidden" name="collection" value="quotes" />
              <input type="hidden" name="id" value={quote.id} />
              <textarea name="notes" rows={5} defaultValue={quote.notes} maxLength={5000} placeholder="تفاصيل التسعير، المتابعات، ملاحظات الفريق…" className={inputClass} />
              <SubmitButton>حفظ الملاحظات</SubmitButton>
            </form>
          </Card>

          {sameClient.length > 0 && (
            <Card title={`طلبات أخرى من نفس العميل (${sameClient.length})`}>
              <ul className="-my-2 divide-y divide-slate-100">
                {sameClient.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/quotes/${r.id}`} className="flex items-center justify-between gap-2 py-2 text-sm">
                      <span className="truncate text-slate-800">{route(r.data.loading_country, r.data.unloading_country)}</span>
                      <StatusBadge meta={quoteStatus[r.status]} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="منطقة الخطر">
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
