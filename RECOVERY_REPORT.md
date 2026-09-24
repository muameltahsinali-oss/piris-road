# Phase 1 — Recovery Report

**Source file:** `aquamarine-gnat-712272.hostingersite.com-20260311-121537-620.wpress` (800 MB)
**Analysed:** 2026-09-12
**Method:** custom `.wpress` extractor → selective file extraction → MySQL dump parsed into SQLite → Elementor JSON / PHP-serialized data decoded.

Everything below marked **[FOUND]** is read directly out of the file. Anything marked **[INFERRED]** is a conclusion I drew from the data, with the reasoning shown. Nothing has been invented.

---

## 1. What this file actually is

It is **not** a WordPress XML/WXR export. It is an **All-in-One WP Migration backup archive** (`.wpress`) — a proprietary sequential container format (4377-byte header per entry: 255 B name, 14 B size, 12 B mtime, 4096 B path), created by plugin **v6.77**.

**[FOUND]** Archive manifest (`package.json`):

| Field | Value |
|---|---|
| SiteURL / HomeURL | `https://aquamarine-gnat-712272.hostingersite.com` (Hostinger temp preview domain) |
| WordPress | 6.9.1 |
| PHP | 8.3.30 |
| Database | MariaDB 11.8.3 |
| Template / Stylesheet | `avista` |
| Server path | `/home/u957531852/domains/.../public_html/wp-content` |

**Contents:** 14,902 entries / 735 MB uncompressed.

| Part | Size | Status |
|---|---|---|
| `database.sql` | 206.8 MB | **complete DB dump** (83 tables) |
| `uploads/` | 286.5 MB, 1,708 files | **complete media library** |
| `plugins/` | 179.5 MB, 11 plugins | complete |
| `themes/` | 17.4 MB (`avista`, `avista-child`, 3 WP defaults) | complete |
| `languages/`, `mu-plugins/`, `litespeed/` | 11.2 MB | complete |

**Important scope limit:** a `.wpress` archive only contains `wp-content` + the database. There is **no WordPress core, no `wp-config.php`, no root `.htaccess`** in this file. That is expected for the format — not damage.

