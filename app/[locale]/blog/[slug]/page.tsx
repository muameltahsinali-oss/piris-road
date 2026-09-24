import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getTranslate } from '@/lib/i18n';
import { truncate } from '@/lib/utils';
import { posts, getPost } from '@/content/posts';
import { Container } from '@/components/ui/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { BlogSidebar, PostMeta, hasFeaturedImage, localized } from '@/components/blocks/PostGrid';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const l = localized(post, locale);
  return {
    title: l.title,
    description: truncate(l.excerpt, 160),
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.tags,
    openGraph: { type: 'article', title: l.title, publishedTime: post.date, modifiedTime: post.modified, images: [{ url: post.image }] },
  };
}

/**
 * Post detail, as on staging: featured image, meta row, body and the same
 * sidebar as the index. Arabic shows the translated body where staging had
 * one (the ASYCUDA article was never translated, so it stays English).
 */
export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = getTranslate(locale);

  const post = getPost(slug);
  if (!post) notFound();
  const l = localized(post, locale);
  const bodyIsArabic = locale === 'ar' && Boolean(post.bodyAr);

  const crumbs = [
    ...(post.category ? [{ label: t(post.category) }] : []),
    { label: l.title },
  ];

  return (
    <>
      <PageHeader t={t} title={l.title} crumbs={crumbs} />
      <section className="bg-white py-16 sm:py-20 lg:py-[80px]">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <article className="min-w-0">
              {/* Staging: featured image (3:2, 15px radius, 30px gap), then meta (20px gap), then body. */}
              {hasFeaturedImage(post) ? (
                <div className="relative mb-[30px] aspect-[3/2] overflow-hidden rounded-[15px] bg-paper">
                  <Image src={post.image} alt={l.title} fill priority sizes="(min-width: 1024px) 860px, 100vw" className="object-cover" />
                </div>
              ) : null}
              <PostMeta t={t} locale={locale} post={post} />
              {/* Bodies come from the site's own content (generated file), not user input. */}
              <div
                className="prose-piris mt-5"
                dir={locale === 'ar' && !bodyIsArabic ? 'ltr' : undefined}
                dangerouslySetInnerHTML={{ __html: l.body }}
              />
              {post.tags.length ? (
                <ul className="mt-10 flex flex-wrap gap-2 border-t border-black/10 pt-6">
                  {post.tags.map((tag) => (
                    <li key={tag} className="rounded-full border border-black/10 px-3 py-1 text-xs text-heading">
                      {t(tag)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
            <BlogSidebar t={t} locale={locale} exclude={post.slug} />
          </div>
        </Container>
      </section>
    </>
  );
}
