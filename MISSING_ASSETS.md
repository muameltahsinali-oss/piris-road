# Recovery gaps — what could not be restored

> **Update — staging sync (2026-09-13).** A newer staging copy of the site
> (`seashell-whale-108794.hostingersite.com`) was found and used to bring the
> rebuild closer to the live design. It **filled these gaps**: 5 real FAQs,
> 4 real client testimonials (with photos for 3), a real CEO message
> ("Nyaz, Founder & CEO"), "Compliance and Safety" body copy, timeline years
> (2018/2020/2023), a correct map location (Plus Code `6X4M+JW Erbil`), new
> industry photos, a new blog post, and ~44 extra Arabic translations.
> It also **changed** content: the Škoda post was rewritten as "Iraq's ASYCUDA
> Revolution", and the hero/about/features copy was updated.
>
> **Still open after the sync:** footer "About Us" blurb (not shown on
> staging either), one reviewer labelled "Someones Name" (name omitted), one
> reviewer with a placeholder photo (initials shown), the About timeline
> description (still Lorem ipsum on staging — omitted), the empty "Job Career"
> FAQ tab (not rendered), and untranslated Arabic for the
> ASYCUDA post body, the marquee labels and the testimonials.
>
> Originals downloaded from staging are kept in `recovery/staging-assets/`.
> The X/Twitter link was later found on staging (`x.com/PirisRoad`) and added.


Every item below is something the `.wpress` archive did **not** contain, or
something that was genuinely broken/unfinished **on the live site itself**.
Nothing here has been invented or filled with placeholder copy.

Each gap is also marked in the code with a `RECOVERY-GAP:` comment at the point
where it matters, so it is visible while editing.

---

## 1. Content the original site never actually had

These slots were still carrying Avista theme demo text when the backup was
taken. They are omitted rather than reproduced.

| Item | Original value on the live site | Where | Status in rebuild |
|---|---|---|---|
| Footer "About Us" paragraph | `Lorem ipsum dolor sit amet, consectetur adipiscing elit.` | Footer 1 | Shows the recovered site description instead. **Needs a real company blurb.** |
| Footer heading | `Avista` (leftover theme branding) | Footer 1 | Dropped. |
| Testimonial slider | `John Doe` + *"The team provided exceptional cleaning! Our home feels fresh, spotless…"* (a cleaning-company demo quote) | About page | Replaced with the one **genuine** client quote found in the archive (recovered from the Our Services page). **Needs real testimonials.** |
| FAQ accordion bodies | `Tab Heading` / `Description` | Home, `tx_tabs` | FAQ accordion not rendered; only the real ISO certification list is shown. **Needs real FAQ content.** |
| Home CTA description | *"At Avista Digital Agency, we provide a full range of digital solutions…"* | Home, `tx_cta` | Omitted. |
| "Compliance and Safety" feature box | Body text was a copy of its own title | Home + About, `tx_about` | Title shown, duplicate body suppressed. **Needs body copy.** |
| CEO message body | Reused the Vision and Mission paragraphs; no distinct letter, no portrait | About page | Recovered blocks shown; brand mark used in place of a photo. **Needs a real message + portrait.** |
| Service-page tagline | Staging shows *"Streamlined processes delivering exceptional digital results"* beside "Why Choice Us" on every service page (Avista agency demo copy) | Service template | Omitted; the subtitle and the four feature columns are shown. |
| Dead service section | A `tx_service_section` still holding *"Web Design & Development"*, *"Digital Marketing"*, *"Branding"* | Home | Not rebuilt — it was hidden on every breakpoint (`hide_desktop` + `hide_tablet` + `hide_mobile`), so it rendered nowhere. |

## 2. Faults in the original that are fixed in the rebuild

| Fault | Detail | Fix |
|---|---|---|
| **Form recipient** | Every Contact Form 7 form emailed `wabidullahsharif@gmail.com` — the theme author's address, never changed after the demo import. Quote requests were very likely never reaching Piris Road. | Recipient now defaults to `info@pirisroad.iq`, configurable via `QUOTE_RECIPIENT`. |
| Footer phone link | The label `+9647503050108` linked to `tel:+9647870008888`. | Each number links to itself. |
| Dead service links | Three home-page value cards linked to `/services/smart-schedule-control/` — a service that does not exist in the database. | Links removed. |
| Map location | The `google_maps` widget stored only the string `baghdad`, contradicting the Erbil street address directly above it. | Maps the recovered Erbil address. |
| Broken hero layout duplication | Two separate heroes with identical copy, swapped by breakpoint. | One responsive hero built from the hand-coded original. |

## 3. Assets and design information not in the archive

| Item | Detail |
|---|---|
| **Any screenshot of the original site** | Nothing in the archive shows what the site looked like. The visual design is reconstructed from the recovered palette, font, section order and the one hand-coded section — it is **not** a pixel copy. |
| **Aeonik Bold / Medium / Italic** | Only `Aeonik-Regular.ttf` (400) was ever uploaded. Headings fall back to Inter for heavier weights rather than shipping synthetic bold. |
| 404 illustration | Theme option `tx_error_image` was empty. |
| X / Twitter profile URL | The header had an X icon with no link set. |
| Google Maps API key / coordinates | Only a place-name string existed. Current embed needs no key. |
| Blog index design | WordPress page 35 ("Blog") had **empty** content and used the theme's default template — no custom design existed to recover. The blog listing is newly designed from the site's own system. |
| Testimonial author photos | The demo entries referenced Avista's stock author images. |
| WordPress core / `wp-config.php` / root `.htaccess` | Not part of the `.wpress` format by design. If the compromise lived there, it is not visible in this file. |
| Historical form submissions | `wp_e_submissions` was empty and no CF7 submissions were stored. |
| Analytics / order history | MonsterInsights tables empty; `wc_orders` had zero rows. |

## 4. Arabic translation coverage

The original was bilingual via TranslatePress. The archive's dictionary
(`wp_trp_dictionary_en_us_ar`) holds **723 rows, of which only 361 had
translations** — genuine human Arabic, now in `content/ar-dictionary.json`.

The remaining 362 strings were never translated on the live site. The most
significant uncovered areas:

- **All three blog post bodies** — no Arabic at all.
- Some UI strings: `Available for New Projects`, `Trusted By`, `Learn More`,
  `Ceo Message`, `ISO 9001`, `Our Working process`.
- The company address string.

The Arabic locale falls back to English for anything untranslated — which is
exactly what TranslatePress did on the live site. Nothing has been
machine-translated: every Arabic word on this site came out of the backup.

The full list of untranslated source strings is preserved in
`recovery/ar_untranslated.json` if you want to have them translated properly.

## 5. Asset conversions applied

Thirteen "SVG" assets in the archive were not vectors at all — each was a
single base64-embedded JPEG/PNG inside an SVG wrapper, 2–5.4 MB apiece
(52.6 MB total). They have been unwrapped and re-encoded as WebP
(**52.6 MB → 2.3 MB**), and a further 13.9 MB of oversized PNGs were converted
(**→ 1.2 MB**). `public/` is 4.6 MB in total, down from 68 MB.

**The untouched originals are preserved in `recovery/assets/`** — all 89 files
referenced by the real pages, plus the two Arabic-named blog featured images.