### Technology stack **[FOUND]**
- **Theme:** Avista 1.0.1 by ThemeXriver ("Digital Agency & Portfolio") + `avista-child`. Commercial ThemeForest theme.
- **Page builder:** **Elementor 3.34.0 + Elementor Pro 3.34.0** — all page layouts are Elementor.
- **Plugins:** WooCommerce, `avista-core` (theme's custom Elementor widget pack), Secure Custom Fields (ACF fork), TranslatePress (multilingual EN ⇄ AR), Contact Form 7, Code Snippets, SVG Support, Safe SVG, One Click Demo Import.
- **SEO:** All in One SEO (AIOSEO) tables present.

---

## 2. Critical finding: real site vs. theme demo content

**[FOUND]** The database contains 25 published pages, but modification timestamps split them cleanly into two groups:

| Date | What happened |
|---|---|
| 2025-10-18/19 | WordPress + WooCommerce install, sample products |
| **2025-12-31** | **Avista theme demo content imported** (One Click Demo Import) — 20 pages, 18 headers, 10 footers, dummy team member, all at the *identical* timestamp `15:26:46` |
| 2026-01-08 → **2026-03-08** | **The owner's real work on Piris Road** |
| 2026-03-11 | Backup taken |

**[FOUND]** The **active navigation menu** (`theme_mods_avista` → `nav_menu_locations: {main-menu: 63}` → term 63 "My Menu") contains only 5 top-level items. This is the authoritative sitemap of the live site:

```
Home  →  /  (page 15, set as front page via show_on_front=page, page_on_front=15)
About →  /about/
Our Services → /our-services/
   ├ Sea Freight Solutions
   ├ Air Freight
   ├ Cold Chain
   ├ Warehousing and Inventory
   ├ Cross-Border Road Transport
   ├ Customs Clearance and Trade
   └ Project Cargo and Heavy Lift
Blog  →  /blog/
Contact us → /contact-us/
```

The other four menus (`Main Menu`, `Main Menu H_2`, `One Page Menu`, `One Page Menu H_2`) are the untouched demo menus and point at `Home 02/03/04`, `Home 01 Dark`, `Shop`, `Pricing`, `Faqs`, `Our Team`.

**[INFERRED]** The real website is a **5-page logistics/freight-forwarding site plus 7 service detail pages and a blog**. The remaining ~20 pages (`Home 02/03/04`, the four `… Dark` variants, the four `… Onepage` variants, `Shop`, `Cart`, `Checkout`, `My account`, `Pricing`, `Faqs`, `Our Team`, `Sample Page`) are **unmodified Avista demo/WooCommerce scaffolding that was never part of the real site.** Reasoning: they are not in the active menu, they retain the bulk demo-import timestamp, and their content is still Avista's agency copy.

---

## 3. The business **[FOUND]**

**Piris Road** — logistics / freight forwarding company operating in Iraq.

| | |
|---|---|
| Site title | `Piris Road` (option `blogname`) |
| Tagline | *(empty)* |
| Address | Cavalli Tower (B12-07), Gulan St. Waziran, **Erbil, Iraq** |
| Phones | `+9647870008888`, `+9647503050108` |
| Emails | `info@pirisroad.iq`, `ops@pirisroad.iq` |
| Hours | 8 AM – 4 PM (Everyday Except Friday & Saturday) |
| Facebook | `facebook.com/pirisroad.iq` |
| Instagram | `instagram.com/pirisroad.iq` |
| LinkedIn | `linkedin.com/company/pirisroad` |
| X/Twitter | icon present, **no URL set** |
| Copyright | `© Copyright 2025, Piris Road All Rights Reserved.` / footer: `© All rights reserved` + `Piris Road 2026` |
| WP admin account | `info@manarahsolutions.com` (single administrator, registered 2025-12-31) |

**[INFERRED]** The intended production domain is `pirisroad.iq` (from the email addresses and social handles); the site was still running on the Hostinger preview domain when the backup was made.

---

## 4. Pages and their complete content

All page layouts are stored as Elementor JSON in `postmeta._elementor_data`, **fully recovered and decoded**. In addition, `postmeta._elementor_element_cache` contains Elementor's **fully-rendered HTML output** for each page (e.g. 76 KB for Home) — so the original markup is recoverable too, not just the data.

Decoded outlines: `recovery/OUTLINE.txt`; full field-level dumps: `recovery/elementor/*.txt`.

### 4.1 Home — page 15, front page (59.5 KB of Elementor data)

| # | Widget | Real recovered content |
|---|---|---|
| 1 | `html` (custom) **mobile/tablet only** | Custom-coded hero `.pr-hero` — full HTML+CSS recovered (see §7) |
| 2 | `tx_hero_section` **desktop only** | "Available for New Projects" / **"Driving Logistics<br>Excellence"** / "Reliable multimodal transportation, customs clearance, and supply chain management for complex and time-critical shipments." / CTA "Contact Us" → `/contact-us/` + "ops@pirisroad.iq" → `mailto:`; rotating labels: "Logistics Built on Precision, Compliance, and Trust", "Where Global Standards Meet Local Expertise", "Engineering Smarter Logistics Solutions" |
| 3 | `tx_about` | "About US" / **"A Strategic Logistics Partner Built for Demanding Markets"** + long description; 3 feature boxes (Operational Excellence, Compliance and Safety, Industry-Focused Solutions); counters `10+` Years of Experience, `1000+` Happy Clients, `4.9/5`; ISO gallery (9001 / 14001 / 45001) |
| 4 | `tx_team_lists` | "Piris Road" / "Driving Growth Through Logistics Excellence" — **6 industries served**, each with an SVG icon: Oil and Gas, Technology and Telecom, Government and Public Sector, Defense and Secure Transport, Commercial and Industrial, Medical and Pharmaceutical Logistics |
| 5 | `tx_moving_text` | Two marquee rows: "End-to-End Logistics Solutions", "Reliable Freight Forwarding Worldwide", "Compliance-Driven Supply Chain Services" / "Moving Business Without Delays", "Precision Logistics for Critical Cargo", "From Port to Door, We Deliver" |
| 6 | `tx_about` (style_2) | "Features" / **"Why Businesses Rely on Piris Road for Mission-Critical Shipments"**; 3 value cards (Customer-Centric Mind, Results-Driven, Collaboration); 3 USP blocks with real copy; `50+` Satisfied Clients |
| 7 | `tx_brand` | "Partners" / "Global Networks Supporting Local Excellence" — 4 partner logos |
| 8 | `tx_service_section` | **hidden on all breakpoints** — dead demo section (still says "Web Design & Development") |
| 9 | `tx_service_section` (style_2) | "Services" / "Some of Services" — **4 real service cards** (Sea Freight, Air Freight, Cross-Border Road, Cold Chain) each with description + 3–4 keyword tags, linking to the real service pages |
| 10 | `tx_cta` | "Let's Work" / "Together!" / CTA "Get started today"; counter `5+ industries We Serve !` — **description still holds Avista demo text** |
| 11 | `tx_pricing_section` | "Values" / **"Our Philosophy ."** — 3 panels: **Our Vision**, **Our Mission**, **Our Values** (with 5 listed values) — full real copy |
| 12 | `tx_service_section` (style_3) | "[Process]" / **"Our Working process"** — Step 01 Shipment and Risk Assessmen[t], Step 02 Transport Strategy Development, Step 03 Documentation and Regulatory Processing |
| 13 | `tx_tabs` | "Awards" + "FAQs / Learn more from FAQs"; certification list **ISO 9001, ISO 14001, ISO 45001**. Tab bodies still demo ("Tab Heading", "Description") |
| 14 | `tx_post_grid` | "Press Release" / **"Logistics Insights & Industry Updates"** + description; pulls the 2 real blog posts |

### 4.2 About — page 23 (26.3 KB)
Hero `tx_about` + `tx_team_lists` (same two blocks as Home) → heading **"Our Story"** + `tx_service_section` style_3 timeline: **Company Foundation** ("Founded to provide structured and compliant freight services across regional trade routes"), **Expansion of Multimodal Services**, **Industry Certifications and Network Memberships** → `tx_about` style_5 **"Ceo Message"** (author **"Nyaz"**) restating Vision & Mission → `tx_testimonial` style_2 "Client success stories that inspire trust and growth." (**testimonial bodies are still demo — "John Doe"**) → `tx_cta` style_2.

### 4.3 Our Services — page 25 (16.9 KB)
`tx_service_section` style_2 (4 cards: Sea Freight, Air Freight, Cross-Border Road, Cold Chain) + style_7 (3 cards: Warehousing/Storage/Inventory, Customs Clearance and Regulatory Compliance, Project Cargo and Heavy Lift) — **all 7 services with descriptions and SEO keyword tags**. Then `tx_about` style_4 with a real client quote ("Piris Road has been a reliable logistics partner for our operations…") and counters (`1000+`, `4.8/5`, "50+ Happy clients", "Proven Experiences — With over a decade of hands-on logistics experience…").

### 4.4 Contact us — page 29 (12.4 KB)
`tx_cta` style_2 ("Need more assistance?" / "Book a personalized call" / "Get a Qoute" [sic] → Get-a-Quote page / "Response time: 1 hours") → 3-column info block:
- **Find us Here** — Cavalli Tower (B12-07), Gulan St. Waziran, Erbil, Iraq
- **Get In touch** — +9647870008888 / +9647503050108 / info@pirisroad.iq
- **Training Hours** — 8 AM - 4 PM (Everyday Except Friday & Saturday)

→ `google_maps` widget, address value **`baghdad`** (inconsistent with the Erbil street address — recovered as-is, not corrected).

### 4.5 Get a Quote — page 3821, slug `/elementor-page-3821/`
Single `shortcode` widget: `[contact-form-7 id="2f5f260" title="Contact form H_2"]`. This is the freight-quote form (§8). **[FOUND]** The header CTA button and the Contact-page CTA both link here.

### 4.6 Blog — page 35
**Empty content, `_wp_page_template: default`.** **[INFERRED]** It rendered the theme's standard blog archive (it is `page_for_posts`), not an Elementor layout. No custom blog design exists in the file.

### 4.7 Service detail pages — 7 × `services` CPT
Rendered by Elementor Pro theme-builder template **3513** (`_elementor_conditions: include/singular/services`):
`image` (featured) → heading "About This Service" → `theme-post-content` → `gallery` → `tx_service_section` style_6 "Why Choice Us" → `tx_cta` style_2 → `[services_nav]` prev/next.

Each service has **[FOUND]** full body copy, a featured SVG, and **4 ACF feature cards** (`c1_title`/`c1_content` … `c4_title`/`c4Content`):

| Service | ACF cards |
|---|---|
| Sea Freight Solutions (FCL & LCL Shipping) | Global Carrier Network · End-to-End Management · Customs & Port Expertise · Cost Optimization |
| Air Freight and Time-Critical Cargo Services | Priority Cargo Handling · Continuous Tracking · Regulatory Compliance · Fast Door-to-Door Delivery |
| Domestic and Cross-Border Road Transport Solutions | Cross-Border Expertise · Secure Transport Operations · Flexible Fleet Options · Route Optimization |
| Cold Chain and Temperature-Controlled Logistics | Temperature Monitoring · Pharmaceutical Compliance · Specialized Equipment · Risk-Controlled Handling |
| Warehousing and Inventory Management Services | Secure Storage Facilities · Inventory Visibility · Distribution Support · Scalable Capacity |
| Customs Clearance and Trade Compliance Services | *(recovered — see `recovery/CONTENT.txt`)* |
| Project Cargo and Heavy Lift Logistics Solutions | *(recovered — see `recovery/CONTENT.txt`)* |

The ACF `gallery` field is defined but **empty on every service**.

### 4.8 Blog posts — 3 published `post`s (Gutenberg blocks, fully recovered)
1. **How to Choose the Right Freight Mode for Your International Shipments** (2026-01-12) — cat *Freight Forwarding & Transport*; tags *freight forwarding*, *international shipping sea freight services*, *air freight solutions*; featured `2026/01/1.svg`
2. **Škoda Logo: What It Represents for Traders and Business Owners** (2026-01-31)
3. **The Impact of Taxes on the Iraqi Market: A Trader's Perspective** (2026-01-31)

Blog categories created (mostly unused): Logistics Insights (2), Freight Forwarding & Transport (1), Customs & Trade Compliance (0), Cold Chain & Medical Logistics (0), Project Cargo & Heavy Lift (0), Industry Solutions (0).

### 4.9 Not part of the real site
18 WooCommerce **sample** products (V-Neck T-Shirt, Hoodie, Beanie, Cap, Canon Camera…) with sample categories — standard WooCommerce dummy data, not logistics products. One demo `teams` entry ("Melissa Lee", ×2).

---

## 5. Header & footer **[FOUND]**

`avista_theme_options` → `header_style: 2582`, `footer_style: 2686`. Page-level overrides exist in `tx_page_meta` but the theme only honours them when `meta_header_type` is truthy (`inc/classes/class-avista-helper.php:28`), and it is `"0"` on every page — **so every page uses Header 1 (2582) and Footer 1 (2686).** (Home stores a stale `meta_header_style: 2886`; it never took effect.)

### Header 1 — post 2582, last edited 2026-03-08 17:31 (the most recent edit in the whole site)
Two `tx_headers` widgets: one desktop-only, one `.mobilehaed` mobile-only.
- Desktop logo `2025/11/logo-png-file-copy-scaled.png`; mobile logo `2025/12/black-font-svg-file.svg`
- CTA button **"Get a Quote"** → `/elementor-page-3821/`
- Off-canvas panel: "We're on social media:" + 4 social icons; "Stay Inspired with Instagram" + 5-image gallery (`right-pic.png`, `left-pic.png`, `4-reefer.png`, `2-cross-borader.png`, `1-sea-freight.png`)
- Nav = "My Menu" (§2)

### Footer 1 — post 2686
- White logo `2026/01/white-font-transparency-png-...-scaled.png`
- **About Us** — text is still `Lorem ipsum dolor sit amet, consectetur adipiscing elit.` *(never replaced)*
- **Newsletter** — "Keep up out latest update subscribe our newsletter!" + CF7 form
- **Quick Navigation** — About us / Services / Contact Us
- **All Page** — Home / Contact / Blogs
- **Contact Us** — info@pirisroad.iq · +9647503050108 · +9647870008888
  *(note: the `+9647503050108` label links to `tel:+9647870008888` — a real bug in the original)*
- Copyright `© All rights reserved <span class="copyright-year"></span>` + `Piris Road 2026`
- `big_title` = **"Avista"** *(leftover demo branding rendered in the footer)*

---

## 6. Recovered visual design system **[FOUND]**

This is the strongest part of the recovery — the palette, fonts and custom CSS are all present.

### Colour tokens
`avista_theme_options` sets, and `themes/avista/inc/avista-custom-css.php:31-32` maps them to CSS variables:

| Token | Value | Role |
|---|---|---|
| `--as-clr-pr-1` (`theme_color_1`) | `#244bdd` | primary blue |
| `--as-clr-pr-3` (`theme_color_2`) | `#ffc200` | accent yellow |
| `--theme-color` (overridden in Additional CSS) | `#3361e5` | primary blue (actual) |
| `--as-clr-h-1` / `--as-clr-h-2` | `#0a0a0a` / `#000000` | headings |
| `--as-clr-p-1` / `--as-clr-p-2` | `#3E3E3E` / `#515151` | body text |

From the service-page custom CSS (post 3513) — an explicit brand ramp:
```css
--blue-dark: #002EAF;  --blue-main: #244BDD;  --blue-light: #5FA3FF;
--blue-soft: #D0E6FC;  --accent-yellow: #FFC200;  --text-dark: #0b1c3d;
```
Hero gradients: `linear-gradient(135deg,#3d63f5,#3558e6)` (custom hero), `linear-gradient(-135deg,#244BDD,#5FA3FF)` (theme hero). Scrollbar: thumb `#4f7cff→#3361e5` on track `#0e1220`. Language switcher `#3558e6`.

**[INFERRED]** Avista ships orange/red defaults (`#fd3f00`/`#fb0d1f`); the owner re-skinned it to blue — corroborated by an Elementor snippet literally named **"orange to blue"**. Several leftover `page_scroll_color: #fd3f00` values remain on About/Contact/service pages.

### Typography
- **Aeonik** is the brand font. **[FOUND]** Registered as a custom Elementor font: `@font-face { font-family:'Aeonik'; src:url('.../uploads/2026/02/Aeonik-Regular.ttf') format('truetype') }`, and forced site-wide in Additional CSS for both `html[lang="ar"]` and `html[lang="en"]`.
- **Only the Regular (400) TTF was ever uploaded** — no bold/medium/italic files exist in the archive.
- Theme fallbacks: `--as-font-1: "Inter", sans-serif`, `--as-font-2: "Geist Mono"`, `--as-font-3: "Mona Sans"`. Elementor CSS records *Archivo*, *Montserrat*, *Inter* used on some pages.

### Other recovered design facts
- Site logo option `site_logo: 3122`; theme `tx_logo` = `2025/12/logo-icon-svg-file.svg`, `tx_logo_width: 222`
- **Preloader enabled**, spinning `L-[logo]-A-D-I-N-G...` letter animation (`header.php`), image `2026/01/Untitled-design-11.svg`
- **Back-to-top button** enabled — but hidden via Additional CSS (`.wa-back-to-top{display:none}`)
- Breadcrumb enabled on all inner pages, background `2026/01/Untitled-design-224-scaled.webp`
- 404 page: "404" / "Oops! Page Not Found." / "Go Back to Home"
- Bottom-corner radius 120 px on the custom hero (60 px mobile); glassmorphism CTA card (`backdrop-filter: blur(20px)`)
- Entrance animations: `fadeSlideLeftBlur`, `fadeSlideRightBlur`, `fadeUpBlur`, staggered 1.1 s / 1.4 s / 1.8 s (waiting out the preloader)
- Libraries the theme loads: Bootstrap 5, Swiper, GSAP + SplitText, PixiJS, Magnific Popup, Odometer, Nice Select, Animate.css, Font Awesome 6
- **Bilingual EN/AR with full RTL handling** — ~120 lines of `html[lang="ar"]` / `html[dir="rtl"]` overrides in Additional CSS; TranslatePress floating switcher, bottom-right, `#3558e6`, rounded 14 px. 723 rows in the AR translation dictionary.

Full CSS: `recovery/css/additional_css_avista.css` (11.4 KB), `additional_css_avista-child.css` (2.3 KB), `elementor_custom_css_3513.css`.

---

## 7. HTML / CSS / JS / shortcodes **[FOUND]**

- **Custom hero** (`recovery/raw/raw_15_d50e350_html.html`, 5.1 KB) — a hand-written `<section class="pr-hero">` with inline `<style>`: gradient background, vertical marquee strip ("Meet Local Expertise Engineering Smarter Logistics Solutions Built On Trust"), rotated container photo (`drop-shadow`, `rotate(-8deg)`), glass CTA card with `#ffc400` button, h1 `clamp(48px,5vw,70px)`, full responsive + keyframe animations. Comments are in Arabic. **This is original design code, recovered verbatim.**
- **Code Snippets:** 12 snippets, **only one active** — `[services_nav]`, a PHP shortcode rendering prev/next service links (`services_prev_next_shortcode`). The 11 inactive ones are experiments (RTL forcing, preloader hiding, counterUp shim, lowercase filenames).
- **Shortcodes in use:** `[contact-form-7 id="2f5f260" …]`, `[services_nav]`.
- Two empty `elementor_snippet` posts ("orange to blue", "rem avista") and two empty draft pages (3729, 3731).

---

## 8. Forms, buttons and CTAs **[FOUND]**

All 6 Contact Form 7 definitions recovered in full.

| # | Form | Where | Fields |
|---|---|---|---|
| **2478** | **Contact form H_2** | **Get a Quote page (3821)** | The real freight-quote form: *Shipping Information* — loading place/country, unloading place/country, number of colli, weight, length, width, height, kind of commodity, additional info; *Company Information* — company name, VAT number, address, postal number, city, country, phone, email, your name; privacy-policy acceptance; Send |
| 6 | Contact form H_1 | demo | full name, email, message, newsletter checkbox, "Submit Now" |
| 2360 | Contact form H_3 | demo | same, placeholder style |
| 2678 | Footer Newsletter H_1 | **Footer 1** | email → "Subscribe" |
| 2763 | Footer Newsletter H_2 | demo | email → "Subscribe" |
| 3065 | Contact form 1 | unused | CF7 default |

**Finding:** every form's notification `From:`/`To:` is still `wabidullahsharif@gmail.com` — **the theme author's address from the demo import.** Quote submissions were very likely never reaching Piris Road. `wp_e_submissions` (Elementor forms) is empty, and there are no stored CF7 submissions, so **no historical form data is in the archive.**

### Primary CTAs
| Label | Target |
|---|---|
| "Get a Quote" (header, both variants) | `/elementor-page-3821/` |
| "Contact Us" (hero) | `/contact-us/` |
| "ops@pirisroad.iq" (hero) | `mailto:ops@pirisroad.iq` |
| "Get a Qoute" (Contact + service pages) | `/elementor-page-3821/` |
| "More Services" | `/our-services/` |
| "Get started today" / "Get started" | `/contact-us/` |
| "More Blog" | `/blog/` |
| "Read More" (blog cards) | post permalink |
| Footer email/phones | `mailto:` / `tel:` |

**Broken links found in the original:** three home-page value cards link to `/services/smart-schedule-control/` — **a service that does not exist** in the database (leftover demo slug). Footer phone mismatch noted in §5.

---

## 9. Dynamic functionality **[FOUND / INFERRED]**

**[FOUND]** in the file: Elementor Pro theme-builder singular template for `services`; ACF field group "Services" (9 fields, `post_type == services`); `[services_nav]` prev/next; CF7 AJAX forms + newsletter; TranslatePress EN⇄AR with floating switcher and 723 dictionary rows; `tx_post_grid` pulling latest posts; Swiper carousels (services, testimonials, brands); GSAP/PixiJS scroll and hover animations; Odometer counters; Magnific Popup galleries/video; preloader; sticky/offcanvas header; breadcrumbs; WooCommerce cart/checkout/account (sample data only); AIOSEO meta.

**[INFERRED]** WooCommerce was installed during setup and never used for the logistics business — 18 untouched sample products, zero orders in `wc_orders`. **A rebuild does not need e-commerce.**

---

## 10. Media & assets **[FOUND]**

- **1,708 files** in `uploads/` (286.5 MB); **330 attachments** registered in the DB.
- I resolved every media URL referenced by the real pages, header, footer, theme options and service/blog posts: **89 distinct files — all 89 are present in the archive. Zero missing.** Full list with sizes: `recovery/MEDIA.txt`. Copied to `recovery/assets/`.
- Logos recovered: `logo-icon-svg-file.svg`, `black-font-svg-file.svg`, `logo-png-file-copy-scaled.png`, `logo-png-file-scaled.png`, `white-font-transparency-png-...-scaled.png`.
- Real photography/illustration: container ship shots (`1-sea-freight.png`, `2-cross-borader.png`, `3-air-cargo.png`, `4-reefer.png`, `left-pic.png`, `right-pic.png`, `row-1/2/3-column-1.png`, `Untitled-design-223-scaled-1.webp`), 6 industry SVG icons, 7 service SVGs, ISO 9001/14001/45001 badges, 4 partner logos.
- ⚠️ Several service SVGs are **traced bitmaps of 2–5.6 MB each** (`wfegrthyj.svg` 5.6 MB, `effas.svg` 4.8 MB, `qawees.svg` 4.2 MB). They will need conversion/optimisation.
- Theme-demo decorative assets are also present (`a1-shape-*.webp`, `star.webp`, `h1-man.webp`, `p1-cloud*.webp`, `s1-*.webp`, `btn-icon.svg`).
- Font: `uploads/2026/02/Aeonik-Regular.ttf` (Regular only).

---

## 11. Security check (because the site was hacked)

I scanned the recovered database (posts, postmeta, options) and every extracted PHP/JS/CSS/HTML file for common infection markers (`eval`, `base64_decode`, `gzinflate`, `str_rot13`, `shell_exec`, `assert`, `create_function`, hidden iframes, `wp-vcd`, known webshell strings).

- **Database: 0 real hits.** 6 pattern matches were all false positives — random substrings (`POpeN`, `poPEn`) inside base64-encoded SVG data in attachment metadata.
- **Files: 0 real hits.** 37 matches were all legitimate library code — PixiJS, GSAP SplitText, TGM Plugin Activation, and the Code Snippets plugin's own `eval()` (that is the plugin's core feature).
- **Users:** exactly one account, `info@manarahsolutions.com`, administrator. **No injected admin users.**
- Only 1 of 12 code snippets is active, and it is benign.

