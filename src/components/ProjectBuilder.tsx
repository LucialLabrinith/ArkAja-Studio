import React, { useState, useMemo } from 'react';
import { CustomBuilderState } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { saveDraftToFirestore } from '../lib/firebase';
import { Logo } from './Logo';
import {
  Minus,
  Plus,
  ArrowRight,
  Check,
  Sparkles,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Layers,
  CreditCard,
} from 'lucide-react';

interface ProjectBuilderProps {
  onContinueToEnquiry: (builderState: CustomBuilderState) => void;
  onOpenAdvisor: () => void;
  onPayFixedSubtotal?: (amountInr: number, bundleTitle: string, items: string[]) => void;
}

export interface ServiceSelectionItem {
  id: string;
  label: string;
  priceLabel: string;
  originalPriceLabel?: string;
  fixedPrice?: number;
  isCustomQuote: boolean;
  category: 'WEBSITE' | 'BRANDING' | 'CONTENT' | 'DEV' | 'AI' | 'OTHER';
}

export const BUILDER_SERVICE_OPTIONS: ServiceSelectionItem[] = [
  {
    id: 'basic-website',
    label: 'Basic Website',
    priceLabel: '₹10,000',
    originalPriceLabel: '₹12,500',
    fixedPrice: 10000,
    isCustomQuote: false,
    category: 'WEBSITE',
  },
  {
    id: 'urgent-website',
    label: 'Urgent Website Delivery',
    priceLabel: '+₹2,000',
    originalPriceLabel: '+₹2,500',
    fixedPrice: 2000,
    isCustomQuote: false,
    category: 'WEBSITE',
  },
  {
    id: 'enquiry-integration',
    label: 'Enquiry Form Integration',
    priceLabel: '+₹3,000',
    originalPriceLabel: '+₹3,750',
    fixedPrice: 3000,
    isCustomQuote: false,
    category: 'WEBSITE',
  },
  {
    id: 'ai-chatbot',
    label: 'AI Chatbot',
    priceLabel: '+₹5,000',
    originalPriceLabel: '+₹6,250',
    fixedPrice: 5000,
    isCustomQuote: false,
    category: 'AI',
  },
  {
    id: 'logo-design',
    label: 'Logo Design',
    priceLabel: '₹3,000',
    originalPriceLabel: '₹3,750',
    fixedPrice: 3000,
    isCustomQuote: false,
    category: 'BRANDING',
  },
  {
    id: 'brand-identity',
    label: 'Brand Identity',
    priceLabel: 'Custom Quote',
    isCustomQuote: true,
    category: 'BRANDING',
  },
  {
    id: 'basic-web-app',
    label: 'Basic Web App (Level 1)',
    priceLabel: '₹15,000',
    originalPriceLabel: '₹18,750',
    fixedPrice: 15000,
    isCustomQuote: false,
    category: 'DEV',
  },
  {
    id: 'web-apps',
    label: 'Advanced Web App / Custom Platform',
    priceLabel: 'Custom Quote',
    isCustomQuote: true,
    category: 'DEV',
  },
  {
    id: 'social-content',
    label: 'Social Media & Content',
    priceLabel: 'Scope Dependent',
    isCustomQuote: false,
    category: 'CONTENT',
  },
  {
    id: 'campaign-creative',
    label: 'Campaign / Promotional Creative',
    priceLabel: 'Scope Dependent',
    isCustomQuote: false,
    category: 'CONTENT',
  },
  {
    id: 'ai-business',
    label: 'AI-Assisted Business Solution',
    priceLabel: 'Custom Quote',
    isCustomQuote: true,
    category: 'AI',
  },
  {
    id: 'custom-website-features',
    label: 'Custom Website Features',
    priceLabel: 'Custom Quote',
    isCustomQuote: true,
    category: 'WEBSITE',
  },
  {
    id: 'other',
    label: 'Other',
    priceLabel: 'Custom Quote',
    isCustomQuote: true,
    category: 'OTHER',
  },
];

