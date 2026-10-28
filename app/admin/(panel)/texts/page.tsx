import Link from 'next/link';
import { getTextEntries, getTextGroups, idFor, type TextEntry } from '@/lib/admin/text-catalog';
import { Card, Empty, inputClass, PageTitle, Pagination, paginate } from '@/components/admin/ui';
import { ConfirmSubmit, SubmitButton } from '@/components/admin/client';
import { Icon } from '@/components/admin/icons';
import { restoreText, saveText } from '@/app/admin/actions';
import { cn } from '@/lib/utils';

export const metadata = { title: 'النصوص والترجمة' };

type Search = { group?: string; q?: string; filter?: string; page?: string };

const FILTERS = [
  { value: '', label: 'الكل' },
  { value: 'missing', label: 'بدون ترجمة عربية' },
  { value: 'edited', label: 'معدّلة' },
] as const;

export default async function TextsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { group: groupParam, q = '', filter = '', page } = await searchParams;
  const entries = getTextEntries();
  const groups = getTextGroups(entries);
  const needle = q.trim().toLowerCase();
  const group = needle ? '' : groups.some((g) => g.key === groupParam) ? groupParam! : groups[0]?.key ?? '';
  const current = groups.find((g) => g.key === group);

  let rows = needle
    ? entries.filter((e) => [e.source, e.en, e.ar].some((v) => v.toLowerCase().includes(needle)))
    : entries.filter((e) => e.group === group);
  if (filter === 'missing') rows = rows.filter((e) => !e.ar);
  if (filter === 'edited') rows = rows.filter((e) => e.editedEn || e.editedAr);
  const { rows: pageRows, page: pageNo, pages } = paginate(rows, page);

  const totals = {
    all: entries.length,
    missing: entries.filter((e) => !e.ar).length,
    edited: entries.filter((e) => e.editedEn || e.editedAr).length,
  };
  const sections = [...new Set(groups.map((g) => g.section))];
  const link = (params: Partial<Search>) => {
    const sp = new URLSearchParams(Object.entries({ group, filter, ...params }).filter((e): e is [string, string] => Boolean(e[1])));
    return `/admin/texts?${sp}`;
  };

  return (
    <>
      <PageTitle
        title="النصوص والترجمة"
        subtitle="عدّل أي نص يظهر في الموقع بالإنجليزية أو العربية. التغيير يُنشر على الموقع فور الحفظ. الرقم البرتقالي بجانب كل قسم = نصوص بدون ترجمة عربية."
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          ['إجمالي النصوص', totals.all, ''],
          ['بدون ترجمة عربية', totals.missing, 'missing'],
          ['نصوص معدّلة', totals.edited, 'edited'],
        ].map(([label, n, f]) => (
          <Link key={label} href={link({ filter: f as string, page: undefined })} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{n}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <form action="/admin/texts" role="search" className="relative mb-4">
            <Icon name="search" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" name="q" defaultValue={q} placeholder="ابحث في كل النصوص…" aria-label="بحث في النصوص" className={cn(inputClass, 'ps-9')} />
          </form>
          <nav aria-label="أقسام الموقع" className="space-y-4 rounded-xl border border-slate-200 bg-white p-3">
            {sections.map((section) => (
              <div key={section}>
                <p className="px-2 pb-1 text-[11px] font-medium text-slate-400">{section}</p>
                <ul>
                  {groups
                    .filter((g) => g.section === section)
                    .map((g) => (
                      <li key={g.key}>
                        <Link
                          href={`/admin/texts?group=${encodeURIComponent(g.key)}${filter ? `&filter=${filter}` : ''}`}
                          aria-current={g.key === group ? 'page' : undefined}
                          className={cn(
                            'flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition',
                            g.key === group ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
                          )}
                        >
                          <span className="truncate">{g.label}</span>
                          <span className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums">
                            {g.missing > 0 && (
                              <span title={`${g.missing} بدون ترجمة عربية`} className="rounded bg-amber-100 px-1.5 font-medium text-amber-800">
                                {g.missing}
                              </span>
                            )}
                            <span className={g.key === group ? 'text-slate-300' : 'text-slate-400'}>{g.count}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{needle ? `نتائج البحث عن «${q}» (${rows.length})` : `${current?.label ?? ''} (${rows.length})`}</h2>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              {FILTERS.map((f) => (
                <Link
                  key={f.value || 'all'}
                  href={needle ? `/admin/texts?q=${encodeURIComponent(q)}${f.value ? `&filter=${f.value}` : ''}` : link({ filter: f.value, page: undefined })}
                  className={cn('rounded-md px-3 py-1.5 text-sm font-medium', filter === f.value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          {pageRows.length === 0 ? (
            <Card>
              <Empty>لا توجد نصوص مطابقة.</Empty>
            </Card>
          ) : (
            <div className="space-y-4">
              {pageRows.map((e) => (
                <TextCard key={`${e.id}-${idFor(`${e.en}\u0000${e.ar}`)}`} entry={e} groupLabel={needle ? groups.find((g) => g.key === e.group)?.label : undefined} />
              ))}
            </div>
          )}
          <Pagination base="/admin/texts" page={pageNo} pages={pages} params={needle ? { q, filter } : { group, filter }} />
        </div>
      </div>
    </>
  );
}

const rowsFor = (e: TextEntry, value: string) => (e.html ? 14 : Math.min(10, Math.max(2, Math.ceil(value.length / 60))));

function TextCard({ entry: e, groupLabel }: { entry: TextEntry; groupLabel?: string }) {
  const edited = e.editedEn || e.editedAr;
  return (
    <form action={saveText} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <input type="hidden" name="id" value={e.id} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {groupLabel && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{groupLabel}</span>}
        {e.html && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">محتوى مقال (HTML)</span>}
        {edited && <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">معدّل</span>}
        {!e.ar && <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">بدون ترجمة عربية — يظهر بالإنجليزية</span>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600">
            English
            {e.editedEn && <span className="font-normal text-slate-400">الأصل: {e.defaultEn.length > 60 ? `${e.defaultEn.slice(0, 60)}…` : e.defaultEn}</span>}
          </span>
          <textarea name="en" dir="ltr" defaultValue={e.en} rows={rowsFor(e, e.en)} className={cn(inputClass, 'text-left leading-relaxed', e.html && 'font-mono text-xs')} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">العربية</span>
          <textarea
            name="ar"
            dir="rtl"
            defaultValue={e.ar}
            rows={rowsFor(e, e.ar || e.en)}
            placeholder="أضف الترجمة العربية…"
            className={cn(inputClass, 'leading-relaxed', e.html && 'font-mono text-xs')}
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        {edited && (
          <ConfirmSubmit formAction={restoreText} formNoValidate message="استعادة النص الأصلي وإلغاء التعديلات؟" className="px-3 py-1.5">
            استعادة الأصل
          </ConfirmSubmit>
        )}
        <SubmitButton className="py-1.5">حفظ</SubmitButton>
      </div>
    </form>
  );
}
