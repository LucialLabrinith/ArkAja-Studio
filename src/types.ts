export type ProjectCategory = 'ALL' | 'BEAUTY' | 'FASHION' | 'HOSPITALITY';

export interface ProjectCreativeDirection {
  title: string;
  subtitle?: string;
  format?: 'post' | 'story' | 'carousel' | 'offer';
  description?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: 'BEAUTY' | 'FASHION' | 'HOSPITALITY';
  label: 'CONCEPT PROJECT';
  productionLabel: 'AI-ASSISTED CREATIVE PRODUCTION';
  tagline: string;
  description: string;
  services: string[];
  creativeDirections: ProjectCreativeDirection[];
  images: string[];
  colorPalette: string[];
  year: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  includes: string[];
  tag?: string;
  category?: string;
  priceText?: string;
  ctaText?: string;
}

export interface PricingPackage {
  id:
    | 'starter'
    | 'signature'
    | 'custom'
    | 'basic-website'
    | 'urgent-website'
    | 'logo-design'
    | 'brand-identity'
    | 'web-apps'
    | 'ai-chatbot'
    | 'ai-business'
    | 'business-launch'
    | string;
  name: string;
  priceInr: string;
  priceInrNumber?: number;
  priceUsd: string;
  priceEur: string;
  priceGbp?: string;
  subtitle: string;
  features: string[];
  delivery: string;
  ctaText: string;
  popular?: boolean;
  isCustomQuote?: boolean;
  category?: 'WEBSITES' | 'BRANDING' | 'DEVELOPMENT' | 'AI' | 'CONTENT' | 'BUNDLE';
  disclaimer?: string;
}

export interface CustomBuilderState {
  categories: string[];
  selectedServiceItems?: string[];
  calculatedSubtotalInr?: number;
  hasCustomQuoteItems?: boolean;
  socialFormats: string[];
  campaignTypes: string[];
  brandVisuals: string[];
  videoTypes: string[];
  counts: {
    posts: number;
    stories: number;
    carousels: number;
    promotionalCreatives: number;
    reels: number;
  };
  somethingElse: string;
  businessType: string;
  country: string;
  timeline: string;
  budget: string;
}

export interface EnquiryFormData {
  fullName: string;
  brandName: string;
  email: string;
  country: string;
  phone: string;
  businessCategory: string;
  neededServices: string[];
  selectedServiceItems?: string[];
  calculatedSubtotalInr?: number;
  isCustomQuote?: boolean;
  preferredPackage: string;
  deliverableCounts: Record<string, number>;
  timeline: string;
  budget: string;
  projectDetails: string;
  referenceLinks: string;
}
