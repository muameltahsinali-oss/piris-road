import fs from 'node:fs';
import path from 'node:path';

/**
 * Text overrides edited from the admin dashboard (/admin/texts).
 *
 * The site looks text up by its English source string (see lib/i18n.ts). An
 * override replaces what that source renders as, per language:
 *   en[source] — new English wording
 *   ar[source] — new or corrected Arabic translation
 * Sources themselves never change, so content files stay the fallback and an
 * override can always be reset.
 *
 * Stored as DATA_DIR/texts.json next to the dashboard's other data. Reads are
 * synchronous (translation happens during render) and cached until the file's
 * mtime changes.
 */

export type TextOverrides = { en: Record<string, string>; ar: Record<string, string> };

const empty = (): TextOverrides => ({ en: {}, ar: {} });
const file = () => path.join(path.resolve(process.env.DATA_DIR || '.data'), 'texts.json');

let cache: { mtimeMs: number; data: TextOverrides } | null = null;

export function getTextOverrides(): TextOverrides {
  try {
    const { mtimeMs } = fs.statSync(file());
    if (cache && cache.mtimeMs === mtimeMs) return cache.data;
    const raw = JSON.parse(fs.readFileSync(file(), 'utf8'));
    const data: TextOverrides = { en: raw?.en ?? {}, ar: raw?.ar ?? {} };
    cache = { mtimeMs, data };
    return data;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') console.error('[texts] could not read overrides', err);
    return empty();
  }
}

let queue: Promise<unknown> = Promise.resolve();

/**
 * Set (or, with null, remove) the override for one source string in each
 * language. Serialised and written atomically like the submission store.
 */
export function saveTextOverride(source: string, values: { en?: string | null; ar?: string | null }) {
  const run = queue.then(async () => {
    const data = structuredClone(getTextOverrides());
    for (const lang of ['en', 'ar'] as const) {
      const v = values[lang];
      if (v === undefined) continue;
      if (v === null) delete data[lang][source];
      else data[lang][source] = v;
    }
    const target = file();
    await fs.promises.mkdir(path.dirname(target), { recursive: true });
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.promises.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.promises.rename(tmp, target);
    cache = null;
    return data;
  });
  queue = run.catch(() => undefined);
  return run;
}

/**
 * Build-time capture for the dashboard's text catalog: when TEXT_CATALOG_DIR
 * is set (only by scripts/text-catalog.mjs), every source string the pages
 * render is appended to a per-process file there.
 */
const captured = new Set<string>();
export function captureSource(source: string) {
  const dir = process.env.TEXT_CATALOG_DIR;
  if (!dir || captured.has(source)) return;
  captured.add(source);
  try {
    fs.appendFileSync(path.join(dir, `${process.pid}.jsonl`), JSON.stringify(source) + '\n');
  } catch {
    // Capture is best-effort; never break a render over it.
  }
}
