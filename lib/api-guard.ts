import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { siteConfig } from '@/content/site';

/**
 * Shared protection for the public form endpoints (/api/quote, /api/contact,
 * /api/newsletter). They send email on every accepted request, so without
 * limits they are an easy way to flood the company inbox or burn the email
 * provider's quota. Each request goes through, in order:
 *
 *  1. Origin check — browsers always send `Origin` on a POST from fetch; one
 *     that names another site is refused, so third-party pages can't post
 *     through visitors' browsers. Requests without the header (curl, etc.)
 *     are left to the rate limit.
 *  2. Rate limit — fixed window per client IP and endpoint.
 *  3. Body limits — JSON content type only, at most MAX_BODY_BYTES.
 *  4. Honeypot — a hidden `website` field real visitors never see. Filled in
 *     means a bot: answer as if it worked and send nothing.
 *  5. Schema validation (zod), which also caps every field's length.
 */

const MAX_BODY_BYTES = 16 * 1024;
export const HONEYPOT_FIELD = 'website';

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

/**
 * In-memory, so it is per server instance and resets on restart — enough to
 * stop a single client hammering a form on one Node server. Behind several
 * instances or serverless, swap in a shared store (e.g. Upstash Redis).
 *
 * The IP comes from the leftmost x-forwarded-for entry, which is only
 * trustworthy behind a proxy that controls it. On Railway (where the site is
 * deployed) the edge proxy does, including through its CDN — verified live:
 * client-supplied values don't change the bucket. Re-check if the host changes.
 */
function rateLimited(key: string, limit: number, windowMs: number): number {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return 0;
  }
  bucket.count++;
  return bucket.count > limit ? Math.ceil((bucket.reset - now) / 1000) : 0;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

function originAllowed(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set(
    [
      request.headers.get('x-forwarded-host'),
      request.headers.get('host'),
      new URL(siteConfig.url).host,
      ...(process.env.ALLOWED_ORIGINS ?? '').split(','),
    ]
      .map((h) => h?.trim().replace(/^https?:\/\//, ''))
      .filter(Boolean),
  );
  return allowed.has(originHost);
}

const fail = (status: number, error: string, headers?: HeadersInit) =>
  NextResponse.json({ error }, { status, headers });

type Guarded<T> = { data: T; response?: undefined } | { data?: undefined; response: NextResponse };

export async function guardSubmission<S extends z.ZodType>(
  request: Request,
  schema: S,
  { name, limit, windowMs = 10 * 60 * 1000 }: { name: string; limit: number; windowMs?: number },
): Promise<Guarded<z.output<S>>> {
  if (!originAllowed(request)) return { response: fail(403, 'Forbidden') };

  const retryAfter = rateLimited(`${name}:${clientIp(request)}`, limit, windowMs);
  if (retryAfter) {
    return { response: fail(429, 'Too many requests', { 'Retry-After': String(retryAfter) }) };
  }

  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return { response: fail(415, 'Expected application/json') };
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return { response: fail(413, 'Payload too large') };
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return { response: fail(413, 'Payload too large') };
    payload = JSON.parse(raw);
  } catch {
    return { response: fail(400, 'Invalid JSON') };
  }

  if (payload && typeof payload === 'object' && (payload as Record<string, unknown>)[HONEYPOT_FIELD]) {
    console.warn('[%s] honeypot filled; submission dropped', name);
    return { response: NextResponse.json({ ok: true, delivered: false }) };
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { response: fail(422, 'Validation failed') };
  }
  return { data: parsed.data };
}

/**
 * Sends a plain-text email through Resend. Returns null when no API key is
 * configured (callers log and accept, so forms work in development).
 */
export async function sendEmail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.QUOTE_FROM ?? `Piris Road <noreply@${new URL(siteConfig.url).hostname}>`,
        to: [to],
        // Header values must stay on one line.
        subject: subject.replace(/[\r\n]+/g, ' ').slice(0, 200),
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('[email] provider error %s: %s', res.status, (await res.text()).slice(0, 500));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] delivery threw', err);
    return false;
  }
}
