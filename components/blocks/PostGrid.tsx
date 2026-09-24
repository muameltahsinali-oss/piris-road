import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Container, Eyebrow } from '@/components/ui/Section';
import { SplitText } from '@/components/motion/SplitText';
import { Reveal } from '@/components/motion/Reveal';
import { MagneticArea } from '@/components/motion/Interactions';
import { Button } from '@/components/ui/Button';
import { posts as allPosts, getPost, blogCategories, popularTags, type Post } from '@/content/posts';
import { insightsSection } from '@/content/company';
import { siteConfig } from '@/content/site';
import { formatDate, truncate } from '@/lib/utils';
import type { Translate } from '@/lib/i18n';

/**
 * Whether the post has a real featured image. On staging, a post whose only
 * picture sits inside its body (the May 2026 introduction post) has no
 * featured image: list, sidebar and detail views show no thumbnail for it.
 * `post.image` is still used for social-share metadata.
 */
export const hasFeaturedImage = (post: Post) => !/<img\b/i.test(post.body);

/** Title/excerpt/body in the current locale, falling back to English. */
export function localized(post: Post, locale: string) {
  const ar = locale === 'ar';
  return {
    title: (ar && post.titleAr) || post.title,
    excerpt: (ar && post.excerptAr) || post.excerpt,
    body: (ar && post.bodyAr) || post.body,
  };
}

/**
 * `as-blog-1` on Home: heading + "More Blog", a black feature card
 * ("Best Logistics Company" over stacked containers) beside two horizontal
 * post cards. Staging selected the freight-mode and ASYCUDA posts.
 */
