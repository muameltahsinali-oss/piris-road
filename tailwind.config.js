/**
 * Design tokens.
 *
 * Colours come from the recovered WordPress theme options and custom CSS
 * (RECOVERY_REPORT.md §6). Typography, radii, spacing and container width were
 * then matched to the computed styles of the staging site
 * (seashell-whale-108794.hostingersite.com), which renders the same Avista
 * theme with the owner's latest changes:
 *   section title  Inter 48px / 500 / -0.06em      body  Inter 16px / 500 / -0.04em
 *   hero title     Inter 62px / 600 / -0.05em      eyebrow  Geist Mono 16px / 500
 *   container 1320px · hero radius 0 0 150px 150px · cards radius 10px
 */
/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './content/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#002EAF',
          DEFAULT: '#244BDD',
          main: '#3361e5',
          light: '#5FA3FF',
          soft: '#D0E6FC',
        },
        accent: { DEFAULT: '#FFC200', warm: '#ffc400' },
        ink: '#0b1c3d',
        heading: '#0a0a0a',
        body: '#3E3E3E',
        muted: '#515151',
        night: '#0a0a0a',
        card: '#1a1a1a',
        paper: '#f2f2f2',
        plan: '#e9e9e9',
        maroon: '#28100f',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(2.5rem, 4.3vw, 3.875rem)', { lineHeight: '1.066', letterSpacing: '-0.05em' }],
        display: ['clamp(2rem, 3.4vw, 3rem)', { lineHeight: '1.11', letterSpacing: '-0.06em' }],
        mega: ['clamp(3.5rem, 7vw, 6rem)', { lineHeight: '1.11', letterSpacing: '-0.05em' }],
        title: ['clamp(1.375rem, 2vw, 1.5rem)', { lineHeight: '1.11', letterSpacing: '-0.05em' }],
        'plan-title': ['clamp(1.75rem, 2.6vw, 2.25rem)', { lineHeight: '1.11', letterSpacing: '-0.05em' }],
      },
      letterSpacing: { tightest: '-0.06em', snug: '-0.04em' },
      borderRadius: { hero: '150px', 'hero-sm': '48px', section: '60px' },
      maxWidth: { content: '1320px' },
      boxShadow: { card: '0 1px 24px rgba(0,0,0,.09)' },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(#3361e5, #3361e5)',
        'page-header': 'linear-gradient(135deg, #1f4fd6 0%, #0b3aa8 55%, #0a2f8f 100%)',
        'brand-sweep': 'linear-gradient(120deg, #244BDD, #002EAF)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)', filter: 'blur(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floatY: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        marqueeX: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        marqueeXReverse: { '0%': { transform: 'translateX(-50%)' }, '100%': { transform: 'translateX(0)' } },
        marqueeY: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-50%)' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        scrollDot: {
          '0%': { transform: 'translateY(-6px)', opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { transform: 'translateY(8px)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 1s cubic-bezier(.2,.8,.2,1) both',
        'fade-up-late': 'fadeUp 1s cubic-bezier(.2,.8,.2,1) .35s both',
        'zoom-in': 'zoomIn .9s cubic-bezier(.2,.8,.2,1) .6s both',
        float: 'floatY 5s ease-in-out infinite',
        marquee: 'marqueeX 30s linear infinite',
        'marquee-slow': 'marqueeX 45s linear infinite',
        'marquee-reverse': 'marqueeXReverse 30s linear infinite',
        'marquee-y': 'marqueeY 30s linear infinite',
        'marquee-y-slow': 'marqueeY 40s linear infinite',
        'spin-slow': 'spinSlow 18s linear infinite',
        'scroll-dot': 'scrollDot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

module.exports = config;
