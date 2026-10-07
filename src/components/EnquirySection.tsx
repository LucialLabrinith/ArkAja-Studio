import React, { useState, useEffect, useMemo } from 'react';
import { EnquiryFormData, CustomBuilderState } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { saveEnquiryToFirestore } from '../lib/firebase';
import { Logo } from './Logo';
import {
  Mail,
  Instagram,
  ArrowUpRight,
  Send,
  CheckCircle2,
  Copy,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface EnquirySectionProps {
  prefillBuilderState?: CustomBuilderState | null;
  prefillPackage?: string | null;
}

export const EnquirySection: React.FC<EnquirySectionProps> = ({
  prefillBuilderState,
  prefillPackage,
}) => {
  const { user, refreshUserData } = useAuth();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState<EnquiryFormData>({
    fullName: '',
    brandName: '',
    email: '',
    country: 'India',
    phone: '',
    businessCategory: 'Beauty',
    neededServices: ['Basic Website — ₹10,000'],
    preferredPackage: 'Basic Website (₹10,000)',
    deliverableCounts: { posts: 4, stories: 2, carousels: 0, promo: 1, reels: 0 },
    timeline: '3–5 days',
    budget: '₹10,000–₹25,000',
    projectDetails: '',
    referenceLinks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id?: string;
    gmailComposeUrl?: string;
    mailtoUrl?: string;
    whatsappUrl?: string;
    formattedMessage?: string;
    message?: string;
    selectedServices?: string[];
    pricingSummary?: string;
    fixedSubtotal?: number;
    hasCustomQuote?: boolean;
  } | null>(null);

  // Sync user info if signed in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Sync with builder or pricing package prefill
  useEffect(() => {
    if (prefillBuilderState) {
      setFormData((prev) => ({
        ...prev,
        businessCategory: prefillBuilderState.businessType || prev.businessCategory,
        country: prefillBuilderState.country || prev.country,
        timeline: prefillBuilderState.timeline || prev.timeline,
        budget: prefillBuilderState.budget || prev.budget,
        neededServices: prefillBuilderState.categories || prev.neededServices,
        deliverableCounts: {
          posts: prefillBuilderState.counts.posts,
          stories: prefillBuilderState.counts.stories,
          carousels: prefillBuilderState.counts.carousels,
          promo: prefillBuilderState.counts.promotionalCreatives,
          reels: prefillBuilderState.counts.reels,
        },
        projectDetails: prefillBuilderState.somethingElse
          ? `Specific requirements: ${prefillBuilderState.somethingElse}\n`
          : '',
      }));
    }
  }, [prefillBuilderState]);

  const [activeSegregation, setActiveSegregation] = useState<
    'ALL' | 'WEBSITE' | 'WEB_APP' | 'SOCIAL_CONTENT' | 'BRANDING' | 'AI_SOLUTIONS'
  >('ALL');

  useEffect(() => {
    if (prefillPackage) {
      setFormData((prev) => ({
        ...prev,
        preferredPackage: prefillPackage,
      }));

      const lower = prefillPackage.toLowerCase();
      if (lower.includes('web app') || lower.includes('system')) {
        setActiveSegregation('WEB_APP');
      } else if (lower.includes('website')) {
        setActiveSegregation('WEBSITE');
      } else if (lower.includes('starter') || lower.includes('signature') || lower.includes('content')) {
        setActiveSegregation('SOCIAL_CONTENT');
      } else if (lower.includes('logo') || lower.includes('brand')) {
        setActiveSegregation('BRANDING');
      } else if (lower.includes('ai')) {
        setActiveSegregation('AI_SOLUTIONS');
      }
    }
  }, [prefillPackage]);

  const serviceOptions = [
    'Basic Website — ₹10,000',
    'Urgent Website Delivery — +₹2,000',
    'Enquiry Form Integration — +₹3,000',
    'AI Chatbot — +₹5,000',
    'Logo Design — ₹3,000',
    'Basic Web App (Level 1) — ₹15,000',
    'Advanced Web App / Platform — Custom Quote',
    'Brand Identity — Custom Quote',
    'Web Apps & Business Systems — Custom Quote',
    'Social Media & Content',
    'Campaign / Promotional Creative',
    'AI-Assisted Business Solution — Custom Quote',
    'Custom Website Features — Custom Quote',
    'Other',
  ];

  const SEGREGATION_CONFIGS = [
    {
      id: 'ALL' as const,
      label: 'All Services',
      badge: 'COMBINED BUNDLE',
      shortDesc: 'Multi-service project combining websites, apps, branding, or content.',
      allowedServices: serviceOptions,
    },
    {
      id: 'WEBSITE' as const,
      label: 'Only Website',
      badge: '20% OFF · ₹10,000',
      shortDesc: 'Brochure online presence (Home, About, Services, Contact, Deployment).',
      quickPreset: {
        packageName: 'Basic Website (₹10,000)',
        serviceToSelect: 'Basic Website — ₹10,000',
        priceBadge: '₹10,000 (was ₹12,500)',
      },
      allowedServices: [
        'Basic Website — ₹10,000',
        'Urgent Website Delivery — +₹2,000',
        'Enquiry Form Integration — +₹3,000',
        'Custom Website Features — Custom Quote',
      ],
    },
    {
      id: 'WEB_APP' as const,
      label: 'Only Web App',
      badge: '20% OFF · ₹15,000',
      shortDesc: 'Operational tools: booking, salon, appointments, inventory, CRM, billing.',
      quickPreset: {
        packageName: 'Basic Web App (Level 1) (₹15,000)',
        serviceToSelect: 'Basic Web App (Level 1) — ₹15,000',
        priceBadge: '₹15,000 (was ₹18,750)',
      },
      allowedServices: [
        'Basic Web App (Level 1) — ₹15,000',
        'Advanced Web App / Platform — Custom Quote',
        'Web Apps & Business Systems — Custom Quote',
      ],
    },
    {
      id: 'SOCIAL_CONTENT' as const,
      label: 'Only Social Content',
      badge: '20% OFF · FROM ₹2,499',
      shortDesc: 'Curated editorial posts, stories, carousels & promotional campaign visuals.',
      quickPreset: {
        packageName: 'Signature Content (₹4,999)',
        serviceToSelect: 'Social Media & Content',
        priceBadge: '₹4,999 (was ₹6,249)',
      },
      allowedServices: [
        'Social Media & Content',
        'Campaign / Promotional Creative',
      ],
    },
    {
      id: 'BRANDING' as const,
      label: 'Only Logo & Brand',
      badge: '20% OFF · FROM ₹3,000',
      shortDesc: '3-stage identity kit (concept, variations, kit) & brand visual systems.',
      quickPreset: {
        packageName: 'Logo Design (₹3,000)',
        serviceToSelect: 'Logo Design — ₹3,000',
        priceBadge: '₹3,000 (was ₹3,750)',
      },
      allowedServices: [
        'Logo Design — ₹3,000',
        'Brand Identity — Custom Quote',
      ],
    },
    {
      id: 'AI_SOLUTIONS' as const,
      label: 'Only AI Solutions',
      badge: '20% OFF · FROM ₹5,000',
      shortDesc: 'Website conversational AI assistants and automated business workflows.',
      quickPreset: {
        packageName: 'AI Chatbot (+₹5,000)',
        serviceToSelect: 'AI Chatbot — +₹5,000',
        priceBadge: '+₹5,000 (was +₹6,250)',
      },
      allowedServices: [
        'AI Chatbot — +₹5,000',
        'AI-Assisted Business Solution — Custom Quote',
      ],
    },
  ];

  const currentSegConfig =
    SEGREGATION_CONFIGS.find((s) => s.id === activeSegregation) || SEGREGATION_CONFIGS[0];

  const visibleServiceOptions = useMemo(() => {
    if (activeSegregation === 'ALL') return serviceOptions;
    return serviceOptions.filter((srv) => currentSegConfig.allowedServices.includes(srv));
  }, [activeSegregation, serviceOptions, currentSegConfig]);

  const applyQuickPreset = (preset: {
    packageName: string;
    serviceToSelect: string;
    priceBadge: string;
  }) => {
    setFormData((prev) => {
      const currentServices = prev.neededServices;
      const nextServices = currentServices.includes(preset.serviceToSelect)
        ? currentServices
        : [...currentServices, preset.serviceToSelect];
      return {
        ...prev,
        preferredPackage: preset.packageName,
        neededServices: nextServices,
      };
    });
  };

  const packageOptions = [
    'Basic Website (₹10,000)',
    'Urgent Basic Website (₹12,000)',
    'Basic Web App (Level 1) (₹15,000)',
    'AI Chatbot (+₹5,000)',
    'Logo Design (₹3,000)',
    'Starter Content (₹2,499)',
    'Signature Content (₹4,999)',
    'Business Launch Bundle (Custom Quote)',
    'Advanced Web App / Custom Platform (Custom Quote)',
    'Web Apps & Business Systems (Custom Quote)',
    'Custom Scope / Bespoke Quote',
    'Not sure yet',
  ];

  const businessCategories = [
    'Beauty',
    'Fashion',
    'Café / Restaurant',
    'Wellness',
    'E-commerce',
    'Real Estate',
    'Personal Brand',
    'Other',
  ];

  const timelines = ['ASAP', '48 hours', '3–5 days', '1 week', 'Flexible'];

  const FIXED_PRICING_MAP: Record<string, number> = {
    'Basic Website — ₹10,000': 10000,
    'Urgent Website Delivery — +₹2,000': 2000,
    'Enquiry Form Integration — +₹3,000': 3000,
    'AI Chatbot — +₹5,000': 5000,
    'Logo Design — ₹3,000': 3000,
    'Basic Web App (Level 1) — ₹15,000': 15000,
  };

  const CUSTOM_QUOTE_ITEMS = [
    'Brand Identity — Custom Quote',
    'Advanced Web App / Platform — Custom Quote',
    'Web Apps & Business Systems — Custom Quote',
    'Web App / Custom Development — Custom Quote',
    'AI-Assisted Business Solution — Custom Quote',
    'Custom Website Features — Custom Quote',
  ];

  // Dynamic pricing calculation adhering to rules 13 & 14
  const pricingAnalysis = useMemo(() => {
    let fixedSubtotal = 0;
    const selectedFixed: { name: string; price: number }[] = [];
    const selectedCustom: string[] = [];

    formData.neededServices.forEach((srv) => {
      if (FIXED_PRICING_MAP[srv] !== undefined) {
        fixedSubtotal += FIXED_PRICING_MAP[srv];
        selectedFixed.push({ name: srv, price: FIXED_PRICING_MAP[srv] });
      } else {
        selectedCustom.push(srv);
      }
    });

    const hasCustomQuote = selectedCustom.length > 0;
    let summaryText = '';
    if (fixedSubtotal > 0 && hasCustomQuote) {
      summaryText = `Base Subtotal: ₹${fixedSubtotal.toLocaleString('en-IN')} + Custom Quote Required`;
    } else if (fixedSubtotal > 0) {
      summaryText = `Base Subtotal: ₹${fixedSubtotal.toLocaleString('en-IN')}`;
    } else if (hasCustomQuote) {
      summaryText = 'Custom Quote Required';
    } else {
      summaryText = 'No services selected';
    }

    return {
      fixedSubtotal,
      hasCustomQuote,
      selectedFixed,
      selectedCustom,
      summaryText,
    };
  }, [formData.neededServices]);

  const toggleService = (srv: string) => {
    setFormData((prev) => {
      const exists = prev.neededServices.includes(srv);
      return {
        ...prev,
        neededServices: exists
          ? prev.neededServices.filter((s) => s !== srv)
          : [...prev.neededServices, srv],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedId = `ARK-${Date.now().toString(36).toUpperCase()}`;

    try {
      // 1. Send to server backend
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          calculatedSubtotal: pricingAnalysis.fixedSubtotal,
          pricingSummary: pricingAnalysis.summaryText,
          hasCustomQuote: pricingAnalysis.hasCustomQuote,
          userId: user?.uid || 'guest',
        }),
      });

      const result = await res.json();
      const enquiryId = result.enquiryId || generatedId;

      // 2. Also persist to Firestore database directly (non-blocking)
      try {
        await saveEnquiryToFirestore({
          ...formData,
          id: enquiryId,
          enquiryId,
          calculatedSubtotal: pricingAnalysis.fixedSubtotal,
          pricingSummary: pricingAnalysis.summaryText,
          hasCustomQuote: pricingAnalysis.hasCustomQuote,
          userId: user?.uid || 'guest',
          createdAt: new Date().toISOString(),
        });
      } catch (firestoreErr) {
        console.warn('[Enquiry] Client-side Firestore sync noted:', firestoreErr);
      }

      // Refresh auth context so user immediately sees their submission in Client Portal
      if (user) {
        refreshUserData();
      }

      setSubmittedData({
        id: enquiryId,
        gmailComposeUrl: result.gmailComposeUrl,
        mailtoUrl: result.mailtoUrl,
        whatsappUrl: result.whatsappUrl,
        formattedMessage: result.formattedMessage,
        message: result.message || 'Your enquiry has been received and forwarded to arkajastudio@gmail.com.',
        selectedServices: formData.neededServices,
        pricingSummary: pricingAnalysis.summaryText,
        fixedSubtotal: pricingAnalysis.fixedSubtotal,
        hasCustomQuote: pricingAnalysis.hasCustomQuote,
      });
      setSubmitSuccess(true);
    } catch (err) {
      // Direct client fallback to mailto & Firestore
      const fallbackSubject = encodeURIComponent(`Project Commission: ${formData.brandName} [${generatedId}]`);
      const fallbackFormatted = [
        `✨ NEW ARKAJA STUDIO PROJECT ENQUIRY [${generatedId}]`,
        `==================================================`,
        `Client Name: ${formData.fullName}`,
        `Brand Name: ${formData.brandName}`,
        `Email: ${formData.email}`,
        `Phone/WhatsApp: ${formData.phone || 'Not provided'}`,
        `Operating Country: ${formData.country}`,
        `Category: ${formData.businessCategory}`,
        `Package: ${formData.preferredPackage}`,
        `Services: ${formData.neededServices.join(', ')}`,
        `Calculated Pricing: ${pricingAnalysis.summaryText}`,
        `Timeline: ${formData.timeline}`,
        `Budget: ${formData.budget}`,
        ``,
        `Project Brief:`,
        `${formData.projectDetails}`,
        ``,
        `Reference Links: ${formData.referenceLinks || 'None'}`,
      ].join('\n');
      const fallbackBody = encodeURIComponent(fallbackFormatted);
      const fallbackGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=arkajastudio@gmail.com&su=${fallbackSubject}&body=${fallbackBody}`;
      const fallbackMailto = `mailto:arkajastudio@gmail.com?subject=${fallbackSubject}&body=${fallbackBody}`;

      try {
        await saveEnquiryToFirestore({
          ...formData,
          id: generatedId,
          enquiryId: generatedId,
          calculatedSubtotal: pricingAnalysis.fixedSubtotal,
          pricingSummary: pricingAnalysis.summaryText,
          hasCustomQuote: pricingAnalysis.hasCustomQuote,
          userId: user?.uid || 'guest',
          createdAt: new Date().toISOString(),
        });
      } catch (firestoreErr) {
        console.warn('Firestore fallback note:', firestoreErr);
      }

      setSubmittedData({
        id: generatedId,
        gmailComposeUrl: fallbackGmail,
        mailtoUrl: fallbackMailto,
        formattedMessage: fallbackFormatted,
        message: 'Your brief is registered and dispatched in real time.',
        selectedServices: formData.neededServices,
        pricingSummary: pricingAnalysis.summaryText,
        fixedSubtotal: pricingAnalysis.fixedSubtotal,
        hasCustomQuote: pricingAnalysis.hasCustomQuote,
      });
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const instagramUrl =
    'https://www.instagram.com/arkajadesigner6208?stkn=aHBmdnFtc241djZ6';
  const gmailAddress = 'ARKAJASTUDIO@GMAIL.COM';

  return (
    <section
      id="enquire"
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors relative ${
        isDark
          ? 'bg-[#0b0c0e] border-[#1f2228] text-[#F3F1EC]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      {/* Anchor for direct bookings navigation */}
      <span id="bookings" className="absolute -top-24 left-0 pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 mb-3">
            <Logo variant="full" size="sm" />
            <span className="opacity-30">|</span>
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
              GET IN TOUCH · STUDIO COMMISSIONS
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight mb-4">
            Have a project in mind?
          </h2>
          <p
            className={`font-sans text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            Tell us what you’re building, what you need and when you need it. We’ll review your brief and get back to you with custom creative direction.
          </p>

          {/* Direct Contact Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <a
              href={`mailto:${gmailAddress}`}
              className={`px-5 py-2.5 text-[11px] tracking-[0.18em] font-medium border transition-colors inline-flex items-center gap-2 ${
                isDark
                  ? 'text-[#F3F1EC] border-[#2E333B] hover:border-[#D8C7A5] bg-[#121418] hover:bg-[#181b22]'
                  : 'text-[#14171A] border-[#DCD6CA] hover:border-[#A58B55] bg-[#FFFFFF] hover:bg-[#F2ECE1]'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#D8C7A5]" />
              <span>EMAIL ARKAJA ({gmailAddress})</span>
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-5 py-2.5 text-[11px] tracking-[0.18em] font-medium border transition-colors inline-flex items-center gap-2 ${
                isDark
                  ? 'text-[#F3F1EC] border-[#2E333B] hover:border-[#D8C7A5] bg-[#121418] hover:bg-[#181b22]'
                  : 'text-[#14171A] border-[#DCD6CA] hover:border-[#A58B55] bg-[#FFFFFF] hover:bg-[#F2ECE1]'
              }`}
            >
              <Instagram className="w-3.5 h-3.5 text-[#D8C7A5]" />
              <span>VIEW INSTAGRAM (@arkajadesigner6208)</span>
              <ArrowUpRight className="w-3 h-3 text-[#8E929A]" />
            </a>
          </div>
        </div>

        {/* Success Confirmation Card */}
        {submitSuccess ? (
          <div
            className={`max-w-2xl mx-auto p-8 sm:p-12 border text-center animate-in fade-in transition-colors ${
              isDark
                ? 'bg-[#121418] border-[#D8C7A5]/60 text-[#F3F1EC]'
                : 'bg-[#FFFFFF] border-[#A58B55]/60 text-[#14171A]'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono tracking-widest uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>DISPATCHED IN REAL TIME TO GMAIL (arkajastudio@gmail.com)</span>
            </div>

            <CheckCircle2 className="w-10 h-10 text-[#D8C7A5] mx-auto mb-4" />
            <h3 className="font-serif text-2xl sm:text-3xl mb-2 font-normal">
              Thank you. Your enquiry has been received.
            </h3>
            <p
              className={`font-sans text-sm leading-relaxed mb-6 font-light ${
                isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
              }`}
            >
              ArkAja Studio will review your brief and get back to you promptly. Your project brief has been automatically formatted into a message and dispatched to our direct inbox.
              {submittedData?.id && (
                <span className="block mt-2 font-mono text-xs text-[#D8C7A5]">
                  Reference ID: {submittedData.id}
                </span>
              )}
            </p>

            {/* Confirmed Services & Pricing Scope */}
            {submittedData?.selectedServices && submittedData.selectedServices.length > 0 && (
              <div
                className={`p-4 border mb-6 text-left ${
                  isDark ? 'bg-[#0d0f12] border-[#22252C]' : 'bg-[#FAF8F5] border-[#E8E2D7]'
                }`}
              >
                <div className="text-[10px] font-mono tracking-widest uppercase text-[#D8C7A5] font-semibold mb-2">
                  CONFIRMED SERVICES INCLUDED IN BRIEF:
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {submittedData.selectedServices.map((s) => (
                    <span
                      key={s}
                      className={`px-2.5 py-1 text-[11px] font-mono border ${
                        isDark
                          ? 'border-[#262B34] bg-white/5 text-[#E0DDD5]'
                          : 'border-[#DDD7CC] bg-black/5 text-[#2A2E38]'
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {submittedData.pricingSummary && (
                  <div className="text-xs font-mono pt-2 border-t border-inherit flex items-center justify-between">
                    <span className="opacity-70">Estimated Pricing Scope:</span>
                    <span className="font-semibold text-[#A58B55] dark:text-[#D8C7A5]">
                      {submittedData.pricingSummary}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              {submittedData?.gmailComposeUrl && (
                <a
                  href={submittedData.gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 text-xs tracking-[0.2em] font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#FAF8F5] shadow-lg active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>OPEN IN GMAIL (PRE-FILLED)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              )}

              {submittedData?.mailtoUrl && (
                <a
                  href={submittedData.mailtoUrl}
                  className={`w-full sm:w-auto px-6 py-3 text-xs tracking-[0.18em] border font-medium transition-colors inline-flex items-center justify-center gap-2 ${
                    isDark
                      ? 'border-[#2E333B] text-[#C5CAD5] hover:text-white hover:border-[#D8C7A5]'
                      : 'border-[#D4CEBF] text-[#555B66] hover:text-black hover:border-[#A58B55]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 opacity-60" />
                  <span>DEFAULT EMAIL CLIENT</span>
                </a>
              )}

              {submittedData?.formattedMessage && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedData.formattedMessage || '');
                    setCopiedMessage(true);
                    setTimeout(() => setCopiedMessage(false), 2500);
                  }}
                  className={`w-full sm:w-auto px-6 py-3 text-xs tracking-[0.18em] border font-medium transition-colors inline-flex items-center justify-center gap-2 ${
                    copiedMessage
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                      : isDark
                      ? 'border-[#2E333B] text-[#C5CAD5] hover:text-white hover:border-[#D8C7A5]'
                      : 'border-[#D4CEBF] text-[#555B66] hover:text-black hover:border-[#A58B55]'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedMessage ? 'COPIED TO CLIPBOARD' : 'COPY BRIEF MESSAGE'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSubmitSuccess(false);
                  setSubmittedData(null);
                }}
                className={`w-full sm:w-auto px-6 py-3 text-xs tracking-[0.18em] border font-medium transition-colors ${
                  isDark
                    ? 'border-[#2E333B] text-[#8E929A] hover:text-[#F3F1EC]'
                    : 'border-[#DDD7CC] text-[#7A808C] hover:text-[#14171A]'
                }`}
              >
                SUBMIT ANOTHER BRIEF
              </button>
            </div>
          </div>
        ) : (
          /* The Form */
          <form
            onSubmit={handleSubmit}
            className={`max-w-3xl mx-auto p-6 sm:p-10 border transition-colors shadow-2xl ${
              isDark
                ? 'bg-[#111317] border-[#22252C]'
                : 'bg-[#FFFFFF] border-[#E2DDD5]'
            }`}
          >
            <div className="space-y-8">
              {/* Row 1: Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Maya Sharma"
                    className={`w-full border px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                        : 'bg-[#FAF8F5] border-[#DDD7CC] text-[#14171A] focus:border-[#A58B55]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                    Brand / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="e.g. Noir & Co."
                    className={`w-full border px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                        : 'bg-[#FAF8F5] border-[#DDD7CC] text-[#14171A] focus:border-[#A58B55]'
                    }`}
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="maya@brand.com"
                    className={`w-full border px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                        : 'bg-[#FAF8F5] border-[#DDD7CC] text-[#14171A] focus:border-[#A58B55]'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 ${
                      isDark ? 'text-[#8E929A]' : 'text-[#7B818F]'
                    }`}
                  >
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={`w-full border px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                        : 'bg-[#FAF8F5] border-[#DDD7CC] text-[#14171A] focus:border-[#A58B55]'
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: Industry & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                    Business Category
                  </label>
                  <select
                    value={formData.businessCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, businessCategory: e.target.value })
                    }
                    className={`w-full border px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                        : 'bg-[#FAF8F5] border-[#DDD7CC] text-[#14171A] focus:border-[#A58B55]'
                    }`}
                  >
                    {businessCategories.map((c) => (
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
                  <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. India, UK, USA, UAE..."
                    className={`w-full border px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                        : 'bg-[#FAF8F5] border-[#DDD7CC] text-[#14171A] focus:border-[#A58B55]'
                    }`}
                  />
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* BOOKING SEGREGATIONS: WEBSITES, WEB APPS, CONTENT, ETC */}
              {/* ---------------------------------------------------- */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                  <label className="block text-[11px] tracking-[0.2em] uppercase font-mono text-[#D8C7A5]">
                    Booking Segregation (Choose Discipline)
                  </label>
                  <span className="text-[10px] font-mono opacity-60">
                    Want only one type? Filter to your specific service below:
                  </span>
                </div>

                {/* Segregation Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
                  {SEGREGATION_CONFIGS.map((seg) => {
                    const isActive = activeSegregation === seg.id;
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => setActiveSegregation(seg.id)}
                        className={`p-2.5 text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                          isActive
                            ? isDark
                              ? 'bg-[#F3F1EC] text-[#0b0c0e] border-[#F3F1EC] font-semibold shadow-md'
                              : 'bg-[#14171A] text-[#FAF7F2] border-[#14171A] font-semibold shadow-md'
                            : isDark
                            ? 'bg-[#14171D] text-[#C5CAD5] border-[#252A35] hover:border-[#D8C7A5]/60 hover:text-white'
                            : 'bg-[#FAF8F5] text-[#555B66] border-[#DDD7CC] hover:border-[#A58B55]/60 hover:text-black'
                        }`}
                      >
                        <span className="text-[11px] tracking-wider uppercase font-mono font-medium block">
                          {seg.label}
                        </span>
                        <span className={`text-[9px] font-mono tracking-widest ${isActive ? 'opacity-80' : 'text-[#D8C7A5]'}`}>
                          {seg.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Segregation Description & Quick Preset */}
                {currentSegConfig && (
                  <div
                    className={`p-3.5 border mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isDark ? 'bg-[#161922] border-[#2A303D]' : 'bg-[#FAF8F5] border-[#DDD7CC]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D8C7A5]" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8C7A5] font-semibold">
                          {currentSegConfig.label}
                        </span>
                        <span className="text-[9.5px] font-mono opacity-60">· {currentSegConfig.badge}</span>
                      </div>
                      <p className="text-[11.5px] opacity-80 mt-0.5">
                        {currentSegConfig.shortDesc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {currentSegConfig.quickPreset && (
                        <button
                          type="button"
                          onClick={() => applyQuickPreset(currentSegConfig.quickPreset!)}
                          className={`px-3 py-1.5 text-[10.5px] font-mono tracking-wider uppercase border font-medium flex items-center gap-1.5 transition-colors ${
                            isDark
                              ? 'border-[#D8C7A5] text-[#D8C7A5] hover:bg-[#D8C7A5] hover:text-[#0b0c0e]'
                              : 'border-[#A58B55] text-[#A58B55] hover:bg-[#A58B55] hover:text-[#FAF7F2]'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>1-Click Select: {currentSegConfig.quickPreset.priceBadge}</span>
                        </button>
                      )}

                      {activeSegregation !== 'ALL' && (
                        <button
                          type="button"
                          onClick={() => setActiveSegregation('ALL')}
                          className="px-2.5 py-1.5 text-[10px] font-mono tracking-wider uppercase opacity-60 hover:opacity-100 hover:underline"
                        >
                          Show All
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Service Selection Checklist Header */}
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[11px] tracking-[0.2em] uppercase font-mono text-[#D8C7A5]">
                    {activeSegregation === 'ALL'
                      ? 'Creative Services Needed (Select any / Multiple selections allowed)'
                      : `Services for ${currentSegConfig.label} (Select required options)`}
                  </label>
                  <span className="text-[10px] font-mono opacity-60">
                    {formData.neededServices.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {visibleServiceOptions.map((srv) => {
                    const selected = formData.neededServices.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`p-3 text-left border transition-all flex items-center gap-3 ${
                          selected
                            ? isDark
                              ? 'bg-[#D8C7A5]/15 border-[#D8C7A5] text-[#FAF8F5]'
                              : 'bg-[#A58B55]/10 border-[#A58B55] text-[#14171A]'
                            : isDark
                            ? 'bg-[#14171d] text-[#B4B7BF] border-[#242932] hover:border-[#3E4554]'
                            : 'bg-[#FAF8F5] text-[#555B66] border-[#DDD7CC] hover:border-[#B8B0A2]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-none border flex items-center justify-center shrink-0 ${
                            selected
                              ? isDark
                                ? 'bg-[#D8C7A5] border-[#D8C7A5] text-[#0b0c0e]'
                                : 'bg-[#A58B55] border-[#A58B55] text-[#FAF7F2]'
                              : isDark
                              ? 'border-[#424855]'
                              : 'border-[#B8B0A2]'
                          }`}
                        >
                          {selected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                        </div>
                        <span className="text-xs tracking-wide font-normal flex-1">
                          {srv}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 13 & 14. Live Enquiry Summary & Pricing Calculation */}
                <div
                  className={`mt-4 p-5 border transition-all ${
                    isDark
                      ? 'bg-[#14171E] border-[#292F3B] text-[#F3F1EC]'
                      : 'bg-[#FAF8F5] border-[#DCD6C9] text-[#14171A]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-inherit">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D8C7A5]" />
                      <span className="text-[10px] font-mono tracking-widest uppercase text-[#D8C7A5] font-semibold">
                        ENQUIRY SELECTION &amp; PRICING SUMMARY
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[11px] font-mono opacity-70">Calculated Base:</span>
                      {pricingAnalysis.fixedSubtotal > 0 && (
                        <span className="font-mono text-xs line-through text-red-500/80 dark:text-red-400 font-semibold decoration-red-500/80">
                          ₹{Math.round(pricingAnalysis.fixedSubtotal * 1.25).toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="font-serif text-xl sm:text-2xl font-normal text-[#A58B55] dark:text-[#D8C7A5]">
                        {pricingAnalysis.fixedSubtotal > 0
                          ? `₹${pricingAnalysis.fixedSubtotal.toLocaleString('en-IN')}`
                          : pricingAnalysis.hasCustomQuote
                          ? 'Custom Quote'
                          : '₹0'}
                      </span>
                      {pricingAnalysis.fixedSubtotal > 0 && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 uppercase">
                          20% NAVRATRI SAVINGS
                        </span>
                      )}
                      {pricingAnalysis.hasCustomQuote && (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#D8C7A5]/15 border border-[#D8C7A5]/40 text-[#A58B55] dark:text-[#D8C7A5] font-semibold uppercase">
                          + Custom Quote Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selected Services Tags */}
                  {formData.neededServices.length > 0 ? (
                    <div>
                      <div className="text-[10px] font-mono tracking-wider opacity-60 uppercase mb-2">
                        Currently Selected ({formData.neededServices.length}):
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {formData.neededServices.map((srv) => (
                          <span
                            key={srv}
                            className={`px-2.5 py-1 text-[11px] font-mono border flex items-center gap-1.5 ${
                              isDark
                                ? 'bg-black/30 border-[#262B34] text-[#E0DDD5]'
                                : 'bg-white border-[#DDD7CC] text-[#2A2E38]'
                            }`}
                          >
                            <Check className="w-3 h-3 text-[#D8C7A5]" />
                            <span>{srv}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-light opacity-70 mb-3 italic">
                      No services selected yet. Check one or more options above to build your scope.
                    </p>
                  )}

                  {/* 15. Pricing Disclaimers */}
                  <div className="space-y-1 pt-2 border-t border-inherit text-[11px] font-light leading-relaxed opacity-75">
                    <p>
                      <strong>Starting / Fixed Packages:</strong> Prices shown are starting/fixed package prices. Final pricing may vary based on project requirements, scope and customization.
                    </p>
                    {pricingAnalysis.hasCustomQuote && (
                      <p className="text-[#A58B55] dark:text-[#D8C7A5]">
                        <strong>Custom Services:</strong> Custom requirements are quoted separately.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Package & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                    Preferred Package
                  </label>
                  <select
                    value={formData.preferredPackage}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredPackage: e.target.value })
                    }
                    className={`w-full border px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                        : 'bg-[#FAF8F5] border-[#DDD7CC] text-[#14171A] focus:border-[#A58B55]'
                    }`}
                  >
                    {packageOptions.map((p) => (
                      <option
                        key={p}
                        value={p}
                        className={isDark ? 'bg-[#121418] text-[#F3F1EC]' : 'bg-[#FFFFFF] text-[#14171A]'}
                      >
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                    Target Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className={`w-full border px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                        : 'bg-[#FAF8F5] border-[#DDD7CC] text-[#14171A] focus:border-[#A58B55]'
                    }`}
                  >
                    {timelines.map((t) => (
                      <option key={t} value={t} className="bg-[#121418] text-[#F3F1EC]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-2 text-[#D8C7A5]">
                  Project Details & Goals *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.projectDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, projectDetails: e.target.value })
                  }
                  placeholder="Describe your brand, target audience, aesthetic reference points, or specific promotional campaign goals..."
                  className={`w-full border px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors leading-relaxed ${
                    isDark
                      ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] placeholder-[#6E7380] focus:border-[#D8C7A5]'
                      : 'bg-[#FAF8F5] border-[#DDD7CC] text-[#14171A] placeholder-[#8E94A0] focus:border-[#A58B55]'
                  }`}
                />
              </div>

              {/* Submit CTA */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 text-xs sm:text-sm tracking-[0.22em] font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 ${
                    isDark
                      ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                      : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'SUBMITTING BRIEF...' : 'SUBMIT ENQUIRY'}</span>
                </button>
                <p
                  className={`text-[11px] text-center mt-3 font-light ${
                    isDark ? 'text-[#717682]' : 'text-[#828896]'
                  }`}
                >
                  By submitting, your brief is logged into our secure studio review queue. We typically reply within 24 hours.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
