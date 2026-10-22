import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { isCollection, list } from '@/lib/admin/store';

export const dynamic = 'force-dynamic';

/**
 * CSV export for the dashboard (admin session required). Prefixed with a BOM so
 * Excel opens Arabic text correctly; cells that start with = + - @ are
 * prefixed with ' so a submitted value can't run as a spreadsheet formula.
 */
function cell(value: unknown): string {
  let s = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const toCsv = (rows: Array<Record<string, unknown>>) => {
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  return '﻿' + [headers.join(','), ...rows.map((r) => headers.map((h) => cell(r[h])).join(','))].join('\r\n');
};

export async function GET(_request: Request, { params }: { params: Promise<{ collection: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { collection } = await params;
  if (!isCollection(collection)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rows = (await list(collection)).map((r) => {
    const { data, ...meta } = r as typeof r & { data?: Record<string, unknown> };
    return { ...meta, ...(data ?? {}) } as Record<string, unknown>;
  });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="piris-road-${collection}-${date}.csv"`,
    },
  });
}
