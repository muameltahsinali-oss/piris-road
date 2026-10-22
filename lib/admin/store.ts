import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { QuoteData } from '@/lib/quote-schema';

/**
 * Submission store for the admin dashboard.
 *
 * Every accepted form submission (quote, contact, newsletter) is written here
 * before the email goes out, so nothing is lost when email delivery isn't
 * configured or fails. One JSON file per collection under DATA_DIR
 * (default `.data/` in the project root, git-ignored).
 *
 * On Railway the container filesystem is wiped on every deploy: mount a volume
 * and point DATA_DIR at it (e.g. DATA_DIR=/data), or the records reset.
 *
 * Writes are serialised through one promise chain and land via write-to-temp +
 * rename, so a crash mid-write never leaves a half-written file. This is meant
 * for a single Node instance and company-scale volumes (thousands of rows);
 * past that, move to a real database.
 */

export const QUOTE_STATUSES = ['new', 'in_progress', 'quoted', 'won', 'lost'] as const;
export const MESSAGE_STATUSES = ['new', 'read', 'replied', 'archived'] as const;
export const SUBSCRIBER_STATUSES = ['active', 'unsubscribed'] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];

type Base = {
  id: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  /** Whether the notification email was delivered (null = no provider configured). */
  delivered?: boolean | null;
};

export type QuoteRecord = Base & { status: QuoteStatus; data: Omit<QuoteData, 'privacy_policy'> };
export type MessageRecord = Base & {
  status: MessageStatus;
  data: { name: string; email: string; message: string; newsletter: boolean };
};
export type SubscriberRecord = Base & { status: SubscriberStatus; email: string; source: 'newsletter' | 'contact' };

export type Collections = {
  quotes: QuoteRecord;
  messages: MessageRecord;
  subscribers: SubscriberRecord;
};
export type CollectionName = keyof Collections;
export const COLLECTIONS: CollectionName[] = ['quotes', 'messages', 'subscribers'];

export const isCollection = (v: string): v is CollectionName => (COLLECTIONS as string[]).includes(v);

export const dataDir = () => path.resolve(process.env.DATA_DIR || '.data');
const fileFor = (name: CollectionName) => path.join(dataDir(), `${name}.json`);

export async function list<C extends CollectionName>(name: C): Promise<Collections[C][]> {
  try {
    const rows = JSON.parse(await fs.readFile(fileFor(name), 'utf8'));
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

export async function get<C extends CollectionName>(name: C, id: string) {
  return (await list(name)).find((r) => r.id === id) ?? null;
}

async function save<C extends CollectionName>(name: C, rows: Collections[C][]) {
  await fs.mkdir(dataDir(), { recursive: true });
  const target = fileFor(name);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), 'utf8');
  await fs.rename(tmp, target);
}

let queue: Promise<unknown> = Promise.resolve();

/** Read-modify-write one collection, serialised against every other write. */
function mutate<C extends CollectionName, R>(name: C, fn: (rows: Collections[C][]) => R): Promise<R> {
  const run = queue.then(async () => {
    const rows = await list(name);
    const result = fn(rows);
    await save(name, rows);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

const now = () => new Date().toISOString();

export function addQuote(data: QuoteData) {
  const { privacy_policy: _accepted, ...fields } = data;
  const t = now();
  const record: QuoteRecord = { id: randomUUID(), createdAt: t, updatedAt: t, notes: '', status: 'new', data: fields };
  return mutate('quotes', (rows) => {
    rows.unshift(record);
    return record;
  });
}

export function addMessage(data: MessageRecord['data']) {
  const t = now();
  const record: MessageRecord = { id: randomUUID(), createdAt: t, updatedAt: t, notes: '', status: 'new', data };
  return mutate('messages', (rows) => {
    rows.unshift(record);
    return record;
  });
}

/** Adds a subscriber, or reactivates an existing one with the same address. */
export function addSubscriber(email: string, source: SubscriberRecord['source']) {
  const t = now();
  const normalized = email.trim().toLowerCase();
  return mutate('subscribers', (rows) => {
    const existing = rows.find((r) => r.email === normalized);
    if (existing) {
      existing.status = 'active';
      existing.updatedAt = t;
      return existing;
    }
    const record: SubscriberRecord = {
      id: randomUUID(),
      createdAt: t,
      updatedAt: t,
      notes: '',
      status: 'active',
      email: normalized,
      source,
    };
    rows.unshift(record);
    return record;
  });
}

export function update<C extends CollectionName>(
  name: C,
  id: string,
  patch: Partial<Pick<Collections[C], 'status' | 'notes' | 'delivered'>>,
) {
  return mutate(name, (rows) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, patch, { updatedAt: now() });
    return row;
  });
}

export function remove(name: CollectionName, id: string) {
  return mutate(name, (rows) => {
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return false;
    rows.splice(i, 1);
    return true;
  });
}

/**
 * Store a submission without letting a storage failure break the public form:
 * the email is still the primary delivery path, so log and carry on.
 */
export async function record<T>(label: string, write: () => Promise<T>): Promise<T | null> {
  try {
    return await write();
  } catch (err) {
    console.error('[store] could not save %s submission', label, err);
    return null;
  }
}
