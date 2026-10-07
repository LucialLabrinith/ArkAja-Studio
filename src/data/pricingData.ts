import { PricingPackage } from '../types';

// ============================================================================
// 1. WEBSITES & DIGITAL PRESENCE PACKAGES
// ============================================================================
export const WEBSITE_PACKAGES: PricingPackage[] = [
  {
    id: 'basic-website',
    name: 'BASIC WEBSITE',
    priceInr: '₹10,000',
    originalPriceInr: '₹12,500',
    discountBadge: '20% OFF · NAVRATRI SPECIAL',
    priceInrNumber: 10000,
    priceUsd: '$120',
    priceEur: '€110',
    priceGbp: '£95',
    category: 'WEBSITES',
    subtitle: 'Launch a clean, professional online presence for your business.',
    features: [
      'Professional responsive website (mobile + desktop)',
      'Basic visual design & brand typography',
      'Standard pages: Home, About, Services, Contact',
      'Basic animations & micro-interactions',
      'Production deployment & live hosting configuration',
      'Contact information display (Email, Phone, WhatsApp)',
    ],
    delivery: '5–7 Business Days',
    ctaText: 'SELECT BASIC WEBSITE (₹10,000)',
    popular: false,
    disclaimer: 'Basic website package. Custom requirements are charged separately.',
  },
  {
    id: 'urgent-website',
    name: 'URGENT BASIC WEBSITE',
    priceInr: '₹12,000',
    originalPriceInr: '₹15,000',
    discountBadge: '20% OFF · NAVRATRI SPECIAL',
    priceInrNumber: 12000,
    priceUsd: '$145',
    priceEur: '€135',
    priceGbp: '£115',
    category: 'WEBSITES',
    subtitle: 'Priority fast-track production delivery for time-critical business launches.',
    features: [
      'Includes complete Basic Website package (₹10,000)',
      'Priority fast-track production queue (+₹2,000 priority delivery charge)',
      'Professional responsive layout (mobile + desktop)',
      'Standard pages: Home, About, Services, Contact',
      'Immediate deployment upon asset handoff',
      'Dedicated launch assistance',
    ],
    delivery: '48–72h Priority Delivery',
    ctaText: 'CHOOSE URGENT WEBSITE (₹12,000)',
    popular: true,
    disclaimer: 'Includes ₹2,000 priority/urgent delivery charge. Custom requirements are charged separately.',
  },
];

// ============================================================================
// 2. WEBSITE ADD-ONS & HARDWARE/DOMAIN NOTICES
// ============================================================================
export interface WebsiteAddon {
  id: string;
  name: string;
  priceInr: string;
  originalPriceInr?: string;
  priceInrNumber: number;
  description: string;
  note?: string;
  badge?: string;
}

export const WEBSITE_ADDONS: WebsiteAddon[] = [
  {
    id: 'urgent-delivery',
    name: 'Urgent Delivery',
    priceInr: '+₹2,000',
    originalPriceInr: '+₹2,500',
    priceInrNumber: 2000,
    description: 'Priority queue placement for expedited delivery of your basic website.',
    note: 'Priority delivery charge applied to basic website scope.',
    badge: '20% FESTIVE OFF',
  },
  {
    id: 'enquiry-integration',
    name: 'Enquiry Form Integration',
    priceInr: '+₹3,000',
    originalPriceInr: '+₹3,750',
    priceInrNumber: 3000,
    description:
      'The basic website can display your contact information, email, phone or WhatsApp. If you require an actual enquiry form that collects and manages customer enquiries, enquiry integration is available as an add-on.',
    note: 'Includes automated inbox routing, Firestore ledger recording & client notifications.',
    badge: '20% FESTIVE OFF',
  },
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot Integration',
    priceInr: '+₹5,000',
    originalPriceInr: '+₹6,250',
    priceInrNumber: 5000,
    description:
      'Website-integrated conversational assistant with AI-powered responses trained on your business knowledge and FAQ for real-time customer assistance.',
    note: 'Basic AI chatbot package. Advanced AI functionality, complex integrations or custom AI systems may require additional charges.',
    badge: '20% FESTIVE OFF',
  },
];

