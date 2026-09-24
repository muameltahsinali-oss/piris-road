/**
 * Company narrative content.
 *
 * Source of truth, in order of precedence:
 *  1. the staging site (seashell-whale-108794.hostingersite.com) — the owner's
 *     latest copy, added after the backup was taken;
 *  2. the .wpress backup (RECOVERY_REPORT.md §4) for anything staging didn't change.
 *
 * Strings are kept byte-identical to the source so the Arabic dictionary lookup
 * finds them. Where the original had a typo, `key` holds the original string and
 * the display text is corrected (see translateAs in lib/i18n.ts).
 */

export const hero = {
  titleLines: ['Smarter Logistics.', 'Stronger Impact.'],
  description:
    "We don't just move cargo; we move businesses forward. From navigating border delays to executing heavy-lift project cargo, we deliver crisis-ready logistics for Iraq's most demanding industries.",
  verticalBrand: 'PirisRoad',
  marqueeLabels: [
    'Logistics Built on Precision, Compliance, and Trust',
    'Where Global Standards Meet Local Expertise',
    'Engineering Smarter Logistics Solutions',
  ],
  ctaPrompt: 'Want to Work With Us ?',
  primaryCta: 'Contact Us',
  emailPrefix: 'or email us at',
  image: '/hero/container-3d.webp',
} as const;

export type ValueItem = { title: string; text: string };

/** Home "About" block (staging copy). */
export const aboutHome = {
  eyebrow: 'About US',
  title: "The Cornerstone of Excellence in Iraq's Logistics Sector",
  description:
    "We transform logistics into a competitive edge. With decades of cross-industry proficiency, Piris Road fuses deep localized expertise with expansive global reach. We don't just navigate geopolitical complexities and infrastructure challenges—we master them, empowering your organization to achieve scalable growth across borders.",
  valuesHeading: 'Our Values',
  values: [
    {
      title: 'Operational Excellence',
      text: 'Structured workflows and military-grade discipline ensuring reliable, measurable results in the most demanding environments.',
    },
    {
      title: 'Compliance and Safety',
      text: 'Uncompromising adherence to HSE protocols and international regulations, protecting your cargo, your people, and your reputation.',
    },
    {
      title: 'Industry-Focused Solutions',
      text: 'We design logistics strategies specifically for Oil and Gas, Medical, Government, Defense, and Technology sectors, ensuring transport solutions align with industry regulations and operational demands.',
    },
  ] as ValueItem[],
} as const;

/** About page's version of the same block (it kept the earlier copy + a rating). */
export const aboutPage = {
  eyebrow: 'About US',
  title: 'A Strategic Logistics Partner Built for Demanding Markets',
  description:
    'Piris Road combines strong local operational capabilities with global logistics standards to deliver scalable, secure, and efficient supply chain solutions. Our team understands the regulatory, geographic, and infrastructure challenges of regional trade and provides proactive logistics planning to minimize delays and optimize delivery performance. We work closely with clients to design customized logistics strategies that align with their industry requirements, shipment profiles, and long-term growth objectives.',
  rating: '4.9 Rating',
  ratingTitle: 'With Certifications, Standards, and Quality Commitment',
  valuesHeading: 'Our Values',
  values: [
    {
      title: 'Operational Excellence',
      text: 'We apply structured workflows, advanced planning, and strict quality controls to ensure reliable performance across every shipment. Our operations are built to deliver consistency, safety, and measurable results in demanding supply chain environments.',
    },
    {
      // The About page showed this title with no body on both the backup and
      // staging; the Home page's staging copy is reused for it.
      title: 'Compliance and Safety',
      text: 'Uncompromising adherence to HSE protocols and international regulations, protecting your cargo, your people, and your reputation.',
    },
    {
      title: 'Industry-Focused Solutions',
      text: 'We design logistics strategies specifically for Oil and Gas, Medical, Government, Defense, and Technology sectors, ensuring transport solutions align with industry regulations and operational demands.',
    },
  ] as ValueItem[],
} as const;

/** Six sectors — photos replaced on staging in May 2026. */
export const industries = [
  { key: 'oilGas', name: 'Oil and Gas Logistics', image: '/industries/oil-and-gas.webp' },
  { key: 'techTelecom', name: 'Technology and Telecom Logistics', image: '/industries/technology-telecom.webp' },
  { key: 'government', name: 'Government and Public Sector Logistics', image: '/industries/government-public-sector.webp' },
  { key: 'defense', name: 'Defense and Secure Transport', image: '/industries/defense-secure-transport.webp' },
  { key: 'commercial', name: 'Commercial and Industrial Logistics', image: '/industries/commercial-industrial.webp' },
  { key: 'medical', name: 'Medical and Pharmaceutical Logistics', image: '/industries/medical-pharmaceutical.webp' },
] as const;

