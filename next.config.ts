import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Content-Security-Policy. The site loads nothing from third parties except the
 * Google Maps embed on /contact, so everything else is locked to this origin.
 *
 * Pages are statically prerendered, so per-request nonces aren't possible;
 * Next.js inlines its hydration data in <script> tags, which is why
 * 'unsafe-inline' stays in script-src. The rest of the policy still blocks
 * third-party scripts, plugins, framing of the site, form posts elsewhere and
 * <base> hijacking. Dev mode additionally needs eval and the HMR websocket.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  'frame-src https://maps.google.com https://www.google.com',
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Browsers ignore HSTS over plain HTTP, so this only takes effect on HTTPS.
  // No includeSubDomains/preload until the production domain and its
  // subdomains are confirmed to be HTTPS-only.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Form endpoints: never cached, never indexed.
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
    ];
  },

  // Original WordPress URLs -> new routes, so existing inbound links keep working.
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/our-services', destination: '/services', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
      { source: '/elementor-page-3821', destination: '/quote', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