export const DOMAIN_NOTICE = {
  title: 'CUSTOM DOMAIN',
  text: 'Domain registration cost + applicable ArkAja setup/handling fee.',
  note: 'Domain registration is not included in the basic website price. Custom domains are configured to the registrar of your choice.',
};

// ============================================================================
// 3. BRANDING & LOGO DESIGN PACKAGES
// ============================================================================
export const BRANDING_PACKAGES: PricingPackage[] = [
  {
    id: 'logo-design',
    name: 'LOGO DESIGN',
    priceInr: '₹3,000',
    originalPriceInr: '₹3,750',
    discountBadge: '20% OFF · NAVRATRI SPECIAL',
    priceInrNumber: 3000,
    priceUsd: '$36',
    priceEur: '€33',
    priceGbp: '£29',
    category: 'BRANDING',
    subtitle: 'Build a distinctive, timeless visual identity for your business.',
    features: [
      '1. LOGO CONCEPT: Business deep-dive, visual direction, and primary concept',
      '2. LOGO VARIATIONS: Primary logo, alternate/compact version, and icon/mark version',
      '3. DELIVERY KIT: High-res files, transparent backgrounds, color & monochrome versions',
      'Files ready and optimized for web, social media, and print collateral',
      'Up to 2 revision rounds included (unlimited revisions not offered)',
    ],
    delivery: '3–5 Business Days',
    ctaText: 'START LOGO DESIGN (₹3,000)',
    popular: false,
    disclaimer: 'Fixed package price includes up to 2 revision rounds. Additional conceptual directions charged separately.',
  },
  {
    id: 'brand-identity',
    name: 'BRAND IDENTITY',
    priceInr: 'Custom Quote',
    priceUsd: 'Bespoke Quote',
    priceEur: 'Sur Mesure',
    priceGbp: 'Tailored',
    category: 'BRANDING',
    subtitle: 'End-to-end visual identity architecture tailored to elevated modern brands.',
    features: [
      'Complete logo system & responsive mark lockups',
      'Curated brand color palette (HEX, RGB, CMYK codes)',
      'Primary & secondary typography hierarchy guidelines',
      'Visual direction & art direction moodboards',
      'Social media identity & grid composition templates',
      'Basic brand guidelines & brand voice overview',
      'Business collateral & stationery design where required',
    ],
    delivery: 'Bespoke Timeline',
    ctaText: 'REQUEST BRAND IDENTITY QUOTE',
    popular: false,
    isCustomQuote: true,
    disclaimer: 'Quoted individually based on required asset scope, collateral depth, and deliverables.',
  },
];

