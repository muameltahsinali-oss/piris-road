# Phase 2 — Reconstruction Plan

Target stack: **Next.js (App Router) + TypeScript + Tailwind CSS**. No WordPress, no PHP, no WooCommerce.

Scope is driven by §2 of [RECOVERY_REPORT.md](RECOVERY_REPORT.md): rebuild the **real** Piris Road site (the 5 pages in the active menu + 7 service pages + blog), not the ~20 Avista demo pages.

---

## 1. Sitemap

| Route | Source | Notes |
|---|---|---|
| `/` | page 15 "Home" | front page (`page_on_front=15`) |
| `/about` | page 23 | |
| `/services` | page 25 "Our Services" | original slug `/our-services/` → redirect |
| `/services/[slug]` | 7 `services` CPT posts | original `/services/<slug>/` — **slugs preserved** |
| `/blog` | page 35 (empty) + post archive | needs a new design (none existed) |
| `/blog/[slug]` | 3 posts | slugs preserved |
| `/contact` | page 29 "Contact us" | original `/contact-us/` → redirect |
| `/quote` | page 3821 "Get a Quote" | original `/elementor-page-3821/` → redirect |
| `/404` | theme options | "Oops! Page Not Found." |

**Service slugs (preserved verbatim):**
`sea-freight-solutions-fcl-lcl-shipping`, `air-freight-and-time-critical-cargo-services`, `domestic-and-cross-border-road-transport-solutions`, `cold-chain-and-temperature-controlled-logistics`, `warehousing-and-inventory-management-services`, `customs-clearance-and-trade-compliance-services`, `project-cargo-and-heavy-lift-logistics-solutions`

**Redirects** (`next.config.ts`, 301) to keep any existing inbound links / SEO:
`/our-services` → `/services` · `/contact-us` → `/contact` · `/elementor-page-3821` → `/quote` · `/home` → `/`

**Deliberately dropped** (with rationale): `/shop`, `/cart`, `/checkout`, `/my-account`, all 18 sample products (WooCommerce never used — zero orders, dummy apparel data); `Home 02/03/04`, the 4 `Dark` and 4 `Onepage` variants, `Pricing`, `Faqs`, `Our Team`, `Sample Page`, the "Melissa Lee" team demo entry (all unmodified Avista demo, absent from the active menu).

---

## 2. Content hierarchy

```
Piris Road  (logistics / freight forwarding — Erbil, Iraq)
│
├── Home ......................... positioning + proof + services overview + philosophy + process + insights
├── About ........................ who we are · our story timeline · CEO message · testimonials
├── Services ..................... all 7 services (overview cards)
│    └── Service detail × 7 ...... body copy + 4 feature cards + prev/next
├── Blog ......................... 3 posts, 6 categories, 3 tags
│    └── Post detail × 3
├── Contact ...................... address · phones · email · hours · map
└── Quote ........................ freight quote form (19 fields)
```

Shared content objects (single source of truth, typed):
- `siteConfig` — name, contact details, hours, socials, copyright
- `services[7]` — slug, title, shortTitle, description, tags[], body, featureCards[4], icon
- `industries[6]` — Oil & Gas, Technology & Telecom, Government & Public Sector, Defense & Secure Transport, Commercial & Industrial, Medical & Pharmaceutical
- `posts[3]` — title, slug, date, category, tags, featuredImage, body
- `philosophy` — vision, mission, values[5]
- `process[3]` — the 3 workflow steps
- `storyTimeline[3]` — About milestones
- `certifications[3]` — ISO 9001 / 14001 / 45001
- `stats` — 10+ years, 1000+ clients, 50+ satisfied, 4.9/5, 5 industries

---

## 3. Design system (from §6 of the report — all recovered, nothing invented)

