# Piris Road — website rebuild

A Next.js / TypeScript / Tailwind rebuild of the **Piris Road** logistics
website, reconstructed from a single `.wpress` backup after the original
WordPress site was hacked and lost.

- **[RECOVERY_REPORT.md](RECOVERY_REPORT.md)** — what the archive turned out to be and everything recovered from it
- **[RECONSTRUCTION_PLAN.md](RECONSTRUCTION_PLAN.md)** — sitemap, component plan, design tokens
- **[MISSING_ASSETS.md](MISSING_ASSETS.md)** — what could not be recovered, and the faults in the original that were fixed here

**Design reference:** after the first rebuild, a newer staging copy of the site
(`seashell-whale-108794.hostingersite.com`) was found. Layout, typography,
spacing and imagery were matched to its rendered pages and computed styles, and
its newer copy, blog posts and Arabic translations were imported. Where staging
and the backup disagree, staging (newer) wins for content; the backup wins for
Arabic translations of unchanged strings.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `QUOTE_RECIPIENT` plus a
`RESEND_API_KEY` to enable form delivery. Without a key the forms still
validate and accept submissions, logging them server-side instead.

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (all pages prerender statically) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

## Deployment (Railway)

Deployed on Railway: project **piris-road**, service **piris-road**,
environment **production** — <https://piris-road-production.up.railway.app>.
Railway builds with Railpack (`npm run build`, then `npm run start`; Node 22 from
`engines`). `.railwayignore` keeps `recovery/` out of uploads.

```bash
railway up --service piris-road --ci
```

The service is not connected to GitHub, so pushes don't redeploy by
themselves; either run the command above or connect the repo in the Railway
dashboard (Service → Settings → Source). Set `RESEND_API_KEY`,
`QUOTE_RECIPIENT` etc. under Service → Variables to enable form delivery, and
add the custom domain (pirisroad.iq) under Settings → Networking when ready.

## Routes

| Route | Original WordPress source |
|---|---|
| `/` | page 15 "Home" (front page) |
| `/about` | page 23 |
| `/services` | page 25 (was `/our-services/`) |
| `/services/[slug]` | 7 `services` posts — **slugs preserved** |
| `/blog` | list + sidebar, as on staging; `?q=` searches |
| `/blog/[slug]` | 4 posts (from staging) — slugs preserved |
| `/contact` | page 29 (was `/contact-us/`) |
| `/quote` | page 3821 (was `/elementor-page-3821/`) |

Old URLs 301-redirect to the new ones (`next.config.ts`).

Everything is available at `/` (English) and `/ar` (Arabic, RTL).

## How the content is organised

There is no CMS. All recovered content lives in typed modules under `content/`,
which makes it easy to read, diff, and later swap for a headless CMS.

```
content/
├── site.ts              company details, nav, social, logos, stats, certifications
├── company.ts           hero, about, industries, philosophy, process, CEO message, CTAs
├── services.ts          the 7 services: copy, tags, body, 4 feature cards each
├── posts.ts             blog posts — GENERATED from the staging site (EN + AR bodies)
└── ar-dictionary.json   405 Arabic translations (backup + staging)
```

`content/posts.ts` is generated (WordPress REST API for English, the /ar/ pages
for Arabic) rather than hand-typed, so post bodies are byte-accurate.

## Bilingual approach

The original was bilingual via TranslatePress, which translated by matching the
rendered **English source string** against a dictionary table. This rebuild does
the same thing:

```tsx
const t = getTranslate(locale);
<h2>{t('A Strategic Logistics Partner Built for Demanding Markets')}</h2>
```

`lib/i18n.ts` looks the string up in `content/ar-dictionary.json` — 361
translations from the backup plus 44 harvested from staging's /ar/ pages by
aligning them with the English DOM — and falls back to English when there is no
entry. **Nothing is machine-translated.** Where the original had a typo
("Why Choice Us"), `translateAs` shows corrected English but keeps the original
key for the Arabic lookup.

`next-intl` handles only locale routing, `dir="rtl"` and locale-aware `<Link>`s.

Use Tailwind's logical properties (`ps-*`, `pe-*`, `ms-*`, `start-*`, `end-*`)
rather than left/right so both directions work from one set of classes.

## Design tokens

Recovered from the WordPress theme options and custom CSS — see
RECOVERY_REPORT.md §6. Defined in `tailwind.config.js`:

