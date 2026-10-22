import { NextResponse } from 'next/server';
import { quoteSchema, type QuoteData } from '@/lib/quote-schema';
import { guardSubmission, sendEmail } from '@/lib/api-guard';
import { siteConfig } from '@/content/site';
import { addQuote, record, update } from '@/lib/admin/store';

/**
 * Receives a freight quote request and emails it to Piris Road.
 *
 * IMPORTANT — a bug carried over from the original: every Contact Form 7 form
 * on the WordPress site sent its notifications to `wabidullahsharif@gmail.com`,
 * the theme author's address left behind by the demo import. Quote requests
 * were very likely never reaching the company. The recipient here defaults to
 * the recovered company address instead. See RECOVERY_REPORT.md §8.
 *
 * Set these env vars to enable delivery (otherwise the submission is logged and
 * accepted, so the form still works in development):
 *   QUOTE_RECIPIENT   - where quotes go (defaults to info@pirisroad.iq)
 *   RESEND_API_KEY    - transactional email provider key
 *   QUOTE_FROM        - verified sender address
 */
const FIELD_ORDER: Array<[keyof QuoteData, string]> = [
  ['loading_place', 'Loading place'],
  ['loading_country', 'Loading country'],
  ['unloading_place', 'Unloading place'],
  ['unloading_country', 'Unloading country'],
  ['number_of_colli', 'Number of Colli'],
  ['weight', 'Weight'],
  ['length', 'Length'],
  ['width', 'Width'],
  ['height', 'Height'],
  ['commodity', 'Commodity'],
  ['additional_info', 'Additional Info'],
  ['company_name', 'Company Name'],
  ['vat_number', 'VAT'],
  ['address', 'Address'],
  ['postal_number', 'Postal'],
  ['city', 'City'],
  ['country', 'Country'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['your_name', 'Name'],
];

/** Mirrors the plain-text body the original CF7 mail template produced. */
function formatBody(data: QuoteData): string {
  return FIELD_ORDER.map(([key, label]) => `${label}: ${data[key] ?? ''}`).join('\n');
}

export async function POST(request: Request) {
  // Origin check, 5 quotes per 10 minutes per IP, body limits, honeypot, schema.
  const { data, response } = await guardSubmission(request, quoteSchema, { name: 'quote', limit: 5 });
  if (response) return response;

  // Saved first so the request shows up in /admin even if email fails.
  const saved = await record('quote', () => addQuote(data));

  const body = formatBody(data);
  const sent = await sendEmail({
    to: process.env.QUOTE_RECIPIENT ?? siteConfig.contact.emails.general,
    subject: `Quote request — ${data.loading_country} → ${data.unloading_country}`,
    text: body,
    replyTo: data.email || undefined,
  });

  if (saved) await record('quote', () => update('quotes', saved.id, { delivered: sent }));

  if (sent === null) {
    // No provider configured yet: accept the submission and log it so the form
    // is usable before email credentials are wired up.
    console.info('[quote] no RESEND_API_KEY set; submission not emailed\n%s', body);
    return NextResponse.json({ ok: true, delivered: false });
  }
  if (!sent) return NextResponse.json({ error: 'Delivery failed' }, { status: 502 });
  return NextResponse.json({ ok: true, delivered: true });
}
