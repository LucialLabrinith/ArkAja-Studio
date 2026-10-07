import React, { useState, useMemo } from 'react';
import {
  WEBSITE_PACKAGES,
  WEBSITE_ADDONS,
  DOMAIN_NOTICE,
  BRANDING_PACKAGES,
  CUSTOM_DEV_PACKAGES,
  BUSINESS_LAUNCH_PACKAGE,
  EDITORIAL_PACKAGES,
  ALL_PRICING_PACKAGES,
} from '../data/pricingData';
import { PricingPackage } from '../types';
import { PaymentModal } from './PaymentModal';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Globe,
  Plus,
  HelpCircle,
  Sparkles,
  CreditCard,
  Layers,
  Zap,
} from 'lucide-react';

interface PricingSectionProps {
  config: {
    starterUrl?: string;
    signatureUrl?: string;
    customUrl?: string;
    hasStarterPayment?: boolean;
    hasSignaturePayment?: boolean;
    hasCustomPayment?: boolean;
    razorpayKeyId?: string;
    isRazorpayConfigured?: boolean;
  };
  onOpenBuilder: () => void;
  onSelectPackageForEnquiry: (pkgName: string) => void;
}

type CurrencyView = 'ALL' | 'INR' | 'USD' | 'EUR';
type PricingTab = 'ALL' | 'WEBSITES' | 'BRANDING' | 'CONTENT' | 'DEVELOPMENT' | 'AI';

