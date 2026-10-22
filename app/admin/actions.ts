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
  isCollection,
  MESSAGE_STATUSES,
  QUOTE_STATUSES,
  remove,
  SUBSCRIBER_STATUSES,
  update,
  type CollectionName,
} from '@/lib/admin/store';

const STATUSES: Record<CollectionName, readonly string[]> = {
  quotes: QUOTE_STATUSES,
  messages: MESSAGE_STATUSES,
  subscribers: SUBSCRIBER_STATUSES,
};

const str = (form: FormData, key: string) => String(form.get(key) ?? '');

export async function login(form: FormData) {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  // 10 attempts per 15 minutes per IP.
  if (rateLimited(`admin-login:${ip}`, 10, 15 * 60 * 1000)) redirect('/admin/login?error=rate');
  if (!checkPassword(str(form, 'password'))) redirect('/admin/login?error=1');

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

export async function setStatus(form: FormData) {
  await requireAdmin();
  const { collection, id } = target(form);
  const status = str(form, 'status');
  if (!STATUSES[collection].includes(status)) throw new Error('Invalid status');
  await update(collection, id, { status } as never);
  revalidatePath('/admin', 'layout');
}

export async function saveNotes(form: FormData) {
  await requireAdmin();
  const { collection, id } = target(form);
  await update(collection, id, { notes: str(form, 'notes').slice(0, 5000) });
  revalidatePath('/admin', 'layout');
}

export async function deleteRecord(form: FormData) {
  await requireAdmin();
  const { collection, id } = target(form);
  await remove(collection, id);
  revalidatePath('/admin', 'layout');
  const back = str(form, 'redirect');
  if (back.startsWith('/admin')) redirect(back);
}
