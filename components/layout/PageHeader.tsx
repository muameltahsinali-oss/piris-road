import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/Section';
import type { Translate } from '@/lib/i18n';

/**
 * Inner-page banner as on staging: the theme's breadcrumb background
 * (uploads/2026/01/Untitled-design-224 — deep blue with the ribbon shape) at
 * full strength, start-aligned white title, breadcrumb with the current page in
 * yellow. Sits under the floating header.
 */
export function PageHeader({
  t,
  title,
  crumbs = [],
}: {
  t: Translate;
  title: string;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-page-header">
      <Image src="/misc/breadcrumb-bg.webp" alt="" fill priority sizes="100vw" aria-hidden className="-z-10 object-cover object-right rtl:-scale-x-100" />
      {/* .as-breadcrumb-area on staging: 220px / 165px padding at every width;
          title 60px (35px phones, 45px tablets), weight 700, -0.02em; crumbs 18px, 28px below. */}
      <Container className="pb-[165px] pt-[220px]">
        <h1 className="max-w-[860px] text-[35px] font-bold leading-[1.066] tracking-[-0.02em] text-white md:text-[45px] min-[992px]:text-[60px]">{title}</h1>
        <nav aria-label="Breadcrumb" className="mt-7">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[18px] font-medium text-white">
            <li>
              <Link href="/" className="hover:text-accent">
                {t('Home')}
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                {c.href ? (
                  <Link href={c.href} className="hover:text-accent">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-accent" aria-current="page">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </Container>
    </section>
  );
}