export const industriesSection = {
  eyebrow: 'Piris Road',
  title: 'Driving Growth Through Logistics Excellence',
} as const;

export const movingText = {
  rowOne: ['End-to-End Logistics Solutions', 'Reliable Freight Forwarding Worldwide', 'Compliance-Driven Supply Chain Services'],
  rowTwo: ['Moving Business Without Delays', 'Precision Logistics for Critical Cargo', 'From Port to Door, We Deliver'],
} as const;

/** "Features" bento (staging copy). */
export const features = {
  eyebrow: 'Features',
  titleLines: ['Built for the Complex.', 'Engineered for the Critical.'],
  why: {
    title: 'Why',
    text: 'We operate with military-grade discipline. When border delays, supply chain shocks, or regulatory shifts happen, our agile teams ensure your cargo keeps moving.',
    image: '/features/why.webp',
  },
  precision: {
    title: 'Precision Planning & Execution',
    text: 'No one-size-fits-all. We design tailored strategies around your specific cargo, industry, and destination, backed by strict HSE compliance and risk-managed routing.',
  },
  clients: { value: 50, suffix: '+', label: 'Satisfied Clients', join: 'Join', joinValue: '450+', joinLabel: 'Developed Business' },
  certified: {
    title: 'Certified Industry Leaders',
    text: "Trusted by Iraq's Oil & Gas sector. As an OSC-certified provider (MNR ID: 101850), we deliver turnkey support for the region's most critical infrastructure projects.",
    image: '/features/certified.webp',
  },
} as const;

export const partnersSection = {
  eyebrow: 'Partners',
  title: 'Global Networks Supporting Local Excellence',
  tagOne: 'We Manage',
  tagTwo: 'Every Step',
} as const;

export const servicesHome = {
  eyebrow: 'Services',
  title: 'Driving Growth Through Logistics Excellence',
  bigTitle: 'Some of Services',
  stat: { value: 350, suffix: '+', label: 'Business' },
  description:
    'From small commercial shipments to complex industrial transport, Piris Road provides full-scope logistics solutions customized to business needs.',
  button: 'More Services',
} as const;

/** The grey "5+ industries We Serve !" box and the black "Let's Work Together!" band. */
export const ctaBand = {
  industriesCount: 5,
  industriesLabel: 'industries We Serve !',
  industryChips: [
    'Oil and Gas Sector',
    'Government and Public Sector',
    'Defense and Secure Logistics',
    'Commercial and Industrial Logistics',
  ],
  titleOne: "Let's Work",
  titleTwo: 'Together!',
  primary: 'Get started today',
  secondary: 'Get a quote',
  scroll: 'Go Down',
  imageLeft: '/misc/cta-left.webp',
  imageRight: '/misc/cta-right.webp',
} as const;

export const philosophy = {
  eyebrow: 'Values',
  /** Original string includes the stray " ." — kept as the dictionary key. */
  titleKey: 'Our Philosophy .',
  title: 'Our Philosophy.',
  description: 'Our Philosophy: Logistics Built on Responsibility, Precision, and Partnership',
  image: '/misc/our-philosophy.webp',
  panels: [
    {
      name: 'Our Vision',
      text: 'To become Iraq’s most reliable and trusted logistics partner by setting new standards in operational efficiency, safety, service quality, and supply chain transparency, while continuously expanding our regional and international capabilities.',
      items: [] as string[],
    },
    {
      name: 'Our Mission',
      text: 'To deliver end-to-end logistics solutions that simplify trade, minimize operational risk, and ensure full regulatory compliance across every shipment, while providing responsive, transparent, and cost-effective services to our clients.',
      items: [] as string[],
    },
    {
      name: 'Our Values',
      text: 'At Piris Road, our values define how we operate, how we serve our clients, and how we build long-term partnerships. In an industry where reliability, safety, and compliance are critical, our values guide every decision — from route planning and carrier selection to customs processing and final delivery. These principles ensure that every shipment is managed with responsibility, transparency, and operational excellence.',
      items: [
        'Reliability and Operational Consistency',
        'Compliance, Safety, and Regulatory Integrity',
        'Client-Focused Solutions and Accountability',
        'Precision Planning and Controlled Execution',
        'Ethical Conduct and Corporate Responsibility',
      ],
    },
  ],
  button: 'Get started',
} as const;

