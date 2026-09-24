'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowBox } from '@/components/ui/Button';
import { Honeypot } from '@/components/ui/Honeypot';
import { HoverSplit, Magnetic } from '@/components/motion/Interactions';
import { siteConfig } from '@/content/site';

export type ContactFormStrings = {
  fullName: string;
  email: string;
  message: string;
  newsletter: string;
  team: string;
  submit: string;
  success: string;
  error: string;
};

/**
 * The dark contact form from the "Need more assistance?" block — a rebuild of
 * Contact Form 7 "Contact form H_1": full name*, email*, message, newsletter
 * opt-in, and the "Piris Road · Support Team" signature beside Submit.
 */
export function ContactForm({ s }: { s: ContactFormStrings }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          message: fd.get('message'),
          newsletter: fd.get('newsletter') === 'on',
          website: fd.get('website'),
        }),
      });
      if (!res.ok) throw new Error();
      setState('done');
      form.reset();
    } catch {
      setState('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <Honeypot />
      {/* CF7 `.field`: 14px label (28px line, 8px gap), 50px underlined input, 22px between fields. */}
      <label className="mb-[22px] block">
        <span className="mb-2 block text-sm font-medium leading-7 text-white">{s.fullName}</span>
        <input name="name" required maxLength={200} autoComplete="name" className="field-line h-[50px]" />
      </label>
      <label className="mb-[22px] block">
        <span className="mb-2 block text-sm font-medium leading-7 text-white">{s.email}</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" className="field-line h-[50px]" dir="ltr" />
      </label>
      <label className="mb-[22px] block">
        <span className="mb-2 block text-sm font-medium leading-7 text-white">{s.message}</span>
        <textarea name="message" maxLength={5000} className="field-line h-[120px] resize-y pt-[11px]" />
      </label>
      <label className="mt-[25px] flex items-center gap-2 text-base font-medium leading-[1.625] tracking-snug text-[#919191]">
        <input name="newsletter" type="checkbox" className="h-[22px] w-[22px] rounded border-white/50 bg-transparent text-brand focus:ring-brand" />
        {s.newsletter}
      </label>

      {state === 'done' ? (
        <p role="status" className="mt-6 rounded-md bg-white/10 px-4 py-3 text-sm text-white">
          {s.success}
        </p>
      ) : null}
      {state === 'error' ? (
        <p role="alert" className="mt-6 text-sm text-accent">
          {s.error}
        </p>
      ) : null}

      {/* `.button-x-author`: 55px logo + name/role, and the white submit button (164×44). */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-[30px]">
        <div className="flex items-center gap-[18px]">
          <Image src={siteConfig.logos.mark} alt="" width={55} height={55} className="h-[55px] w-[55px]" />
          <div>
            <p className="text-[20px] font-medium leading-[1.11] tracking-[-0.05em] text-white">{siteConfig.name}</p>
            <p className="text-[15px] font-medium leading-[1.625] tracking-snug text-[#6a6a6a]">{s.team}</p>
          </div>
        </div>
        <Magnetic>
          <button
            type="submit"
            disabled={state === 'sending'}
            className="group inline-flex items-center gap-4 rounded-lg bg-white py-[3px] pe-[3px] ps-5 text-base font-medium tracking-snug text-heading transition-all duration-500 ease-cube hover:bg-brand hover:text-white disabled:opacity-60"
          >
            <HoverSplit>{s.submit}</HoverSplit>
            <ArrowBox tone="light" className="h-[38px] w-[38px]" />
          </button>
        </Magnetic>
      </div>
    </form>
  );
}
