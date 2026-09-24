'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quoteSchema, type QuoteInput } from '@/lib/quote-schema';
import { Honeypot } from '@/components/ui/Honeypot';
import { cn } from '@/lib/utils';

export type QuoteLabels = Record<string, string>;

/**
 * The freight quote form — a field-for-field rebuild of Contact Form 7 form
 * 2478, which was the only genuinely dynamic feature on the original site.
 *
 * Field order, grouping, labels and required flags all come from the recovered
 * CF7 markup. See RECOVERY_REPORT.md §8 and lib/quote-schema.ts.
 */
export function QuoteForm({ labels }: { labels: QuoteLabels }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const honeypotRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { privacy_policy: false as unknown as true },
  });

  const onSubmit = handleSubmit(async (values) => {
    setState('sending');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypotRef.current?.value }),
      });
      if (!res.ok) throw new Error('failed');
      setState('done');
      reset();
    } catch {
      setState('error');
    }
  });

  if (state === 'done') {
    return (
      <div role="status" className="rounded-3xl bg-brand-soft/50 p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-main text-white">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-5 text-lg font-semibold text-heading">{labels.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative">
      <Honeypot ref={honeypotRef} />
      {/* ---- Shipping Information ---- */}
      <fieldset>
        <legend className={legendCls}>{labels.shippingInformation}</legend>

        <div className="space-y-[15px]">
          <div className="grid gap-x-5 gap-y-[15px] sm:grid-cols-2">
            <Field label={labels.loading_place} error={errors.loading_place?.message} required>
              <input type="text" {...register('loading_place')} className={inputCls} />
            </Field>
            <Field label={labels.loading_country} error={errors.loading_country?.message} required>
              <input type="text" {...register('loading_country')} className={inputCls} />
            </Field>
          </div>

          <div className="grid gap-x-5 gap-y-[15px] sm:grid-cols-2">
            <Field label={labels.unloading_place} error={errors.unloading_place?.message} required>
              <input type="text" {...register('unloading_place')} className={inputCls} />
            </Field>
            <Field label={labels.unloading_country} error={errors.unloading_country?.message} required>
              <input type="text" {...register('unloading_country')} className={inputCls} />
            </Field>
          </div>

          <Field label={labels.number_of_colli} error={errors.number_of_colli?.message} required>
            <input type="number" min="1" inputMode="numeric" {...register('number_of_colli')} className={inputCls} />
          </Field>

          <div className="grid gap-x-5 gap-y-[15px] sm:grid-cols-2 lg:grid-cols-4">
            <Field label={labels.weight} error={errors.weight?.message}>
              <input type="number" min="0" step="any" {...register('weight')} className={inputCls} />
            </Field>
            <Field label={labels.length} error={errors.length?.message}>
              <input type="number" min="0" step="any" {...register('length')} className={inputCls} />
            </Field>
            <Field label={labels.width} error={errors.width?.message}>
              <input type="number" min="0" step="any" {...register('width')} className={inputCls} />
            </Field>
            <Field label={labels.height} error={errors.height?.message} required>
              <input type="number" min="0" step="any" {...register('height')} className={inputCls} />
            </Field>
          </div>

          <Field label={labels.commodity} error={errors.commodity?.message} required>
            <input type="text" {...register('commodity')} className={inputCls} />
          </Field>

          <Field label={labels.additional_info} error={errors.additional_info?.message} required>
            <textarea {...register('additional_info')} maxLength={5000} className={cn(fieldCls, 'h-[306px] resize-y')} />
          </Field>
        </div>
      </fieldset>

      {/* ---- Company Information ---- */}
      <fieldset>
        <legend className={legendCls}>{labels.companyInformation}</legend>

        <div className="space-y-[15px]">
          <div className="grid gap-x-5 gap-y-[15px] sm:grid-cols-2">
            <Field label={labels.company_name}>
              <input type="text" {...register('company_name')} className={inputCls} />
            </Field>
            <Field label={labels.vat_number}>
              <input type="text" {...register('vat_number')} className={inputCls} />
            </Field>
          </div>

          <div className="grid gap-x-5 gap-y-[15px] sm:grid-cols-2">
            <Field label={labels.address}>
              <input type="text" {...register('address')} className={inputCls} />
            </Field>
            <Field label={labels.postal_number}>
              <input type="text" {...register('postal_number')} className={inputCls} />
            </Field>
          </div>

          <div className="grid gap-x-5 gap-y-[15px] sm:grid-cols-2">
            <Field label={labels.city}>
              <input type="text" {...register('city')} className={inputCls} />
            </Field>
            <Field label={labels.country}>
              <input type="text" {...register('country')} className={inputCls} />
            </Field>
          </div>

          <div className="grid gap-x-5 gap-y-[15px] sm:grid-cols-2">
            <Field label={labels.phone}>
              <input type="tel" dir="ltr" {...register('phone')} className={inputCls} />
            </Field>
            <Field label={labels.email} error={errors.email?.message}>
              <input type="email" dir="ltr" {...register('email')} className={inputCls} />
            </Field>
          </div>

          <Field label={labels.your_name}>
            <input type="text" {...register('your_name')} className={inputCls} />
          </Field>
        </div>
      </fieldset>

      {/* ---- Acceptance + submit ---- */}
      <div className="mt-[30px] space-y-4">
        <label className="flex items-center gap-3 text-[18px] font-medium leading-7 text-black">
          <input
            type="checkbox"
            {...register('privacy_policy')}
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span>
            {labels.privacy_policy}
            <span aria-hidden>*</span>
          </span>
        </label>
        {errors.privacy_policy?.message ? (
          <p role="alert" className="text-sm text-red-600">
            {errors.privacy_policy.message}
          </p>
        ) : null}

        {/* CF7 submit on staging: 54px, 6px radius, 135° blue gradient, 18px/600. */}
        <button
          type="submit"
          disabled={state === 'sending'}
          className="h-[54px] w-full rounded-[6px] border border-[#cccccc] bg-[linear-gradient(135deg,#1e5ad7,#0b3fb3)] text-[18px] font-semibold text-white transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-60"
        >
          {state === 'sending' ? labels.sending : labels.send}
        </button>

        {state === 'error' ? (
          <p role="alert" className="text-sm text-red-600">
            {labels.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

// Staging's CF7 fields: 54px tall, 12px padding, 1px #ccc border, 6px radius, 18px black text.
const fieldCls =
  'w-full rounded-[6px] border border-[#cccccc] bg-white p-3 text-[18px] text-black ' +
  'transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';
const inputCls = `h-[54px] ${fieldCls}`;

// "Shipping Information" / "Company Information": 42px/600 #101010, 30px above, 7px below.
const legendCls = 'mb-[7px] mt-[30px] text-[42px] font-semibold leading-[1.2] text-[#101010]';

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      {/* The original wrapped each input in a .field div with the label above
          it — recovered from the CF7 markup. Wrapping the control in the
          <label> also ties the two together for screen readers. */}
      <label className="flex flex-col">
        <span className="mb-1.5 text-[18px] font-medium leading-7 text-black">
          {label}
          {required ? <span aria-hidden>*</span> : null}
        </span>
        {children}
      </label>
      {error ? (
        <p role="alert" className={cn('mt-1.5 text-xs text-red-600')}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
