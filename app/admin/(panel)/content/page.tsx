import Image from 'next/image';
import { services } from '@/content/services';
import { posts } from '@/content/posts';
import { formatDate } from '@/lib/utils';
import { Card, PageTitle } from '@/components/admin/ui';

export const metadata = { title: 'المحتوى' };

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
const linkCls = 'rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50';

export default function ContentPage() {
  const translated = posts.filter((p) => p.bodyAr).length;

  return (
    <>
      <PageTitle title="محتوى الموقع" subtitle="الخدمات والمقالات المنشورة حالياً، مع روابط للنسختين الإنجليزية والعربية." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['الخدمات', services.length],
          ['المقالات', posts.length],
          ['مقالات مترجمة للعربية', `${translated} / ${posts.length}`],
          ['اللغات', 2],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title={`الخدمات (${services.length})`}>
          <ul className="-my-2 divide-y divide-slate-100">
            {services.map((s) => (
              <li key={s.slug} className="flex items-center gap-3 py-3">
                <Image src={s.cardImage ?? s.image} alt="" width={56} height={40} className="h-10 w-14 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900" dir="ltr">
                    <span className="block text-end">{s.cardTitle}</span>
                  </p>
                  <p className="truncate text-xs text-slate-500">{s.tags.length} كلمات مفتاحية · {s.featureCards.length} بطاقات مزايا</p>
                </div>
                <a href={`/services/${s.slug}`} className={linkCls} {...ext}>EN</a>
                <a href={`/ar/services/${s.slug}`} className={linkCls} {...ext}>عربي</a>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`المقالات (${posts.length})`}>
          <ul className="-my-2 divide-y divide-slate-100">
            {[...posts].sort((a, b) => b.date.localeCompare(a.date)).map((p) => (
              <li key={p.slug} className="flex items-center gap-3 py-3">
                <Image src={p.image} alt="" width={56} height={40} className="h-10 w-14 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{p.titleAr || p.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {formatDate(p.date, 'ar')} · {p.bodyAr ? 'مترجم' : 'إنجليزي فقط'}
                  </p>
                </div>
                <a href={`/blog/${p.slug}`} className={linkCls} {...ext}>EN</a>
                <a href={`/ar/blog/${p.slug}`} className={linkCls} {...ext}>عربي</a>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
        المحتوى مُولَّد بشكل ثابت من ملفات المشروع (<code dir="ltr">content/services.ts</code>، <code dir="ltr">content/posts.ts</code>،{' '}
        <code dir="ltr">content/ar-dictionary.json</code>) لضمان سرعة الموقع وأمانه. تعديل النصوص يتم في هذه الملفات ثم إعادة النشر.
      </p>
    </>
  );
}