// ============================================================================
// 4. WEB APPS, AI SOLUTIONS & CUSTOM DEVELOPMENT
// ============================================================================
export const CUSTOM_DEV_PACKAGES: PricingPackage[] = [
  {
    id: 'basic-web-app',
    name: 'BASIC WEB APP (LEVEL 1)',
    priceInr: '₹15,000',
    originalPriceInr: '₹18,750',
    discountBadge: '20% OFF · NAVRATRI SPECIAL',
    priceInrNumber: 15000,
    priceUsd: '$180',
    priceEur: '€165',
    priceGbp: '£140',
    category: 'DEVELOPMENT',
    subtitle: 'Custom single-workflow operational tool designed around your daily business process.',
    features: [
      'Level 1 Basic Web App package (₹15,000 fixed price)',
      'Single workflow application (e.g. Appointment booking, Salon booking, Mini inventory, Billing/Invoice, Order request)',
      'User input forms & responsive UI (mobile + desktop)',
      'Database setup with Add, Edit, Delete & Search records',
      'Status tracking & basic admin dashboard view',
      'Basic authentication & email notifications',
      'Anything aside from basic workflow is quoted custom',
    ],
    delivery: '7–10 Business Days',
    ctaText: 'SELECT BASIC WEB APP (₹15,000)',
    popular: true,
    isCustomQuote: false,
    disclaimer: 'Basic web app package is fixed at ₹15,000. Advanced systems with multiple user roles, payments, or custom platforms are quoted separately.',
  },
  {
    id: 'web-apps',
    name: 'ADVANCED WEB APPS & PLATFORMS',
    priceInr: 'Custom Quote',
    priceUsd: 'Bespoke Quote',
    priceEur: 'Sur Mesure',
    priceGbp: 'Tailored',
    category: 'DEVELOPMENT',
    subtitle: 'Multi-role operational platforms, complex automated workflows, and custom enterprise tools.',
    features: [
      'Level 2 & Level 3 advanced web apps & custom platforms',
      'Multi-role access (Customer, Staff & Admin permissions)',
      'Payment gateway flows (Razorpay / Stripe) & auto invoicing',
      'Automated WhatsApp, SMS & email notification workflows',
      'Advanced analytics dashboards, file uploads & custom reports',
      'Specialized platforms (Hospital management, scholarship systems, SaaS, monitoring)',
      'Quoted based on architectural complexity and user roles',
    ],
    delivery: 'Sprint Scoped',
    ctaText: 'REQUEST CUSTOM SYSTEM QUOTE',
    popular: false,
    isCustomQuote: true,
    disclaimer: 'Anything aside from the ₹15,000 basic web app is quoted individually based on requirements.',
  },
  {
    id: 'ai-business',
    name: 'AI-ASSISTED BUSINESS SOLUTIONS',
    priceInr: 'Custom Quote',
    priceUsd: 'Bespoke Quote',
    priceEur: 'Sur Mesure',
    priceGbp: 'Tailored',
    category: 'AI',
    subtitle: 'Custom AI workflows, automated tooling, and smart business integrations.',
    features: [
      'AI-assisted website features & customized interactive flows',
      'Business workflow automation & smart data processing',
      'AI-powered content pipelines & creative tooling',
      'Custom AI integrations with your existing business stack',
      'Dedicated AI business solutions engineered to requirements',
    ],
    delivery: 'Scoped per Project',
    ctaText: 'REQUEST AI SOLUTIONS QUOTE',
    popular: false,
    isCustomQuote: true,
    disclaimer: 'Features implemented as per validated technical specifications. Quoted separately.',
  },
  {
    id: 'custom-website-features',
    name: 'CUSTOM WEBSITE FEATURES',
    priceInr: 'Custom Quote',
    priceUsd: 'Bespoke Quote',
    priceEur: 'Sur Mesure',
    priceGbp: 'Tailored',
    category: 'WEBSITES',
    subtitle: 'Advanced functionalities for websites exceeding standard basic pages.',
    features: [
      'Advanced UI/UX & bespoke interactive components',
      'Additional custom pages beyond standard 4 pages',
      'Advanced WebGL, 3D or kinetic animations',
      'Booking systems & calendar synchronizations',
      'Admin dashboards, user login & authentication',
      'Database functionality & dynamic content feeds',
      'Custom payment systems & checkout workflows',
    ],
    delivery: 'Scoped per Feature',
    ctaText: 'REQUEST FEATURE QUOTE',
    popular: false,
    isCustomQuote: true,
    disclaimer: 'Any feature outside the Basic Website package is quoted individually.',
  },
];

