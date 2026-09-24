'use client';

import { useRef, useState } from 'react';
import { useTypedPlaceholder } from '@/components/motion/Interactions';
import { Honeypot } from '@/components/ui/Honeypot';

/**
 * Footer newsletter — replaces Contact Form 7 form 2678 (one required email
 * field + Subscribe), styled as on staging: outlined field with the blue button
 * sitting inside it.
 */
export function NewsletterForm({
  placeholder,
  submitLabel,
  successMessage,
  errorMessage,
}: {
  placeholder: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
}) {
  const [email, setEmail] = useState('');
  // `.wa_placeholder` — the placeholder types itself out when the field is in view.
  const inputRef = useTypedPlaceholder(placeholder);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const honeypotRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: honeypotRef.current?.value }),
      });
      if (!res.ok) throw new Error('failed');
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <p role="status" className="rounded-lg bg-white/10 px-4 py-3 text-sm text-white">
        {successMessage}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-2">
      <Honeypot ref={honeypotRef} />
      <div className="flex items-center rounded-lg border border-white/20 p-1 focus-within:border-white/60">
        <label className="sr-only" htmlFor="newsletter-email">
          {placeholder}
        </label>
        <input
          ref={inputRef}
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-500 hover:bg-white hover:text-heading disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
      {state === 'error' ? (
        <p role="alert" className="text-xs text-accent">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
