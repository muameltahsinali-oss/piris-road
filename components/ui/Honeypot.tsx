import { forwardRef } from 'react';

/**
 * Spam trap for the public forms: a text field positioned off-screen, removed
 * from the tab order and hidden from assistive tech. People never fill it in;
 * form-filling bots usually do, and the API then drops the submission quietly
 * (see lib/api-guard.ts, HONEYPOT_FIELD).
 */
export const Honeypot = forwardRef<HTMLInputElement>(function Honeypot(_, ref) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -start-[9999px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input ref={ref} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
});
