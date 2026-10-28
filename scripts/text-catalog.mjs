/**
 * Regenerates content/text-catalog.json — the list of texts the admin
 * dashboard lets the team edit (/admin/texts).
 *
 *   node scripts/text-catalog.mjs
 *
 * Runs a production build with TEXT_CATALOG_DIR set, so every source string
 * the pages actually pass through getTranslate() is recorded (see
 * captureSource in lib/text-overrides.ts). Each string is then tagged with
 * the file whose t('…') literal it came from, when there is one, so the
 * dashboard can group it by page. Re-run after adding or changing copy.
 *
 * Don't run it while `next dev` is running (they share .next).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const captureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'piris-texts-'));

console.log('[text-catalog] building with capture into', captureDir);
const build = spawnSync('npx next build', {
  cwd: root,
  shell: true,
  stdio: 'inherit',
  env: { ...process.env, TEXT_CATALOG_DIR: captureDir },
});
if (build.status !== 0) {
  console.error('[text-catalog] build failed');
  process.exit(build.status ?? 1);
}

const captured = new Set();
for (const f of fs.readdirSync(captureDir)) {
  for (const line of fs.readFileSync(path.join(captureDir, f), 'utf8').split('\n')) {
    if (line.trim()) captured.add(JSON.parse(line));
  }
}
fs.rmSync(captureDir, { recursive: true, force: true });

// t('literal') / t("literal") and translateAs(t, 'display', 'key') in page and component code.
const literal = String.raw`'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"`;
const patterns = [
  new RegExp(String.raw`\bt\(\s*(?:${literal})\s*\)`, 'g'),
  new RegExp(String.raw`translateAs\(\s*t\s*,\s*(?:${literal})\s*,\s*(?:${literal})\s*\)`, 'g'),
];
const unescape = (s) => s.replace(/\\(['"\\])/g, '$1');

const fileOf = new Map();
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'admin') scan(p);
    } else if (/\.tsx?$/.test(entry.name)) {
      const src = fs.readFileSync(p, 'utf8');
      const rel = path.relative(root, p).split(path.sep).join('/');
      for (const re of patterns) {
        for (const m of src.matchAll(re)) {
          const groups = m.slice(1).filter((g) => g !== undefined);
          const text = unescape(groups[groups.length - 1]);
          if (!fileOf.has(text)) fileOf.set(text, rel);
        }
      }
    }
  }
}
scan(path.join(root, 'components'));
scan(path.join(root, 'app'));

const entries = [...captured]
  .filter((s) => typeof s === 'string' && /\p{L}/u.test(s))
  .sort((a, b) => a.localeCompare(b))
  .map((text) => (fileOf.has(text) ? { text, file: fileOf.get(text) } : { text }));

const out = path.join(root, 'content', 'text-catalog.json');
fs.writeFileSync(out, JSON.stringify(entries, null, 1) + '\n');
console.log(`[text-catalog] wrote ${entries.length} texts to ${path.relative(root, out)}`);