**Conclusion:** the *content* in this archive (database, theme, uploads, `avista-core`, `code-snippets`) appears clean and safe to reuse. **Important caveats:** (a) `.wpress` contains no WordPress core, so if the compromise lived in core files or `wp-config.php`, it is not in this file and not visible to me; (b) I scanned the plugins I extracted, not the ~160 MB of WooCommerce/Elementor/TranslatePress/SCF vendor code I skipped as public third-party code. This is a heuristic scan, not a forensic audit. Rebuilding on Next.js — carrying over only text, images and CSS, and no PHP — sidesteps the risk entirely.

---

## 12. Recovery scorecard

### ✅ Fully recovered (high confidence)
- What the file is, the exact stack and versions
- The real sitemap, via the active navigation menu
- **100 % of text content** on all 5 real pages, 7 service pages and 3 blog posts (Elementor JSON + Gutenberg blocks)
- Header and footer composition, logos, menus, CTAs, social links, contact details
- **All 89 referenced media files — nothing missing**
- The complete colour palette, the brand font identity, and every line of custom CSS (13.7 KB)
- The hand-written hero section's HTML + CSS + animations, verbatim
- All 6 form definitions, including the real freight-quote form
- All custom PHP/JS snippets; ACF field definitions; SEO metadata
- Elementor's **rendered HTML output** per page, cached in `postmeta`
- Which content is real vs. theme demo, evidenced by timestamps