export const PricingSection: React.FC<PricingSectionProps> = ({
  config,
  onOpenBuilder,
  onSelectPackageForEnquiry,
}) => {
  const [selectedPkgForModal, setSelectedPkgForModal] = useState<PricingPackage | null>(null);
  const [currencyView, setCurrencyView] = useState<CurrencyView>('ALL');
  const [activeTab, setActiveTab] = useState<PricingTab>('ALL');
  const { isDark } = useTheme();

  // Interactive Live Pricing Estimator state
  const [calcSelected, setCalcSelected] = useState<{
    basicWebsite: boolean;
    urgentDelivery: boolean;
    enquiryIntegration: boolean;
    aiChatbot: boolean;
    logoDesign: boolean;
    basicWebApp: boolean;
    customWebApp: boolean;
    brandIdentity: boolean;
    aiBusiness: boolean;
    customWebsiteFeatures: boolean;
  }>({
    basicWebsite: true,
    urgentDelivery: false,
    enquiryIntegration: true,
    aiChatbot: false,
    logoDesign: false,
    basicWebApp: false,
    customWebApp: false,
    brandIdentity: false,
    aiBusiness: false,
    customWebsiteFeatures: false,
  });

  // Calculate live subtotal
  const calculationSummary = useMemo(() => {
    let fixedTotal = 0;
    const selectedLabels: string[] = [];
    const customQuoteItems: string[] = [];

    if (calcSelected.basicWebsite) {
      fixedTotal += 10000;
      selectedLabels.push('Basic Website (₹10,000)');
    }
    if (calcSelected.urgentDelivery) {
      fixedTotal += 2000;
      selectedLabels.push('Urgent Delivery (+₹2,000)');
    }
    if (calcSelected.enquiryIntegration) {
      fixedTotal += 3000;
      selectedLabels.push('Enquiry Form Integration (+₹3,000)');
    }
    if (calcSelected.aiChatbot) {
      fixedTotal += 5000;
      selectedLabels.push('AI Chatbot (+₹5,000)');
    }
    if (calcSelected.logoDesign) {
      fixedTotal += 3000;
      selectedLabels.push('Logo Design (₹3,000)');
    }
    if (calcSelected.brandIdentity) {
      customQuoteItems.push('Brand Identity');
      selectedLabels.push('Brand Identity (Custom Quote)');
    }
    if (calcSelected.basicWebApp) {
      fixedTotal += 15000;
      selectedLabels.push('Basic Web App Level 1 (₹15,000)');
    }
    if (calcSelected.customWebApp) {
      customQuoteItems.push('Advanced Web App / Custom Platform');
      selectedLabels.push('Advanced Web App / Platform (Custom Quote)');
    }
    if (calcSelected.aiBusiness) {
      customQuoteItems.push('AI-Assisted Business Solutions');
      selectedLabels.push('AI Business Solutions (Custom Quote)');
    }
    if (calcSelected.customWebsiteFeatures) {
      customQuoteItems.push('Custom Website Features');
      selectedLabels.push('Custom Website Features (Custom Quote)');
    }

    return {
      fixedTotal,
      hasCustomQuoteItems: customQuoteItems.length > 0,
      customQuoteItems,
      selectedLabels,
    };
  }, [calcSelected]);

  const displayedPackages = useMemo(() => {
    if (activeTab === 'WEBSITES') return [...WEBSITE_PACKAGES, ...CUSTOM_DEV_PACKAGES.filter((p) => p.category === 'WEBSITES')];
    if (activeTab === 'BRANDING') return BRANDING_PACKAGES;
    if (activeTab === 'CONTENT') return EDITORIAL_PACKAGES;
    if (activeTab === 'DEVELOPMENT') return CUSTOM_DEV_PACKAGES.filter((p) => p.category === 'DEVELOPMENT');
    if (activeTab === 'AI') {
      const aiChatbotStandalone: PricingPackage = {
        id: 'ai-chatbot-pkg',
        name: 'AI CHATBOT INTEGRATION',
        priceInr: '₹5,000',
        originalPriceInr: '₹6,250',
        discountBadge: '20% OFF · NAVRATRI SPECIAL',
        priceInrNumber: 5000,
        priceUsd: '$60',
        priceEur: '$55',
        priceGbp: '£48',
        category: 'AI',
        subtitle: 'AI-powered assistant integrated directly into your website for 24/7 client response.',
        features: [
          'Website-integrated chat interface matching your brand',
          'AI-powered responses trained on your business & FAQ',
          'Customer assistance & automated lead collection',
          'Basic chatbot setup and seamless website integration',
          'Up to 3 revisions on knowledge base prompts',
        ],
        delivery: '3–5 Business Days',
        ctaText: 'CHOOSE AI CHATBOT (₹5,000)',
        popular: false,
        disclaimer: 'Basic AI chatbot package. Advanced AI functionality, complex integrations or custom AI systems require separate quotation.',
      };
      return [aiChatbotStandalone, ...CUSTOM_DEV_PACKAGES.filter((p) => p.category === 'AI')];
    }
    return ALL_PRICING_PACKAGES;
  }, [activeTab]);

  const handlePackageAction = (pkg: PricingPackage) => {
    if (pkg.isCustomQuote) {
      onSelectPackageForEnquiry(pkg.name);
    } else {
      setSelectedPkgForModal(pkg);
    }
  };

  const getPriceDisplay = (pkg: PricingPackage) => {
    if (pkg.isCustomQuote || pkg.id === 'custom') {
      return {
        primary: 'Custom Quote',
        secondary: 'Bespoke Scoped Investment',
        note: 'Quoted individually by project scope & deliverables',
      };
    }

    if (currencyView === 'USD') {
      return {
        primary: `${pkg.priceUsd} USD`,
        secondary: `approx. ${pkg.priceInr} · ${pkg.priceEur}`,
        note: 'One-time investment · Taxes included',
      };
    }

    if (currencyView === 'EUR') {
      return {
        primary: `${pkg.priceEur} EUR`,
        secondary: `approx. ${pkg.priceInr} · ${pkg.priceUsd}`,
        note: 'One-time investment · Taxes included',
      };
    }

    if (currencyView === 'INR') {
      return {
        primary: `${pkg.priceInr} INR`,
        secondary: `approx. ${pkg.priceUsd} · ${pkg.priceEur}`,
        note: 'One-time investment · Taxes included',
      };
    }

    return {
      primary: pkg.priceInr,
      secondary: `/ ${pkg.priceUsd} USD · ${pkg.priceEur} EUR`,
      note: 'One-time investment · Taxes included',
    };
  };

  const handleLaunchCalculatedPayment = () => {
    const customBundlePkg: PricingPackage = {
      id: `bundle-${Date.now()}`,
      name: `Custom Scope Bundle`,
      priceInr: `₹${calculationSummary.fixedTotal.toLocaleString('en-IN')}`,
      priceInrNumber: calculationSummary.fixedTotal,
      priceUsd: `$${Math.round(calculationSummary.fixedTotal / 83.5)}`,
      priceEur: `€${Math.round(calculationSummary.fixedTotal / 91.0)}`,
      subtitle: calculationSummary.selectedLabels.join(' + '),
      features: calculationSummary.selectedLabels,
      delivery: calcSelected.urgentDelivery ? '48–72h Priority Delivery' : 'Standard 5–7 Business Days',
      ctaText: `PAY ₹${calculationSummary.fixedTotal.toLocaleString('en-IN')}`,
    };
    setSelectedPkgForModal(customBundlePkg);
  };

  return (
    <section
      id="pricing"
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        isDark
          ? 'bg-[#0d0f12] border-[#1f2228] text-[#FAF8F5]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <Logo variant="full" size="sm" />
            <span className="opacity-30">|</span>
            <span className="text-[11px] tracking-[0.28em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
              TRANSPARENT PACKAGES &amp; BESPOKE SOLUTIONS
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight mb-4">
            Services &amp; Pricing Architecture
          </h2>
          <p
            className={`font-sans text-sm sm:text-base font-light leading-relaxed mb-6 ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            Clear starting and fixed-price packages alongside bespoke quoting for websites, web applications, branding, AI solutions, and content.
          </p>

          {/* Currency Switcher */}
          <div className="inline-flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 border border-inherit text-xs font-mono">
            <div className="flex items-center gap-1 px-2.5 py-1 text-[10px] tracking-wider text-[#A58B55] dark:text-[#D8C7A5] font-semibold">
              <Globe className="w-3 h-3" />
              <span>CURRENCY:</span>
            </div>
            {(['ALL', 'INR', 'USD', 'EUR'] as CurrencyView[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrencyView(c)}
                className={`px-3 py-1 text-[10px] tracking-wider transition-all ${
                  currencyView === c
                    ? 'bg-[#14171A] text-white dark:bg-[#D8C7A5] dark:text-black font-semibold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {c === 'ALL' ? 'ALL (₹ / $ / €)' : c}
              </button>
            ))}
          </div>
        </div>

        {/* ================================================================= */}
        {/* NAVRATRI FESTIVE CELEBRATION DISCOUNT BANNER (FLAT 20% OFF)       */}
        {/* ================================================================= */}
        <div
          className={`p-5 sm:p-6 border mb-12 flex flex-col md:flex-row items-center justify-between gap-5 transition-all shadow-md ${
            isDark
              ? 'bg-gradient-to-r from-[#1c160c] via-[#14120f] to-[#121418] border-[#D8C7A5]/50 text-[#FAF8F5]'
              : 'bg-gradient-to-r from-[#FFF9EE] via-[#FDF5E6] to-[#FAF1DF] border-[#C5A358]/60 text-[#14171A]'
          }`}
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#A58B55] to-[#EEDFB3] flex items-center justify-center text-black font-bold shrink-0 shadow-md">
              <Sparkles className="w-6 h-6 text-black animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase font-bold px-2 py-0.5 bg-[#A58B55] text-black">
                  NAVRATRI UTSAV SPECIAL
                </span>
                <span className="text-xs font-mono font-bold text-[#A58B55] dark:text-[#D8C7A5]">
                  20% FESTIVE DISCOUNT APPLIED
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal mt-1">
                Ongoing Navratri Offer: All Rates Feature 20% Celebratory Savings
              </h3>
              <p
                className={`text-xs sm:text-[13px] font-light mt-0.5 ${
                  isDark ? 'text-[#B4B7BF]' : 'text-[#646A77]'
                }`}
              >
                The 20% higher standard rates are strikethrough below. All displayed prices are your final discounted rates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 border border-[#A58B55]/60 bg-black/10 text-xs font-mono font-semibold text-[#A58B55] dark:text-[#D8C7A5] whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FESTIVE SAVINGS ACTIVE</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-10 border-b border-inherit">
          {[
            { id: 'ALL', label: 'ALL PACKAGES' },
            { id: 'WEBSITES', label: 'WEBSITES (FROM ₹10,000)' },
            { id: 'BRANDING', label: 'LOGO (₹3,000) & BRANDING' },
            { id: 'CONTENT', label: 'CONTENT (FROM ₹2,499)' },
            { id: 'DEVELOPMENT', label: 'WEB APPS & CUSTOM DEV' },
            { id: 'AI', label: 'AI CHATBOT (+₹5,000) & TOOLS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PricingTab)}
              className={`px-3.5 py-2 text-[10px] sm:text-[11px] tracking-[0.16em] uppercase font-mono transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? isDark
                    ? 'bg-[#D8C7A5] text-[#0b0c0e] border-[#D8C7A5] font-bold shadow-sm'
                    : 'bg-[#14171A] text-[#FAF8F5] border-[#14171A] font-bold shadow-sm'
                  : isDark
                  ? 'border-[#262A34] text-[#8E929A] hover:text-[#FAF8F5] hover:border-[#D8C7A5]/50'
                  : 'border-[#DDD7CD] text-[#555B66] hover:text-[#14171A] hover:border-[#A58B55]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Master Catalog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-14 items-stretch">
          {displayedPackages.map((pkg) => {
            const isSignature = pkg.popular;
            const priceInfo = getPriceDisplay(pkg);

            return (
              <div
                key={pkg.id}
                className={`p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 relative border ${
                  isSignature
                    ? isDark
                      ? 'border-2 border-[#D8C7A5] shadow-2xl bg-[#121418] text-[#FAF8F5]'
                      : 'border-2 border-[#A58B55] shadow-xl bg-[#FFFFFF] text-[#14171A]'
                    : isDark
                    ? 'bg-[#111317] border-[#24272D] hover:border-[#3a3f4c] text-[#FAF8F5]'
                    : 'bg-[#FFFFFF] border-[#E2DDD5] hover:border-[#A58B55] text-[#14171A] shadow-sm'
                }`}
              >
                {isSignature && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] tracking-[0.25em] font-semibold uppercase font-mono shadow-sm whitespace-nowrap ${
                      isDark ? 'bg-[#D8C7A5] text-[#0b0c0e]' : 'bg-[#A58B55] text-[#FAF8F5]'
                    }`}
                  >
                    POPULAR CHOICE · FAST-TRACK
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] tracking-[0.25em] uppercase font-mono text-[#D8C7A5] font-semibold">
                      {pkg.delivery}
                    </span>
                    {pkg.category && (
                      <span className="text-[9.5px] tracking-widest text-[#D8C7A5] uppercase font-mono opacity-70">
                        {pkg.category}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mb-2">
                    {pkg.name}
                  </h3>

                  <p
                    className={`font-sans text-xs sm:text-sm font-light mb-6 leading-relaxed ${
                      isDark ? 'text-[#A6ABB5]' : 'text-[#646A77]'
                    }`}
                  >
                    {pkg.subtitle}
                  </p>

                  <div className="pb-6 mb-6 border-b border-inherit">
                    {/* Navratri Strikethrough Original Higher Price */}
                    {pkg.originalPriceInr && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm sm:text-base line-through text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80 decoration-2">
                          {currencyView === 'USD'
                            ? `$${Math.round((pkg.priceInrNumber || 10000) * 1.25 / 83.5)} USD`
                            : currencyView === 'EUR'
                            ? `€${Math.round((pkg.priceInrNumber || 10000) * 1.25 / 91)} EUR`
                            : pkg.originalPriceInr}
                        </span>
                        <span className="text-[9.5px] font-mono font-bold tracking-wider px-2 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 uppercase">
                          20% NAVRATRI OFF
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <span className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
                        {priceInfo.primary}
                      </span>
                      <span className="text-xs tracking-wider opacity-70 font-mono text-[#D8C7A5]">
                        {priceInfo.secondary}
                      </span>
                    </div>
                    <span className="text-[10px] tracking-wider opacity-60 block mt-2 font-mono">
                      {priceInfo.note}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-xs sm:text-[13px] font-light">
                        <Check className="w-4 h-4 text-[#D8C7A5] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.disclaimer && (
                    <div
                      className={`p-3 text-[11px] leading-relaxed border mb-6 font-light ${
                        isDark ? 'bg-black/30 border-[#22252C] text-[#8E929A]' : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#636875]'
                      }`}
                    >
                      {pkg.disclaimer}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handlePackageAction(pkg)}
                    className={`w-full py-3.5 px-4 text-[11px] sm:text-[12px] tracking-[0.2em] font-semibold transition-all flex items-center justify-center gap-2 active:scale-98 ${
                      pkg.isCustomQuote
                        ? isDark
                          ? 'border border-[#D8C7A5] text-[#D8C7A5] hover:bg-[#D8C7A5] hover:text-[#0b0c0e]'
                          : 'border border-[#14171A] text-[#14171A] hover:bg-[#14171A] hover:text-[#FAF8F5]'
                        : isSignature
                        ? 'bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#EEDFB3] shadow-md'
                        : isDark
                        ? 'bg-[#FAF8F5] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                        : 'bg-[#14171A] text-[#FAF8F5] hover:bg-[#A58B55]'
                    }`}
                  >
                    <span>{pkg.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {pkg.isCustomQuote ? (
                    <button
                      onClick={() => setSelectedPkgForModal(pkg)}
                      className="w-full py-1.5 text-[10px] tracking-widest uppercase font-mono opacity-70 hover:opacity-100 hover:text-[#D8C7A5] transition-colors text-center"
                    >
                      Already agreed price? Pay custom amount via Razorpay →
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectPackageForEnquiry(pkg.name)}
                      className="w-full py-1.5 text-[10px] tracking-widest uppercase font-mono opacity-60 hover:opacity-100 transition-opacity text-center"
                    >
                      Or discuss custom brief with studio →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================================================================= */}
        {/* INTERACTIVE PRICING ESTIMATOR & ADD-ON CALCULATOR                  */}
        {/* ================================================================= */}
        <div
          className={`p-8 sm:p-12 border mb-14 transition-all shadow-xl ${
            isDark ? 'bg-[#111318] border-[#2A2E38]' : 'bg-[#FFFFFF] border-[#DDD7CD]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-inherit">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#D8C7A5] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INTERACTIVE MULTI-SERVICE ESTIMATOR</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal">
                Build &amp; Calculate Your Service Bundle
              </h3>
            </div>
            <p className={`text-xs max-w-md font-light ${isDark ? 'text-[#8E929A]' : 'text-[#646A77]'}`}>
              Select any combination of fixed packages and custom services. Fixed services calculate live into your base subtotal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* 1. Basic Website */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.basicWebsite
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.basicWebsite}
                onChange={(e) => setCalcSelected({ ...calcSelected, basicWebsite: e.target.checked })}
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">Basic Website</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="line-through text-[11px] text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">₹12,500</span>
                    <span className="font-semibold text-[#D8C7A5]">₹10,000</span>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 px-1 py-0.5 bg-amber-500/15 border border-amber-500/30">20% OFF</span>
                  </div>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Responsive 4-page website (Home, About, Services, Contact) + deployment.
                </p>
              </div>
            </label>

            {/* 2. Urgent Delivery */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.urgentDelivery
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.urgentDelivery}
                onChange={(e) => setCalcSelected({ ...calcSelected, urgentDelivery: e.target.checked })}
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">Urgent Website Delivery</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="line-through text-[11px] text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">+₹2,500</span>
                    <span className="font-semibold text-[#D8C7A5]">+₹2,000</span>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 px-1 py-0.5 bg-amber-500/15 border border-amber-500/30">20% OFF</span>
                  </div>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Fast-track priority queue (48–72h expedited production delivery).
                </p>
              </div>
            </label>

            {/* 3. Enquiry Form Integration */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.enquiryIntegration
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.enquiryIntegration}
                onChange={(e) => setCalcSelected({ ...calcSelected, enquiryIntegration: e.target.checked })}
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">Enquiry Form Integration</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="line-through text-[11px] text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">+₹3,750</span>
                    <span className="font-semibold text-[#D8C7A5]">+₹3,000</span>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 px-1 py-0.5 bg-amber-500/15 border border-amber-500/30">20% OFF</span>
                  </div>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Interactive enquiry collection, email notifications, and database recording.
                </p>
              </div>
            </label>

            {/* 4. AI Chatbot */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.aiChatbot
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.aiChatbot}
                onChange={(e) => setCalcSelected({ ...calcSelected, aiChatbot: e.target.checked })}
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">AI Chatbot Integration</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="line-through text-[11px] text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">+₹6,250</span>
                    <span className="font-semibold text-[#D8C7A5]">+₹5,000</span>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 px-1 py-0.5 bg-amber-500/15 border border-amber-500/30">20% OFF</span>
                  </div>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Website-integrated AI assistant trained on your business knowledge and FAQ.
                </p>
              </div>
            </label>

            {/* 5. Logo Design */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.logoDesign
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.logoDesign}
                onChange={(e) => setCalcSelected({ ...calcSelected, logoDesign: e.target.checked })}
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">Logo Design</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="line-through text-[11px] text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">₹3,750</span>
                    <span className="font-semibold text-[#D8C7A5]">₹3,000</span>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 px-1 py-0.5 bg-amber-500/15 border border-amber-500/30">20% OFF</span>
                  </div>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Concept, variations kit &amp; production delivery files (up to 2 revisions).
                </p>
              </div>
            </label>

            {/* 6. Brand Identity (Custom Quote) */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.brandIdentity
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.brandIdentity}
                onChange={(e) => setCalcSelected({ ...calcSelected, brandIdentity: e.target.checked })}
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">Brand Identity</span>
                  <span className="font-mono text-xs font-semibold text-[#D8C7A5]">Custom Quote</span>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Logo system, color palette, typography guidelines, and brand collateral.
                </p>
              </div>
            </label>

            {/* 7. Basic Web App (Level 1) */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.basicWebApp
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.basicWebApp}
                onChange={(e) => setCalcSelected({ ...calcSelected, basicWebApp: e.target.checked })}
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">Basic Web App (Level 1)</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="line-through text-[11px] text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">₹18,750</span>
                    <span className="font-semibold text-[#D8C7A5]">₹15,000</span>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 px-1 py-0.5 bg-amber-500/15 border border-amber-500/30">20% OFF</span>
                  </div>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Single workflow system (Appointment, salon booking, inventory, billing). Fixed ₹15,000.
                </p>
              </div>
            </label>

            {/* 8. Advanced Web App / Platform */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.customWebApp
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.customWebApp}
                onChange={(e) => setCalcSelected({ ...calcSelected, customWebApp: e.target.checked })}
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">Advanced Web App / Platform</span>
                  <span className="font-mono text-xs font-semibold text-[#D8C7A5]">Custom Quote</span>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Multi-role access, customer/staff/admin, payments, hospital/SaaS platforms.
                </p>
              </div>
            </label>

            {/* 8. AI-Assisted Business Solutions */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.aiBusiness
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.aiBusiness}
                onChange={(e) => setCalcSelected({ ...calcSelected, aiBusiness: e.target.checked })}
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">AI Business Solutions</span>
                  <span className="font-mono text-xs font-semibold text-[#D8C7A5]">Custom Quote</span>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Business automation, custom AI integrations, workflows, and smart tools.
                </p>
              </div>
            </label>

            {/* 9. Custom Website Features */}
            <label
              className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                calcSelected.customWebsiteFeatures
                  ? isDark
                    ? 'border-[#D8C7A5] bg-[#D8C7A5]/10'
                    : 'border-[#A58B55] bg-[#A58B55]/10'
                  : isDark
                  ? 'border-[#22252C] hover:border-[#333844]'
                  : 'border-[#E2DDD5] hover:border-[#C5BDAF]'
              }`}
            >
              <input
                type="checkbox"
                checked={calcSelected.customWebsiteFeatures}
                onChange={(e) =>
                  setCalcSelected({ ...calcSelected, customWebsiteFeatures: e.target.checked })
                }
                className="mt-1 accent-[#D8C7A5]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">Custom Website Features</span>
                  <span className="font-mono text-xs font-semibold text-[#D8C7A5]">Custom Quote</span>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Advanced animations, additional pages, dynamic databases, custom UI/UX.
                </p>
              </div>
            </label>
          </div>

          {/* Calculator Output & Action Strip */}
          <div
            className={`p-6 border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
              isDark ? 'bg-[#15181F] border-[#292E38]' : 'bg-[#FAF8F5] border-[#E0D9CE]'
            }`}
          >
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase opacity-70 mb-1 flex items-center gap-2">
                <span>CALCULATED BASE SUBTOTAL</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/40">
                  NAVRATRI DISCOUNTED
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                {calculationSummary.fixedTotal > 0 && (
                  <span className="font-mono text-base line-through text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">
                    ₹{Math.round(calculationSummary.fixedTotal * 1.25).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="font-serif text-3xl sm:text-4xl font-normal text-[#D8C7A5]">
                  {calculationSummary.fixedTotal > 0
                    ? `₹${calculationSummary.fixedTotal.toLocaleString('en-IN')}`
                    : 'Custom Quote'}
                </span>
                {calculationSummary.fixedTotal > 0 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 uppercase">
                    YOU SAVE ₹{Math.round(calculationSummary.fixedTotal * 0.25).toLocaleString('en-IN')} (20% OFF)
                  </span>
                )}
                {calculationSummary.hasCustomQuoteItems && (
                  <span className="text-xs font-mono px-2.5 py-0.5 bg-[#D8C7A5]/15 border border-[#D8C7A5]/40 text-[#A58B55] dark:text-[#D8C7A5] font-semibold">
                    + Custom Quote Required
                  </span>
                )}
              </div>
              {calculationSummary.selectedLabels.length > 0 && (
                <p className="text-xs font-light mt-1.5 opacity-80 max-w-xl">
                  Selected: {calculationSummary.selectedLabels.join(' · ')}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {calculationSummary.fixedTotal > 0 && !calculationSummary.hasCustomQuoteItems && (
                <button
                  type="button"
                  onClick={handleLaunchCalculatedPayment}
                  className="px-6 py-3.5 text-xs tracking-[0.2em] font-medium bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 whitespace-nowrap"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>PAY ₹{calculationSummary.fixedTotal.toLocaleString('en-IN')} (RAZORPAY)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  onSelectPackageForEnquiry(
                    calculationSummary.hasCustomQuoteItems
                      ? `Custom Scope (Base ₹${calculationSummary.fixedTotal} + Custom: ${calculationSummary.customQuoteItems.join(', ')})`
                      : `Selected Package Bundle (₹${calculationSummary.fixedTotal})`
                  )
                }
                className={`px-6 py-3.5 text-xs tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap border ${
                  isDark
                    ? 'border-[#D8C7A5] text-[#D8C7A5] hover:bg-[#D8C7A5] hover:text-[#0b0c0e]'
                    : 'border-[#14171A] text-[#14171A] hover:bg-[#14171A] hover:text-[#FAF8F5]'
                }`}
              >
                <span>
                  {calculationSummary.hasCustomQuoteItems
                    ? 'REQUEST CUSTOM QUOTE / ENQUIRE'
                    : 'CONFIRM SCOPE IN ENQUIRY'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* DOMAIN NOTICE & PRICING DISCLAIMERS                               */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Domain Notice */}
          <div
            className={`p-6 border text-xs leading-relaxed transition-colors ${
              isDark ? 'bg-[#121418] border-[#22252C]' : 'bg-[#FFFFFF] border-[#E8E2D7]'
            }`}
          >
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#D8C7A5] font-semibold mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>{DOMAIN_NOTICE.title}</span>
            </div>
            <p className="font-medium text-sm mb-1">{DOMAIN_NOTICE.text}</p>
            <p className={`font-light ${isDark ? 'text-[#8E929A]' : 'text-[#646A77]'}`}>
              {DOMAIN_NOTICE.note}
            </p>
          </div>

          {/* Pricing Disclaimer */}
          <div
            className={`p-6 border text-xs leading-relaxed transition-colors ${
              isDark ? 'bg-[#121418] border-[#22252C]' : 'bg-[#FFFFFF] border-[#E8E2D7]'
            }`}
          >
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#D8C7A5] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TRANSPARENCY &amp; TERMS DISCLAIMER</span>
            </div>
            <p className="font-medium text-sm mb-1">
              Prices shown are starting/fixed package prices. Final pricing may vary based on project requirements, scope and customization.
            </p>
            <p className={`font-light ${isDark ? 'text-[#8E929A]' : 'text-[#646A77]'}`}>
              Basic website package covers standard pages and interactions. Custom requirements and complex workflows are quoted separately.
            </p>
          </div>
        </div>

        {/* Studio Assurance Bar */}
        <div
          className={`p-6 border flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light tracking-wide ${
            isDark
              ? 'bg-[#121418] border-[#24272D] text-[#A6ABB5]'
              : 'bg-[#FFFFFF] border-[#E2DDD5] text-[#555B66] shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D8C7A5] shrink-0" />
            <span>
              <strong>ArkAja Studio Standard:</strong> 100% human-directed creative execution. Dedicated project art direction on every campaign. Payments accepted in INR (₹), USD ($), and EUR (€).
            </span>
          </div>
          <button
            onClick={onOpenBuilder}
            className="text-[11px] tracking-[0.2em] font-medium text-[#A58B55] dark:text-[#D8C7A5] hover:underline whitespace-nowrap font-mono"
          >
            CUSTOMIZE A BESPOKE PACKAGE →
          </button>
        </div>
      </div>

      {/* Payment or Brief Modal */}
      <PaymentModal
        pkg={selectedPkgForModal}
        config={config}
        onClose={() => setSelectedPkgForModal(null)}
        onProceedToEnquiry={(name) => {
          onSelectPackageForEnquiry(name);
          setSelectedPkgForModal(null);
        }}
      />
    </section>
  );
};
