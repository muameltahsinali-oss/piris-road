/**
 * The seven services. Every field is recovered verbatim from the archive:
 *  - title / slug / body  -> wp_posts (post_type='services')
 *  - featureCards         -> ACF fields c1_title/c1_content … c4_title/c4Content
 *  - cardTitle / summary / tags -> the tx_service_section widgets on the
 *    Home and Our Services pages (Elementor settings)
 *  - image                -> _thumbnail_id featured image
 *
 * Slugs are preserved exactly as WordPress had them so old links keep working.
 * See RECOVERY_REPORT.md §4.7.
 */

export type FeatureCard = { title: string; content: string };

export type Service = {
  slug: string;
  /** Full post title. */
  title: string;
  /** Shorter label used on service cards and in the nav dropdown. */
  cardTitle: string;
  /** Nav-dropdown label, from the active "My Menu". */
  navLabel: string;
  /** One-line summary used on the card grids. */
  summary: string;
  /** SEO keyword tags shown as chips on the cards. */
  tags: string[];
  /** Long-form body copy (from post_content). */
  body: string;
  /** Featured image (originally an SVG wrapping a JPEG; converted to WebP). */
  image: string;
  /** Photographic card image, where the original had one. */
  cardImage?: string;
  featureCards: FeatureCard[];
};

