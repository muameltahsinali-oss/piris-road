import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/admin/auth';
import { list } from '@/lib/admin/store';
import { decodeFlash, FLASH_COOKIE } from '@/lib/admin/flash';
import { followUpState } from '@/lib/admin/format';
import { siteConfig } from '@/content/site';
import { NavLink, Toast } from '@/components/admin/client';
import { Icon } from '@/components/admin/icons';
import { logout } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [quotes, messages] = await Promise.all([list('quotes'), list('messages')]);
  const newQuotes = quotes.filter((q) => q.status === 'new').length;
  const newMessages = messages.filter((m) => m.status === 'new').length;
  const dueFollowUps = quotes.filter(
    (q) => q.status !== 'won' && q.status !== 'lost' && ['overdue', 'today'].includes(followUpState(q.deal?.followUpAt) ?? ''),
  ).length;
  const flash = decodeFlash((await cookies()).get(FLASH_COOKIE)?.value);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-slate-950 print:hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-5 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2.5 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">
              <Image src={siteConfig.logos.icon} alt="" width={22} height={22} />
            </span>
            <span className="leading-tight">
              <span className="block font-semibold">{siteConfig.name}</span>
              <span className="block text-[11px] text-slate-400">لوحة التحكم</span>
            </span>
          </Link>
          <form action={logout} className="lg:hidden">
            <button type="submit" className="text-sm text-slate-300 hover:text-white">
              خروج
            </button>
          </form>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="لوحة التحكم">
          <p className="hidden px-3 pb-1 pt-2 text-[11px] font-medium text-slate-500 lg:block">الرئيسية</p>
          <NavLink href="/admin" icon="home">
            نظرة عامة
          </NavLink>
          <NavLink href="/admin/reports" icon="chart">
            التقارير
          </NavLink>
          <p className="hidden px-3 pb-1 pt-4 text-[11px] font-medium text-slate-500 lg:block">العملاء</p>
          <NavLink href="/admin/quotes" icon="quote" badge={newQuotes}>
            طلبات الأسعار
          </NavLink>
          <NavLink href="/admin/follow-ups" icon="calendar" badge={dueFollowUps}>
            المتابعات
          </NavLink>
          <NavLink href="/admin/messages" icon="mail" badge={newMessages}>
            الرسائل
          </NavLink>
          <NavLink href="/admin/subscribers" icon="users">
            المشتركون
          </NavLink>
          <p className="hidden px-3 pb-1 pt-4 text-[11px] font-medium text-slate-500 lg:block">الموقع</p>
          <NavLink href="/admin/texts" icon="note">
            النصوص والترجمة
          </NavLink>
          <NavLink href="/admin/content" icon="doc">
            الخدمات والمقالات
          </NavLink>
        </nav>
        <div className="hidden border-t border-white/10 p-3 lg:block">
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
              <Icon name="logout" className="h-[18px] w-[18px]" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur print:hidden">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <form action="/admin/search" role="search" className="relative w-full max-w-md">
              <Icon name="search" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="q"
                placeholder="ابحث في الطلبات والرسائل والمشتركين…"
                aria-label="بحث شامل"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pe-3 ps-9 text-sm outline-none placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
              />
            </form>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="ms-auto hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 sm:inline-flex"
            >
              <Icon name="external" />
              عرض الموقع
            </a>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
      {flash && <Toast key={flash.id} id={flash.id} message={flash.message} />}
    </div>
  );
}