| Token | Value | Source |
|---|---|---|
| `brand` | `#244BDD` | `avista_theme_options.theme_color_1` |
| `brand-main` | `#3361e5` | `--theme-color` override in Additional CSS (the colour actually used) |
| `brand-dark` / `brand-light` / `brand-soft` | `#002EAF` / `#5FA3FF` / `#D0E6FC` | service-template custom CSS |
| `accent` | `#FFC200` | `theme_color_2` |
| `heading` / `body` | `#0a0a0a` / `#3E3E3E` | Avista `:root` |
| `night` / `card` / `paper` | `#0a0a0a` / `#1a1a1a` / `#f2f2f2` | staging computed styles |
| font | **Inter** + **Geist Mono** (eyebrows) | what staging actually renders — the backup's Aeonik rule targeted `lang="en"` but the site used `en-US`, so it never applied |

Type scale, radii (hero `0 0 150px 150px`, cards 10px), the 1320px container and
card shadows were taken from staging's computed styles.

## Motion

Every animation was taken from the Avista theme's own scripts and CSS as served
by the staging site (`avista-core.js`, `avista-core.css`, `animate.css`), using
the same libraries — **GSAP** (ScrollTrigger, SplitText) and **Lenis** — with the
same durations, eases, offsets and breakpoints. The code lives in
`components/motion/`:

| Component | Theme hook | What it does |
|---|---|---|
| `MotionProvider` | Lenis boot + `.as-preloader` | Smooth scroll (duration 1, quartic ease); "L[logo]ADING…" preloader until `load`, then headline intros start |
| `SplitText` | `wa_title_spilt_1` / `wa_split_up` / `wa_title_split_2` | Letters flip up from rotateX(-80°) · letters rise 50px · words drift out of blur |
| `Reveal` | `wow` + `fadeInUp2` etc. | Scroll reveals with the theme's keyframes and `data-wow-delay` values |
| `Magnetic`, `MagneticArea`, `HoverSplit` | `wa_magnetic_btn_1`, `wa_magnetic_1_trigger`, `wa_btn_split_1`, `menu_1_split` | Elastic magnetic buttons, drifting card photos, letter bounce/flip on hover |
| `ScrollScene` | `partner1_trigger`, `portfolio1_pin_elm`, `cta1_trigger`, `p1_pin_elm`, team/testimonial timelines | Scrubbed/pinned scenes: clouds, pinned services heading, CTA hands, stacking process cards, industries fly-in (≥1600px), testimonials (≥1400px) |
| `HeroInteractive`, `LiquidImage` | `wa_tilt`, `#wa_cursor_noise`, `#wa_liquid_img` | Pointer tilt, particle noise, liquid "condense" intro on the container |
| `Odometer` | `.odometer` | Rolling digit counters |

GSAP, its plugins and Lenis are **loaded on demand** (`lib/motion.ts`:
`loadMotion()`, `loadSplitText()`, `useGsap()`) instead of being bundled into
every page's first-load JavaScript. Nothing animates before the preloader lifts
on `window.load` anyway, SplitText is only fetched when an LTR page splits text,
and if a chunk fails to load the preloader still lifts and content shows
unanimated. This took Home's first-load JS from 177 kB to 122 kB.

Differences from the theme, deliberately:
- The liquid intro uses an SVG displacement filter instead of PixiJS/WebGL
  (same 220 → 0 over 2s, but a procedural noise map rather than the GIF texture).
- Split-text effects are skipped on Arabic pages — the theme does the same
  (`direction !== "rtl"`), and splitting would break Arabic letter joining.
- Everything is disabled under `prefers-reduced-motion`, and nothing is hidden
  when JavaScript is off.

## Security

The original site was hacked, so the rebuild keeps its attack surface small:
static pages, no CMS, no database, no user accounts. What is exposed is covered
as follows (checked by an automated test against `next start`):

- **HTTP headers** (`next.config.ts`): Content-Security-Policy (same-origin
  only, plus the Google Maps frame; no plugins, no framing of the site, forms
  may only post to this origin), HSTS, `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`,
  `Cross-Origin-Opener-Policy`; `X-Powered-By` removed. Because pages are
  prerendered, `script-src` keeps `'unsafe-inline'` for Next's inline
  hydration data (nonces would force every page to render dynamically).
