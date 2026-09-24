import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslate } from '@/lib/i18n';
import { siteConfig } from '@/content/site';
import { Container } from '@/components/ui/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContactBlock } from '@/components/blocks/ContactBlock';

export const metadata: Metadata = {
  title: 'Contact us',
  description: `Contact Piris Road — ${siteConfig.contact.address}. ${siteConfig.contact.emails.general}`,
  alternates: { canonical: '/contact' },
};

/**
 * Contact — staging order: contact block (with form) · three info columns under
 * short blue rules · map (Plus Code of the Erbil office, as fixed on staging).
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getTranslate(locale);
  const { contact } = siteConfig;

  const columns = [
    { title: t('Find us Here'), body: <p>{t(contact.address)}</p> },
    {
      title: t('Get In touch'),
      body: (
        <ul>
          {contact.phones.map((p) => (
            <li key={p}>
              <a href={`tel:${p}`} dir="ltr" className="hover:text-brand">
                {p}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${contact.emails.general}`} className="hover:text-brand">
              {contact.emails.general}
            </a>
          </li>
        </ul>
      ),
    },
    {
      title: t('Training Hours'),
      body: (
        <>
          <p dir="ltr">{contact.hours.time}</p>
          <p>{t(contact.hours.note)}</p>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader t={t} title={t('Contact us')} crumbs={[{ label: t('Contact us') }]} />
      <ContactBlock t={t} />

      {/* Staging: 100×12px #2858e2 divider, 24px/800 capitalised headings (20px on phones), 18px #727272 text. */}
      <section className="bg-white py-[50px] min-[992px]:pb-[121px] min-[992px]:pt-[60px]">
        <Container>
          <div className="mx-auto grid max-w-[1210px] gap-[53px] text-center md:grid-cols-3 md:gap-0">
            {columns.map((c) => (
              <div key={c.title}>
                <span className="mx-auto my-[15px] block h-3 w-[100px] bg-[#2858e2]" aria-hidden />
                <h2 className="text-[20px] font-extrabold capitalize leading-5 tracking-[1px] text-black md:text-2xl md:leading-6">{c.title}</h2>
                <div className="text-base leading-6 text-[#727272] md:text-[18px] md:leading-[27px]">{c.body}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section aria-label={t('Find us Here')} className="my-[90px] bg-white">
        <Container>
          <div className="h-[511px] overflow-hidden rounded-[10px] bg-paper">
            <iframe
              title={t('Find us Here')}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&t=m&z=17&output=embed&iwloc=near`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
