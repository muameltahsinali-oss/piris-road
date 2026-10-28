import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { dirFor } from '@/lib/i18n';
import { siteConfig } from '@/content/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { MotionProvider } from '@/components/motion/MotionProvider';
import '../globals.css';

/**
 * Typography matches what the staging site actually renders: Inter for text and
 * Geist Mono for the `{●} Eyebrow` labels (both loaded by the Avista theme).
 *
 * The backup's Additional CSS forced "Aeonik" only on html[lang="en"], but the
 * site's lang attribute is "en-US", so that rule never matched — the live pages
 * were Inter all along. Aeonik-Regular.ttf is kept in recovery/ for reference.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-geist-mono',
});

/**
 * Pages are prerendered, then refreshed so text edited in the dashboard shows
 * up: saving a text revalidates every page at once, and this interval covers
 * a fresh deploy (the build can't see the data volume, so it renders the
 * defaults until the first refresh).
 */
export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Home - ${siteConfig.name}`,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    siteName: siteConfig.name,
    type: 'website',
    images: [{ url: '/hero/container.webp', width: 1600, height: 1200 }],
  },
  icons: { icon: siteConfig.logos.icon },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={dirFor(locale)} className={`${inter.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Flag JS before first paint so reveal targets can start hidden; without JS nothing is hidden. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js-motion')" }} />
        <noscript>
          <style>{'.preloader-root{display:none!important}'}</style>
        </noscript>
      </head>
      <body>
        <NextIntlClientProvider>
          <MotionProvider logo={siteConfig.logos.mark}>
            <Header locale={locale} />
            <main id="main">{children}</main>
            <Footer locale={locale} />
            {/* Floating switcher, as TranslatePress rendered it (bottom corner, #3558e6). */}
            <LanguageSwitcher floating />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
