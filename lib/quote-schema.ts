import { z } from 'zod';

// Zod 4 probes `new Function()` to JIT-compile validators. The site's CSP
// forbids eval, so the probe only produced a CSP violation report on every
// page before falling back. Skip the probe.
z.config({ jitless: true });

/**
 * Freight quote request.
 *
 * Field-for-field reconstruction of Contact Form 7 form 2478
 * ("Contact form H_2"), which the original site rendered on the Get a Quote
 * page via [contact-form-7 id="2f5f260"]. Required/optional flags follow the
 * CF7 tags exactly: a trailing `*` in CF7 (e.g. `[text* loading_place]`) means
 * required, no asterisk means optional.
 * See RECOVERY_REPORT.md §8.
 */

// Length caps keep a single submission from turning into a multi-megabyte
// email; single-line fields also reject line breaks and control characters.
const LINE_MAX = 200;
const TEXT_MAX = 5000;
const SINGLE_LINE = new RegExp('^[^\\u0000-\\u001f\\u007f]*$');
// Multi-line text may keep tabs and line breaks (\t \n \r).
const MULTI_LINE = new RegExp('^[^\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f]*$');

const line = z.string().trim().max(LINE_MAX, `Must be at most ${LINE_MAX} characters`).regex(SINGLE_LINE, 'Invalid characters');
const text = z.string().trim().max(TEXT_MAX, `Must be at most ${TEXT_MAX} characters`).regex(MULTI_LINE, 'Invalid characters');

const required = (label: string) => line.min(1, `${label} is required`);
const optional = line.optional().default('');

// CF7 [number*] / [number] fields — kept as strings so empty optional values
// round-trip cleanly, validated as numeric where present.
const numeric = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(20, `${label} must be a number`)
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, `${label} must be a number`);

const numericOptional = z
  .string()
  .trim()
  .max(20, 'Must be a number')
  .optional()
  .default('')
  .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) > 0), 'Must be a number');

const email = z.string().trim().max(254, 'Enter a valid email address').email('Enter a valid email address');

export const quoteSchema = z.object({
  // --- Shipping Information ---
  loading_place: required('Loading place'),
  loading_country: required('Loading country'),
  unloading_place: required('Unloading place'),
  unloading_country: required('Unloading country'),
  number_of_colli: numeric('Number of Colli'),
  weight: numericOptional,
  length: numericOptional,
  width: numericOptional,
  height: numeric('Height'),
  commodity: required('Kind of commodity'),
  additional_info: text.min(1, 'Additional Info is required'),

  // --- Company Information --- (all optional in the original form)
  company_name: optional,
  vat_number: optional,
  address: optional,
  postal_number: optional,
  city: optional,
  country: optional,
  phone: optional,
  email: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((v) => v === '' || email.safeParse(v).success, 'Enter a valid email address'),
  your_name: optional,

  // [acceptance privacy-policy] — required before submitting
  privacy_policy: z.literal(true, { message: 'Please accept the privacy policy' }),
});

export type QuoteInput = z.input<typeof quoteSchema>;
export type QuoteData = z.output<typeof quoteSchema>;

export const newsletterSchema = z.object({
  email,
});

/** "Need more assistance?" form — Contact Form 7 "Contact form H_1". */
export const contactSchema = z.object({
  name: line.min(1, 'Full name is required'),
  email,
  message: text.optional().default(''),
  newsletter: z.boolean().optional().default(false),
});