export const ProjectBuilder: React.FC<ProjectBuilderProps> = ({
  onContinueToEnquiry,
  onOpenAdvisor,
  onPayFixedSubtotal,
}) => {
  const { isDark } = useTheme();
  const { user, refreshUserData } = useAuth();
  const [draftSaved, setDraftSaved] = useState(false);

  // Selected Services from Section 13
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    'basic-website',
    'enquiry-integration',
  ]);

  const [state, setState] = useState<CustomBuilderState>({
    categories: ['Websites', 'Enquiry Integration'],
    selectedServiceItems: ['Basic Website — ₹10,000', 'Enquiry Form Integration — +₹3,000'],
    calculatedSubtotalInr: 13000,
    hasCustomQuoteItems: false,
    socialFormats: ['Instagram Post', 'Story'],
    campaignTypes: [],
    brandVisuals: [],
    videoTypes: [],
    counts: {
      posts: 4,
      stories: 2,
      carousels: 0,
      promotionalCreatives: 1,
      reels: 0,
    },
    somethingElse: '',
    businessType: 'Beauty',
    country: 'India',
    timeline: '3–5 days',
    budget: '₹10,000–₹25,000',
  });

  // Calculate pricing based on selection
  const pricingCalculation = useMemo(() => {
    let subtotal = 0;
    const selectedItems = BUILDER_SERVICE_OPTIONS.filter((s) => selectedServiceIds.includes(s.id));
    const customQuoteItems = selectedItems.filter((s) => s.isCustomQuote);
    const fixedItems = selectedItems.filter((s) => !s.isCustomQuote && s.fixedPrice);

    fixedItems.forEach((item) => {
      if (item.fixedPrice) {
        subtotal += item.fixedPrice;
      }
    });

    const hasCustomQuote = customQuoteItems.length > 0;
    const selectedLabels = selectedItems.map((s) => `${s.label} (${s.priceLabel})`);

    return {
      subtotal,
      hasCustomQuote,
      customQuoteItems,
      fixedItems,
      selectedLabels,
      formattedSubtotal: subtotal > 0 ? `₹${subtotal.toLocaleString('en-IN')}` : 'Custom Quote',
    };
  }, [selectedServiceIds]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      return next;
    });
  };

  const socialOptions = [
    'Instagram Post',
    'Carousel',
    'Story',
    'Promotional Creative',
    'Caption Writing',
  ];

  const campaignOptions = [
    'Product Launch',
    'Seasonal Campaign',
    'Festival Campaign',
    'Offer / Sale',
    'Brand Campaign',
  ];

  const brandOptions = [
    'Creative Direction',
    'Social Visual System',
    'Content Templates',
    'Visual Mood / Art Direction',
  ];

  const videoOptions = [
    'Short-form Reel',
    'Product Reel',
    'Promotional Reel',
    'Editing',
  ];

  const businessTypes = [
    'Beauty',
    'Fashion',
    'Café / Restaurant',
    'Wellness',
    'E-commerce',
    'Real Estate',
    'Personal Brand',
    'Other',
  ];

  const countries = [
    'India',
    'United States',
    'United Kingdom',
    'United Arab Emirates',
    'Australia',
    'Canada',
    'Singapore',
    'Germany',
    'France',
    'Other Country',
  ];

  const timelines = ['ASAP', '48 hours', '3–5 days', '1 week', 'Flexible'];

  const budgetOptions = [
    'Under ₹5,000',
    '₹5,000–₹10,000',
    '₹10,000–₹25,000',
    '₹25,000+',
    'Custom Quote',
  ];

  const toggleArrayItem = (
    key: keyof Pick<
      CustomBuilderState,
      'socialFormats' | 'campaignTypes' | 'brandVisuals' | 'videoTypes'
    >,
    item: string
  ) => {
    setState((prev) => {
      const current = prev[key];
      const next = current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item];
      return { ...prev, [key]: next };
    });
  };

  const updateCount = (key: keyof CustomBuilderState['counts'], delta: number) => {
    setState((prev) => ({
      ...prev,
      counts: {
        ...prev.counts,
        [key]: Math.max(0, prev.counts[key] + delta),
      },
    }));
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    try {
      await saveDraftToFirestore(user.uid, {
        draftId: `draft-${Date.now()}`,
        brandName: `${state.businessType} Project Scope Draft`,
        category: state.businessType,
        timeline: state.timeline,
        budget: pricingCalculation.formattedSubtotal,
        selectedServices: pricingCalculation.selectedLabels,
        deliverables: state.counts,
      });
      setDraftSaved(true);
      refreshUserData();
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (e) {
      console.warn('Draft save error:', e);
    }
  };

  const handleProceedToEnquiry = () => {
    const updatedState: CustomBuilderState = {
      ...state,
      categories: pricingCalculation.selectedLabels,
      selectedServiceItems: pricingCalculation.selectedLabels,
      calculatedSubtotalInr: pricingCalculation.subtotal,
      hasCustomQuoteItems: pricingCalculation.hasCustomQuote,
      budget: pricingCalculation.hasCustomQuote
        ? `Base ₹${pricingCalculation.subtotal} + Custom Quote`
        : pricingCalculation.subtotal > 0
        ? `₹${pricingCalculation.subtotal.toLocaleString('en-IN')}`
        : state.budget,
    };
    onContinueToEnquiry(updatedState);
  };

  return (
    <section
      id="builder"
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        isDark
          ? 'bg-[#0b0c0e] border-[#1f2228] text-[#F3F1EC]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 mb-3">
            <Logo variant="full" size="sm" />
            <span className="opacity-30">|</span>
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
              INTERACTIVE SCOPE &amp; PRICING BUILDER
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight mb-4">
            Build Your Project Scope
          </h2>
          <p
            className={`font-sans text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            Select your required services from websites and AI chatbots to brand identities and content packages. Fixed items calculate into a base subtotal live.
          </p>
        </div>

        <div
          className={`max-w-4xl mx-auto border transition-colors shadow-2xl ${
            isDark
              ? 'bg-[#111317] border-[#22252C]'
              : 'bg-[#FFFFFF] border-[#E2DDD5]'
          }`}
        >
          {/* ============================================================== */}
          {/* STEP 1: MULTI-SERVICE SELECTION SYSTEM (Section 13)            */}
          {/* ============================================================== */}
          <div className="p-6 sm:p-10 border-b border-inherit">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono block mb-1">
                  STEP 01 · SELECT SERVICES
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal">
                  What services does your project need?
                </h3>
              </div>
              <span className="text-[11px] font-mono opacity-60">Multi-select enabled</span>
            </div>

            <p className="text-xs font-light mb-6 opacity-75">
              Choose from fixed packages and custom services. Fixed pricing sums automatically below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {BUILDER_SERVICE_OPTIONS.map((svc) => {
                const isSelected = selectedServiceIds.includes(svc.id);
                return (
                  <div
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className={`p-4 border transition-all cursor-pointer select-none flex items-start gap-3 ${
                      isSelected
                        ? isDark
                          ? 'bg-[#D8C7A5]/10 border-[#D8C7A5] text-[#FAF8F5]'
                          : 'bg-[#A58B55]/10 border-[#A58B55] text-[#14171A]'
                        : isDark
                        ? 'bg-[#15181F] border-[#24272D] text-[#B4B7BF] hover:border-[#383E4C]'
                        : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#555B66] hover:border-[#C5BDAF]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-none border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-[#D8C7A5] border-[#D8C7A5] text-[#0b0c0e]'
                            : 'bg-[#A58B55] border-[#A58B55] text-white'
                          : 'border-inherit'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-[13px] font-medium leading-tight">
                          {svc.label}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs whitespace-nowrap">
                          {svc.originalPriceLabel && (
                            <span className="line-through text-[11px] text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">
                              {svc.originalPriceLabel}
                            </span>
                          )}
                          <span
                            className={`font-semibold ${
                              svc.isCustomQuote
                                ? 'text-[#A58B55] dark:text-[#D8C7A5]'
                                : 'text-[#D8C7A5]'
                            }`}
                          >
                            {svc.priceLabel}
                          </span>
                          {svc.originalPriceLabel && (
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 px-1 py-0.5 bg-amber-500/15 border border-amber-500/30">
                              20% OFF
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] tracking-widest uppercase font-mono opacity-50 block mt-1">
                        {svc.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Calculation Callout Bar (Section 14) */}
            <div
              className={`p-5 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isDark ? 'bg-[#161922] border-[#2A2E3B]' : 'bg-[#FAF8F5] border-[#DCD6C9]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase opacity-70 block mb-1">
                  CALCULATED BASE SUBTOTAL (NAVRATRI DISCOUNTED)
                </span>
                <div className="flex flex-wrap items-baseline gap-3">
                  {pricingCalculation.subtotal > 0 && (
                    <span className="font-mono text-base line-through text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">
                      ₹{Math.round(pricingCalculation.subtotal * 1.25).toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="font-serif text-3xl font-normal text-[#D8C7A5]">
                    {pricingCalculation.formattedSubtotal}
                  </span>
                  {pricingCalculation.subtotal > 0 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 uppercase">
                      20% NAVRATRI SAVINGS APPLIED
                    </span>
                  )}
                  {pricingCalculation.hasCustomQuote && (
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-[#D8C7A5]/15 border border-[#D8C7A5]/40 text-[#A58B55] dark:text-[#D8C7A5] font-semibold">
                      Custom Quote Required
                    </span>
                  )}
                </div>
                {pricingCalculation.hasCustomQuote && (
                  <p className="text-[11px] opacity-75 mt-1">
                    Custom services ({pricingCalculation.customQuoteItems.map((c) => c.label).join(', ')}) require bespoke review without auto-charging.
                  </p>
                )}
              </div>

              {pricingCalculation.subtotal > 0 && !pricingCalculation.hasCustomQuote && onPayFixedSubtotal && (
                <button
                  type="button"
                  onClick={() =>
                    onPayFixedSubtotal(
                      pricingCalculation.subtotal,
                      pricingCalculation.selectedLabels.join(' + '),
                      pricingCalculation.selectedLabels
                    )
                  }
                  className="px-5 py-2.5 text-xs tracking-wider uppercase font-medium bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#FAF8F5] transition-all flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>PAY {pricingCalculation.formattedSubtotal} (RAZORPAY)</span>
                </button>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* STEP 2: CREATIVE DELIVERABLE SPECIFICATIONS                    */}
          {/* ============================================================== */}
          <div className="p-6 sm:p-10 border-b border-inherit">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono block mb-1">
              STEP 02 · CREATIVE &amp; CONTENT DETAILS
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal mb-6">
              Tailor formats &amp; content volumes
            </h3>

            {/* Deliverable Counters */}
            <div className="mb-8">
              <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-3 text-[#D8C7A5]">
                Content Volume Quantities (for content scopes)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: 'posts', label: 'Feed Posts' },
                  { key: 'stories', label: 'Stories' },
                  { key: 'carousels', label: 'Carousels' },
                  { key: 'promotionalCreatives', label: 'Promo / Offers' },
                  { key: 'reels', label: 'Reels / Motion' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-3.5 border text-center transition-colors ${
                      isDark
                        ? 'bg-[#15181f] border-[#22252C]'
                        : 'bg-[#FAF8F5] border-[#E0D9CE]'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-70 block mb-2">
                      {item.label}
                    </span>
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateCount(item.key as keyof CustomBuilderState['counts'], -1)
                        }
                        className="w-6 h-6 border border-inherit flex items-center justify-center hover:opacity-100 opacity-60 text-xs transition-opacity"
                        aria-label={`Decrease ${item.label}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-serif text-lg font-normal w-5">
                        {state.counts[item.key as keyof CustomBuilderState['counts']]}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCount(item.key as keyof CustomBuilderState['counts'], 1)
                        }
                        className="w-6 h-6 border border-inherit flex items-center justify-center hover:opacity-100 opacity-60 text-xs transition-opacity"
                        aria-label={`Increase ${item.label}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Formats */}
            <div className="mb-6">
              <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                Content Asset Formats Needed
              </label>
              <div className="flex flex-wrap gap-2">
                {socialOptions.map((opt) => {
                  const selected = state.socialFormats.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleArrayItem('socialFormats', opt)}
                      className={`px-3 py-1.5 text-xs tracking-wider border transition-colors ${
                        selected
                          ? isDark
                            ? 'bg-[#D8C7A5] text-[#0b0c0e] border-[#D8C7A5] font-medium'
                            : 'bg-[#A58B55] text-[#FAF7F2] border-[#A58B55] font-medium'
                          : isDark
                          ? 'bg-[#15181f] text-[#8E929A] border-[#22252C] hover:border-[#383E4C]'
                          : 'bg-[#FAF8F5] text-[#555B66] border-[#DDD7CD] hover:border-[#B8B0A2]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campaign Moments */}
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                Campaign Occasions / Launch Types
              </label>
              <div className="flex flex-wrap gap-2">
                {campaignOptions.map((opt) => {
                  const selected = state.campaignTypes.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleArrayItem('campaignTypes', opt)}
                      className={`px-3 py-1.5 text-xs tracking-wider border transition-colors ${
                        selected
                          ? isDark
                            ? 'bg-[#D8C7A5] text-[#0b0c0e] border-[#D8C7A5] font-medium'
                            : 'bg-[#A58B55] text-[#FAF7F2] border-[#A58B55] font-medium'
                          : isDark
                          ? 'bg-[#15181f] text-[#8E929A] border-[#22252C] hover:border-[#383E4C]'
                          : 'bg-[#FAF8F5] text-[#555B66] border-[#DDD7CD] hover:border-[#B8B0A2]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STEP 3: BUSINESS METRICS & TIMELINES                           */}
          {/* ============================================================== */}
          <div className="p-6 sm:p-10 border-b border-inherit">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono block mb-1">
              STEP 03 · CONTEXT &amp; TIMELINE
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal mb-6">
              Your business and delivery target
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block mb-2 font-medium">
                  INDUSTRY / CATEGORY
                </label>
                <select
                  value={state.businessType}
                  onChange={(e) => setState({ ...state, businessType: e.target.value })}
                  className={`w-full border text-xs px-3 py-2.5 focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#14161a] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                      : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A] focus:border-[#A58B55]'
                  }`}
                >
                  {businessTypes.map((bt) => (
                    <option
                      key={bt}
                      value={bt}
                      className={isDark ? 'bg-[#121418] text-[#F3F1EC]' : 'bg-[#FFFFFF] text-[#14171A]'}
                    >
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block mb-2 font-medium">
                  COUNTRY
                </label>
                <select
                  value={state.country}
                  onChange={(e) => setState({ ...state, country: e.target.value })}
                  className={`w-full border text-xs px-3 py-2.5 focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#14161a] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                      : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A] focus:border-[#A58B55]'
                  }`}
                >
                  {countries.map((c) => (
                    <option
                      key={c}
                      value={c}
                      className={isDark ? 'bg-[#121418] text-[#F3F1EC]' : 'bg-[#FFFFFF] text-[#14171A]'}
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block mb-2 font-medium">
                  TARGET TIMELINE
                </label>
                <select
                  value={state.timeline}
                  onChange={(e) => setState({ ...state, timeline: e.target.value })}
                  className={`w-full border text-xs px-3 py-2.5 focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#14161a] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                      : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A] focus:border-[#A58B55]'
                  }`}
                >
                  {timelines.map((tl) => (
                    <option
                      key={tl}
                      value={tl}
                      className={isDark ? 'bg-[#121418] text-[#F3F1EC]' : 'bg-[#FFFFFF] text-[#14171A]'}
                    >
                      {tl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STEP 4: SUMMARY & PROCEED TO ENQUIRY                           */}
          {/* ============================================================== */}
          <div
            className={`p-6 sm:p-8 transition-colors ${
              isDark ? 'bg-[#14171d]' : 'bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit mb-4">
              <span className="text-[11px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono">
                YOUR PROJECT SUMMARY
              </span>
              <div className="flex items-center gap-4">
                {user && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="text-[11px] tracking-wider uppercase text-[#D8C7A5] hover:underline flex items-center gap-1 font-mono"
                  >
                    {draftSaved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved to Cloud!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save Draft</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenAdvisor}
                  className="text-[11px] tracking-[0.15em] text-[#D8C7A5] hover:opacity-80 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discuss with Aja</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-light mb-6 opacity-90">
              <div>
                <span className="opacity-60 block text-[10px] tracking-wider uppercase font-mono">
                  SELECTED SERVICES
                </span>
                <span className="font-normal">
                  {pricingCalculation.selectedLabels.join(' · ') || 'None selected'}
                </span>
              </div>
              <div>
                <span className="opacity-60 block text-[10px] tracking-wider uppercase font-mono">
                  DELIVERABLE COUNTS
                </span>
                <span className="font-mono">
                  {state.counts.posts} posts · {state.counts.stories} stories · {state.counts.carousels} carousels · {state.counts.promotionalCreatives} promo · {state.counts.reels} reels
                </span>
              </div>
              <div>
                <span className="opacity-60 block text-[10px] tracking-wider uppercase font-mono">
                  BASE ESTIMATE
                </span>
                <span className="text-[#D8C7A5] font-mono font-medium text-sm">
                  {pricingCalculation.formattedSubtotal}
                </span>
              </div>
            </div>

            {/* Disclaimer notice */}
            <div
              className={`p-3 border text-[11px] mb-6 leading-relaxed font-light ${
                isDark
                  ? 'bg-[#0e1014] border-[#24272D] text-[#8E929A]'
                  : 'bg-[#FFFFFF] border-[#E2DDD5] text-[#636875]'
              }`}
            >
              Prices shown are starting/fixed package prices. Final pricing may vary based on project requirements, scope, and customization. Custom requirements are quoted separately.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] tracking-[0.18em] opacity-70">
                Ready to review and submit your brief?
              </span>
              <button
                type="button"
                onClick={handleProceedToEnquiry}
                className={`w-full sm:w-auto px-8 py-3.5 text-[12px] tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-md ${
                  isDark
                    ? 'text-[#0b0c0e] bg-[#F3F1EC] hover:bg-[#D8C7A5]'
                    : 'text-[#FAF7F2] bg-[#14171A] hover:bg-[#A58B55]'
                }`}
              >
                <span>CONTINUE TO ENQUIRY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