```ts
// tailwind theme tokens
colors: {
  brand: {
    dark:  '#002EAF',
    DEFAULT:'#244BDD',   // theme_color_1
    main:  '#3361e5',    // --theme-color override (actual primary)
    light: '#5FA3FF',
    soft:  '#D0E6FC',
  },
  accent: '#FFC200',     // theme_color_2
  ink:    '#0b1c3d',     // --text-dark
  heading:'#0a0a0a',     // --as-clr-h-1
  body:   '#3E3E3E',     // --as-clr-p-1
  muted:  '#515151',
  night:  '#0e1220',     // scrollbar track / dark sections
}
fontFamily: { sans: ['Aeonik', 'Inter', 'system-ui', 'sans-serif'] }
```
- Gradients: `from-[#3d63f5] to-[#3558e6]` (hero), `-135deg #244BDD→#5FA3FF` (alt hero)
- Hero bottom corners: `rounded-b-[120px]` desktop / `rounded-b-[60px]` mobile
- Glass CTA card: `bg-white/25 backdrop-blur-xl rounded-[28px] shadow-2xl`
- Accent button: `bg-accent text-ink rounded-xl` + `-translate-y-[3px]` hover
- H1: `clamp(48px, 5vw, 70px)`, line-height 1.1
- Font: self-host `Aeonik-Regular.ttf` via `next/font/local`. **Only weight 400 exists** — declare 400 and let heavier weights fall back to Inter rather than faking synthetic bold. This is a documented gap, not a guess.

---

## 4. Header & footer structure

### Header (from post 2582)
```
Header
├── Logo (desktop PNG / mobile SVG)  → /
├── NavDesktop            Home · About · Services ▾ (7 services) · Blog · Contact
├── ButtonQuote           "Get a Quote" → /quote
├── LanguageSwitcher      EN / AR  [see §8 — deferred]
└── MobileMenu (Sheet)
     ├── NavMobile (accordion for Services)
     ├── SocialLinks      "We're on social media:" — FB · X · IG · LinkedIn
     └── GalleryStrip     "Stay Inspired with Instagram" — 5 images
```
Sticky on scroll; two logo variants preserved as in the original.

### Footer (from post 2686)
```
Footer
├── FooterBrand           white logo + About Us text  ⚠ original text was Lorem ipsum
├── FooterNewsletter      "Keep up out latest update subscribe our newsletter!" + email → Subscribe
├── FooterLinks "Quick Navigation"   About us · Services · Contact Us
├── FooterLinks "All Page"           Home · Contact · Blogs
├── FooterContact "Contact Us"       info@pirisroad.iq · +9647503050108 · +9647870008888
└── FooterBottom          "© All rights reserved {year}" · "Piris Road 2026"
```
Fixes applied to real bugs found in the original (each flagged in code comments): the `+9647503050108` label pointed at `tel:+9647870008888`; the footer `big_title` rendered **"Avista"**.

---

## 5. Reusable components

**Layout / chrome**
`Header` · `Footer` · `Container` · `Section` · `SectionHeading` (eyebrow + title + description) · `Breadcrumb` · `Preloader` · `BackToTop` (hidden, as original) · `LanguageSwitcher`

**Primitives**
`Button` (primary / accent / ghost, optional icon) · `Card` · `Tag` · `Icon` · `Divider` · `Counter` (odometer-style, `IntersectionObserver`) · `Marquee` (CSS-only, horizontal + vertical) · `Accordion` · `Tabs` · `Carousel` (embla) · `Lightbox`

