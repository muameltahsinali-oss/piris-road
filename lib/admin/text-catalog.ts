import { createHash } from 'node:crypto';
import catalog from '@/content/text-catalog.json';
import * as company from '@/content/company';
import { services } from '@/content/services';
import { posts } from '@/content/posts';
import { siteConfig } from '@/content/site';
import { defaultArabic } from '@/lib/i18n';
import { getTextOverrides } from '@/lib/text-overrides';

/**
 * Everything the text editor (/admin/texts) can change, grouped by where it
 * appears on the site.
 *
 * The list comes from content/text-catalog.json (every string the pages pass
 * through getTranslate, captured at build time — regenerate it with
 * `node scripts/text-catalog.mjs`) plus the blog posts, which are localised
 * field by field. Each string is placed in a group by looking it up in the
 * content modules it came from.
 */

export type TextEntry = {
  /** Stable id for forms and links (hash of the source string). */
  id: string;
  /** The English source string — the lookup key, never changed. */
  source: string;
  group: string;
  html: boolean;
  defaultEn: string;
  defaultAr: string;
  en: string;
  ar: string;
  editedEn: boolean;
  editedAr: boolean;
};

export type TextGroup = { key: string; label: string; section: string };

const GROUPS: TextGroup[] = [
  { key: 'layout', label: 'الترويسة والتذييل', section: 'عام' },
  { key: 'company:hero', label: 'الواجهة الرئيسية', section: 'الصفحة الرئيسية' },
  { key: 'company:aboutHome', label: 'من نحن (الرئيسية)', section: 'الصفحة الرئيسية' },
  { key: 'company:industries', label: 'القطاعات', section: 'الصفحة الرئيسية' },
  { key: 'company:movingText', label: 'الشريط المتحرك', section: 'الصفحة الرئيسية' },
  { key: 'company:features', label: 'المزايا', section: 'الصفحة الرئيسية' },
  { key: 'company:partnersSection', label: 'الشركاء', section: 'الصفحة الرئيسية' },
  { key: 'company:servicesHome', label: 'قسم الخدمات', section: 'الصفحة الرئيسية' },
  { key: 'company:ctaBand', label: 'شريط الدعوة للتواصل', section: 'الصفحة الرئيسية' },
  { key: 'company:philosophy', label: 'فلسفتنا', section: 'الصفحة الرئيسية' },
  { key: 'company:workingProcess', label: 'مراحل العمل', section: 'الصفحة الرئيسية' },
  { key: 'company:faqSection', label: 'الأسئلة الشائعة', section: 'الصفحة الرئيسية' },
  { key: 'company:insightsSection', label: 'قسم المدونة', section: 'الصفحة الرئيسية' },
  { key: 'company:aboutPage', label: 'صفحة من نحن', section: 'من نحن' },
  { key: 'company:storyTimeline', label: 'قصتنا', section: 'من نحن' },
  { key: 'company:ceoMessage', label: 'كلمة المدير التنفيذي', section: 'من نحن' },
  { key: 'company:testimonials', label: 'آراء العملاء', section: 'من نحن' },
  { key: 'company:provenBlock', label: 'قسم الإنجازات', section: 'من نحن' },
  { key: 'company:serviceDetail', label: 'نصوص صفحة الخدمة', section: 'الخدمات' },
  ...services.map((s) => ({ key: `service:${s.slug}`, label: s.cardTitle, section: 'الخدمات' })),
  { key: 'blog-ui', label: 'عناوين وأزرار المدونة', section: 'المدونة' },
  ...posts.map((p) => ({ key: `post:${p.slug}`, label: p.titleAr || p.title, section: 'المدونة' })),
  { key: 'contact', label: 'صفحة التواصل', section: 'التواصل وطلب السعر' },
  { key: 'company:contactBlock', label: 'نموذج «تحتاج مساعدة؟»', section: 'التواصل وطلب السعر' },
  { key: 'quote', label: 'صفحة ونموذج طلب السعر', section: 'التواصل وطلب السعر' },
  { key: 'site', label: 'معلومات الشركة', section: 'عام' },
  { key: 'notfound', label: 'صفحة غير موجودة', section: 'عام' },
  { key: 'general', label: 'نصوص أخرى', section: 'عام' },
];

