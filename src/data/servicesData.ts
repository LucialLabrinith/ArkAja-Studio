import { ServiceItem } from '../types';

export const STUDIO_SERVICES: ServiceItem[] = [
  // A. WEBSITES
  {
    id: 'websites',
    title: 'WEBSITES',
    description: 'Professional responsive websites built to establish a distinctive online presence for modern brands.',
    priceText: 'From ₹10,000 / Custom Quote',
    category: 'WEBSITES',
    ctaText: 'START A WEBSITE',
    includes: [
      'Responsive design (Mobile + Desktop)',
      'Clean typography & brand aesthetic',
      'Standard pages: Home, About, Services, Contact',
      'Basic animations & micro-interactions',
      'Deployment & hosting setup',
      'Custom website features on request',
    ],
  },
  // B. WEB APPS & BUSINESS SYSTEMS
  {
    id: 'web-apps',
    title: 'WEB APPS & BUSINESS SYSTEMS',
    description: 'Custom digital tools designed around the way your business actually works. A basic web app costs ₹15,000; anything beyond (multi-role, payments, custom enterprise platforms) is quoted custom.',
    priceText: 'From ₹15,000 (Basic) / Custom Quote',
    category: 'DEVELOPMENT',
    ctaText: 'START WEB APP',
    includes: [
      'Basic Web App: ₹15,000 fixed package for single workflow',
      'Booking & Appointments (Services → staff → slot → booking)',
      'Mini Inventory & Stock (Products → stock → update quantities)',
      'Customer Management & CRM (Customers → status → follow-ups)',
      'Billing & Invoice Systems (Calculate bill → generate invoice)',
      'Advanced multi-role platforms quoted custom based on scope',
    ],
  },
  // C. LOGO DESIGN
  {
    id: 'logo-design',
    title: 'LOGO DESIGN',
    description: 'Distinctive, memorable mark and wordmark architecture crafted through a thorough 3-stage identity process.',
    priceText: '₹3,000 (Fixed Package)',
    category: 'BRANDING',
    ctaText: 'COMMISSION LOGO',
    includes: [
      'Logo Concept: Understanding business & visual direction',
      'Logo Variations: Primary, alternate/compact & icon/mark',
      'Delivery Kit: High-res files, transparent, color & monochrome',
      'Files ready for web, print, and social media',
      'Up to 2 revision rounds included',
    ],
  },
  // D. BRAND IDENTITY
  {
    id: 'brand-identity',
    title: 'BRAND IDENTITY',
    description: 'Comprehensive visual direction systems that ensure your brand is cohesive, authoritative, and immediately recognizable.',
    priceText: 'Custom Quote',
    category: 'BRANDING',
    ctaText: 'REQUEST A QUOTE',
    includes: [
      'Complete logo system & responsive marks',
      'Curated brand color palette & dark/light codes',
      'Brand typography hierarchy & font pairings',
      'Social media visual direction & feed systems',
      'Basic brand guidelines & application rules',
      'Business collateral & stationery where required',
    ],
  },
  // E. SOCIAL MEDIA & CONTENT
  {
    id: 'social-content',
    title: 'SOCIAL MEDIA & CONTENT',
    description: 'Editorial social content that gives your feed a clear, high-fashion visual identity and consistent storytelling.',
    priceText: 'From ₹2,499 (Starter / Signature)',
    category: 'CONTENT',
    ctaText: 'EXPLORE PACKAGES',
    includes: [
      'Bespoke Instagram posts & carousels',
      'High-impact editorial stories',
      'Brand-tailored captions & tone of voice',
      'Content calendar direction & aesthetic layout',
      'Kinetic motion visuals & kinetic formats',
    ],
  },
  // F. CAMPAIGN & PROMOTIONAL CREATIVE
  {
    id: 'campaign-creative',
    title: 'CAMPAIGN & PROMOTIONAL CREATIVE',
    description: 'Cohesive, high-conversion visual campaigns for product launches, seasonal collections, offers, and brand moments.',
    priceText: 'Signature / Custom Quote',
    category: 'CONTENT',
    ctaText: 'START CAMPAIGN',
    includes: [
      'End-to-end campaign concepts & art direction',
      'Product launch & hero promotional visuals',
      'Seasonal, festival & limited-time offer assets',
      'High-conversion event & announcement graphics',
      'Multi-format adaptation across digital channels',
    ],
  },
  // G. AI CHATBOT
  {
    id: 'ai-chatbot',
    title: 'AI CHATBOT',
    description: 'Intelligent, website-integrated conversational assistant powered by modern AI to engage visitors and answer business inquiries 24/7.',
    priceText: '+₹5,000 (Add-on / Standalone)',
    category: 'AI',
    ctaText: 'ADD AI CHATBOT',
    includes: [
      'Website-integrated chat interface matching your brand',
      'AI-powered responses trained on your business & FAQ',
      'Real-time customer guidance & lead capture',
      'Setup, prompt tuning & website embedding',
      'Note: Complex custom integrations quoted separately',
    ],
  },
  // H. AI-ASSISTED BUSINESS SOLUTIONS
  {
    id: 'ai-business-solutions',
    title: 'AI-ASSISTED BUSINESS SOLUTIONS',
    description: 'Custom AI workflows and automated business tools engineered to accelerate client operations and decision making.',
    priceText: 'Custom Quote',
    category: 'AI',
    ctaText: 'REQUEST A QUOTE',
    includes: [
      'AI-assisted website features & smart recommendation flows',
      'Automated content & creative production pipelines',
      'Custom AI integrations & business data workflows',
      'Intelligent inquiry routing & lead qualification',
      'Bespoke AI-assisted business tooling',
    ],
  },
];

export const CUSTOM_VIDEO_SERVICE = {
  title: 'SHORT-FORM VIDEO / REELS',
  badge: 'AVAILABLE AS A CUSTOM SERVICE',
  description:
    'Tailored short-form video concepts and motion direction created on request for brands requiring kinetic social storytelling.',
  includes: [
    'Concept & storyboard direction',
    'Promotional video edits',
    'Product showcase reels',
    'Custom pacing & audio treatment',
  ],
};

export const SERVICES_LIST = STUDIO_SERVICES;

