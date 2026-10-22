import { siteConfig } from '@/content/site';
import { COLLECTIONS, dataDir, list } from '@/lib/admin/store';
import { formatNumber } from '@/lib/admin/format';
import { Card, PageTitle } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

export const metadata = { title: 'الإعدادات' };

const NAMES = { quotes: 'طلبات الأسعار', messages: 'الرسائل', subscribers: 'المشتركون' } as const;

function Check({ ok, warn, label, detail }: { ok: boolean; warn?: boolean; label: string; detail: React.ReactNode }) {
  const tone = ok ? 'bg-emerald-50 text-emerald-800' : warn ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800';
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{detail}</p>
      </div>
      <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', tone)}>{ok ? '✓ جاهز' : warn ? '! تنبيه' : '✕ غير مضبوط'}</span>
    </li>
  );
}

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700" dir="ltr">
    {children}
  </code>
);

export default async function SettingsPage() {
  const env = process.env;
  const counts = await Promise.all(COLLECTIONS.map(async (c) => [c, (await list(c)).length] as const));
  const prod = env.NODE_ENV === 'production';

  return (
    <>
      <PageTitle title="الإعدادات وحالة النظام" subtitle="تُضبط هذه القيم عبر متغيرات البيئة على الخادم (Railway → Variables)." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="فحص الإعدادات">
          <ul className="-my-3 divide-y divide-slate-100">
            <Check ok={Boolean(env.RESEND_API_KEY)} warn label="إرسال البريد (Resend)" detail={<>بدون <Code>RESEND_API_KEY</Code> تُحفظ الطلبات هنا فقط ولا يُرسل إشعار بريدي.</>} />
            <Check
              ok={Boolean(env.DATA_DIR)}
              warn={!prod}
              label="تخزين دائم للبيانات"
              detail={
                <>
                  المسار الحالي: <Code>{dataDir()}</Code>. على Railway يجب ربط Volume وضبط <Code>DATA_DIR</Code> عليه (مثلاً <Code>/data</Code>) وإلا تُمسح البيانات مع كل نشر.
                </>
              }
            />
            <Check ok={Boolean(env.ADMIN_SECRET)} warn label="مفتاح جلسات مستقل" detail={<>اختياري: <Code>ADMIN_SECRET</Code> لتوقيع جلسات الدخول. تغييره يسجّل خروج الجميع.</>} />
            <Check ok={Boolean(env.ADMIN_PASSWORD)} label="كلمة مرور لوحة التحكم" detail={<><Code>ADMIN_PASSWORD</Code> — استخدم كلمة مرور طويلة وفريدة.</>} />
          </ul>
        </Card>

        <Card title="مستلمو الإشعارات">
          <dl className="space-y-3 text-sm">
            {[
              ['طلبات الأسعار', env.QUOTE_RECIPIENT ?? siteConfig.contact.emails.general, 'QUOTE_RECIPIENT'],
              ['رسائل التواصل', env.CONTACT_RECIPIENT ?? siteConfig.contact.emails.general, 'CONTACT_RECIPIENT'],
              ['النشرة البريدية', env.NEWSLETTER_RECIPIENT ?? siteConfig.contact.emails.general, 'NEWSLETTER_RECIPIENT'],
              ['المرسِل', env.QUOTE_FROM ?? `noreply@${new URL(siteConfig.url).hostname}`, 'QUOTE_FROM'],
            ].map(([label, value, key]) => (
              <div key={key} className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-slate-500">
                  {label} <Code>{key}</Code>
                </dt>
                <dd className="font-medium text-slate-900" dir="ltr">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="البيانات المخزنة">
          <dl className="grid grid-cols-3 gap-4 text-center">
            {counts.map(([c, n]) => (
              <div key={c}>
                <dt className="text-xs text-slate-500">{NAMES[c]}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{formatNumber(n)}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="معلومات الموقع">
          <dl className="space-y-2 text-sm">
            {[
              ['النطاق', siteConfig.url],
              ['العنوان', siteConfig.contact.address],
              ['الهاتف', siteConfig.contact.phones.join(' · ')],
              ['البريد', `${siteConfig.contact.emails.general} · ${siteConfig.contact.emails.operations}`],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-900" dir="ltr">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  );
}
