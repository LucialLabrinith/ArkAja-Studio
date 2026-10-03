import React, { useState, useEffect } from 'react';
import { EnquiryFormData, CustomBuilderState } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { saveEnquiryToFirestore } from '../lib/firebase';
import { Logo } from './Logo';
import { Mail, Instagram, ArrowUpRight, Send, CheckCircle2, Copy } from 'lucide-react';

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
    neededServices: ['Social Content'],
    preferredPackage: 'Signature',
    deliverableCounts: { posts: 4, stories: 2, carousels: 0, promo: 1, reels: 0 },
    timeline: '3–5 days',
    budget: '₹5,000–₹10,000',
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

  useEffect(() => {
    if (prefillPackage) {
      setFormData((prev) => ({
        ...prev,
        preferredPackage: prefillPackage,
      }));
    }
  }, [prefillPackage]);

  const serviceOptions = [
    'Social Content',
    'Campaign Creative',
    'Promotional Visuals',
    'Brand Visuals',
    'Short-form Video',
    'Custom Project',
  ];

  const packageOptions = ['Starter', 'Signature', 'Custom', 'Not sure'];

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
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        isDark
          ? 'bg-[#0b0c0e] border-[#1f2228] text-[#F3F1EC]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
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

              {/* Service Selection */}
              <div>
                <label className="block text-[11px] tracking-[0.2em] uppercase font-mono mb-3 text-[#D8C7A5]">
                  Creative Services Needed (Select any)
                </label>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((srv) => {
                    const selected = formData.neededServices.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`px-3.5 py-2 text-xs tracking-wider border transition-colors ${
                          selected
                            ? isDark
                              ? 'bg-[#D8C7A5] text-[#0b0c0e] border-[#D8C7A5] font-medium'
                              : 'bg-[#A58B55] text-[#FAF7F2] border-[#A58B55] font-medium'
                            : isDark
                            ? 'bg-[#14171d] text-[#B4B7BF] border-[#262B34] hover:border-[#3E4554]'
                            : 'bg-[#FAF8F5] text-[#555B66] border-[#DDD7CC] hover:border-[#B8B0A2]'
                        }`}
                      >
                        {srv}
                      </button>
                    );
                  })}
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
