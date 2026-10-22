import Image from 'next/image';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
import { list } from '@/lib/admin/store';
import { siteConfig } from '@/content/site';
import { NavLink } from '@/components/admin/client';
import { logout } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [quotes, messages] = await Promise.all([list('quotes'), list('messages')]);
  const newQuotes = quotes.filter((q) => q.status === 'new').length;
  const newMessages = messages.filter((m) => m.status === 'new').length;

  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-slate-900 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-5 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2.5 text-white">
            <Image src={siteConfig.logos.icon} alt="" width={28} height={28} />
            <span className="font-semibold">{siteConfig.name}</span>
          </Link>
          <form action={logout} className="lg:hidden">
            <button type="submit" className="text-sm text-slate-300 hover:text-white">
              خروج
            </button>
          </form>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="لوحة التحكم">
          <NavLink href="/admin">نظرة عامة</NavLink>
          <NavLink href="/admin/quotes" badge={newQuotes}>
            طلبات الأسعار
          </NavLink>
          <NavLink href="/admin/messages" badge={newMessages}>
            الرسائل
          </NavLink>
          <NavLink href="/admin/subscribers">المشتركون</NavLink>
          <NavLink href="/admin/content">المحتوى</NavLink>
          <NavLink href="/admin/settings">الإعدادات</NavLink>
        </nav>
        <div className="hidden space-y-1 border-t border-white/10 p-3 lg:block">
          <a href="/" target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            عرض الموقع ↗
          </a>
          <form action={logout}>
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-start text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