export function HomeInsights({ t, locale }: { t: Translate; locale: string }) {
  const featured = insightsSection.homeSlugs.map(getPost).filter(Boolean) as Post[];

  return (
    <section className="bg-[#f3f3f3] py-16 sm:py-20 lg:py-[100px]">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <Eyebrow>{t(insightsSection.eyebrow)}</Eyebrow>
            <h2 className="mt-3 max-w-[560px] text-display font-medium text-heading">
              <SplitText>{t(insightsSection.title)}</SplitText>
            </h2>
            <Reveal as="p" animation="fadeInRight2" delay={0.2} className="mt-4 text-base font-medium leading-[1.625] tracking-snug text-body">
              {t(insightsSection.description)}
            </Reveal>
          </div>
          <Reveal animation="fadeInLeft2" delay={0.3}>
            <Button href="/blog" variant="dark">
              {t(insightsSection.button)}
            </Button>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <MagneticArea className="relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-[20px] bg-black p-8 lg:min-h-full">
            <Reveal animation="fadeInUp2" className="absolute -inset-4">
              <span data-magnetic className="absolute inset-0 block">
                <Image src={insightsSection.featureImage} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover opacity-70" />
              </span>
            </Reveal>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
            <Image src={siteConfig.logos.white} alt={siteConfig.name} width={320} height={117} className="relative h-10 w-auto self-start" />
            <h3 className="relative text-[clamp(2rem,3.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.05em] text-white">
              {insightsSection.featureTitle.map((l) => (
                <SplitText key={l} className="block">
                  {t(l)}
                </SplitText>
              ))}
            </h3>
          </MagneticArea>

          <ul className="flex flex-col gap-5">
            {featured.map((p) => (
              <li key={p.slug}>
                <HorizontalPostCard t={t} locale={locale} post={p} />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function HorizontalPostCard({ t, locale, post }: { t: Translate; locale: string; post: Post }) {
  const l = localized(post, locale);
  return (
    <MagneticArea as="article" className="group grid gap-5 rounded-[20px] bg-white p-2 sm:grid-cols-[42%_1fr] sm:pe-5">
      <Reveal animation="fadeInRight2" className="relative aspect-[16/11] overflow-hidden rounded-[14px] bg-paper sm:aspect-auto sm:min-h-[230px]">
        <Link href={`/blog/${post.slug}`} className="absolute inset-0 block" aria-label={l.title}>
          <span data-magnetic className="absolute -inset-4 block">
            <Image src={post.image} alt={l.title} fill sizes="(min-width: 640px) 25vw, 100vw" className="object-cover" />
          </span>
        </Link>
      </Reveal>
      <div className="flex flex-col py-3 ps-3 sm:ps-0">
        {post.category ? (
          <span className="self-start rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white">{t(post.category)}</span>
        ) : null}
        <h3 className="mt-3 line-clamp-2 text-xl font-medium leading-[1.2] tracking-[-0.05em] text-heading">
          <Link href={`/blog/${post.slug}`} className="transition-colors duration-[400ms] ease-cube hover:text-brand">
            {l.title}
          </Link>
        </h3>
        {/* dir="auto": an untranslated (English) excerpt on an Arabic page keeps LTR punctuation order. */}
        <p dir="auto" className="mt-3 line-clamp-3 text-sm font-medium leading-6 tracking-snug text-body">{l.excerpt}</p>
        <div className="mt-auto pt-4">
          <Button href={`/blog/${post.slug}`} variant="dark" size="sm">
            {t('Read More')}
          </Button>
        </div>
      </div>
    </MagneticArea>
  );
}

/**
 * Blog index/listing card (`.tz-blog-item.list-view-item` on staging): #f6f6f6
 * panel, 20px padding, 15px radius; 3:2 image; 18px meta row; 24px/700 title;
 * 18px excerpt; bold brand "Read More »".
 */
export function BlogListCard({ t, locale, post }: { t: Translate; locale: string; post: Post }) {
  const l = localized(post, locale);
  return (
    <article className="group rounded-[15px] bg-[#f6f6f6] p-5">
      {hasFeaturedImage(post) ? (
        <Link href={`/blog/${post.slug}`} className="relative mb-5 block aspect-[3/2] overflow-hidden rounded-[15px] bg-white">
          <Image src={post.image} alt={l.title} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
        </Link>
      ) : null}
      <div className="p-2.5">
        <PostMeta t={t} locale={locale} post={post} />
        <h2 className="mb-2 mt-4 pb-4 text-2xl font-bold leading-[1.2] text-black">
          <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-brand-main">
            {l.title}
          </Link>
        </h2>
        <p dir="auto" className="mb-4 pb-5 text-[18px] leading-7 text-black">{truncate(l.excerpt, 180)}</p>
        <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-[18px] font-bold leading-7 text-brand-main transition-[gap] hover:gap-2.5">
          {t('Read More')} <span aria-hidden className="text-sm rtl:-scale-x-100">»</span>
        </Link>
      </div>
    </article>
  );
}

export function PostMeta({ t, locale, post }: { t: Translate; locale: string; post: Post }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 text-[18px] leading-7 text-black">
      <li className="flex items-center gap-1.5">
        <Icon d="M7 3v2M17 3v2M4 8h16M5 5h14v15H5z" />
        <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
      </li>
      <li className="flex items-center gap-1.5">
        <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />
        {siteConfig.name}
      </li>
      <li className="flex items-center gap-1.5">
        <Icon d="M4 5h16v11H8l-4 4z" />
        {t('Comments(0)')}
      </li>
    </ul>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-main" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/**
 * Blog sidebar (`.tx-sidebarWrapper` on staging): a #f2f3f4 frame holding white
 * widgets — Search (55px field + square button), Recent Posts (image above
 * date and title), Category (bordered rows with counts), Popular Tags (pills).
 */
export function BlogSidebar({ t, locale, exclude }: { t: Translate; locale: string; exclude?: string }) {
  const recent = allPosts.filter((p) => p.slug !== exclude).slice(0, 3);
  return (
    <aside className="space-y-[30px] self-start rounded-[15px] bg-[#f2f3f4] p-5 text-[18px] leading-7 text-black">
      <Widget title={t('Search')}>
        <form action={locale === 'ar' ? '/ar/blog' : '/blog'} className="relative">
          <input
            name="q"
            maxLength={100}
            placeholder={t('Search...')}
            className="h-[55px] w-full rounded-[10px] border border-[#eaebee] bg-white pe-[60px] ps-5 text-[18px] focus:border-brand-main focus:outline-none"
          />
          <button type="submit" aria-label={t('Search')} className="absolute end-0 top-0 grid h-[55px] w-[55px] place-items-center rounded-[10px] bg-brand-main text-white">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        </form>
      </Widget>

      <Widget title={t('Recent Posts')}>
        <ul className="space-y-[30px]">
          {recent.map((p) => {
            const l = localized(p, locale);
            return (
              <li key={p.slug}>
                {hasFeaturedImage(p) ? (
                  <Link href={`/blog/${p.slug}`} className="relative mb-4 block h-[130px] overflow-hidden rounded-[10px] bg-white">
                    <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 306px, 100vw" className="object-cover" />
                  </Link>
                ) : null}
                <p className="mb-2.5 flex items-center gap-1.5">
                  <Icon d="M7 3v2M17 3v2M4 8h16M5 5h14v15H5z" />
                  <time dateTime={p.date}>{formatDate(p.date, locale)}</time>
                </p>
                <h3 className="text-[18px] font-bold leading-[1.2]">
                  <Link href={`/blog/${p.slug}`} className="transition-colors hover:text-brand-main">
                    {l.title}
                  </Link>
                </h3>
              </li>
            );
          })}
        </ul>
      </Widget>

      <Widget title={t('Category')}>
        <ul>
          {blogCategories.map((c) => (
            <li key={c.name} className="mb-2.5 flex items-center justify-between gap-4 border-b border-[#dee1e9] py-[15px] font-medium last:mb-0 last:border-b-0 last:pb-0">
              <span>{t(c.name)}</span>
              <span>({c.count})</span>
            </li>
          ))}
        </ul>
      </Widget>

      <Widget title={t('Popular Tags')}>
        <ul className="flex flex-wrap gap-3">
          {popularTags.map((tag) => (
            <li key={tag} className="rounded-[40px] border border-[#eaebee] bg-white px-5 py-[7px] text-[15px] leading-5">
              {t(tag)}
            </li>
          ))}
        </ul>
      </Widget>
    </aside>
  );
}

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[15px] bg-white px-[35px] py-[30px]">
      <h2 className="mb-2 pb-6 text-[20px] font-bold leading-6 text-black">{title}</h2>
      {children}
    </section>
  );
}
