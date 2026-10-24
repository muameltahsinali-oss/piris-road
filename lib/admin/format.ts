import type { Currency, MessageStatus, Priority, QuoteStatus, SubscriberStatus } from './store';

/** Dashboard copy is Arabic; dates use the company's timezone (Erbil). */
export const TIME_ZONE = 'Asia/Baghdad';

const dateTime = new Intl.DateTimeFormat('ar', {
  numberingSystem: 'latn',
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const shortDay = new Intl.DateTimeFormat('ar', { numberingSystem: 'latn', timeZone: TIME_ZONE, day: 'numeric', month: 'short' });
const dayKeyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatShortDay = (d: Date) => shortDay.format(d);
/** YYYY-MM-DD in the company timezone. */
export const dayKey = (d: Date | string) => dayKeyFmt.format(typeof d === 'string' ? new Date(d) : d);
export const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);

export function timeAgo(iso: string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'الآن';
  const m = Math.round(s / 60);
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.round(h / 24);
  if (d < 30) return `قبل ${d} يوم`;
  return formatDateTime(iso);
}

type Tone = 'info' | 'progress' | 'good' | 'bad' | 'neutral';
type StatusMeta = { label: string; tone: Tone };

export const quoteStatus: Record<QuoteStatus, StatusMeta> = {
  new: { label: 'جديد', tone: 'info' },
  in_progress: { label: 'قيد المعالجة', tone: 'progress' },
  quoted: { label: 'تم إرسال العرض', tone: 'progress' },
  won: { label: 'مقبول', tone: 'good' },
  lost: { label: 'مرفوض / مغلق', tone: 'bad' },
};

export const messageStatus: Record<MessageStatus, StatusMeta> = {
  new: { label: 'جديدة', tone: 'info' },
  read: { label: 'مقروءة', tone: 'neutral' },
  replied: { label: 'تم الرد', tone: 'good' },
  archived: { label: 'مؤرشفة', tone: 'neutral' },
};

export const subscriberStatus: Record<SubscriberStatus, StatusMeta> = {
  active: { label: 'نشط', tone: 'good' },
  unsubscribed: { label: 'ملغى', tone: 'neutral' },
};

/** Status badges always carry a text label, never colour alone. */
export const toneClass: Record<Tone, string> = {
  info: 'bg-blue-50 text-blue-800 ring-blue-200',
  progress: 'bg-amber-50 text-amber-800 ring-amber-200',
  good: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  bad: 'bg-rose-50 text-rose-800 ring-rose-200',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export const toneDot: Record<Tone, string> = {
  info: 'bg-blue-600',
  progress: 'bg-amber-500',
  good: 'bg-emerald-600',
  bad: 'bg-rose-600',
  neutral: 'bg-slate-400',
};

/** Digits only, for tel: and wa.me links. */
export const phoneDigits = (phone: string) => phone.replace(/[^\d+]/g, '');

/**
 * "From → To", isolated as left-to-right so the arrow keeps pointing at the
 * destination inside RTL text (place names come from the English form).
 */
export const route = (from: string, to: string) => `\u2066${from} → ${to}\u2069`;

export const priorityMeta: Record<Priority, StatusMeta> = {
  low: { label: 'منخفضة', tone: 'neutral' },
  normal: { label: 'عادية', tone: 'info' },
  high: { label: 'عالية', tone: 'progress' },
  urgent: { label: 'عاجلة', tone: 'bad' },
};

export const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

export function formatMoney(amount: number | undefined, currency: Currency = 'USD') {
  if (amount == null || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'IQD' ? 0 : 2 }).format(amount);
}

/** Today in the company timezone, YYYY-MM-DD — for follow-up due checks. */
export const today = () => dayKey(new Date());

export function followUpState(date: string | undefined): 'overdue' | 'today' | 'upcoming' | null {
  if (!date) return null;
  const t = today();
  return date < t ? 'overdue' : date === t ? 'today' : 'upcoming';
}

export const followUpLabel = { overdue: 'متأخرة', today: 'اليوم', upcoming: 'قادمة' } as const;

export function formatDay(key: string) {
  return new Intl.DateTimeFormat('ar', { numberingSystem: 'latn', timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${key}T00:00:00Z`),
  );
}

/** Hours between two ISO timestamps, or null. */
export const hoursBetween = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000;

export function formatDuration(hours: number | null) {
  if (hours == null) return '—';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} دقيقة`;
  if (hours < 48) return `${Math.round(hours)} ساعة`;
  return `${Math.round(hours / 24)} يوم`;
}

/** Percent change vs. a previous period; null when there is nothing to compare. */
export function delta(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Hours from arrival to the first status change — how fast the team picks a request up. */
export function firstResponseHours(r: { createdAt: string; history?: Array<{ type: string; at: string }> }): number | null {
  const first = r.history?.find((e) => e.type === 'status');
  return first ? hoursBetween(r.createdAt, first.at) : null;
}