**Content blocks** (one per recovered `tx_*` widget)
| Component | Replaces | Used on |
|---|---|---|
| `HeroCustom` | `html` `.pr-hero` | Home (mobile/tablet) |
| `HeroTheme` | `tx_hero_section` | Home (desktop) |
| `AboutIntro` | `tx_about` | Home, About |
| `IndustryGrid` | `tx_team_lists` | Home, About |
| `MovingText` | `tx_moving_text` | Home |
| `WhyUs` | `tx_about` style_2 | Home |
| `PartnerLogos` | `tx_brand` | Home |
| `ServiceCards` | `tx_service_section` style_2/7 | Home, Services |
| `CtaBanner` | `tx_cta` style_1/2 | Home, About, Contact, service pages |
| `PhilosophyPanels` | `tx_pricing_section` | Home |
| `ProcessSteps` | `tx_service_section` style_3 | Home, About (as timeline) |
| `FaqTabs` | `tx_tabs` | Home |
| `PostGrid` | `tx_post_grid` | Home, Blog |
| `Testimonials` | `tx_testimonial` | About |
| `CeoMessage` | `tx_about` style_5 | About |
| `ContactInfoColumns` | container + icon-lists | Contact |
| `MapEmbed` | `google_maps` | Contact |
| `ServiceFeatureCards` | ACF c1–c4 | service detail |
| `ServiceNav` | `[services_nav]` | service detail |
| `QuoteForm` | CF7 2478 | Quote |
| `NewsletterForm` | CF7 2678 | Footer |

---

## 6. Page-by-page component structure

### Home `/`
```
Home
├── Header
├── HeroCustom ................... mobile + tablet only (exact recovered HTML/CSS)
├── HeroTheme ..................... desktop only  — "Driving Logistics Excellence"
├── AboutIntro .................... "A Strategic Logistics Partner Built for Demanding Markets"
│    ├── FeatureBox × 3
│    ├── Counter × 3 (10+ yrs · 1000+ clients · 4.9/5)
│    └── CertificationGallery (ISO 9001/14001/45001)
├── IndustryGrid .................. 6 industries served
├── MovingText .................... 2 marquee rows
├── WhyUs ......................... "Why Businesses Rely on Piris Road…"
│    ├── ValueCard × 3
│    └── UspBlock × 3
├── PartnerLogos .................. "Global Networks Supporting Local Excellence"
├── ServiceCards .................. "Some of Services" — 4 cards + tags
├── CtaBanner ..................... "Let's Work Together!"  ⚠ demo copy in original
├── PhilosophyPanels .............. Vision · Mission · Values
├── ProcessSteps .................. Step 01–03
├── FaqTabs ....................... ISO certifications  ⚠ tab bodies were demo
├── PostGrid ...................... "Logistics Insights & Industry Updates"
└── Footer
```
*(The all-breakpoints-hidden demo `tx_service_section` is intentionally not rebuilt.)*

### About `/about`
```
About
├── Header
├── Breadcrumb
├── AboutIntro .................... same block as Home
├── IndustryGrid
├── SectionHeading ................ "Our Story"
├── ProcessSteps (timeline) ....... Foundation · Multimodal Expansion · Certifications
├── CeoMessage .................... "Ceo Message" — Nyaz — Vision & Mission
├── Testimonials .................. ⚠ bodies were demo in original
├── CtaBanner
└── Footer
```

### Services `/services`
```
Services
├── Header
├── Breadcrumb
├── ServiceCards (style_2) ........ Sea · Air · Road · Cold Chain
├── ServiceCards (style_7) ........ Warehousing · Customs · Project Cargo
├── AboutIntro (style_4) .......... client quote + "Proven Experiences" + counters
└── Footer
```

### Service detail `/services/[slug]`
```
ServiceDetail
├── Header
├── Breadcrumb
├── ServiceHero ................... featured SVG + title
├── SectionHeading ................ "About This Service"
├── ProseBody ..................... recovered body copy
├── ServiceFeatureCards ........... 4 ACF cards ("Why Choice Us")
├── CtaBanner
├── ServiceNav .................... ← Previous Service / Next Service →
└── Footer
```

### Blog `/blog` and `/blog/[slug]`
```
Blog                         BlogPost
├── Header                   ├── Header
├── Breadcrumb               ├── Breadcrumb
├── PostGrid                 ├── PostHeader (title · date · category · featured image)
├── CategoryFilter           ├── ProseBody (Gutenberg → React)
└── Footer                   ├── TagList
                             ├── CtaBanner
                             └── Footer
```
⚠ **No blog design existed** (page 35 was empty, theme default was used) — this is newly designed, consistent with the recovered system.