### 🟡 Partially recoverable
- **Exact pixel layout.** I have the content, the structure and the tokens — but the visual arrangement of each `tx_*` widget lives in the Avista theme's PHP view templates (`avista-core/elementor-widgets/tx-*/views/view-N.php`) plus a 307 KB `avista-core.css`. Those files *are* in the archive, so the layout is reconstructable by reading them — but it is interpretation work, not a direct export. The `_elementor_element_cache` rendered HTML narrows this considerably.
- **Typography scale.** Font family is certain; per-element sizes/weights are spread across theme CSS and per-widget Elementor overrides. Only Aeonik Regular exists as a file, so bold text was being synthesised or falling back.
- **Arabic content.** 723 dictionary rows recovered, but I have not verified coverage per string; the AR site may have been partial.
- **Animation timing/easing** — recovered for the custom hero; theme-widget animations are driven by GSAP/PixiJS code that would need reading.

### ❌ Missing / not in the file
- Any screenshot or visual reference of the original site — **nothing shows what it actually looked like**
- WordPress core, `wp-config.php`, root `.htaccess` (not part of `.wpress` by design)
- Aeonik Bold/Medium/Italic font files
- The intended production domain's live content (site was on the Hostinger preview URL)
- Historical form submissions, analytics, or order data
- A blog index design (page 35 is empty; theme default was used)
- Real testimonial content, real tab/FAQ bodies, footer About text, and the `tx_cta` description — **these were still Avista demo text on the live site**
- Google Maps: only the string `baghdad`; no coordinates or embed key

