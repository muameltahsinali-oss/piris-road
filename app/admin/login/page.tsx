import Image from 'next/image';
import { redirect } from 'next/navigation';
import { adminConfigured, isAdmin } from '@/lib/admin/auth';
import { siteConfig } from '@/content/site';
import { buttonClass, inputClass } from '@/components/admin/ui';
import { login } from '../actions';

export const metadata = { title: 'تسجيل الدخول' };
export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  '1': 'كلمة المرور غير صحيحة.',
  rate: 'محاولات كثيرة. حاول مجدداً بعد 15 دقيقة.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect('/admin');
  const { error } = await searchParams;
  const configured = adminConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image src={siteConfig.logos.icon} alt="" width={48} height={48} />
          <h1 className="text-xl font-semibold text-slate-900">لوحة تحكم {siteConfig.name}</h1>
          <p className="text-sm text-slate-500">سجّل الدخول لإدارة الطلبات والرسائل والمشتركين.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!configured ? (
            <p className="text-sm leading-relaxed text-slate-700">
              لوحة التحكم مقفلة لأن متغير البيئة <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs" dir="ltr">ADMIN_PASSWORD</code> غير
              مضبوط على الخادم. أضفه ثم أعد تشغيل الموقع.
            </p>
          ) : (
            <form action={login} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">كلمة المرور</span>
                <input type="password" name="password" required autoFocus autoComplete="current-password" className={inputClass} dir="ltr" />
              </label>
              {error && ERRORS[error] && (
                <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {ERRORS[error]}
                </p>
              )}
              <button type="submit" className={`${buttonClass} w-full py-2.5`}>
                دخول
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
