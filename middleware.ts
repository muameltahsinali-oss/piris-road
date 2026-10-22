import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Run on every page route, but skip API routes, the /admin dashboard, Next internals and anything
  // that looks like a static file (i.e. contains a dot).
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
