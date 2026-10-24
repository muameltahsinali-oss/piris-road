'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { rateLimited } from '@/lib/api-guard';
import {
  checkPassword,
  createSessionToken,
  requireAdmin,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/admin/auth';
import {
  CURRENCIES,
  isCollection,
  MESSAGE_STATUSES,
  PRIORITIES,
  QUOTE_STATUSES,
  removeMany,
  SUBSCRIBER_STATUSES,
  update,
  updateMany,
  type CollectionName,
  type Currency,
  type Deal,
  type Priority,
} from '@/lib/admin/store';
import { messageStatus, priorityMeta, quoteStatus, subscriberStatus } from '@/lib/admin/format';
import { encodeFlash, FLASH_COOKIE } from '@/lib/admin/flash';

const STATUSES: Record<CollectionName, readonly string[]> = {
  quotes: QUOTE_STATUSES,
  messages: MESSAGE_STATUSES,
  subscribers: SUBSCRIBER_STATUSES,
};

const LABELS: Record<CollectionName, Record<string, { label: string }>> = {
  quotes: quoteStatus,
  messages: messageStatus,
  subscribers: subscriberStatus,
};

const str = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

/** One-shot toast shown by the panel layout after the action re-renders it. */
async function flash(message: string) {
  (await cookies()).set(FLASH_COOKIE, encodeFlash(message), { path: '/admin', maxAge: 30, sameSite: 'strict' });
}

function done(message: string) {
  return flash(message).then(() => revalidatePath('/admin', 'layout'));
}

export async function login(form: FormData) {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  // 10 attempts per 15 minutes per IP.
  if (rateLimited(`admin-login:${ip}`, 10, 15 * 60 * 1000)) redirect('/admin/login?error=rate');
  if (!checkPassword(String(form.get('password') ?? ''))) redirect('/admin/login?error=1');

  (await cookies()).set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  redirect('/admin');
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/admin/login');
}

function target(form: FormData) {
  const collection = str(form, 'collection');
  const id = str(form, 'id');
  if (!isCollection(collection) || !id) throw new Error('Invalid target');
  return { collection, id };
}

function checkStatus(collection: CollectionName, status: string) {
  if (!STATUSES[collection].includes(status)) throw new Error('Invalid status');
  return status;
}

export async function setStatus(form: FormData) {
  await requireAdmin();
  const { collection, id } = target(form);
  const status = checkStatus(collection, str(form, 'status'));
  const label = LABELS[collection][status].label;
  await update(collection, id, { status } as never, { type: 'status', text: `تغيّرت الحالة إلى «${label}»` });
  await done(`تم تحديث الحالة إلى «${label}»`);
}

export async function saveNotes(form: FormData) {
  await requireAdmin();
  const { collection, id } = target(form);
  await update(collection, id, { notes: str(form, 'notes').slice(0, 5000) }, { type: 'note', text: 'تم تحديث الملاحظات الداخلية' });
  await done('تم حفظ الملاحظات');
}

export async function saveDeal(form: FormData) {
  await requireAdmin();
  const id = str(form, 'id');
  const amountRaw = str(form, 'amount').replace(/,/g, '');
  const amount = amountRaw ? Number(amountRaw) : undefined;
  if (amount != null && (!Number.isFinite(amount) || amount < 0)) throw new Error('Invalid amount');
  const currency = str(form, 'currency') as Currency;
  const priority = str(form, 'priority') as Priority;
  const followUpAt = str(form, 'followUpAt');
  const deal: Deal = {
    amount,
    currency: CURRENCIES.includes(currency) ? currency : 'USD',
    priority: PRIORITIES.includes(priority) ? priority : 'normal',
    assignee: str(form, 'assignee').slice(0, 80) || undefined,
    followUpAt: /^\d{4}-\d{2}-\d{2}$/.test(followUpAt) ? followUpAt : undefined,
  };
  const parts = [
    amount != null && `القيمة \u2066${amount} ${deal.currency}\u2069`,
    `الأولوية ${priorityMeta[deal.priority!].label}`,
    deal.assignee && `المسؤول ${deal.assignee}`,
    deal.followUpAt && `المتابعة \u2066${deal.followUpAt}\u2069`,
  ].filter(Boolean);
  await update('quotes', id, { deal }, { type: 'deal', text: `تحديث بيانات الصفقة: ${parts.join('، ')}` });
  await done('تم حفظ بيانات الصفقة');
}

export async function deleteRecord(form: FormData) {
  await requireAdmin();
  const { collection, id } = target(form);
  await removeMany(collection, [id]);
  await done('تم الحذف');
  const back = str(form, 'redirect');
  if (back.startsWith('/admin')) redirect(back);
}

/**
 * Bulk action from a list's checkboxes: the "delete" submit button, or
 * `op` = "status:<value>" from the action select.
 */
export async function bulkAction(form: FormData) {
  await requireAdmin();
  const collection = str(form, 'collection');
  if (!isCollection(collection)) throw new Error('Invalid collection');
  const ids = form.getAll('ids').map(String).filter(Boolean).slice(0, 500);
  const op = form.get('delete') ? 'delete' : str(form, 'op');
  if (!ids.length) {
    await flash('لم يتم تحديد أي عنصر');
    return;
  }
  if (op === 'delete') {
    const n = await removeMany(collection, ids);
    await done(`تم حذف ${n} عنصر`);
    return;
  }
  if (op.startsWith('status:')) {
    const status = checkStatus(collection, op.slice(7));
    const label = LABELS[collection][status].label;
    const rows = await updateMany(collection, ids, { status } as never, { type: 'status', text: `تغيّرت الحالة إلى «${label}» (إجراء جماعي)` });
    await done(`تم تحديث ${rows.length} عنصر إلى «${label}»`);
    return;
  }
  throw new Error('Invalid operation');
}
