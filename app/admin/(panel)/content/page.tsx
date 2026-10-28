import Image from 'next/image';
import Link from 'next/link';
import { services } from '@/content/services';
import { posts } from '@/content/posts';
import { formatDate } from '@/lib/utils';
import { getTextEntries, getTextGroups } from '@/lib/admin/text-catalog';
import { localized } from '@/components/blocks/PostGrid';
import { Card, PageTitle } from '@/components/admin/ui';
import { Icon } from '@/components/admin/icons';

export const metadata = { title: 'الخدمات والمقالات' };

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
const linkCls = 'rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50';
const editCls = 'inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700';

export default function ContentPage() {
  const groups = new Map(getTextGroups(getTextEntries()).map((g) => [g.key, g]));
  const status = (key: string) => {
    const g = groups.get(key);
    if (!g) return '—';
    return g.missing ? `${g.missing} نص بدون ترجمة` : 'مترجم بالكامل';
  };
  const translatedPosts = posts.filter((p) => !groups.get(`post:${p.slug}`)?.missing).length;

  return (
    <>
      <PageTitle title="الخدمات والمقالات" subtitle="الخدمات والمقالات المنشورة على الموقع. اضغط «تعديل» لتغيير نصوصها وترجمتها." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['الخدمات', services.length],
          ['المقالات', posts.length],
          ['مقالات مترجمة بالكامل', `${translatedPosts} / ${posts.length}`],
          ['اللغات', 'العربية · English'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
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
                  <p className="truncate text-sm font-medium text-slate-900">{s.cardTitle}</p>
                  <p className="truncate text-xs text-slate-500">{status(`service:${s.slug}`)}</p>
                </div>
                <Link href={`/admin/texts?group=${encodeURIComponent(`service:${s.slug}`)}`} className={editCls}>
                  <Icon name="note" className="h-3.5 w-3.5" /> تعديل
                </Link>
                <a href={`/services/${s.slug}`} className={linkCls} {...ext}>EN</a>
                <a href={`/ar/services/${s.slug}`} className={linkCls} {...ext}>عربي</a>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`المقالات (${posts.length})`}>
          <ul className="-my-2 divide-y divide-slate-100">
            {[...posts]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((p) => (
                <li key={p.slug} className="flex items-center gap-3 py-3">
                  <Image src={p.image} alt="" width={56} height={40} className="h-10 w-14 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{localized(p, 'ar').title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {formatDate(p.date, 'ar')} · {status(`post:${p.slug}`)}
                    </p>
                  </div>
                  <Link href={`/admin/texts?group=${encodeURIComponent(`post:${p.slug}`)}`} className={editCls}>
                    <Icon name="note" className="h-3.5 w-3.5" /> تعديل
                  </Link>
                  <a href={`/blog/${p.slug}`} className={linkCls} {...ext}>EN</a>
                  <a href={`/ar/blog/${p.slug}`} className={linkCls} {...ext}>عربي</a>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
