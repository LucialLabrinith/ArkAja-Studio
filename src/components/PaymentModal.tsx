import React, { useState, useEffect } from 'react';
import { PricingPackage } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { saveEnquiryToFirestore } from '../lib/firebase';
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
  MessageSquare,
  Mail,
} from 'lucide-react';

export interface StudioPaymentConfig {
  email?: string;
  instagram?: string;
  instagramUrl?: string;
  location?: string;
  starterUrl?: string;
  signatureUrl?: string;
  customUrl?: string;
  basicWebsiteUrl?: string;
  urgentWebsiteUrl?: string;
  logoDesignUrl?: string;
  aiChatbotUrl?: string;
  basicWebAppUrl?: string;
  webAppUrl?: string;
  brandIdentityUrl?: string;
  aiBusinessUrl?: string;
  businessLaunchUrl?: string;
  hasStarterPayment?: boolean;
  hasSignaturePayment?: boolean;
  hasCustomPayment?: boolean;
  razorpayKeyId?: string;
  isRazorpayConfigured?: boolean;
  isRazorpayLiveKey?: boolean;
}

const DEFAULT_RAZORPAY_ME_URL = 'https://razorpay.me/@divyamithileshmishra';

interface PaymentModalProps {
  pkg: PricingPackage | null;
  config: StudioPaymentConfig;
  onClose: () => void;
  onProceedToEnquiry: (packageName: string) => void;
}

interface PaymentReceipt {
  mode: 'razorpay' | 'booking';
  paymentId: string;
  orderId: string;
  amount: number;
  date: string;
  packageName: string;
  whatsappUrl?: string;
  gmailUrl?: string;
}