const FILE_GROUPS: Record<string, string> = {
  'components/layout/Header.tsx': 'layout',
  'components/layout/Footer.tsx': 'layout',
  'app/[locale]/quote/page.tsx': 'quote',
  'app/[locale]/contact/page.tsx': 'contact',
  'components/blocks/ContactBlock.tsx': 'contact',
  'components/blocks/PostGrid.tsx': 'blog-ui',
  'app/[locale]/not-found.tsx': 'notfound',
  'components/blocks/Hero.tsx': 'company:hero',
};

/** Exports that share a group with another one. */
const COMPANY_ALIASES: Record<string, string> = { industriesSection: 'industries' };

/** Keys whose values are paths, links or ids rather than visible copy. */
const SKIP_KEYS = new Set(['slug', 'image', 'cardImage', 'href', 'icon', 'icons', 'src', 'url', 'mapQuery', 'homeSlugs', 'logos', 'social', 'emails', 'phones', 'date', 'modified']);

function collect(value: unknown, out: Set<string>, key = '') {
  if (SKIP_KEYS.has(key)) return;
  if (typeof value === 'string') {
    out.add(value);
    // Service bodies are rendered one paragraph at a time.
    if (value.includes('\n\n')) value.split('\n\n').forEach((p) => out.add(p));
  } else if (Array.isArray(value)) value.forEach((v) => collect(v, out));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) collect(v, out, k);
}

let groupOf: Map<string, string> | null = null;

function buildGroupIndex() {
  const index = new Map<string, string>();
  const claim = (strings: Set<string>, group: string) => strings.forEach((s) => index.has(s) || index.set(s, group));
  for (const [name, value] of Object.entries(company)) {
    const set = new Set<string>();
    collect(value, set);
    claim(set, `company:${COMPANY_ALIASES[name] ?? name}`);
  }
  for (const s of services) {
    const set = new Set<string>();
    collect(s, set);
    claim(set, `service:${s.slug}`);
  }
  const site = new Set<string>();
  collect(siteConfig, site);
  claim(site, 'site');
  return index;
}

export const idFor = (source: string) => createHash('sha1').update(source).digest('base64url').slice(0, 16);

/** All editable texts with their current values. */
export function getTextEntries(): TextEntry[] {
  groupOf ??= buildGroupIndex();
  const o = getTextOverrides();
  const entries: TextEntry[] = [];

  for (const { text, file } of catalog as Array<{ text: string; file?: string }>) {
    const defaultAr = defaultArabic(text) ?? '';
    const group = (file && FILE_GROUPS[file]) || groupOf.get(text) || 'general';
    entries.push(entry(text, group, false, defaultAr, o));
  }

  for (const p of posts) {
    entries.push(entry(p.title, `post:${p.slug}`, false, p.titleAr, o));
    entries.push(entry(p.excerpt, `post:${p.slug}`, false, p.excerptAr, o));
    entries.push(entry(p.body, `post:${p.slug}`, true, p.bodyAr, o));
  }
  return entries;
}

function entry(source: string, group: string, html: boolean, defaultAr: string, o: ReturnType<typeof getTextOverrides>): TextEntry {
  return {
    id: idFor(source),
    source,
    group,
    html,
    defaultEn: source,
    defaultAr,
    en: o.en[source] ?? source,
    ar: o.ar[source] ?? defaultAr,
    editedEn: source in o.en,
    editedAr: source in o.ar,
  };
}

/** Groups that have at least one entry, in display order. */
export function getTextGroups(entries: TextEntry[]) {
  return GROUPS.map((g) => {
    const rows = entries.filter((e) => e.group === g.key);
    return { ...g, count: rows.length, missing: rows.filter((e) => !e.ar).length, edited: rows.filter((e) => e.editedEn || e.editedAr).length };
  }).filter((g) => g.count > 0);
}
