import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslate } from '@/lib/i18n';
import { posts } from '@/content/posts';
import { insightsSection } from '@/content/company';
import { Container } from '@/components/ui/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { BlogListCard, BlogSidebar, localized } from '@/components/blocks/PostGrid';

export const metadata: Metadata = {
  title: 'Blog',
  description: insightsSection.description,
  alternates: { canonical: '/blog' },
};

/**
 * Blog index, as on staging: the theme's standard two-column blog layout —
 * post cards on the start side, sidebar (Search, Recent Posts, Category,
 * Popular Tags) on the other. `?q=` filters by title/excerpt.
 */
export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = '' } = await searchParams;
  setRequestLocale(locale);
  const t = getTranslate(locale);

  const query = String(q).slice(0, 100);
  const needle = query.trim().toLowerCase();
  const list = needle
    ? posts.filter((p) => {
        const l = localized(p, locale);
        return [l.title, l.excerpt, p.title, p.excerpt].some((s) => s.toLowerCase().includes(needle));
      })
    : posts;

  return (
    <>
      <PageHeader t={t} title={t('Blog')} crumbs={[{ label: t('Blog') }]} />
      <section className="bg-white py-16 sm:py-20 lg:py-[80px]">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-[60px]">
              {needle ? (
                <p className="text-[18px] text-muted">
                  {t('Search')}: <strong className="text-heading">{query}</strong> ({list.length})
                </p>
              ) : null}
              {list.map((p) => (
                <BlogListCard key={p.slug} t={t} locale={locale} post={p} />
              ))}
            </div>
            <BlogSidebar t={t} locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