### Contact `/contact`
```
Contact
├── Header
├── Breadcrumb
├── CtaBanner (style_2) ........... "Need more assistance?" · "Book a personalized call"
├── ContactInfoColumns
│    ├── "Find us Here" ........... Cavalli Tower (B12-07), Gulan St. Waziran, Erbil, Iraq
│    ├── "Get In touch" .......... +9647870008888 · +9647503050108 · info@pirisroad.iq
│    └── "Training Hours" ........ 8 AM – 4 PM (Everyday Except Friday & Saturday)
├── MapEmbed ...................... ⚠ original value was only "baghdad"
└── Footer
```

### Quote `/quote`
```
Quote
├── Header
├── Breadcrumb
├── QuoteForm
│    ├── Fieldset "Shipping Information" .. loading place/country · unloading place/country
│    │                                      · colli · weight · length · width · height
│    │                                      · commodity · additional info
│    ├── Fieldset "Company Information" ... company · VAT · address · postal · city
│    │                                      · country · phone · email · your name
│    ├── AcceptancePrivacy
│    └── Button "Send"
└── Footer
```

---

## 7. Required assets

All 89 originals are in `recovery/assets/` and move to `public/`:

| Group | Files |
|---|---|
| Logos | `logo-icon-svg-file.svg`, `black-font-svg-file.svg`, `logo-png-file-copy-scaled.png`, `white-font-transparency-...png` |
| Hero | `Untitled-design-223-scaled-1.webp` (container), `Untitled-design-223-scaled.png` |
| Service SVGs × 7 | `Sea-Freight-Solutions-FCL-LCL-Shipping.svg`, `yfftghv-1.svg`, `effas.svg`, `dwfwgre.svg`, `wfegrthyj.svg`, `qawees.svg`, `ihuf.svg` |
| Service cards | `1-sea-freight.png`, `2-cross-borader.png`, `3-air-cargo.png`, `4-reefer.png` |
| Industry icons × 6 | `2-1.svg`, `3-1.svg`, `4-1.svg`, `5-1.svg`, `6.svg`, `Untitlhl.ed-design.png` |
| Certifications | ISO 9001 / 14001 / 45001 badges, `e2d.png` |
| Partners × 4 | `2026/01/1.png` … `4.png` |
| Header gallery × 5 | `right-pic.png`, `left-pic.png`, `4-reefer.png`, `2-cross-borader.png`, `1-sea-freight.png` |
| Blog featured | `2026/01/1.svg`, `image-1024x444.png`, `post3.jpg` |
| Breadcrumb bg | `Untitled-design-224-scaled.webp` |
| Font | `Aeonik-Regular.ttf` |

**Asset work required:** the 7 service SVGs are traced bitmaps totalling ~28 MB (largest 5.6 MB). Convert to optimised WebP/AVIF or re-trace. Serve everything through `next/image`.

**To be clearly marked as missing in code** (`// RECOVERY-GAP:` comments + a `MISSING_ASSETS.md`): Aeonik Bold/Medium/Italic; any real testimonial photos/names; footer About Us copy; FAQ/tab bodies; Google Maps coordinates; X/Twitter profile URL.

---

## 8. Forms & interactive functionality