export const workingProcess = {
  eyebrow: '[Process]',
  titleLines: ['Our Working', 'process'],
  description:
    'Every shipment is managed through a structured logistics workflow that ensures transparency, compliance, and continuous communication throughout the supply chain.',
  steps: [
    {
      label: 'Step 01',
      title: 'Shipment and Risk Assessment',
      key: 'Shipment and Risk Assessmen',
      text: 'We evaluate cargo type, dimensions, urgency, regulatory requirements, and potential transit risks.',
    },
    {
      label: 'Step 02',
      title: 'Transport Strategy Development',
      key: 'Transport Strategy Development',
      text: 'Selection of transport modes, routes, carriers, and contingency planning.',
    },
    {
      label: 'Step 03',
      title: 'Documentation and Regulatory Processing',
      key: 'Documentation and Regulatory Processing',
      text: 'Preparation of customs paperwork, permits, certifications, and trade compliance checks.',
    },
  ],
} as const;

/**
 * About page timeline. Years added on staging.
 * RECOVERY-GAP: the section description is still Lorem ipsum on staging, so it
 * is omitted.
 */
export const storyTimeline = {
  eyebrow: '[Process]',
  titleLines: ['Our Working', 'process'],
  milestones: [
    { label: '2018', title: 'Company Foundation', text: 'Founded to provide structured and compliant freight services across regional trade routes.' },
    { label: '2020', title: 'Expansion of Multimodal Services', text: 'Integration of air, sea, and road transport capabilities.' },
    {
      label: '2023',
      title: 'Industry Certifications and Network Memberships',
      text: 'Strengthened compliance framework and international connectivity.',
    },
  ],
} as const;

/** Awards + FAQ band (FAQs were written on staging — the backup only had placeholders). */
export const faqSection = {
  awardsEyebrow: 'Awards',
  awardsTitle: 'Driving Growth Through Logistics Excellence',
  certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001'],
  faqEyebrow: 'FAQs',
  faqTitle: 'Learn more from FAQs',
  // Staging also had a "Job Career" tab, but its panel is empty — not rendered.
  tab: 'Ask',
  items: [
    {
      q: 'What logistics services does Piris Road provide?',
      a: 'We provide full-spectrum logistics and freight forwarding services including sea freight (FCL and LCL), air freight, domestic and cross-border road transport, cold chain logistics, warehousing, customs clearance, and project cargo handling. All services are integrated into end-to-end supply chain solutions designed for commercial, industrial, and government clients.',
    },
    {
      q: 'Do you provide door-to-door delivery services?',
      a: 'Yes. We manage door-to-door logistics solutions that include pickup at origin, international transportation, customs clearance, and final delivery to the destination address. This service is available across multiple transport modes depending on cargo type and delivery timelines.',
    },
    {
      q: 'Can you handle customs clearance and documentation?',
      a: 'Yes. Our customs brokerage team manages all import and export documentation, tariff classification, regulatory approvals, and coordination with customs authorities to ensure compliant and efficient cargo clearance at ports, airports, and border crossings.',
    },
    {
      q: 'Do you provide services for sensitive or regulated cargo?',
      a: 'Yes. We specialize in handling regulated cargo such as pharmaceuticals, medical equipment, oil and gas materials, and high-value industrial equipment. Our operations follow strict safety, temperature-control, and compliance procedures to meet industry-specific regulations.',
    },
    {
      q: 'How do you ensure shipment safety and cargo security?',
      a: 'We apply strict handling procedures, secure transport equipment, approved carrier networks, and continuous monitoring systems. Our operations follow international safety standards and risk management protocols to minimize cargo damage, theft, and transit delays.',
    },
  ],
} as const;

export const insightsSection = {
  eyebrow: 'Press Release',
  title: 'Logistics Insights & Industry Updates',
  description:
    'Expert perspectives on freight forwarding, customs regulations, cold chain logistics, and cross-border transportation strategies.',
  button: 'More Blog',
  featureTitle: ['Best Logistics', 'Company'],
  featureImage: '/blog/containers-bg.webp',
  /** The two posts the staging home page's post grid had selected. */
  homeSlugs: [
    'how-to-choose-the-right-freight-mode-for-your-international-shipments',
    'iraqs-asycuda-revolution-what-it-means-for-logistics-and-trade',
  ],
} as const;

