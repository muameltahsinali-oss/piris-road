import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Admin sign-in.
 *
 * A single shared password (ADMIN_PASSWORD). Signing in sets an HttpOnly cookie
 * holding an expiry timestamp signed with HMAC-SHA256; nothing is kept on the
 * server. The signing key is ADMIN_SECRET, or derived from the password when
 * that isn't set — so changing either one signs everybody out.
 *
 * With no ADMIN_PASSWORD configured the dashboard stays locked entirely.
 */

export const SESSION_COOKIE = 'pr_admin';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

const sha256 = (s: string) => createHash('sha256').update(s).digest();

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

function signingKey(): Buffer | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return sha256(process.env.ADMIN_SECRET || `piris-road-admin:${password}`);
}

/** Constant-time comparison (hashing first makes the lengths equal). */
export function checkPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return timingSafeEqual(sha256(input), sha256(password));
}

const sign = (key: Buffer, payload: string) => createHmac('sha256', key).update(payload).digest('base64url');

export function createSessionToken(): string {
  const key = signingKey();
  if (!key) throw new Error('ADMIN_PASSWORD is not set');
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE);
  return `${exp}.${sign(key, exp)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const key = signingKey();
  if (!key || !token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) * 1000 < Date.now()) return false;
  const expected = Buffer.from(sign(key, exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function isAdmin(): Promise<boolean> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
}
