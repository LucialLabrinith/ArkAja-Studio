import React from 'react';
import { PricingPackage } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { X, ShieldCheck, ExternalLink, ArrowRight, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  pkg: PricingPackage | null;
  config: {
    starterUrl?: string;
    signatureUrl?: string;
    customUrl?: string;
    hasStarterPayment?: boolean;
    hasSignaturePayment?: boolean;
    hasCustomPayment?: boolean;
  };
  onClose: () => void;
  onProceedToEnquiry: (packageName: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  pkg,
  config,
  onClose,
  onProceedToEnquiry,
}) => {
  const { isDark } = useTheme();

  if (!pkg) return null;

  const getPaymentUrl = () => {
    if (pkg.id === 'starter') return config.starterUrl;
    if (pkg.id === 'signature') return config.signatureUrl;
    if (pkg.id === 'custom') return config.customUrl;
    return '';
  };

  const paymentUrl = getPaymentUrl()?.trim();
  const hasConfiguredUrl = Boolean(paymentUrl);

  const getButtonText = () => {
    if (pkg.id === 'starter') return 'PAY ₹2,499';
    if (pkg.id === 'signature') return 'PAY ₹4,999';
    return 'REQUEST A QUOTE';
  };

  const handlePayClick = () => {
    if (hasConfiguredUrl && paymentUrl) {
      window.location.href = paymentUrl;
      onClose();
    } else {
      // Fallback: Proceed to enquiry with package pre-selected
      onProceedToEnquiry(pkg.name);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border transition-colors animate-in fade-in zoom-in-95 ${
          isDark
            ? 'bg-[#121418] border-[#24272D] text-[#F3F1EC]'
            : 'bg-[#FFFFFF] border-[#E2DDD5] text-[#14171A]'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 transition-colors ${
            isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7A808C] hover:text-[#14171A]'
          }`}
          aria-label="Close Payment Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Logo variant="full" size="sm" />
            <span className="opacity-30">|</span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono block">
              RAZORPAY CHECKOUT
            </span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal">
            {pkg.name} Package
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-2xl font-medium">
              {pkg.priceInr}
            </span>
            <span
              className={`text-xs font-light ${
                isDark ? 'text-[#8E929A]' : 'text-[#7A808C]'
              }`}
            >
              ({pkg.priceUsd} / {pkg.priceGbp})
            </span>
            <span className="text-[10px] text-[#D8C7A5] uppercase tracking-wider ml-auto font-mono">
              One-Time Project
            </span>
          </div>
        </div>

        {/* Package Highlights */}
        <div
          className={`border p-4 mb-6 text-xs space-y-2 ${
            isDark
              ? 'bg-[#171a20] border-[#24272D] text-[#B4B7BF]'
              : 'bg-[#FAF8F5] border-[#E8E3DA] text-[#555A64]'
          }`}
        >
          {pkg.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D8C7A5] rounded-full shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-inherit text-[11px] text-[#D8C7A5] font-mono">
            Turnaround: {pkg.delivery}
          </div>
        </div>

        {/* Security & Payment Link State */}
        {hasConfiguredUrl ? (
          <div className="mb-6 flex items-start gap-3 p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              You will be securely redirected to the official Razorpay Payment Page. Full 256-bit encryption. No card details are ever stored on this application.
            </p>
          </div>
        ) : (
          <div
            className={`mb-6 p-4 border text-xs space-y-2 ${
              isDark
                ? 'bg-[#181b22] border-[#2E333B] text-[#8E929A]'
                : 'bg-[#FBF9F6] border-[#E5E0D6] text-[#636873]'
            }`}
          >
            <div className="font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-500 font-semibold font-mono text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                Payment link coming soon.
              </span>
              <span className="text-[9px] text-[#D8C7A5] font-mono uppercase tracking-widest">
                STAGE READY
              </span>
            </div>
            <p className="leading-relaxed font-light">
              Direct Razorpay payment page integration is being finalized. In the meantime, reserve this package directly via our enquiry brief with instant booking priority.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handlePayClick}
            className={`w-full py-3.5 text-xs tracking-[0.2em] font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${
              isDark
                ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
            }`}
          >
            <span>{hasConfiguredUrl ? getButtonText() : 'RESERVE VIA ENQUIRY BRIEF'}</span>
            {hasConfiguredUrl ? (
              <ExternalLink className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => {
              onProceedToEnquiry(pkg.name);
              onClose();
            }}
            className={`w-full py-2.5 text-xs tracking-[0.18em] font-light transition-colors text-center ${
              isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7B818F] hover:text-[#14171A]'
            }`}
          >
            Or customize a bespoke scope for this package
          </button>
        </div>
      </div>
    </div>
  );
};
