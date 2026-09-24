import os

ROOT = r"C:\Users\omlsa\Desktop\piris_road"


def sub(path, old, new):
    fp = os.path.join(ROOT, path)
    s = open(fp, encoding="utf-8").read()
    assert old in s, (path, old[:80])
    s = s.replace(old, new, 1)
    open(fp, "w", encoding="utf-8").write(s)


# Footer: contain the bounceInUp travel
sub("components/layout/Footer.tsx", '<footer className="bg-black text-white">', '<footer className="overflow-hidden bg-black text-white">')

# ContactBlock (as-cta-2)
p = "components/blocks/ContactBlock.tsx"
sub(p, "import { ContactForm } from './ContactForm';", "import { ContactForm } from './ContactForm';\nimport { SplitText } from '@/components/motion/SplitText';\nimport { Reveal } from '@/components/motion/Reveal';")
sub(
    p,
    """              <p className="mt-1 text-base font-medium tracking-snug text-heading">{t(c.bookCall)}</p>
              <div className="mt-4">
                <Button href="/quote" variant="dark" size="sm">
                  {translateAs(t, c.button, c.buttonKey)}
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted">
                {t(c.emailPrefix)}{' '}
                <a href={`mailto:${siteConfig.contact.emails.operations}`} className="font-medium text-heading hover:text-brand" dir="ltr">
                  {siteConfig.contact.emails.operations}
                </a>
              </p>""",
    """              <Reveal as="p" animation="fadeInUp2" delay={0.2} className="mt-1 text-base font-medium tracking-snug text-heading">
                {t(c.bookCall)}
              </Reveal>
              <Reveal animation="fadeInUp2" delay={0.3}>
                <div className="mt-4">
                  <Button href="/quote" variant="dark" size="sm">
                    {translateAs(t, c.button, c.buttonKey)}
                  </Button>
                </div>
                <p className="mt-4 text-xs text-muted">
                  {t(c.emailPrefix)}{' '}
                  <a href={`mailto:${siteConfig.contact.emails.operations}`} className="font-semibold text-black transition-colors duration-[400ms] ease-cube hover:text-brand" dir="ltr">
                    {siteConfig.contact.emails.operations}
                  </a>
                </p>
              </Reveal>""",
)
sub(
    p,
    """              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />""",
    """              {/* subtitle dot flashes (animate.css flash, 3s) */}
              <span className="flash-dot h-[11px] w-[11px] rounded-full bg-brand" aria-hidden />""",
)
sub(
    p,
    """<h2 className="mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.05em] text-white">{t(c.title)}</h2>""",
    """<h2 className="mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.05em] text-white">
              <SplitText>{t(c.title)}</SplitText>
            </h2>""",
)