export const services: Service[] = [
  {
    slug: 'sea-freight-solutions-fcl-lcl-shipping',
    title: 'Sea Freight Solutions (FCL & LCL Shipping)',
    cardTitle: 'Sea Freight Solutions',
    navLabel: 'Sea Freight Solutions',
    summary:
      'Cost-effective international ocean freight solutions for full container and consolidated shipments with reliable global carrier networks.',
    tags: ['ocean freight forwarding', 'FCL shipping', 'LCL shipping', 'container shipping'],
    body:
      'Our sea freight services provide reliable and cost-effective international shipping solutions for both full container load (FCL) and less than container load (LCL) cargo. We manage the complete ocean freight process including carrier booking, export documentation, port handling, customs coordination, and inland transportation to final destination.\n\n' +
      'Through strong relationships with global shipping lines and port operators, we secure stable schedules, competitive rates, and flexible routing options. Our sea freight solutions support commercial trade, industrial equipment shipments, and project cargo movements with professional oversight at every stage of transit.',
    image: '/services/sea-freight.webp',
    cardImage: '/services/card-sea-freight.webp',
    featureCards: [
      {
        title: 'Global Carrier Network',
        content:
          'We work with trusted international shipping lines to ensure reliable sailing schedules and secure container handling.',
      },
      {
        title: 'End-to-End Management',
        content:
          'From origin pickup to final delivery, we control every step of the sea freight process to reduce delays and risks.',
      },
      {
        title: 'Customs & Port Expertise',
        content:
          'Our team coordinates closely with ports and customs authorities to ensure smooth cargo clearance and fast processing.',
      },
      {
        title: 'Cost Optimization',
        content:
          'We design routing and consolidation strategies that balance transit time and shipping cost efficiently.',
      },
    ],
  },
  {
    slug: 'air-freight-and-time-critical-cargo-services',
    title: 'Air Freight and Time-Critical Cargo Services',
    cardTitle: 'Air Freight and Time-Critical Cargo',
    navLabel: 'Air Freight',
    summary:
      'Fast and secure air cargo services for urgent, high-value, and time-sensitive international shipments.',
    tags: ['air freight', 'press cargo shipping', 'international air cargo', 'time-critical'],
    body:
      'Our air freight solutions are designed for urgent, high-value, and time-sensitive shipments that require fast and secure transportation. We handle flight booking, priority cargo handling, customs clearance, and final delivery with continuous tracking and operational monitoring.\n\n' +
      'Whether transporting medical supplies, spare parts, electronics, or urgent commercial cargo, we ensure reliable transit schedules and strict regulatory compliance. Our airline partnerships allow us to secure priority capacity and optimized flight connections worldwide.',
    image: '/services/air-freight.webp',
    cardImage: '/services/card-air-freight.webp',
    featureCards: [
      {
        title: 'Priority Cargo Handling',
        content: 'We secure fast flight connections and priority loading for urgent and critical shipments.',
      },
      {
        title: 'Continuous Tracking',
        content: 'Real-time shipment monitoring ensures visibility and rapid response to schedule changes.',
      },
      {
        title: 'Regulatory Compliance',
        content: 'We manage aviation and customs documentation to prevent delays and penalties.',
      },
      {
        title: 'Fast Door-to-Door Delivery',
        content: 'We coordinate ground transport to ensure seamless final-mile delivery after landing.',
      },
    ],
  },
  {
    slug: 'domestic-and-cross-border-road-transport-solutions',
    title: 'Domestic and Cross-Border Road Transport Solutions',
    cardTitle: 'Domestic and Cross-Border Road Transportation',
    navLabel: 'Cross-Border Road Transport',
    summary:
      'Reliable trucking services for local and international cargo movement with secure transit and route optimization.',
    tags: [
      'road freight services',
      'cross-border trucking',
      'domestic transport solutions',
      'land freight logistics',
    ],
    body:
      'Our road transport services provide safe and efficient cargo movement across domestic routes and international border crossings. We operate through certified trucking partners with experience handling palletized goods, heavy equipment, and specialized cargo types.\n\n' +
      'With advanced route planning, border coordination, and real-time tracking, we ensure reliable delivery schedules while maintaining compliance with transport regulations and customs procedures.',
    image: '/services/road-transport.webp',
    cardImage: '/services/card-road-transport.webp',
    featureCards: [
      {
        title: 'Cross-Border Expertise',
        content: 'We manage border procedures and documentation to reduce transit delays.',
      },
      {
        title: 'Secure Transport Operations',
        content: 'All shipments follow safety protocols and controlled handling procedures.',
      },
      {
        title: 'Flexible Fleet Options',
        content: 'We provide different vehicle types to match cargo size and handling needs.',
      },
      {
        title: 'Route Optimization',
        content: 'We select efficient routes to minimize transit time and fuel costs.',
      },
    ],
  },
  {
    slug: 'cold-chain-and-temperature-controlled-logistics',
    title: 'Cold Chain and Temperature-Controlled Logistics',
    cardTitle: 'Cold Chain and Temperature-Controlled Transportation',
    navLabel: 'Cold Chain',
    summary:
      'Secure refrigerated transport and storage solutions for pharmaceuticals, food products, and sensitive materials.',
    tags: ['cold chain', 'refrigerated trucking', 'pharmaceutical logistics'],
    body:
      'Our cold chain logistics services ensure strict temperature control throughout transportation and storage to protect sensitive cargo such as pharmaceuticals, medical products, and perishable goods. We provide refrigerated vehicles, temperature-controlled containers, and monitoring systems to maintain product integrity.\n\n' +
      'With validated handling procedures and compliance with health regulations, we ensure safe delivery across all stages of the supply chain.',
    image: '/services/cold-chain.webp',
    cardImage: '/services/card-cold-chain.webp',
    featureCards: [
      {
        title: 'Temperature Monitoring',
        content: 'Continuous tracking ensures stable temperature conditions throughout transit.',
      },
      {
        title: 'Pharmaceutical Compliance',
        content: 'Operations follow healthcare and food safety standards.',
      },
      {
        title: 'Specialized Equipment',
        content: 'Refrigerated vehicles and insulated containers protect product quality.',
      },
      {
        title: 'Risk-Controlled Handling',
        content: 'Strict protocols reduce product loss and contamination risks.',
      },
    ],
  },
  {
    slug: 'warehousing-and-inventory-management-services',
    title: 'Warehousing and Inventory Management Services',
    cardTitle: 'Warehousing, Storage, and Inventory Solutions',
    navLabel: 'Warehousing and Inventory',
    summary:
      'Secure storage facilities with inventory control and distribution support for supply chain optimization.',
    tags: ['warehousing services', 'logistics storage solutions', 'inventory management systems'],
    body:
      'Our warehousing solutions provide secure storage, inventory control, and distribution support for commercial and industrial supply chains. We manage receiving, storage, order processing, and dispatch operations integrated with transportation planning.\n\n' +
      'Our facilities and systems help clients reduce storage costs, improve inventory visibility, and maintain continuous product availability.',
    image: '/services/warehousing.webp',
    featureCards: [
      {
        title: 'Secure Storage Facilities',
        content: 'Controlled access and organized storage protect inventory integrity.',
      },
      {
        title: 'Inventory Visibility',
        content: 'Structured stock management improves planning and order fulfillment.',
      },
      {
        title: 'Distribution Support',
        content: 'Warehousing is integrated with transport for efficient dispatch.',
      },
      {
        title: 'Scalable Capacity',
        content: 'Flexible storage options support seasonal and project demands.',
      },
    ],
  },
  {
    slug: 'customs-clearance-and-trade-compliance-services',
    title: 'Customs Clearance and Trade Compliance Services',
    cardTitle: 'Customs Clearance and Regulatory Compliance Services',
    navLabel: 'Customs Clearance and Trade',
    summary:
      'Professional customs brokerage ensuring fast processing and full trade compliance at all border points.',
    tags: [
      'customs clearance',
      'customs brokerage Iraq',
      'import export documentation',
      'trade compliance solutions',
    ],
    body:
      'Our customs clearance services ensure accurate documentation, tariff classification, duty processing, and regulatory compliance at all entry and exit points. We manage communication with customs authorities to prevent delays, penalties, and shipment holds.\n\n' +
      'By staying updated with changing trade regulations, we help clients maintain smooth cross-border operations and predictable delivery schedules.',
    image: '/services/customs-clearance.webp',
    featureCards: [
      {
        title: 'Regulatory Expertise',
        content: 'We manage complex customs procedures and trade regulations.',
      },
      { title: 'Fast Processing', content: 'Efficient documentation reduces clearance delays.' },
      {
        title: 'Risk Prevention',
        content: 'Proper compliance protects clients from fines and shipment rejection.',
      },
      {
        title: 'Authority Coordination',
        content: 'Direct coordination with customs offices ensures smooth approvals.',
      },
    ],
  },
  {
    slug: 'project-cargo-and-heavy-lift-logistics-solutions',
    title: 'Project Cargo and Heavy Lift Logistics Solutions',
    cardTitle: 'Project Cargo and Heavy Lift Logistics Solutions',
    navLabel: 'Project Cargo and Heavy Lift',
    summary:
      'Specialized transport for oversized, high-weight, and complex industrial cargo with engineering support.',
    tags: ['project cargo logistics', 'heavy lift transportation', 'oversized cargo shipping', 'industrial equipment transport'],
    body:
      'Our project cargo services support transportation of oversized, heavy, and complex industrial equipment. We manage full project planning including route surveys, load engineering, permits, lifting operations, and multimodal transport coordination.\n\n' +
      'With experience in energy, infrastructure, and industrial projects, we ensure safe execution, regulatory compliance, and precise delivery scheduling.',
    image: '/services/project-cargo.webp',
    featureCards: [
      { title: 'Engineering Planning', content: 'Detailed load and route studies ensure safe transport.' },
      {
        title: 'Specialized Equipment',
        content: 'We use cranes, trailers, and lifting tools for heavy cargo.',
      },
      { title: 'Multimodal Coordination', content: 'We combine sea, road, and port handling seamlessly.' },
      {
        title: 'Project Management Control',
        content: 'Dedicated coordination teams manage timelines and risks.',
      },
    ],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

/** Prev/next pairing, replacing the original's [services_nav] PHP shortcode. */
export function getServiceNeighbours(slug: string) {
  const i = services.findIndex((s) => s.slug === slug);
  return {
    prev: i > 0 ? services[i - 1] : undefined,
    next: i >= 0 && i < services.length - 1 ? services[i + 1] : undefined,
  };
}