function isSafeHttpsUrl(url?: string): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
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
  }, [user, clientName, clientEmail]);

  // Set default initial amount and clear stale modal state when package changes
  useEffect(() => {
    setErrorMessage(null);
    setPaymentReceipt(null);
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
        setTimeout(() => resolve(Boolean((window as any).Razorpay)), 2500);
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

  // Enable Razorpay Standard Checkout whenever configured via backend or VITE_RAZORPAY_KEY_ID
  const envKey = ((import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '').trim();
  const activeKey = config?.razorpayKeyId?.trim() || envKey;
  const isGatewayLive = Boolean((config?.isRazorpayConfigured || activeKey) && activeKey);
  const isTestMode = activeKey.startsWith('rzp_test_');

  useEffect(() => {
    if (isGatewayLive) {
      loadRazorpayScript();
    }
  }, [isGatewayLive]);

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
    let candidate: string | undefined;
    if (pkg.id === 'starter') candidate = config?.starterUrl;
    else if (pkg.id === 'signature') candidate = config?.signatureUrl;
    else if (pkg.id === 'basic-website') candidate = config?.basicWebsiteUrl;
    else if (pkg.id === 'urgent-website') candidate = config?.urgentWebsiteUrl;
    else if (pkg.id === 'logo-design') candidate = config?.logoDesignUrl;
    else if (pkg.id === 'ai-chatbot-pkg' || pkg.id === 'ai-chatbot') candidate = config?.aiChatbotUrl;
    else if (pkg.id === 'basic-web-app') candidate = config?.basicWebAppUrl || config?.webAppUrl;
    else if (pkg.id === 'web-apps' || pkg.id === 'web-app') candidate = config?.webAppUrl;
    else if (pkg.id === 'brand-identity') candidate = config?.brandIdentityUrl;
    else if (pkg.id === 'ai-business') candidate = config?.aiBusinessUrl;
    else if (pkg.id === 'business-launch') candidate = config?.businessLaunchUrl;

    if (isSafeHttpsUrl(candidate)) return candidate;
    if (isSafeHttpsUrl(config?.customUrl)) return config.customUrl;
    return DEFAULT_RAZORPAY_ME_URL;
  };
  const hostedUrl = getHostedPaymentUrl();
  const isRazorpayMeLink = Boolean(hostedUrl?.includes('razorpay.me/'));

  const validateClientDetails = (): boolean => {
    if (!clientName.trim()) {
      setErrorMessage('Please enter your full name for the project receipt.');
      return false;
    }
    const emailTrimmed = clientEmail.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (isCustomPackage && (!customInrAmount || customInrAmount < 100 || customInrAmount > 5000000)) {
      setErrorMessage('Please enter a valid quoted amount between ₹100 and ₹50,00,000.');
      return false;
    }
    return true;
  };

  const handleCopyPaymentId = () => {
    if (paymentReceipt?.paymentId) {
      navigator.clipboard?.writeText(paymentReceipt.paymentId).catch(() => {});
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Flow 1: Live Razorpay Gateway Checkout (when server keys are configured)
  const handlePayViaRazorpay = async () => {
    setErrorMessage(null);
    if (!validateClientDetails()) return;

    setIsProcessing(true);

    try {
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady || !(window as any).Razorpay) {
        throw new Error('Could not load Razorpay checkout script. Please disable any ad-blocker or use Direct Slot Reservation below.');
      }

      // 1. Create authoritative order via backend API (/api/create-order)
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInr * 100,
          currency: 'INR',
          packageId: pkg.id,
          packageName: pkg.name,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          customAmount: amountInr,
        }),
      });

      const contentType = orderRes.headers.get('content-type') || '';
      const orderData = contentType.includes('application/json') ? await orderRes.json() : null;
      const resolvedOrderId = orderData?.order_id || orderData?.orderId;
      const resolvedKeyId = orderData?.keyId || activeKey;

      if (!orderRes.ok || !resolvedOrderId || !resolvedKeyId) {
        throw new Error(
          orderData?.error || 'Could not initialize payment order. Please try again.'
        );
      }

      const authoritativeAmountInr = Math.round((orderData.amount || amountInr * 100) / 100);

      // 2. Launch Razorpay Standard Checkout modal bound to server order_id
      const prefill: Record<string, string> = {
        name: clientName.trim(),
        email: clientEmail.trim(),
      };
      if (clientPhone.trim()) {
        prefill.contact = clientPhone.trim();
      }

      const rzpOptions: Record<string, unknown> = {
        key: resolvedKeyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        order_id: resolvedOrderId,
        name: 'ArkAja Studio',
        description: isCustomPackage
          ? `Custom Project Quoted Scope (₹${authoritativeAmountInr.toLocaleString('en-IN')})`
          : `${pkg.name} Package`,
        image: `${window.location.origin}/arkaja-monogram.svg`,
        handler: async function (response: {
          razorpay_order_id?: string;
          razorpay_payment_id?: string;
          razorpay_signature?: string;
        }) {
          try {
            if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
              setIsProcessing(false);
              setErrorMessage('Incomplete payment confirmation received from Razorpay. Please contact arkajastudio@gmail.com.');
              return;
            }

            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                packageId: pkg.id,
                packageName: isCustomPackage ? `Custom Scope (₹${authoritativeAmountInr})` : pkg.name,
                clientName: clientName.trim(),
                clientEmail: clientEmail.trim(),
                clientPhone: clientPhone.trim(),
                amount: authoritativeAmountInr,
              }),
            });

            const verifyData = await verifyRes.json().catch(() => null);

            if (!verifyRes.ok || !verifyData?.verified) {
              setIsProcessing(false);
              setErrorMessage(
                `Payment signature could not be verified (${verifyData?.error || 'Verification failed'}). If debited, share Payment ID ${response.razorpay_payment_id} with arkajastudio@gmail.com.`
              );
              return;
            }

            setIsProcessing(false);
            setPaymentReceipt({
              mode: 'razorpay',
              paymentId: verifyData.paymentId || response.razorpay_payment_id,
              orderId: verifyData.orderId || response.razorpay_order_id,
              amount: verifyData.amount || authoritativeAmountInr,
              packageName: verifyData.packageName || (isCustomPackage ? 'Custom Scope' : pkg.name),
              date: new Date().toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }),
            });
          } catch {
            setIsProcessing(false);
            setErrorMessage(
              `Network error while verifying payment. Please email your Payment ID (${response.razorpay_payment_id || 'N/A'}) to arkajastudio@gmail.com.`
            );
          }
        },
        prefill,
        notes: {
          packageId: pkg.id,
          packageName: pkg.name,
          studio: 'ArkAja Studio',
          amountInr: String(authoritativeAmountInr),
        },
        theme: {
          color: '#0B0C0E',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setErrorMessage('Payment window closed before completion. You can retry whenever ready.');
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(rzpOptions);
      razorpayInstance.on('payment.failed', function (resp: { error?: { description?: string } }) {
        setIsProcessing(false);
        setErrorMessage(resp?.error?.description || 'Payment was declined or cancelled. Please try again.');
      });

      razorpayInstance.open();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Unable to launch Razorpay checkout right now.');
    }
  };

  // Flow 2: Direct Studio Slot Reservation & Instant UPI / Invoice Payment Link Request
  const handleDirectBookingRequest = async () => {
    setErrorMessage(null);
    if (!validateClientDetails()) return;

    setIsProcessing(true);

    const formattedInr = `₹${amountInr.toLocaleString('en-IN')}`;
    const packageLabel = isCustomPackage ? `${pkg.name} (${formattedInr})` : `${pkg.name} (${formattedInr})`;
    const bookingDetails = [
      `Direct Slot Reservation & Payment Link Request`,
      `Package: ${pkg.name}`,
      `Amount: ${formattedInr} INR (~$${amountUsd} USD / ~€${amountEur} EUR)`,
      `Delivery: ${pkg.delivery}`,
      pkg.features.length > 0 ? `Scope Includes: ${pkg.features.join('; ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const fallbackRefId = `ARK-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    try {
      let bookingId = fallbackRefId;
      let whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `*ArkAja Studio Slot Reservation [${fallbackRefId}]*\n\n*Client:* ${clientName.trim()} (${clientEmail.trim()})\n*Phone:* ${clientPhone.trim() || 'Not provided'}\n*Package:* ${packageLabel}\n*Amount:* ${formattedInr} (~$${amountUsd} USD / €${amountEur} EUR)\n\nPlease share the UPI / Razorpay payment link to confirm my slot.`
      )}`;
      let gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=arkajastudio@gmail.com&su=${encodeURIComponent(
        `Slot Reservation & Payment Link Request: ${pkg.name} [${fallbackRefId}]`
      )}&body=${encodeURIComponent(
        `Hi ArkAja Studio,\n\nI would like to reserve my slot and receive the UPI / Razorpay payment link:\n\nReference ID: ${fallbackRefId}\nName: ${clientName.trim()}\nEmail: ${clientEmail.trim()}\nWhatsApp / Phone: ${clientPhone.trim() || 'Not provided'}\nPackage: ${packageLabel}\nAmount: ${formattedInr} INR (~$${amountUsd} USD / €${amountEur} EUR)\n\nThank you!`
      )}`;

      const enquiryPayload = {
        fullName: clientName.trim(),
        brandName: `${clientName.trim()} — ${pkg.name}`,
        email: clientEmail.trim(),
        country: 'India / Global',
        phone: clientPhone.trim() || 'Not provided',
        businessCategory: pkg.category || 'Package Booking',
        neededServices: [pkg.name],
        preferredPackage: packageLabel,
        timeline: pkg.delivery,
        budget: `${formattedInr} (~$${amountUsd} USD)`,
        projectDetails: bookingDetails,
        calculatedSubtotal: amountInr,
        pricingSummary: `${pkg.name} — ${formattedInr} INR (~$${amountUsd} USD / €${amountEur} EUR)`,
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryPayload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.enquiry?.id) bookingId = data.enquiry.id;
        if (isSafeHttpsUrl(data?.whatsappUrl)) whatsappUrl = data.whatsappUrl;
        if (isSafeHttpsUrl(data?.gmailComposeUrl)) gmailUrl = data.gmailComposeUrl;
      }

      // Also sync to Firestore ledger in background (non-blocking)
      saveEnquiryToFirestore({
        id: bookingId,
        ...enquiryPayload,
        status: 'payment_link_requested',
        userId: user?.uid || 'guest',
      }).catch(() => {});

      setPaymentReceipt({
        mode: 'booking',
        paymentId: bookingId,
        orderId: pkg.id,
        amount: amountInr,
        packageName: pkg.name,
        date: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        whatsappUrl,
        gmailUrl,
      });
    } catch {
      setErrorMessage('Could not connect to studio server. Please try again or email arkajastudio@gmail.com.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      data-payment-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${pkg.name} Checkout`}
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
          disabled={isProcessing}
          className={`absolute top-4 right-4 p-2 transition-colors disabled:opacity-40 ${
            isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7A808C] hover:text-[#14171A]'
          }`}
          aria-label="Close Payment Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================== */}
        {/* VIEW 1: PAYMENT / SLOT RESERVATION CONFIRMATION                */}
        {/* ============================================================== */}
        {paymentReceipt ? (
          <div>
            {/* Header with success check */}
            <div className="text-center pb-6 border-b border-inherit mb-6">
              <div
                className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center shadow-sm border ${
                  isDark
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-[10px] tracking-[0.25em] font-mono uppercase text-[#A58B55] dark:text-[#D8C7A5] mb-1 font-semibold">
                {paymentReceipt.mode === 'razorpay'
                  ? 'TRANSACTION VERIFIED · RAZORPAY'
                  : 'SLOT RESERVED · PAYMENT LINK REQUESTED'}
              </div>
              <h3 className="font-serif text-3xl font-normal">
                {paymentReceipt.mode === 'razorpay' ? 'Slot Reserved' : 'Booking Confirmed'}
              </h3>
              <p
                className={`text-xs mt-1 ${
                  isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
                }`}
              >
                {paymentReceipt.mode === 'razorpay'
                  ? `Thank you, ${clientName}. Your payment has been cryptographically verified.`
                  : `Thank you, ${clientName}. Your package slot is logged and our studio will send your UPI / Card payment link shortly.`}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div
              className={`p-4 border mb-6 text-xs space-y-2.5 font-mono ${
                isDark
                  ? 'bg-[#171a20] border-[#24272D] text-[#B4B7BF]'
                  : 'bg-[#FAF8F5] border-[#E8E3DA] text-[#3F444E]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-inherit gap-3">
                <span className="opacity-65 text-[11px]">PACKAGE</span>
                <span className="font-semibold text-[#8C6E33] dark:text-[#D8C7A5] text-right">
                  {paymentReceipt.packageName}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <span className="opacity-65 text-[11px]">
                  {paymentReceipt.mode === 'razorpay' ? 'AMOUNT PAID' : 'ESTIMATED TOTAL'}
                </span>
                <div className="text-right">
                  <div className="text-base font-semibold">₹{paymentReceipt.amount.toLocaleString('en-IN')} INR</div>
                  <div className="text-[10px] opacity-65">
                    approx. ${Math.round(paymentReceipt.amount / 83.5)} USD / €{Math.round(paymentReceipt.amount / 91)} EUR
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <span className="opacity-65 text-[11px]">
                  {paymentReceipt.mode === 'razorpay' ? 'PAYMENT ID' : 'REFERENCE ID'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-semibold ${
                      isDark ? 'text-emerald-400' : 'text-emerald-700'
                    }`}
                  >
                    {paymentReceipt.paymentId}
                  </span>
                  <button
                    onClick={handleCopyPaymentId}
                    className="p-1 hover:text-[#A58B55] dark:hover:text-[#D8C7A5] transition-colors"
                    title="Copy Reference ID"
                    type="button"
                  >
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-65 text-[11px]">DATE &amp; TIME</span>
                <span className="text-[11px]">{paymentReceipt.date}</span>
              </div>
            </div>

            {/* What Happens Next Guidance */}
            <div
              className={`p-3.5 border mb-6 text-xs space-y-1 ${
                isDark
                  ? 'bg-black/40 border-[#D8C7A5]/30 text-[#D8C7A5]'
                  : 'bg-[#FAF8F5] border-[#D8C7A5] text-[#8C6E33]'
              }`}
            >
              <div className="font-semibold tracking-wider uppercase text-[10px] flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Next Steps for Your Project
              </div>
              <p
                className={`font-light text-[11px] leading-relaxed ${
                  isDark ? 'text-[#ECE9E2]' : 'text-[#3F444E]'
                }`}
              >
                {paymentReceipt.mode === 'razorpay'
                  ? `Our creative director will reach out via email (${clientEmail}) within 24 hours to review your references and kick off production.`
                  : `We've sent your booking to arkajastudio@gmail.com. You'll receive a verified Razorpay / UPI payment link at ${clientEmail} shortly — or speed it up via WhatsApp/Gmail below.`}
              </p>
            </div>

            {/* Direct WhatsApp / Gmail quick links for booking mode */}
            {paymentReceipt.mode === 'booking' && (paymentReceipt.whatsappUrl || paymentReceipt.gmailUrl) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {paymentReceipt.whatsappUrl && (
                  <a
                    href={paymentReceipt.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 text-[11px] tracking-[0.14em] uppercase font-mono font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Studio</span>
                  </a>
                )}
                {paymentReceipt.gmailUrl && (
                  <a
                    href={paymentReceipt.gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-2.5 px-3 text-[11px] tracking-[0.14em] uppercase font-mono font-semibold border transition-colors flex items-center justify-center gap-2 ${
                      isDark
                        ? 'border-[#D8C7A5]/50 text-[#D8C7A5] hover:bg-[#D8C7A5]/10'
                        : 'border-[#14171A] text-[#14171A] hover:bg-[#14171A] hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Gmail</span>
                  </a>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  onProceedToEnquiry(
                    paymentReceipt.mode === 'razorpay'
                      ? `${paymentReceipt.packageName} (Deposit Paid: ${paymentReceipt.paymentId})`
                      : `${paymentReceipt.packageName} (Slot Ref: ${paymentReceipt.paymentId})`
                  );
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
                type="button"
                onClick={onClose}
                className={`w-full py-2.5 text-xs tracking-[0.18em] font-light transition-colors text-center ${
                  isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#646A77] hover:text-[#14171A]'
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
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#8C6E33] dark:text-[#D8C7A5] font-mono font-semibold block">
                  {isGatewayLive
                    ? isTestMode
                      ? 'RAZORPAY CHECKOUT · TEST MODE'
                      : 'RAZORPAY GLOBAL CHECKOUT'
                    : isRazorpayMeLink
                    ? 'RAZORPAY.ME OFFICIAL CHECKOUT'
                    : hostedUrl
                    ? 'HOSTED PAYMENT CHECKOUT'
                    : 'DIRECT STUDIO CHECKOUT'}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal">
                {pkg.name}
              </h3>

              {/* Price & Multi-Currency Breakdown */}
              {isCustomPackage ? (
                <div
                  className={`mt-3 p-3 border text-xs ${
                    isDark
                      ? 'bg-amber-500/10 border-amber-500/25 text-amber-200'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase font-semibold mb-1 ${
                      isDark ? 'text-amber-400' : 'text-amber-800'
                    }`}
                  >
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
                    <span className="font-mono text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                      {pkg.priceInr}
                    </span>
                    <span className="text-xs font-mono text-[#8C6E33] dark:text-[#D8C7A5] font-semibold">
                      · {pkg.priceUsd} USD · {pkg.priceEur} EUR
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider ml-auto font-mono ${
                        isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
                      }`}
                    >
                      One-Time Project
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono opacity-80">
                    <Globe className="w-3 h-3 text-[#8C6E33] dark:text-[#D8C7A5] shrink-0" />
                    <span>
                      Processed in INR (₹) with UPI, Indian &amp; international cards, and bank transfer support
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Amount Input for Custom Package */}
            {isCustomPackage && (
              <div
                className={`mb-5 p-4 border space-y-2 ${
                  isDark
                    ? 'bg-[#171a20] border-[#24272D]'
                    : 'bg-[#FAF8F5] border-[#E2DDD5]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <label
                    htmlFor="custom-amount"
                    className="font-semibold text-[#8C6E33] dark:text-[#D8C7A5] uppercase tracking-wider"
                  >
                    ENTER QUOTED AMOUNT (INR ₹)
                  </label>
                  <span className="text-[10px] opacity-70">As agreed with studio</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono opacity-60">₹</span>
                  <input
                    id="custom-amount"
                    type="number"
                    min="100"
                    max="5000000"
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
                        ? 'bg-[#121418] border-[#2E333B] focus:border-[#D8C7A5] text-white'
                        : 'bg-[#FFFFFF] border-[#DCD6C9] focus:border-[#A58B55] text-black'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8C6E33] dark:text-[#D8C7A5] pt-1">
                  <span>Approx. USD: ~${amountUsd} USD</span>
                  <span>Approx. EUR: ~€{amountEur} EUR</span>
                </div>
              </div>
            )}

            {/* Package Highlights */}
            <div
              className={`border p-4 mb-5 text-xs space-y-2 ${
                isDark
                  ? 'bg-[#171a20] border-[#24272D] text-[#B4B7BF]'
                  : 'bg-[#FAF8F5] border-[#E8E3DA] text-[#454A54]'
              }`}
            >
              {pkg.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#A58B55] dark:bg-[#D8C7A5] rounded-full shrink-0 mt-1.5" />
                  <span>{feat}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-inherit text-[11px] text-[#8C6E33] dark:text-[#D8C7A5] font-mono flex flex-wrap items-center justify-between gap-2">
                <span>Turnaround: {pkg.delivery}</span>
                <span>UPI · Cards · Netbanking</span>
              </div>
            </div>

            {/* Client Contact Inputs */}
            <div className="mb-5 space-y-3">
              <div className="text-[10px] font-mono tracking-widest uppercase opacity-75">
                CLIENT CONTACT &amp; RECEIPT DETAILS
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
                      ? 'bg-[#16181f] border-[#2E333B] focus:border-[#D8C7A5] text-white placeholder:text-[#6B707B]'
                      : 'bg-[#FAF8F5] border-[#DCD6C9] focus:border-[#A58B55] text-black placeholder:text-[#7A808C]'
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
                      ? 'bg-[#16181f] border-[#2E333B] focus:border-[#D8C7A5] text-white placeholder:text-[#6B707B]'
                      : 'bg-[#FAF8F5] border-[#DCD6C9] focus:border-[#A58B55] text-black placeholder:text-[#7A808C]'
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
                      ? 'bg-[#16181f] border-[#2E333B] focus:border-[#D8C7A5] text-white placeholder:text-[#6B707B]'
                      : 'bg-[#FAF8F5] border-[#DCD6C9] focus:border-[#A58B55] text-black placeholder:text-[#7A808C]'
                  }`}
                />
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                className={`mb-5 p-3 border text-xs flex items-start gap-2 ${
                  isDark
                    ? 'bg-red-950/40 border-red-800/50 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Security / Checkout Mode Indicator */}
            <div
              className={`mb-6 flex items-start gap-2.5 p-3 border text-xs ${
                isDark
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                {isGatewayLive
                  ? 'Powered by official Razorpay gateway with server-verified orders and 256-bit SSL encryption. Accepts Indian & International Cards, UPI, Netbanking & Wallets.'
                  : isRazorpayMeLink
                  ? `Pay securely on our official Razorpay.me page (@divyamithileshmishra) via UPI, Cards, or Netbanking — enter ₹${amountInr.toLocaleString('en-IN')} on Razorpay, then reserve your slot below so we match your receipt.`
                  : hostedUrl
                  ? 'Pay securely via our official Razorpay Payment Link below, or reserve your slot directly so we send your project kickoff confirmation immediately.'
                  : 'Reserve your slot instantly below — no upfront failure. Our studio immediately sends your verified UPI / Razorpay Card Payment Link & invoice to your email and WhatsApp.'}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {isGatewayLive ? (
                <button
                  type="button"
                  onClick={handlePayViaRazorpay}
                  disabled={isProcessing}
                  className={`w-full py-3.5 text-xs tracking-[0.16em] font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
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
              ) : hostedUrl ? (
                <a
                  href={hostedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 text-xs tracking-[0.16em] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#F3F1EC]'
                      : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isRazorpayMeLink
                      ? `PAY ₹${amountInr.toLocaleString('en-IN')} VIA RAZORPAY.ME`
                      : `PAY ₹${amountInr.toLocaleString('en-IN')} VIA RAZORPAY LINK`}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleDirectBookingRequest}
                  disabled={isProcessing}
                  className={`w-full py-3.5 text-xs tracking-[0.16em] font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#F3F1EC]'
                      : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>RESERVING YOUR SLOT...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        RESERVE SLOT &amp; GET PAYMENT LINK (₹{amountInr.toLocaleString('en-IN')})
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Secondary hosted link when live Razorpay is also active */}
              {isGatewayLive && hostedUrl && (
                <a
                  href={hostedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 text-xs tracking-[0.16em] font-medium border transition-colors flex items-center justify-center gap-2 ${
                    isDark
                      ? 'border-[#D8C7A5]/50 text-[#D8C7A5] hover:bg-[#D8C7A5]/10'
                      : 'border-[#A58B55]/60 text-[#8C6E33] hover:bg-[#A58B55]/10'
                  }`}
                >
                  <span>
                    {isRazorpayMeLink ? 'OR PAY DIRECTLY ON RAZORPAY.ME' : 'PAY VIA HOSTED RAZORPAY LINK'}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Secondary direct reservation option when hostedUrl is primary */}
              {!isGatewayLive && hostedUrl && (
                <button
                  type="button"
                  onClick={handleDirectBookingRequest}
                  disabled={isProcessing}
                  className={`w-full py-3 text-xs tracking-[0.16em] font-medium border transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    isDark
                      ? 'border-[#D8C7A5]/50 text-[#D8C7A5] hover:bg-[#D8C7A5]/10'
                      : 'border-[#A58B55]/60 text-[#8C6E33] hover:bg-[#A58B55]/10'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>CONFIRMING SLOT...</span>
                    </>
                  ) : (
                    <span>CONFIRM SLOT &amp; NOTIFY STUDIO</span>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onProceedToEnquiry(
                    isCustomPackage
                      ? `Custom Campaign (Requirement: ₹${amountInr.toLocaleString('en-IN')})`
                      : pkg.name
                  );
                  onClose();
                }}
                disabled={isProcessing}
                className={`w-full py-2.5 text-xs tracking-[0.18em] font-light transition-colors text-center ${
                  isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#646A77] hover:text-[#14171A]'
                }`}
              >
                {isCustomPackage
                  ? 'Or request a bespoke scope brief in enquiry form'
                  : 'Or discuss brief via studio enquiry form'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
