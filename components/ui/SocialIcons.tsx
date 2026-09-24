import { cn } from '@/lib/utils';
import { siteConfig } from '@/content/site';

/**
 * Social icons. The original header used Font Awesome brand glyphs
 * (fab fa-facebook-f / fa-instagram / fa-linkedin); these are inline SVG
 * equivalents so we don't ship an icon font.
 */
const paths: Record<string, string> = {
  facebook:
    'M14 9h2.5V6H14c-2.2 0-3.5 1.3-3.5 3.6V11H8.5v3h2V22h3.2v-8h2.3l.5-3h-2.8V9.8c0-.6.2-.8.8-.8z',
  instagram:
    'M12 7.6A4.4 4.4 0 1 0 16.4 12A4.4 4.4 0 0 0 12 7.6m0 7.2A2.8 2.8 0 1 1 14.8 12A2.8 2.8 0 0 1 12 14.8M17.6 7.4a1 1 0 1 1-1-1a1 1 0 0 1 1 1M20.9 8.4a5.1 5.1 0 0 0-1.4-3.6a5.1 5.1 0 0 0-3.6-1.4C14.5 3.3 9.5 3.3 8.1 3.4A5.1 5.1 0 0 0 4.5 4.8A5.1 5.1 0 0 0 3.1 8.4C3 9.8 3 14.2 3.1 15.6a5.1 5.1 0 0 0 1.4 3.6a5.1 5.1 0 0 0 3.6 1.4c1.4.1 6.4.1 7.8 0a5.1 5.1 0 0 0 3.6-1.4a5.1 5.1 0 0 0 1.4-3.6c.1-1.4.1-5.8 0-7.2m-2.2 8.7a2.9 2.9 0 0 1-1.6 1.6c-1.1.5-7.7.5-8.8 0a2.9 2.9 0 0 1-1.6-1.6c-.5-1.1-.5-7.1 0-8.2A2.9 2.9 0 0 1 8.3 6.9c1.1-.5 7.7-.5 8.8 0a2.9 2.9 0 0 1 1.6 1.6c.5 1.1.5 7.5 0 8.6',
  linkedin:
    'M6.9 20H3.6V9.2h3.3zM5.2 7.7a1.9 1.9 0 1 1 1.9-1.9a1.9 1.9 0 0 1-1.9 1.9M20.4 20h-3.3v-5.6c0-1.4-.5-2.3-1.7-2.3a1.8 1.8 0 0 0-1.7 1.2a2.4 2.4 0 0 0-.1.8V20H10V9.2h3.3v1.5a3.6 3.6 0 0 1 3.2-1.7c2.3 0 3.9 1.5 3.9 4.7z',
  x: 'M17.5 3h3.2l-7 8 7.8 10h-5.6l-4.4-5.7L6.4 21H3.2l7.3-8.3L3 3h5.7l4.1 5.4zm-1.1 16h1.7L7.5 4.8H5.7z',
};

export function SocialIcons({
  className,
  itemClassName,
  tone = 'light',
}: {
  className?: string;
  itemClassName?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <ul className={cn('flex items-center gap-2.5', className)}>
      {siteConfig.social.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className={cn(
              'grid h-9 w-9 place-items-center rounded-full transition hover:-translate-y-0.5',
              tone === 'light'
                ? 'bg-brand-soft/60 text-brand-dark hover:bg-brand-main hover:text-white'
                : 'bg-white/10 text-white hover:bg-white hover:text-brand-main',
              itemClassName,
            )}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d={paths[s.icon]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
