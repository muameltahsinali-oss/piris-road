/**
 * Company details, navigation and social profiles.
 *
 * Recovered from the .wpress archive (RECOVERY_REPORT.md §3, §5, §8) and
 * cross-checked against the staging site. Nothing in this file is invented.
 * Note: staging rewrote every @pirisroad.iq address to its own Hostinger
 * domain; the real addresses from the backup are kept here.
 */

export const siteConfig = {
  name: 'Piris Road',
  legalName: 'Piris Road',
  // wp_options.blogdescription was empty on the original site.
  tagline: '',
  description:
    'Reliable multimodal transportation, customs clearance, and supply chain management for complex and time-critical shipments.',

  // RECOVERY-GAP: the live site ran on a Hostinger preview domain
  // (aquamarine-gnat-712272.hostingersite.com). pirisroad.iq is the intended
  // production domain, inferred from the recovered email addresses and social
  // handles. Update once the real domain is confirmed.
  url: 'https://pirisroad.iq',

  contact: {
    address: 'Cavalli Tower (B12-07), Gulan St. Waziran, Erbil, Iraq',
    phones: ['+9647870008888', '+9647503050108'],
    emails: {
      general: 'info@pirisroad.iq',
      operations: 'ops@pirisroad.iq',
    },
    hours: {
      time: '8 AM - 4 PM',
      note: '(Everyday Except Friday & Saturday)',
    },
    // The backup's map widget only stored "baghdad"; staging fixed it to the
    // Plus Code of the Erbil office.
    mapQuery: '6X4M+JW Erbil',
  },

  social: [
    { label: 'Facebook', href: 'https://www.facebook.com/pirisroad.iq/', icon: 'facebook' },
    { label: 'Instagram', href: 'https://www.instagram.com/pirisroad.iq', icon: 'instagram' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/pirisroad', icon: 'linkedin' },
    // Missing from the backup; the staging site links it.
    { label: 'X', href: 'https://x.com/PirisRoad', icon: 'x' },
  ] as const,

  logos: {
    header: '/logos/logo-header.webp',
    headerAlt: '/logos/logo-header-alt.webp',
    white: '/logos/logo-white.webp',
    icon: '/logos/logo-icon.svg',
    dark: '/logos/logo-dark.svg',
    mark: '/logos/mark.svg',
  },

  copyright: {
    // Theme option tx_copyright
    themeOption: '© Copyright 2025, Piris Road All Rights Reserved.',
    // Footer 1 widget: copyright_text + copyright_text_right
    left: '© All rights reserved',
    right: 'Piris Road 2026',
    // Footer bottom bar as rendered on staging
    line: '© All rights reserved - Piris Road 2026',
    credit: 'Developed By Manarah Solutions',
  },
} as const;

/** The active "My Menu" navigation (wp term 63) — the real site's nav. */
export const mainNav = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services', hasChildren: true },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' },
] as const;

/** Footer link columns, recovered from Footer 1 (post 2686). */
export const footerNav = {
  quickNavigation: [
    { key: 'aboutUs', href: '/about' },
    { key: 'services', href: '/services' },
    { key: 'contactUs', href: '/contact' },
  ],
  allPages: [
    { key: 'home', href: '/' },
    { key: 'contact', href: '/contact' },
    { key: 'blogs', href: '/blog' },
  ],
} as const;

/**
 * Off-canvas gallery from the header ("Stay Inspired with Instagram").
 * The original made these non-clickable via CSS (pointer-events: none).
 */
export const headerGallery = [
  { src: '/misc/gallery-1.webp', alt: 'Piris Road logistics operations' },
  { src: '/misc/gallery-2.webp', alt: 'Piris Road freight handling' },
  { src: '/services/card-cold-chain.webp', alt: 'Refrigerated container transport' },
  { src: '/services/card-road-transport.webp', alt: 'Cross-border road transport' },
  { src: '/services/card-sea-freight.webp', alt: 'Sea freight container shipping' },
] as const;

/** Counter values recovered from the Elementor widget settings. */
export const stats = {
  yearsExperience: { value: 10, prefix: '+' },
  happyClients: { value: 1000, prefix: '+' },
  satisfiedClients: { value: 50, prefix: '+' },
  industriesServed: { value: 5, prefix: '+' },
  rating: { value: '4.9', suffix: '/5' },
} as const;

export const certifications = [
  { name: 'ISO 9001', image: '/certifications/iso-9001.jpeg' },
  { name: 'ISO 14001', image: '/certifications/iso-14001.webp' },
  { name: 'ISO 45001', image: '/certifications/iso-45001.webp' },
] as const;

export const partners = [
  { src: '/partners/partner-1.png', alt: 'Partner network member' },
  { src: '/partners/partner-2.png', alt: 'Partner network member' },
  { src: '/partners/partner-3.png', alt: 'Partner network member' },
  { src: '/partners/partner-4.png', alt: 'Partner network member' },
] as const;
