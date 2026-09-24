import { NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/quote-schema';
import { guardSubmission, sendEmail } from '@/lib/api-guard';
import { siteConfig } from '@/content/site';

/**
 * Footer newsletter signup — replaces Contact Form 7 form 2678.
 *
 * The original had no mailing-list provider: CF7 simply emailed the address to
 * the site owner (and, because of the demo-import bug, to the theme author's
 * Gmail). This keeps the same behaviour with a corrected recipient, and leaves
 * an obvious place to plug in a real list provider later.
 */
export async function POST(request: Request) {
  const { data, response } = await guardSubmission(request, newsletterSchema, { name: 'newsletter', limit: 3 });
  if (response) return response;

  const { email } = data;
  const sent = await sendEmail({
    to: process.env.NEWSLETTER_RECIPIENT ?? siteConfig.contact.emails.general,
    subject: 'Newsletter subscription',
    text: `New subscriber: ${email}`,
    replyTo: email,
  });

  if (sent === null) {
    console.info('[newsletter] no RESEND_API_KEY set; subscriber not emailed: %s', email);
    return NextResponse.json({ ok: true, delivered: false });
  }
  if (!sent) return NextResponse.json({ error: 'Delivery failed' }, { status: 502 });
  return NextResponse.json({ ok: true, delivered: true });
}