/** About — CEO message (staging copy). */
export const ceoMessage = {
  eyebrow: 'CEO Message',
  quoteLead: '“At Piris Road,',
  quoteRest:
    'we simplify trade and eliminate supply chain complexity. With expertise across Oil and Gas, Medical, Government, Defense, and Technology sectors, we deliver reliable, compliant logistics solutions, on time, every time.',
  author: 'Nyaz',
  role: 'Founder & CEO',
  cards: [
    {
      title: 'Our Vision',
      icon: '/decor/icon-cube.webp',
      text: 'To become Iraq’s most reliable and trusted logistics partner by setting new standards in operational efficiency, safety, service quality, and supply chain transparency, while continuously expanding our regional and international capabilities.',
    },
    {
      title: 'Our Mission',
      icon: '/decor/icon-cubes.webp',
      text: 'To deliver end-to-end logistics solutions that simplify trade, minimize operational risk, and ensure full regulatory compliance across every shipment, while providing responsive, transparent, and cost-effective services to our clients.',
    },
  ],
} as const;

/**
 * About — client reviews (added on staging; the backup only had demo entries).
 * RECOVERY-GAP: one reviewer is still labelled "Someones Name" on staging, so the
 * name is left out; another has a placeholder image, so initials are shown.
 */
export const testimonials = {
  eyebrow: 'Testimonial',
  title: 'Client success stories that inspire trust and growth.',
  watermark: 'Testimonial',
  label: 'Review',
  items: [
    {
      name: 'Mohammad Dawd',
      avatar: '/testimonials/mohammad-dawd.png',
      quote:
        '"From my extensive experience, I wholeheartedly urge everyone to engage with them. Their presence spans the globe, offering invaluable insights and opportunities you won’t miss."',
    },
    {
      name: '',
      avatar: '/testimonials/reviewer-3.png',
      quote: '"Reliable and efficient team, thanks for your effort, keep it up."',
    },
    {
      name: 'Ali sulaiman',
      avatar: '/testimonials/ali-sulaiman.png',
      quote: '"I am proud that Iraq has such a large, world-class logistics company, the fastest and most reliable 👏🏻 Thank you Piris Road"',
    },
    {
      name: 'Safwan Ali Faisal',
      avatar: '',
      quote:
        '"A leading company in the field of international shipping and its services are distinguished. Thank you for the services you provide and, God willing, with continued success and prosperity."',
    },
  ],
} as const;

/** "Need more assistance?" block with the contact form (CF7 "Contact form H_1"). */
export const contactBlock = {
  eyebrow: 'Need more assistance?',
  bookCall: 'Book a personalized call',
  button: 'Get a Quote',
  buttonKey: 'Get a Qoute',
  emailPrefix: 'or email us at',
  hi: 'Hi',
  salesTeam: 'Contact Sales Team',
  responseTime: 'Response time: 1 hours',
  title: 'Driving Growth Through Logistics Excellence',
  fullName: 'Full name *',
  email: 'Your email *',
  message: 'Your message',
  newsletter: 'Subscribe to Newsletter',
  team: 'Support Team',
  submit: 'Submit Now',
} as const;

/** Our Services page — client quote + experience panels (staging copy). */
export const provenBlock = {
  quote:
    'Piris Road has been a reliable logistics partner for our operations. Their ability to manage complex shipments, handle customs efficiently, and maintain clear communication has significantly improved our supply chain performance. We value their professionalism, responsiveness, and commitment to meeting delivery timelines in demanding environments.',
  experienceTitle: 'Proven Experiences',
  experienceText:
    'With over a decade of hands-on logistics experience, Piris Road delivers consistent, compliant, and efficient freight solutions for commercial, industrial, and government sectors. Our proven track record reflects strong operational control and long-term client trust.',
  performanceTitle: 'Proven Performance Across Industries',
  performanceText:
    'We support Oil & Gas, Medical, Government, Defense, and Commercial sectors with tailored logistics strategies, specialized handling procedures, and compliance-driven transport operations designed for critical supply chains.',
  images: ['/misc/proven-1.webp', '/misc/proven-2.webp', '/misc/proven-3.webp'],
} as const;

export const serviceDetail = {
  about: 'About This Service',
  why: 'Why Choose Us',
  whyKey: 'Why Choice Us',
  next: 'Next Service →',
  prev: '← Previous Service',
  icons: ['/decor/feature-icon-1.svg', '/decor/feature-icon-2.svg', '/decor/feature-icon-2.svg', '/decor/feature-icon-4.svg'],
} as const;
