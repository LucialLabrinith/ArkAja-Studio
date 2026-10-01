import React, { useState } from 'react';
import { PRICING_PACKAGES } from '../data/pricingData';
import { PricingPackage } from '../types';
import { PaymentModal } from './PaymentModal';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { Check, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

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

export const PricingSection: React.FC<PricingSectionProps> = ({
  config,
  onOpenBuilder,
  onSelectPackageForEnquiry,
}) => {
  const [selectedPkgForModal, setSelectedPkgForModal] = useState<PricingPackage | null>(null);
  const [currencyView, setCurrencyView] = useState<CurrencyView>('ALL');
  const { isDark } = useTheme();

  const handlePackageAction = (pkg: PricingPackage) => {
    setSelectedPkgForModal(pkg);
  };

  const getPriceDisplay = (pkg: PricingPackage) => {
    if (pkg.id === 'custom') {
      return {
        primary: 'As Per Requirement',
        secondary: 'No Fixed Price · Bespoke Quote',
        note: 'Priced individually by project scope & deliverables',
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

    // Default 'ALL'
    return {
      primary: pkg.priceInr,
      secondary: `/ ${pkg.priceUsd} USD · ${pkg.priceEur} EUR`,
      note: 'One-time investment · Taxes included',
    };
  };

  const getButtonLabel = (pkg: PricingPackage) => {
    if (pkg.id === 'starter') return 'PAY ₹2,499 ($30 / €28)';
    if (pkg.id === 'signature') return 'PAY ₹4,999 ($60 / €55)';
    return 'CUSTOM SCOPE · GET QUOTE / PAY';
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
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <Logo variant="full" size="sm" />
            <span className="opacity-30">|</span>
            <span className="text-[11px] tracking-[0.28em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
              TRANSPARENT INVESTMENT · ONE-TIME PACKAGES
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight mb-4">
            Project Packages
          </h2>
          <p
            className={`font-sans text-sm sm:text-base font-light leading-relaxed mb-6 ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            All offerings are one-time project packages tailored for distinct campaigns, launches, and content seasons. No recurring monthly subscriptions.
          </p>

          {/* Currency Switcher Bar */}
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

        {/* 3 Packages Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14 items-stretch">
          {PRICING_PACKAGES.map((pkg) => {
            const isSignature = pkg.popular;
            const isCardDark = isDark;
            const priceInfo = getPriceDisplay(pkg);

            return (
              <div
                key={pkg.id}
                className={`p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 relative border ${
                  isSignature
                    ? isDark
                      ? 'border-2 border-[#D8C7A5] shadow-2xl lg:-translate-y-2 bg-[#121418] text-[#FAF8F5]'
                      : 'border-2 border-[#A58B55] shadow-xl lg:-translate-y-2 bg-[#FFFFFF] text-[#14171A]'
                    : isDark
                    ? 'bg-[#111317] border-[#24272D] hover:border-[#3a3f4c] text-[#FAF8F5]'
                    : 'bg-[#FFFFFF] border-[#E2DDD5] hover:border-[#A58B55] text-[#14171A] shadow-sm'
                }`}
              >
                {isSignature && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] tracking-[0.25em] font-semibold uppercase font-mono shadow-sm ${
                      isDark
                        ? 'bg-[#D8C7A5] text-[#0b0c0e]'
                        : 'bg-[#A58B55] text-[#FAF8F5]'
                    }`}
                  >
                    MOST POPULAR · 48H DELIVERY
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] tracking-[0.25em] uppercase font-mono text-[#D8C7A5] font-semibold">
                      {pkg.delivery}
                    </span>
                    {isSignature && (
                      <span className="text-[10px] tracking-widest text-[#D8C7A5] uppercase font-mono">
                        PRIORITY QUEUE
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-2">
                    {pkg.name}
                  </h3>

                  <p
                    className={`font-sans text-xs sm:text-sm font-light mb-6 leading-relaxed ${
                      isCardDark ? 'text-[#A6ABB5]' : 'text-[#646A77]'
                    }`}
                  >
                    {pkg.subtitle}
                  </p>

                  <div className="pb-6 mb-6 border-b border-inherit">
                    <div className="flex flex-col gap-1">
                      <span className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
                        {priceInfo.primary}
                      </span>
                      <span className="text-xs tracking-wider opacity-70 font-mono text-[#D8C7A5]">
                        {priceInfo.secondary}
                      </span>
                    </div>
                    <span className="text-[10px] tracking-wider opacity-50 block mt-2 font-mono">
                      {priceInfo.note}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3.5 mb-8">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-xs sm:text-sm font-light">
                        <Check className="w-4 h-4 text-[#D8C7A5] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handlePackageAction(pkg)}
                    className={`w-full py-3.5 px-4 text-[11px] sm:text-[12px] tracking-[0.2em] font-semibold transition-all flex items-center justify-center gap-2 active:scale-98 ${
                      isSignature
                        ? 'bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#EEDFB3] shadow-md'
                        : isCardDark
                        ? 'bg-[#FAF8F5] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                        : 'bg-[#14171A] text-[#FAF8F5] hover:bg-[#A58B55]'
                    }`}
                  >
                    <span>{getButtonLabel(pkg)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (pkg.id === 'custom') {
                        onOpenBuilder();
                      } else {
                        onSelectPackageForEnquiry(pkg.name);
                      }
                    }}
                    className="w-full py-1.5 text-[10px] tracking-widest uppercase font-mono opacity-60 hover:opacity-100 transition-opacity text-center"
                  >
                    {pkg.id === 'custom' ? 'Open Custom Scope Builder →' : 'Or discuss brief with studio →'}
                  </button>
                </div>
              </div>
            );
          })}
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
