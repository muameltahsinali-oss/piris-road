# Continuation prompt — Piris Road rebuild

Paste everything below the line into a new conversation opened in
`C:\Users\omlsa\Desktop\piris_road`.

---

I'm continuing work on the **Piris Road** website rebuild in
`C:\Users\omlsa\Desktop\piris_road`. Read `README.md`, `MISSING_ASSETS.md`,
`RECOVERY_REPORT.md` and `RECONSTRUCTION_PLAN.md` before changing anything —
they are the record of what was done and why.

## Background
- Piris Road is a logistics / freight-forwarding company in Erbil, Iraq. The
  original WordPress site (Avista theme + Elementor Pro) was hacked and lost.
- **Source 1:** a `.wpress` backup (All-in-One WP Migration) at
  `C:\Users\omlsa\Desktop\aquamarine-gnat-712272.hostingersite.com-20260311-121537-620.wpress`.
  Decoded outputs are in `recovery/` (page outlines, content, CSS, 89 original assets).
- **Source 2 (newer, wins for content and design):** the staging site
  `https://seashell-whale-108794.hostingersite.com/` (it also has `/ar/` pages and
  the WordPress REST API at `/wp-json/wp/v2/`). Staging rewrote every
  `@pirisroad.iq` email to its own domain — keep the real `@pirisroad.iq` addresses.
  Staging originals are in `recovery/staging-assets/`.

## Decisions already made (don't re-litigate)
- Rebuild the **real site only**: Home, About, Services + 7 service pages, Blog + 4 posts,
  Contact, Quote. No WooCommerce, no Avista demo pages.
- **Never invent content.** Unrecoverable slots are omitted/marked with
  `RECOVERY-GAP:` comments and listed in `MISSING_ASSETS.md`.
- **Fully bilingual EN/AR** (`/` and `/ar`, RTL). Arabic comes only from
  `content/ar-dictionary.json` (backup + strings harvested from staging's `/ar/` pages);
  never machine-translate. Lookup is by exact English source string — keep copy
  byte-identical; use `translateAs()` where the original had a typo.
- Match the staging site's **layout and motion** as closely as possible.

## Stack and structure
Next.js 15 (App Router) · TypeScript 5.9 · Tailwind 3 · next-intl (routing only) ·
GSAP 3.15 (ScrollTrigger, SplitText) · Lenis · react-hook-form + zod.
- `content/` — all copy (`site.ts`, `company.ts`, `services.ts`, `posts.ts` is generated)
- `components/blocks/` sections · `components/layout/` header/footer/page header ·
  `components/ui/` primitives · `components/motion/` animation system
- `app/[locale]/…` pages · `app/api/{quote,contact,newsletter}` (Resend; env vars in `.env.example`)
- `recovery/scripts/` — the Python/Node scripts used for extraction, staging sync,
  Arabic alignment, post generation and browser verification. **Their file paths are
  hard-coded to old temp folders — update paths before re-running.**

## Motion system (second pass, done)
Reproduced from the theme's `avista-core.js` / `avista-core.css`: preloader, Lenis,
SplitText headline effects, WOW reveals, magnetic buttons/areas, hover letter effects,
hero tilt + particle noise + liquid intro (SVG filter instead of PixiJS), pinned/scrubbed
scenes (services heading pin, process card stack, partner clouds, CTA hands, industries
≥1600px, testimonials ≥1400px), odometers, inline desktop menu. Split effects are
skipped in RTL; everything is off under `prefers-reduced-motion`. Verified with
puppeteer in real time: 0 console errors, all reveals fire, pins/stack positions correct.

## Environment gotchas (learned the hard way)
- Windows. **Bash heredocs mangle backslashes and quotes** — write scripts to files
  with the Write tool instead of inline heredocs.
- Keep **TypeScript on 5.x** (TS 7 breaks loading `next.config.ts`).
- `tailwind.config.js` must stay **CommonJS** (the `.ts` config silently failed in dev).
- Don't give a Tailwind `fontSize` key the same name as a `colors` key
  (`text-plan` collided once and made headings invisible).
- Never run `next build` while `next dev` is running (shared `.next` breaks the build).
- The in-app Browser pane is often hidden, which pauses animation frames, and
  headless Edge with `--virtual-time-budget` freezes GSAP. To verify motion, install
  `puppeteer-core@23` in the session scratchpad and drive Edge at
  `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` in real time
  (see `recovery/scripts/verify/verify.js`).
- Use `.claude/launch.json` (autoPort) with the preview tool to run the dev server.
- The project is **not a git repository** yet.

## Known open items
- Content gaps in `MISSING_ASSETS.md` (unnamed reviewer, placeholder reviewer photo,
  timeline description, footer About blurb, untranslated Arabic for the ASYCUDA post,
  marquee labels and testimonials).
- Form delivery needs `RESEND_API_KEY` + real recipients; production domain
  (`pirisroad.iq`) is inferred and unconfirmed.
- Motion was verified numerically on Home and About; the Services, Contact, service
  detail and blog pages, and mobile animation visuals, haven't had a close visual review.
- Home first-load JS is ~177 kB after adding GSAP/Lenis.

Before you start, run `npx tsc --noEmit` and a production build to confirm a clean
baseline, then ask me what to work on next.