- **Form endpoints** (`lib/api-guard.ts`, used by `/api/quote`, `/api/contact`,
  `/api/newsletter`): cross-site `Origin` refused, JSON content type only,
  16 KB body cap, per-IP rate limit (5 per 10 min; 3 for the newsletter),
  hidden honeypot field, and zod schemas that cap every field's length and
  reject line breaks in single-line fields (no header injection into the
  email subject). Validation errors don't echo schema details; API responses
  are `no-store` and `noindex`.
- **Rate limiting is in-memory**, i.e. per server instance. Behind several
  instances or on serverless, move it to a shared store (e.g. Upstash Redis).
  It keys on `x-forwarded-for`, which is only trustworthy behind a proxy that
  sets it (Vercel, Nginx, Cloudflare…). Set `ALLOWED_ORIGINS` if the site is
  served from extra hostnames.
- **Dependencies**: `npm audit` is clean. Next 15 bundles an old PostCSS; an
  `overrides` entry in `package.json` points it at the patched top-level copy.
- **Content**: blog bodies are rendered as HTML but come only from the
  generated `content/posts.ts` (checked: no scripts, event handlers or
  external links). The `?q=` blog search is length-capped and escaped by React.
- HSTS deliberately has no `includeSubDomains`/`preload` until the production
  domain and its subdomains are confirmed HTTPS-only.

## The `recovery/` directory

This is the audit trail — the decoded source of truth for everything above.
Worth keeping in the repo.

```
recovery/
├── OUTLINE.txt                 section-by-section outline of every real page
├── CONTENT.txt                 full text of services, posts + SEO metadata
├── MEDIA.txt                   all 89 asset URLs, verified present
├── wpress_file_index.tsv       complete 14,902-entry archive index
├── ar_dictionary.json          recovered Arabic translations
├── ar_untranslated.json        strings the original never translated
├── asset_map.json              original uploads path -> public/ path
├── elementor/                  field-level dumps per page
├── css/                        recovered custom CSS
├── raw/                        custom HTML widgets, verbatim
└── assets/                     the 89 untouched original media files
```

## Notes for whoever picks this up

- **Read MISSING_ASSETS.md first** — the staging sync note at the top lists
  what is still open (one unnamed reviewer, a placeholder photo, the X URL,
  some untranslated Arabic).
- **Set a real form recipient.** Every form on the original emailed the theme
  author's Gmail address; quote requests were probably never arriving.
- `RECOVERY-GAP:` comments in the code mark each unrecoverable detail in place.
- Images are optimised (`public/` is ~5 MB). Thirteen "SVG" files were
  base64-wrapped photos; originals are in `recovery/assets/` and
  `recovery/staging-assets/`.
- The layout and motion follow the staging site closely (see *Motion* below),
  but this is a clean rebuild, not a copy of the WordPress theme's code.

## Admin dashboard (`/admin`)

Arabic (RTL) dashboard for the site's forms: quote requests, contact messages
and newsletter subscribers.

- Overview with 7/30/90/365-day ranges, change vs. the previous period,
  open pipeline value, response time and win rate.
- Quotes: status pipeline, deal fields (value, currency, priority, assignee,
  follow-up date), activity timeline, sorting, bulk actions, printable sheet.
- Follow-ups board (overdue / today / upcoming), message detail pages,
  12-month reports, global search, CSV export.
- Texts & translation editor: every string the site renders, in English and
  Arabic, grouped by page/section, with search and "missing Arabic" filters.
  Edits are stored in `DATA_DIR/texts.json` (`lib/text-overrides.ts`), applied
  by `getTranslate()` and the blog post localiser, and published immediately
  (all pages are revalidated on save; `revalidate = 300` covers fresh deploys).
- The editor's list of strings is `content/text-catalog.json`, captured from a
  real build. After adding or changing copy in the code, regenerate it with
  `npm run texts:catalog` (don't run it while `next dev` is running).

- Every accepted form submission is saved by `lib/admin/store.ts` (JSON files
  under `DATA_DIR`, default `.data/`) before the notification email is sent.
- Sign-in: set `ADMIN_PASSWORD` (and optionally `ADMIN_SECRET`). Without a
  password the dashboard stays locked.
- **Railway:** attach a Volume and set `DATA_DIR` to its mount path (e.g.
  `/data`), otherwise stored submissions are wiped on each deploy.
