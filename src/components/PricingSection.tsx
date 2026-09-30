import React, { useState } from 'react';
import { PRICING_PACKAGES } from '../data/pricingData';
import { PricingPackage } from '../types';
import { PaymentModal } from './PaymentModal';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingSectionProps {
  config: {
    starterUrl?: string;
    signatureUrl?: string;
    customUrl?: string;
    hasStarterPayment?: boolean;
    hasSignaturePayment?: boolean;
    hasCustomPayment?: boolean;
  };
  onOpenBuilder: () => void;
  onSelectPackageForEnquiry: (pkgName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  config,
  onOpenBuilder,
  onSelectPackageForEnquiry,
}) => {
  const [selectedPkgForModal, setSelectedPkgForModal] = useState<PricingPackage | null>(null);
  const { isDark, isCombo } = useTheme();

  const handlePackageAction = (pkg: PricingPackage) => {
    if (pkg.id === 'custom') {
      onOpenBuilder();
      return;
    }

    if (pkg.id === 'starter') {
      const url = config?.starterUrl?.trim();
      if (url) {
        window.location.href = url;
      } else {
        setSelectedPkgForModal(pkg);
      }
      return;
    }

    if (pkg.id === 'signature') {
      const url = config?.signatureUrl?.trim();
      if (url) {
        window.location.href = url;
      } else {
        setSelectedPkgForModal(pkg);
      }
      return;
    }

    setSelectedPkgForModal(pkg);
  };

  const getButtonLabel = (pkg: PricingPackage) => {
    if (pkg.id === 'starter') return 'PAY ₹2,499';
    if (pkg.id === 'signature') return 'PAY ₹4,999';
    return 'REQUEST A QUOTE';
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
        <div className="text-center max-w-3xl mx-auto mb-16">
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
            className={`font-sans text-sm sm:text-base font-light leading-relaxed ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            All offerings are one-time project packages tailored for distinct campaigns, launches, and content seasons. No recurring monthly subscriptions.
          </p>
        </div>

        {/* 3 Packages Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14 items-stretch">
          {PRICING_PACKAGES.map((pkg) => {
            const isSignature = pkg.popular;
            const isCardDark = isDark;

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
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-4xl sm:text-5xl font-normal tracking-tight">
                        {pkg.priceInr}
                      </span>
                      {pkg.priceUsd && (
                        <span className="text-xs tracking-wider opacity-60 font-mono">
                          / {pkg.priceUsd} · {pkg.priceGbp}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] tracking-wider opacity-50 block mt-1">
                      One-time investment · Taxes included
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
                    className={`w-full py-3.5 px-4 text-[11px] sm:text-[12px] tracking-[0.22em] font-semibold transition-all flex items-center justify-center gap-2 active:scale-98 ${
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
                    onClick={() => onSelectPackageForEnquiry(pkg.name)}
                    className="w-full py-1.5 text-[10px] tracking-widest uppercase font-mono opacity-60 hover:opacity-100 transition-opacity text-center"
                  >
                    Or discuss brief with studio →
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
              <strong>ArkAja Studio Standard:</strong> 100% human-directed creative execution. Dedicated project art direction on every campaign.
            </span>
          </div>
          <button
            onClick={onOpenBuilder}
            className="text-[11px] tracking-[0.2em] font-medium text-[#A58B55] dark:text-[#D8C7A5] hover:underline whitespace-nowrap"
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
