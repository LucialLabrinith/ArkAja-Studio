import React, { useState, useEffect } from 'react';
import { PricingPackage } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  Copy,
  Check,
  Globe,
  Sliders,
} from 'lucide-react';

interface PaymentModalProps {
  pkg: PricingPackage | null;
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
  onClose: () => void;
  onProceedToEnquiry: (packageName: string) => void;
}

interface PaymentReceipt {
  paymentId: string;
  orderId: string;
  amount: number;
  date: string;
  packageName: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  pkg,
  config,
  onClose,
  onProceedToEnquiry,
}) => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [clientName, setClientName] = useState(user?.displayName || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientPhone, setClientPhone] = useState('');
  const [customInrAmount, setCustomInrAmount] = useState<number>(10000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Sync auth user details if available
  useEffect(() => {
    if (user) {
      if (!clientName && user.displayName) setClientName(user.displayName);
      if (!clientEmail && user.email) setClientEmail(user.email);
    }
  }, [user]);

  // Set default initial amount when modal opens for custom package
  useEffect(() => {
    if (pkg) {
      if (pkg.id === 'web-apps' || pkg.id === 'web-app') setCustomInrAmount(25000);
      else if (pkg.id === 'brand-identity') setCustomInrAmount(15000);
      else if (pkg.id === 'ai-business') setCustomInrAmount(20000);
      else if (pkg.id === 'business-launch') setCustomInrAmount(30000);
      else if (pkg.priceInrNumber && pkg.priceInrNumber > 0) setCustomInrAmount(pkg.priceInrNumber);
      else setCustomInrAmount(10000);
    }
  }, [pkg]);

  // Resilient script loader for Razorpay checkout SDK
  const loadRazorpayScript = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if ((window as any).Razorpay) return true;

    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existingScript) {
        if ((window as any).Razorpay) {
          resolve(true);
          return;
        }
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        setTimeout(() => resolve(Boolean((window as any).Razorpay)), 2000);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Preload Razorpay SDK on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Keyboard shortcut: Esc to close if not actively processing payment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, onClose]);

  if (!pkg) return null;

  const isCustomPackage = pkg.id === 'custom' || Boolean(pkg.isCustomQuote);

  const getActiveAmountInr = (): number => {
    if (isCustomPackage) {
      return Math.max(100, customInrAmount || 10000);
    }
    if (pkg.priceInrNumber && pkg.priceInrNumber > 0) return pkg.priceInrNumber;
    if (pkg.id === 'starter') return 2499;
    if (pkg.id === 'signature') return 4999;
    if (pkg.id === 'basic-website') return 10000;
    if (pkg.id === 'urgent-website') return 12000;
    if (pkg.id === 'logo-design') return 3000;
    if (pkg.id === 'ai-chatbot' || pkg.id === 'ai-chatbot-pkg') return 5000;
    if (pkg.id === 'basic-web-app') return 15000;
    return Math.max(100, customInrAmount || 10000);
  };

  const amountInr = getActiveAmountInr();
  const amountUsd = Math.round(amountInr / 83.5);
  const amountEur = Math.round(amountInr / 91.0);

  const getHostedPaymentUrl = (): string | undefined => {
    if (pkg.id === 'starter' && config?.starterUrl) return config.starterUrl;
    if (pkg.id === 'signature' && config?.signatureUrl) return config.signatureUrl;
    if (pkg.id === 'basic-website' && (config as any)?.basicWebsiteUrl) return (config as any).basicWebsiteUrl;
    if (pkg.id === 'urgent-website' && (config as any)?.urgentWebsiteUrl) return (config as any).urgentWebsiteUrl;
    if (pkg.id === 'logo-design' && (config as any)?.logoDesignUrl) return (config as any).logoDesignUrl;
    if ((pkg.id === 'ai-chatbot-pkg' || pkg.id === 'ai-chatbot') && (config as any)?.aiChatbotUrl) return (config as any).aiChatbotUrl;
    if ((pkg.id === 'web-apps' || pkg.id === 'web-app') && (config as any)?.webAppUrl) return (config as any).webAppUrl;
    if (pkg.id === 'brand-identity' && (config as any)?.brandIdentityUrl) return (config as any).brandIdentityUrl;
    if (pkg.id === 'ai-business' && (config as any)?.aiBusinessUrl) return (config as any).aiBusinessUrl;
    if (pkg.id === 'business-launch' && (config as any)?.businessLaunchUrl) return (config as any).businessLaunchUrl;
    if (config?.customUrl) return config.customUrl;
    return undefined;
  };
  const hostedUrl = getHostedPaymentUrl();

  const handleCopyPaymentId = () => {
    if (paymentReceipt?.paymentId) {
      navigator.clipboard.writeText(paymentReceipt.paymentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handlePayViaRazorpay = async () => {
    setErrorMessage(null);

    // Validation
    if (!clientName.trim()) {
      setErrorMessage('Please enter your full name for the project receipt.');
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (isCustomPackage && (!customInrAmount || customInrAmount < 100)) {
      setErrorMessage('Please enter a valid quoted project amount (minimum ₹100).');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Ensure SDK script is ready
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady && !(window as any).Razorpay) {
        throw new Error('Razorpay secure checkout SDK is loading. Please disable ad-blockers and try again.');
      }

      const activeKey =
        config?.razorpayKeyId?.trim() ||
        (import.meta as any).env?.VITE_RAZORPAY_KEY_ID?.trim() ||
        '';

      if (!activeKey) {
        throw new Error(
          'Online payment gateway is being configured by the studio. Please use Bookings / Enquire or email arkajastudio@gmail.com directly.'
        );
      }

      // 2. Attempt to create Order via backend (if server API is available at deployment)
      let orderId: string | undefined = undefined;
      try {
        const orderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: pkg.id,
            packageName: pkg.name,
            clientName: clientName.trim(),
            clientEmail: clientEmail.trim(),
            clientPhone: clientPhone.trim() || '+91 9999999999',
            customAmount: amountInr,
          }),
        });

        if (orderRes.ok) {
          const contentType = orderRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const orderData = await orderRes.json();
            if (orderData?.orderId) {
              orderId = orderData.orderId;
            }
          }
        } else {
          console.warn('[Razorpay] Backend create-order returned status:', orderRes.status, 'Proceeding with direct checkout fallback');
        }
      } catch (backendErr) {
        console.warn('[Razorpay] Backend order API unreachable at deployment; proceeding with direct gateway checkout:', backendErr);
      }

      // 3. Open official Razorpay Checkout Modal (supports both order-backed and direct checkout)
      const rzpOptions: any = {
        key: activeKey,
        amount: amountInr * 100, // paise
        currency: 'INR',
        name: 'ArkAja Studio',
        description: isCustomPackage
          ? `Custom Project Quoted Scope (₹${amountInr.toLocaleString('en-IN')})`
          : `${pkg.name} Package Creative Production`,
        image: '/arkaja-monogram.svg',
        handler: async function (response: any) {
          try {
            // Attempt to verify with backend if signature provided
            if (response.razorpay_signature) {
              await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id || orderId || 'direct',
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  packageId: pkg.id,
                  packageName: isCustomPackage ? `Custom Campaign (₹${amountInr})` : pkg.name,
                  clientName: clientName.trim(),
                  clientEmail: clientEmail.trim(),
                  clientPhone: clientPhone.trim(),
                  amount: amountInr,
                }),
              }).catch((e) => console.warn('[Razorpay] Backend verification sync note:', e));
            }
          } catch (err: any) {
            console.warn('[Razorpay] Verification note:', err);
          } finally {
            setIsProcessing(false);
            setPaymentReceipt({
              paymentId: response.razorpay_payment_id || `pay_${Date.now().toString(36)}`,
              orderId: response.razorpay_order_id || orderId || 'Direct Gateway',
              amount: amountInr,
              packageName: isCustomPackage ? 'Custom Campaign' : pkg.name,
              date: new Date().toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }),
            });
          }
        },
        prefill: {
          name: clientName.trim(),
          email: clientEmail.trim(),
          contact: clientPhone.trim() || '9999999999',
        },
        notes: {
          packageId: pkg.id,
          packageName: pkg.name,
          studio: 'ArkAja Studio Atelier',
          amountInr: String(amountInr),
          amountUsd: String(amountUsd),
          amountEur: String(amountEur),
        },
        theme: {
          color: '#0B0C0E',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      if (orderId) {
        rzpOptions.order_id = orderId;
      }

      const razorpayInstance = new (window as any).Razorpay(rzpOptions);
      razorpayInstance.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        setErrorMessage(resp.error?.description || 'Payment was declined or cancelled.');
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('Razorpay initialization error:', err);
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Error launching Razorpay checkout.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border transition-colors animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto ${
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

        {/* ============================================================== */}
        {/* VIEW 1: PAYMENT SUCCESS RECEIPT CONFIRMATION                   */}
        {/* ============================================================== */}
        {paymentReceipt ? (
          <div>
            {/* Header with success check */}
            <div className="text-center pb-6 border-b border-inherit mb-6">
              <div className="w-14 h-14 mx-auto mb-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-[10px] tracking-[0.25em] font-mono uppercase text-[#D8C7A5] mb-1">
                TRANSACTION CONFIRMED · RAZORPAY
              </div>
              <h3 className="font-serif text-3xl font-normal">
                Slot Reserved
              </h3>
              <p
                className={`text-xs mt-1 ${
                  isDark ? 'text-[#8E929A]' : 'text-[#7A808C]'
                }`}
              >
                Thank you, {clientName}. Your project deposit has been confirmed.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div
              className={`p-4 border mb-6 text-xs space-y-2.5 font-mono ${
                isDark
                  ? 'bg-[#171a20] border-[#24272D] text-[#B4B7BF]'
                  : 'bg-[#FAF8F5] border-[#E8E3DA] text-[#555A64]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <span className="opacity-60 text-[11px]">PACKAGE</span>
                <span className="font-semibold text-[#D8C7A5]">{paymentReceipt.packageName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <span className="opacity-60 text-[11px]">AMOUNT PAID</span>
                <div className="text-right">
                  <div className="text-base font-medium">₹{paymentReceipt.amount.toLocaleString('en-IN')} INR</div>
                  <div className="text-[10px] opacity-60">approx. ${Math.round(paymentReceipt.amount / 83.5)} USD / €{Math.round(paymentReceipt.amount / 91)} EUR</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <span className="opacity-60 text-[11px]">PAYMENT ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {paymentReceipt.paymentId}
                  </span>
                  <button
                    onClick={handleCopyPaymentId}
                    className="p-1 hover:text-[#D8C7A5] transition-colors"
                    title="Copy Payment ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-60 text-[11px]">DATE & TIME</span>
                <span className="text-[11px]">{paymentReceipt.date}</span>
              </div>
            </div>

            {/* What Happens Next Guidance */}
            <div className="p-3.5 bg-black/40 border border-[#D8C7A5]/30 mb-6 text-xs text-[#D8C7A5] space-y-1">
              <div className="font-semibold tracking-wider uppercase text-[10px] flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Next Steps for Your Project
              </div>
              <p className="font-light text-[11px] leading-relaxed text-[#ECE9E2]">
                Our creative director will reach out via email ({clientEmail}) within 24 hours to review your references and initiate the project brief.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onProceedToEnquiry(`${paymentReceipt.packageName} (Deposit Paid: ${paymentReceipt.paymentId})`);
                  onClose();
                }}
                className={`w-full py-3.5 text-xs tracking-[0.2em] font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${
                  isDark
                    ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                    : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
                }`}
              >
                <span>CONTINUE TO PROJECT BRIEF</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className={`w-full py-2.5 text-xs tracking-[0.18em] font-light transition-colors text-center ${
                  isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7B818F] hover:text-[#14171A]'
                }`}
              >
                Close Receipt
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* VIEW 2: ACTIVE CHECKOUT & MULTI-CURRENCY SPECIFICATION         */
          /* ============================================================== */
          <div>
            {/* Modal Header */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <Logo variant="full" size="sm" />
                <span className="opacity-30">|</span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono block">
                  RAZORPAY GLOBAL CHECKOUT
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal">
                {pkg.name} Package
              </h3>

              {/* Price & Multi-Currency Breakdown */}
              {isCustomPackage ? (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase font-semibold text-amber-400 mb-1">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>SCOPE AS PER REQUIREMENT · NO FIXED PRICE</span>
                  </div>
                  <p className="text-[11px] font-light leading-relaxed">
                    Custom packages are priced individually based on deliverable counts and timeline. Enter your agreed quoted deposit below, or request a custom scope quote.
                  </p>
                </div>
              ) : (
                <div className="mt-2.5 pb-2 border-b border-inherit">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <span className="font-mono text-2xl font-medium">
                      {pkg.priceInr}
                    </span>
                    <span className="text-xs font-mono text-[#D8C7A5] font-semibold">
                      · {pkg.priceUsd} USD · {pkg.priceEur} EUR
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider ml-auto font-mono">
                      One-Time Project
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono opacity-70">
                    <Globe className="w-3 h-3 text-[#D8C7A5]" />
                    <span>Razorpay processes globally in INR (₹) with real-time conversion for international cards & UPI</span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Amount Input for Custom Package */}
            {isCustomPackage && (
              <div className="mb-5 p-4 border bg-black/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <label htmlFor="custom-amount" className="font-semibold text-[#D8C7A5] uppercase tracking-wider">
                    ENTER QUOTED AMOUNT (INR ₹)
                  </label>
                  <span className="text-[10px] opacity-70">
                    As agreed with studio
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono opacity-60">₹</span>
                  <input
                    id="custom-amount"
                    type="number"
                    min="100"
                    step="100"
                    value={customInrAmount === 0 ? '' : customInrAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomInrAmount(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                    }}
                    disabled={isProcessing}
                    placeholder="e.g. 10000"
                    className={`w-full pl-8 pr-3.5 py-2.5 text-sm font-mono border rounded-none focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#16181f] border-[#2E333B] focus:border-[#D8C7A5] text-white'
                        : 'bg-[#FAF8F5] border-[#DCD6C9] focus:border-[#A58B55] text-black'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#D8C7A5] pt-1">
                  <span>Equivalent in USD: ~${amountUsd} USD</span>
                  <span>Equivalent in EUR: ~€{amountEur} EUR</span>
                </div>
              </div>
            )}

            {/* Package Highlights */}
            <div
              className={`border p-4 mb-5 text-xs space-y-2 ${
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
              <div className="pt-2 border-t border-inherit text-[11px] text-[#D8C7A5] font-mono flex items-center justify-between">
                <span>Turnaround: {pkg.delivery}</span>
                <span>All major cards · UPI · Netbanking</span>
              </div>
            </div>

            {/* Client Contact Inputs */}
            <div className="mb-5 space-y-3">
              <div className="text-[10px] font-mono tracking-widest uppercase opacity-70">
                CLIENT CONTACT & RECEIPT DETAILS
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={isProcessing}
                  className={`w-full px-3.5 py-2.5 text-xs border rounded-none focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#16181f] border-[#2E333B] focus:border-[#D8C7A5] text-white'
                      : 'bg-[#FAF8F5] border-[#DCD6C9] focus:border-[#A58B55] text-black'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  disabled={isProcessing}
                  className={`w-full px-3.5 py-2.5 text-xs border rounded-none focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#16181f] border-[#2E333B] focus:border-[#D8C7A5] text-white'
                      : 'bg-[#FAF8F5] border-[#DCD6C9] focus:border-[#A58B55] text-black'
                  }`}
                />
                <input
                  type="tel"
                  placeholder="WhatsApp / Phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  disabled={isProcessing}
                  className={`w-full px-3.5 py-2.5 text-xs border rounded-none focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#16181f] border-[#2E333B] focus:border-[#D8C7A5] text-white'
                      : 'bg-[#FAF8F5] border-[#DCD6C9] focus:border-[#A58B55] text-black'
                  }`}
                />
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3 bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Security Indicator */}
            <div className="mb-6 flex items-start gap-2.5 p-3 bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Powered by official Razorpay gateway. Full 256-bit SSL encryption. Accepts Indian & International Debit/Credit Cards, UPI, Netbanking & Wallets with real-time currency conversion.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handlePayViaRazorpay}
                disabled={isProcessing}
                className={`w-full py-3.5 text-xs tracking-[0.18em] font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                    : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>LAUNCHING RAZORPAY...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      PAY ₹{amountInr.toLocaleString('en-IN')} (~${amountUsd} USD / €{amountEur} EUR)
                    </span>
                  </>
                )}
              </button>

              {hostedUrl && (
                <a
                  href={hostedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 text-xs tracking-[0.16em] font-medium border transition-colors flex items-center justify-center gap-2 ${
                    isDark
                      ? 'border-[#D8C7A5]/50 text-[#D8C7A5] hover:bg-[#D8C7A5]/10'
                      : 'border-[#A58B55]/60 text-[#A58B55] hover:bg-[#A58B55]/10'
                  }`}
                >
                  <span>PAY VIA HOSTED RAZORPAY LINK</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={() => {
                  onProceedToEnquiry(
                    isCustomPackage
                      ? `Custom Campaign (Requirement: ₹${amountInr})`
                      : pkg.name
                  );
                  onClose();
                }}
                disabled={isProcessing}
                className={`w-full py-2.5 text-xs tracking-[0.18em] font-light transition-colors text-center ${
                  isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7B818F] hover:text-[#14171A]'
                }`}
              >
                {isCustomPackage
                  ? 'Or request a bespoke scope brief in builder'
                  : 'Or discuss brief via studio enquiry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
