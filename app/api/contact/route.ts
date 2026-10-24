import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/quote-schema';
import { guardSubmission, sendEmail } from '@/lib/api-guard';
import { siteConfig } from '@/content/site';
import { addMessage, addSubscriber, emailEvent, record, update } from '@/lib/admin/store';

/**
 * Contact form from the "Need more assistance?" block.
 * Same delivery setup as /api/quote: set CONTACT_RECIPIENT (defaults to the
 * company inbox) and RESEND_API_KEY; without a key submissions are logged.
 */
export async function POST(request: Request) {
  const { data, response } = await guardSubmission(request, contactSchema, { name: 'contact', limit: 5 });
  if (response) return response;

  const { name, email, message, newsletter } = data;
  // Saved first so the message shows up in /admin even if email fails.
  const saved = await record('contact', () => addMessage({ name, email, message, newsletter }));
  if (newsletter) await record('contact', () => addSubscriber(email, 'contact'));

  const text =`Name: ${name}\nEmail: ${email}\nNewsletter: ${newsletter ? 'yes' : 'no'}\n\n${message}`;

  const sent = await sendEmail({
    to: process.env.CONTACT_RECIPIENT ?? siteConfig.contact.emails.general,
    subject: `Website enquiry — ${name}`,
    text,
    replyTo: email,
  });

  if (saved) await record('contact', () => update('messages', saved.id, { delivered: sent }, emailEvent(sent)));

  if (sent === null) {
    console.info('[contact] no RESEND_API_KEY set; submission not emailed\n%s', text);
    return NextResponse.json({ ok: true, delivered: false });
  }
  if (!sent) return NextResponse.json({ error: 'Delivery failed' }, { status: 502 });
  return NextResponse.json({ ok: true, delivered: true });
}