# CEO message, testimonials, proven block
p = "components/blocks/CeoMessage.tsx"
sub(p, "import { Container, SectionHeading } from '@/components/ui/Section';", "import { Container, Eyebrow } from '@/components/ui/Section';\nimport { SplitText } from '@/components/motion/SplitText';\nimport { Reveal } from '@/components/motion/Reveal';\nimport { ScrollScene } from '@/components/motion/ScrollScene';")
sub(
    p,
    """            {ceoMessage.cards.map((c) => (
              <li key={c.title} className="rounded-[24px] bg-white/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,.05)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold tracking-snug text-heading">{t(c.title)}</h3>
                  <Image src={c.icon} alt="" width={47} height={47} className="h-10 w-10 opacity-70" aria-hidden />
                </div>
                <p className="mt-5 text-sm leading-[1.7] text-body">{t(c.text)}</p>
              </li>
            ))}""",
    """            {ceoMessage.cards.map((c, i) => (
              <Reveal as="li" key={c.title} animation="fadeInRight2" delay={i * 0.2} className="group rounded-[24px] bg-white/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,.05)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  {/* .as-about-3-card: title nudges 3px on hover; icon rubber-bands */}
                  <h3 className="text-lg font-bold tracking-snug text-heading transition-all duration-300 hover:translate-x-[3px] hover:text-brand">{t(c.title)}</h3>
                  <Image src={c.icon} alt="" width={47} height={47} className="hover-rubber h-10 w-10 opacity-70" aria-hidden />
                </div>
                <p className="mt-5 text-sm leading-[1.7] text-body">{t(c.text)}</p>
              </Reveal>
            ))}""",
)
sub(
    p,
    """        <SectionHeading eyebrow={t(testimonials.eyebrow)} title={t(testimonials.title)} align="center" />""",
    """        <div className="text-center">
          <Eyebrow>{t(testimonials.eyebrow)}</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[760px] text-display font-medium text-heading">
            <SplitText>{t(testimonials.title)}</SplitText>
          </h2>
        </div>""",
)
sub(
    p,
    """  const offsets = ['lg:mt-[160px]', 'lg:mt-0', 'lg:mt-[160px]', 'lg:-mt-[40px] lg:col-start-2'];""",
    """  const offsets = ['lg:mt-[160px]', 'lg:mt-0', 'lg:mt-[160px]', 'lg:-mt-[40px] lg:col-start-2'];
  // Staging order: item1 Mohammad Dawd and item2 Ali sulaiman rise, item3 (top
  // centre) drops from above, item4 Safwan slides in from the side.
  const sceneKeys = ['t-1', 't-3', 't-2', 't-4'];""",
)
sub(
    p,
    """        <ul className="relative mx-auto mt-12 grid max-w-[980px] gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.items.map((item, i) => (
            <li key={i} className={offsets[i]}>""",
    """        {/* at 1400px and up the four cards converge as the section scrolls */}
        <ScrollScene scene="testimonials" as="ul" className="relative mx-auto mt-12 grid max-w-[980px] gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.items.map((item, i) => (
            <li key={i} className={offsets[i]} data-scene={sceneKeys[i]}>""",
)
sub(
    p,
    """            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/**
 * Our Services""",
    """            </li>
          ))}
        </ScrollScene>
      </Container>
    </section>
  );
}

/**
 * Our Services""",
)
sub(
    p,
    """            <Image src="/misc/proven-2.webp" alt="" fill sizes="30vw" className="object-cover opacity-30" aria-hidden />""",
    """            {/* .as-about-4-growth .img-elm wipes in over 2s when scrolled into view (wa_add_class) */}
            <Reveal className="clip-reveal absolute inset-0">
              <Image src="/misc/proven-2.webp" alt="" fill sizes="30vw" className="object-cover opacity-30" />
            </Reveal>""",
)
sub(
    p,
    """            <h3 className="relative text-[1.625rem] font-medium leading-[1.1] tracking-[-0.05em] text-white">{t(provenBlock.performanceTitle)}</h3>""",
    """            <h3 className="relative text-[1.625rem] font-medium leading-[1.1] tracking-[-0.05em] text-white">
              <SplitText>{t(provenBlock.performanceTitle)}</SplitText>
            </h3>""",
)
sub(
    p,
    """            <h3 className="relative text-sm font-medium text-white/60">{t(provenBlock.experienceTitle)}</h3>""",
    """            <h3 className="relative text-sm font-medium text-white/60">
              <SplitText>{t(provenBlock.experienceTitle)}</SplitText>
            </h3>""",
)
sub(
    p,
    """            <ul className="grid h-full grid-cols-3 gap-2.5 rounded-[4px] bg-white p-2.5">
              {provenBlock.images.map((src) => (
                <li key={src} className="relative min-h-[120px] overflow-hidden rounded-[6px]">
                  <Image src={src} alt={siteConfig.name} fill sizes="15vw" className="object-cover" />
                </li>
              ))}
            </ul>""",
    """            {/* photo strip scrolls sideways endlessly (wa_marquee_left_nopause) */}
            <div className="h-full overflow-hidden rounded-[4px] bg-white p-2.5">
              <ul className="flex h-full min-h-[120px] w-max animate-marquee-slow gap-2.5">
                {[...provenBlock.images, ...provenBlock.images].map((src, i) => (
                  <li key={i} className="relative min-h-[120px] w-[180px] shrink-0 overflow-hidden rounded-[6px]">
                    <Image src={src} alt={i < provenBlock.images.length ? siteConfig.name : ''} fill sizes="180px" className="object-cover" />
                  </li>
                ))}
              </ul>
            </div>""",
)

# Service detail — Why Choose Us: numbers slide in, icons swing on hover
p = "app/[locale]/services/[slug]/page.tsx"
sub(p, "import { ContactBlock } from '@/components/blocks/ContactBlock';", "import { ContactBlock } from '@/components/blocks/ContactBlock';\nimport { Reveal } from '@/components/motion/Reveal';\nimport { SplitText } from '@/components/motion/SplitText';")
sub(
    p,
    """            <li key={card.title} className="relative flex flex-col border-black/15 px-5 pb-16 pt-2 sm:border-s">
              <Image src={serviceDetail.icons[i]} alt="" width={40} height={40} className="h-10 w-10 opacity-60" aria-hidden />""",
    """            <li key={card.title} className="group relative flex flex-col border-black/15 px-5 pb-16 pt-2 sm:border-s">
              {/* .as-process-2-item:hover .icon — swing */}
              <Image src={serviceDetail.icons[i]} alt="" width={40} height={40} className="hover-swing h-10 w-10 opacity-60" aria-hidden />""",
)
sub(
    p,
    """              <span className="absolute bottom-0 start-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-[#8a8a8a] font-mono text-xs text-white rtl:translate-x-1/2">
                {String(i + 1).padStart(2, '0')}
              </span>""",
    """              {/* step numbers slide in from the side (wow slideInRight2) */}
              <span className="absolute bottom-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                <Reveal as="span" animation="slideInRight2" className="grid h-9 w-9 place-items-center rounded-full bg-[#8a8a8a] font-mono text-xs text-white">
                  {String(i + 1).padStart(2, '0')}
                </Reveal>
              </span>""",
)
sub(
    p,
    """<h2 className="mt-10 text-[1.75rem] font-medium tracking-[-0.05em] text-heading">{t(serviceDetail.about)}</h2>""",
    """<h2 className="mt-10 text-[1.75rem] font-medium tracking-[-0.05em] text-heading">
            <SplitText>{t(serviceDetail.about)}</SplitText>
          </h2>""",
)
print("patched")