| Feature | Approach |
|---|---|
| **Quote form** | React Hook Form + Zod, POST to a Next.js Route Handler (`app/api/quote/route.ts`) → email via Resend/SMTP. **Recipient must be a real Piris Road address** — the original sent to the theme author's Gmail. |
| **Newsletter** | Route Handler; pluggable provider (no original provider config existed beyond CF7 email). |
| Service prev/next | Static, derived from the ordered `services` array (replaces `[services_nav]`). |
| Counters | `IntersectionObserver` count-up (replaces Odometer). |
| Marquees | CSS keyframes (replaces the theme's JS). |
| Carousels | `embla-carousel-react` (replaces Swiper). |
| Lightbox | `yet-another-react-lightbox` (replaces Magnific Popup). |
| Scroll/entrance animations | Framer Motion, reproducing the recovered `fadeSlideLeftBlur` / `fadeSlideRightBlur` / `fadeUpBlur` timings (1.1 s / 1.4 s / 1.8 s). |
| Preloader | Optional `Preloader` component matching the recovered `L-logo-A-D-I-N-G...` animation; behind a config flag since it delays LCP. |
| Mobile menu / offcanvas | Headless UI / Radix Dialog. |
| **EN ⇄ AR bilingual** | Recovered as a real feature (TranslatePress, 723 dictionary rows, ~120 lines of RTL CSS). Plan: `next-intl` with `[locale]` segment + `dir="rtl"`. **Scoped as a phase-2 follow-up** — I have the English content verbatim, but I have not verified Arabic coverage per string, and I will not machine-translate and present it as recovered copy. |
| WooCommerce | **Not rebuilt** — never used for the business. |

## 9. Backend functionality to recreate

Minimal. Everything else is static.
1. `POST /api/quote` — validate + send the 19-field freight quote (the only genuinely dynamic feature the real site had).
2. `POST /api/newsletter` — email capture.
3. Content as typed TS modules under `content/` (services, posts, industries, philosophy, process, siteConfig). Trivially swappable for a headless CMS later.
4. `sitemap.ts`, `robots.ts`, per-route `generateMetadata` seeded from the recovered AIOSEO titles/descriptions.
5. 301 redirects (§1).

---

## 10. Proposed project structure

```
app/
├── layout.tsx                 fonts, <html dir>, Header/Footer, metadata
├── page.tsx                   Home
├── about/page.tsx
├── services/page.tsx
├── services/[slug]/page.tsx
├── blog/page.tsx
├── blog/[slug]/page.tsx
├── contact/page.tsx
├── quote/page.tsx
├── not-found.tsx
└── api/{quote,newsletter}/route.ts
components/
├── layout/    Header Footer MobileMenu Breadcrumb Preloader BackToTop LanguageSwitcher
├── ui/        Button Card Tag Counter Marquee Accordion Tabs Carousel Lightbox Section SectionHeading
└── blocks/    HeroCustom HeroTheme AboutIntro IndustryGrid MovingText WhyUs PartnerLogos
            ServiceCards CtaBanner PhilosophyPanels ProcessSteps FaqTabs PostGrid
            Testimonials CeoMessage ContactInfoColumns MapEmbed ServiceFeatureCards
            ServiceNav QuoteForm NewsletterForm
content/       site.ts services.ts posts.ts industries.ts philosophy.ts process.ts stats.ts
lib/           utils.ts metadata.ts
public/        logos/ hero/ services/ industries/ certifications/ partners/ blog/ fonts/
recovery/      (kept as the audit trail / source of truth)
MISSING_ASSETS.md
```

---

## 11. Honest statement about design fidelity

The rebuild will use **only** recovered content, recovered colours, the recovered font, the recovered section order, and the recovered assets. The one hand-coded section (`.pr-hero`) will be reproduced from its original CSS.

It will **not** be a pixel-identical clone of the original. The original's look came from a commercial theme (Avista) whose appearance is produced by 307 KB of its own CSS across dozens of `tx_*` widget view templates, and **no screenshot of the original site exists in this archive**. I will build a clean, professional design that is faithful to the recovered structure, palette and typography — and I will not represent it as identical to what was lost.

Where the original itself contained leftover demo text or broken links (footer About, testimonials, FAQ bodies, `tx_cta` copy, `/services/smart-schedule-control/`, the footer phone link, the `baghdad` map value, the theme author's form recipient), I will mark each one rather than silently invent replacements.
