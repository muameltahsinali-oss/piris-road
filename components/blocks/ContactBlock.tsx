import Image from 'next/image';
import { Container } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { ContactForm } from './ContactForm';
import { SplitText } from '@/components/motion/SplitText';
import { Reveal } from '@/components/motion/Reveal';
import { contactBlock as c } from '@/content/company';
import { siteConfig } from '@/content/site';
import { translateAs, type Translate } from '@/lib/i18n';

/**
 * "Need more assistance?" block (`tx_cta` style_2 / `.as-cta-2-wrap` on
 * staging), used on About, Contact and every service page. Measurements from
 * staging's computed styles:
 *  - two columns 15px apart from 992px, stacked below;
 *  - start column: a #c4c4c4 frame (10px padding, 20px radius) holding the
 *    booking card (40px/45px padding; 25px sides below 992px) and the
 *    "Hi 👋 Contact Sales Team" card (24px/20px, centred);
 *  - end column: the black form card, 90px/45px padding (50px/20px below 992px).
 */
export function ContactBlock({ t, tone = 'light' }: { t: Translate; tone?: 'light' | 'paper' }) {
  return (
    <section className={`${tone === 'paper' ? 'bg-paper' : 'bg-white'} pt-[90px]`}>
      <Container>
        <div className="grid items-start gap-[15px] min-[992px]:grid-cols-2">
          <div className="grid gap-2.5 rounded-[20px] bg-[#c4c4c4] p-2.5 min-[992px]:grid-cols-[2fr_1fr]">
            <div className="rounded-[16px] bg-white px-[25px] py-10 min-[992px]:px-[45px]">
              <h2 className="mb-2 text-[26px] font-medium leading-[1.11] tracking-[-0.05em] text-heading">
                <SplitText>{t(c.eyebrow)}</SplitText>
              </h2>
              <Reveal as="p" animation="fadeInUp2" delay={0.2} className="mb-5 text-[20px] font-medium leading-[1.625] tracking-snug text-[#8d8d8d]">
                {t(c.bookCall)}
              </Reveal>
              <Reveal animation="fadeInUp2" delay={0.3}>
                <Button href="/quote" variant="dark">
                  {translateAs(t, c.button, c.buttonKey)}
                </Button>
                <p className="mt-4 text-base font-medium leading-[1.625] tracking-snug text-body">
                  {t(c.emailPrefix)}{' '}
                  <a href={`mailto:${siteConfig.contact.emails.operations}`} className="font-semibold text-black transition-colors duration-[400ms] ease-cube hover:text-brand" dir="ltr">
                    {siteConfig.contact.emails.operations}
                  </a>
                </p>
              </Reveal>
            </div>
            <div className="flex flex-col items-center justify-center rounded-[20px] bg-white px-5 py-6 text-center">
              <span className="mb-3 grid h-[100px] w-[100px] place-items-center rounded-full border-[5px] border-[#dddddd] bg-white">
                <Image src={siteConfig.logos.mark} alt="" width={64} height={64} className="h-14 w-14" />
              </span>
              <p className="text-2xl font-medium leading-[1.11] tracking-[-0.05em] text-heading">
                {t(c.hi)} <span aria-hidden>👋</span> {t(c.salesTeam)}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] bg-black px-5 py-[50px] text-white min-[992px]:px-[45px] min-[992px]:py-[90px]">
            <p className="mb-3 flex items-center gap-2.5 text-base leading-[1.625] tracking-snug text-white">
              {/* subtitle dot flashes (animate.css flash, 3s) */}
              <span className="flash-dot h-[11px] w-[11px] shrink-0 rounded-full bg-brand" aria-hidden />
              {t(c.responseTime)}
            </p>
            <h2 className="mb-9 text-2xl font-medium leading-[1.11] tracking-[-0.05em] text-white min-[992px]:text-[30px]">
              <SplitText>{t(c.title)}</SplitText>
            </h2>
            <ContactForm
              s={{
                fullName: t(c.fullName),
                email: t(c.email),
                message: t(c.message),
                newsletter: t(c.newsletter),
                team: t(c.team),
                submit: t(c.submit),
                success: t('Thank you for your message. It has been sent.'),
                error: t('There was an error trying to send your message. Please try again later.'),
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