### Confidence assessment

| Dimension | Confidence | Basis |
|---|---|---|
| Content & copy | **Very high (~98 %)** | Direct from DB |
| Sitemap & navigation | **Very high** | Active menu + front-page option |
| Assets | **Very high** | 89/89 present |
| Colour palette | **Very high** | Explicit tokens + custom CSS |
| Brand font | **High** | Declared, file present (Regular only) |
| Section order per page | **Very high** | Elementor tree order + visibility flags |
| Component-level layout | **Medium-high** | Needs reading theme view templates + cached HTML |
| Exact typographic scale / spacing | **Medium** | Distributed across 307 KB theme CSS |
| Pixel-perfect visual replica | **Not achievable from this file alone** | No screenshots; layout is emergent from a commercial theme's CSS |

**Bottom line:** structure and content can be reconstructed with very high fidelity. The *design* can be reconstructed faithfully **in spirit** — correct palette, correct font, correct section order, correct copy, correct imagery, and the one hand-coded section reproduced exactly. A pixel-identical clone of the Avista theme's rendering is not achievable from this file without treating the theme's 307 KB CSS as the spec, and I will not claim the rebuild is identical to the original.

---

## 13. Where the recovered data lives

```
recovery/
├── OUTLINE.txt                  section-by-section outline of every real page
├── CONTENT.txt                  full text of services, posts, teams + SEO metadata
├── MEDIA.txt                    all 89 asset URLs, verified present, with sizes
├── wpress_file_index.tsv        complete 14,902-entry archive index
├── elementor/elementor_*.txt    field-level dumps per page (incl. header/footer/templates)
├── css/                         recovered custom CSS (site-wide + per-template)
├── raw/                         custom HTML widgets + shortcodes, verbatim
└── assets/                      the 89 original media files (84 MB)
```