// ============================================================================
// 5. BUSINESS LAUNCH COMPREHENSIVE SERVICE
// ============================================================================
export const BUSINESS_LAUNCH_PACKAGE: PricingPackage = {
  id: 'business-launch',
  name: 'BUSINESS LAUNCH',
  priceInr: 'Custom Quote',
  priceUsd: 'Bespoke Bundle',
  priceEur: 'Sur Mesure',
  priceGbp: 'Tailored',
  category: 'BUNDLE',
  subtitle:
    'Need more than one thing? Build your business presence with a combination of branding, website, and digital creative services.',
  features: [
    'Logo Design & Variations Kit',
    'Brand Identity & Color/Typography Guidelines',
    'Responsive Business Website',
    'Enquiry Form & CRM Integration',
    'Website-Integrated AI Chatbot',
    'Social Media Launch Creatives & Content Grid',
    'Custom Web App or Feature Additions',
    'Dedicated creative launch direction across all touchpoints',
  ],
  delivery: 'Coordinated Launch Timeline',
  ctaText: 'REQUEST A CUSTOM LAUNCH QUOTE',
  popular: true,
  isCustomQuote: true,
  disclaimer: 'Full multi-disciplinary launch tailored to your exact combination of required services.',
};

// ============================================================================
// 6. EXISTING EDITORIAL & SOCIAL PACKAGES (PRESERVED 100%)
// ============================================================================
export const EDITORIAL_PACKAGES: PricingPackage[] = [
  {
    id: 'starter',
    name: 'STARTER',
    priceInr: '₹2,499',
    originalPriceInr: '₹3,125',
    discountBadge: '20% OFF · NAVRATRI SPECIAL',
    priceInrNumber: 2499,
    priceUsd: '$30',
    priceEur: '€28',
    priceGbp: '£24',
    category: 'CONTENT',
    subtitle: 'One-time project package for emerging brands seeking elevated feed aesthetics.',
    features: [
      '4 bespoke posts',
      '2 editorial stories',
      '1 promotional creative',
      '1 short-form visual',
      'Consistent visual direction',
    ],
    delivery: '3–5 Business Days',
    ctaText: 'CHOOSE STARTER',
    popular: false,
  },
  {
    id: 'signature',
    name: 'SIGNATURE',
    priceInr: '₹4,999',
    originalPriceInr: '₹6,249',
    discountBadge: '20% OFF · NAVRATRI SPECIAL',
    priceInrNumber: 4999,
    priceUsd: '$60',
    priceEur: '€55',
    priceGbp: '£48',
    category: 'CONTENT',
    subtitle: 'Our flagship complete editorial package with priority turnaround and captions.',
    features: [
      '8 bespoke posts',
      '4 editorial stories',
      '2 promotional creatives',
      'Brand-tailored captions included',
      'Consistent visual direction & palette',
      '48-hour delivery option',
    ],
    delivery: '48-Hour Delivery',
    ctaText: 'CHOOSE SIGNATURE',
    popular: true,
  },
  {
    id: 'custom',
    name: 'CUSTOM CAMPAIGN',
    priceInr: 'As Per Requirement',
    priceUsd: 'Bespoke Quote',
    priceEur: 'Sur Mesure',
    priceGbp: 'Tailored',
    category: 'CONTENT',
    subtitle:
      'Customized as per requirement (no fixed price). Quoted individually for major product launches, bespoke volume, and visual systems.',
    features: [
      'Larger campaigns & brand launches',
      'Custom content scope as per requirement',
      'Brand visual systems & design guides',
      'Larger content volumes & variations',
      'Short-form video / reels on request',
      'Custom timelines & priority revisions',
    ],
    delivery: 'Custom Timeline',
    ctaText: 'BUILD SCOPE / GET QUOTE',
    popular: false,
    isCustomQuote: true,
  },
];

// Preserved default export for existing components
export const PRICING_PACKAGES: PricingPackage[] = EDITORIAL_PACKAGES;

// Complete master catalog
export const ALL_PRICING_PACKAGES: PricingPackage[] = [
  ...WEBSITE_PACKAGES,
  ...BRANDING_PACKAGES,
  ...CUSTOM_DEV_PACKAGES,
  BUSINESS_LAUNCH_PACKAGE,
  ...EDITORIAL_PACKAGES,
];
