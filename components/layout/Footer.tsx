import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { siteConfig, footerNav } from '@/content/site';
import { NewsletterForm } from '@/components/blocks/NewsletterForm';
import { Container } from '@/components/ui/Section';
import { Reveal } from '@/components/motion/Reveal';
import { getTranslate } from '@/lib/i18n';

/**
 * Footer 1 as rendered on staging: black, Newsletter + three link columns,
 * the large white logo, and a bottom bar with the copyright line and the
 * "Developed By Manarah Solutions" credit.
 */
export function Footer({ locale }: { locale: string }) {
  const t = getTranslate(locale);
  const labels: Record<string, string> = {
    aboutUs: t('About us'),
    services: t('Services'),
    contactUs: t('Contact Us'),
    home: t('Home'),
    contact: t('Contact'),
    blogs: t('Blogs'),
  };
  const heading = 'text-2xl font-medium tracking-[-0.05em] text-white';
  // .as-footer-1-menu a — on hover the link slides 16px and a short blue dash grows in front of it
  const link =
    'relative z-[1] inline-block text-[15px] font-medium tracking-snug text-[#f2f2f2] transition-all duration-500 ease-cube hover:translate-x-4 hover:text-brand rtl:hover:-translate-x-4 ' +
    "after:absolute after:-start-4 after:top-1/2 after:h-[2px] after:w-2 after:-translate-y-1/2 after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-500 after:content-[''] hover:after:scale-x-100";

  return (
    <footer className="overflow-hidden bg-black text-white">
      <Container className="pt-16 sm:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_0.8fr_1.3fr] lg:gap-10">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-medium tracking-[-0.05em] text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8a2.5 2.5 0 0 0 2.4 2zm7-6V11a7 7 0 0 0-5.5-6.8V3.5a1.5 1.5 0 0 0-3 0v.7A7 7 0 0 0 5 11v5l-2 2v1h18v-1z" />
              </svg>
              {t('Newsletter')}
            </h2>
            <p className="mt-3 text-sm text-white/80">{t('Keep up out latest update subscribe our newsletter!')}</p>
            <div className="mt-6 max-w-[360px]">
              <NewsletterForm
                placeholder={t('Email Address')}
                submitLabel={t('Subscribe')}
                successMessage={t('Thank you for your message. It has been sent.')}
                errorMessage={t('There was an error trying to send your message. Please try again later.')}
              />
            </div>
          </div>

          <div>
            <h2 className={heading}>{t('Quick Navigation')}</h2>
            <ul className="mt-6 space-y-3">
              {footerNav.quickNavigation.map((l) => (
                <li key={l.key}>
                  <Link href={l.href} className={link}>
                    {labels[l.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={heading}>{t('All Page')}</h2>
            <ul className="mt-6 space-y-3">
              {footerNav.allPages.map((l) => (
                <li key={l.key}>
                  <Link href={l.href} className={link}>
                    {labels[l.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={heading}>{t('Contact Us')}</h2>
            <ul className="mt-6 space-y-3">
              <li>
                <a href={`mailto:${siteConfig.contact.emails.general}`} className={link} dir="ltr">
                  {siteConfig.contact.emails.general}
                </a>
              </li>
              {/* Each number links to itself (the backup's footer linked the second label to the first number). */}
              {[...siteConfig.contact.phones].reverse().map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone}`} dir="ltr" className={link}>
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer logo bounces up into place (`wow bounceInUp`). */}
        <Reveal animation="bounceInUp" className="flex justify-center py-16 sm:py-20">
          <Image src={siteConfig.logos.white} alt={siteConfig.name} width={640} height={233} className="h-auto w-[220px] sm:w-[300px]" />
        </Reveal>

        <div className="flex flex-col gap-2 border-t border-white/15 py-7 text-sm text-white/85 sm:flex-row sm:items-center sm:justify-between">
          <p>{t(siteConfig.copyright.line)}</p>
          <p>{t(siteConfig.copyright.credit)}</p>
        </div>
      </Container>
    </footer>
  );
}
