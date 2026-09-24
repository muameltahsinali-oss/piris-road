import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@/content/site';
import { services } from '@/content/services';
import { posts } from '@/content/posts';

/** Static routes mirroring the recovered sitemap (RECONSTRUCTION_PLAN.md §1). */
const staticPaths = ['', '/about', '/services', '/blog', '/contact', '/quote'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const url = (locale: string, path: string) =>
    `${siteConfig.url}${locale === routing.defaultLocale ? '' : `/${locale}`}${path || '/'}`;

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: url(locale, path),
        changeFrequency: path === '/blog' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.8,
      });
    }
    for (const s of services) {
      entries.push({ url: url(locale, `/services/${s.slug}`), changeFrequency: 'monthly', priority: 0.7 });
    }
    for (const p of posts) {
      entries.push({
        url: url(locale, `/blog/${p.slug}`),
        lastModified: p.modified,
        changeFrequency: 'yearly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
