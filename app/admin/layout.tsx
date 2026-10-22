import type { Metadata } from 'next';
import { siteConfig } from '@/content/site';
import '../globals.css';

/**
 * Root layout for the admin dashboard. It sits beside app/[locale] (there is
 * no app/layout.tsx), so it renders its own <html>: Arabic, RTL, and none of
 * the public site's header, footer or motion system.
 */
export const metadata: Metadata = {
  title: { default: `لوحة التحكم - ${siteConfig.name}`, template: `%s - لوحة التحكم` },
  robots: { index: false, follow: false },
  icons: { icon: siteConfig.logos.icon },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900" style={{ fontFamily: "'Segoe UI', Tahoma, 'Noto Sans Arabic', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
