import { HeaderShell, type NavItem } from './HeaderShell';
import { getTranslate } from '@/lib/i18n';
import { services } from '@/content/services';

/**
 * Server wrapper: resolves the navigation and all header strings through the
 * recovered Arabic dictionary, then hands plain strings to the client shell.
 *
 * Nav structure comes from the site's active menu ("My Menu", wp term 63) —
 * see RECOVERY_REPORT.md §2.
 */
export function Header({ locale }: { locale: string }) {
  const t = getTranslate(locale);

  const nav: NavItem[] = [
    { label: t('Home'), href: '/' },
    { label: t('About'), href: '/about' },
    {
      label: t('Our Services'),
      href: '/services',
      children: services.map((s) => ({
        label: t(s.navLabel),
        href: `/services/${s.slug}`,
      })),
    },
    { label: t('Blog'), href: '/blog' },
    { label: t('Contact Us'), href: '/contact' },
  ];

  return (
    <HeaderShell
      nav={nav}
      strings={{
        quoteCta: t('Get a Quote'),
        socialHeading: t("We're on social media:"),
        galleryHeading: t('Stay Inspired with Instagram'),
        openMenu: t('Menu'),
        closeMenu: t('Close'),
        skipToContent: t('Skip to content'),
      }}
    />
  );
}
