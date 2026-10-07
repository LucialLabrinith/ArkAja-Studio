import React, { useState } from 'react';
import { STUDIO_SERVICES, CUSTOM_VIDEO_SERVICE } from '../data/servicesData';
import { BUSINESS_LAUNCH_PACKAGE } from '../data/pricingData';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { ArrowUpRight, ArrowRight, Sparkles, Check, Layers, Code, Bot, Palette, Globe, Rocket } from 'lucide-react';

interface ServicesSectionProps {
  onOpenBuilder: () => void;
  onSelectServiceForEnquiry?: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenBuilder,
  onSelectServiceForEnquiry,
}) => {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'WEBSITES' | 'BRANDING' | 'CONTENT' | 'DEVELOPMENT' | 'AI'>('ALL');

  const categories = [
    { id: 'ALL', label: 'ALL SERVICES' },
    { id: 'WEBSITES', label: 'WEBSITES' },
    { id: 'DEVELOPMENT', label: 'WEB APPS & DEV' },
    { id: 'BRANDING', label: 'LOGO & BRANDING' },
    { id: 'CONTENT', label: 'CONTENT & CAMPAIGNS' },
    { id: 'AI', label: 'AI SOLUTIONS' },
  ];

  const filteredServices =
    activeCategory === 'ALL'
      ? STUDIO_SERVICES
      : STUDIO_SERVICES.filter((s) => s.category === activeCategory);

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'websites':
        return <Globe className="w-4 h-4 text-[#D8C7A5]" />;
      case 'web-apps':
        return <Code className="w-4 h-4 text-[#D8C7A5]" />;
      case 'logo-design':
      case 'brand-identity':
        return <Palette className="w-4 h-4 text-[#D8C7A5]" />;
      case 'ai-chatbot':
      case 'ai-business-solutions':
        return <Bot className="w-4 h-4 text-[#D8C7A5]" />;
      default:
        return <Layers className="w-4 h-4 text-[#D8C7A5]" />;
    }
  };

  const handleCardCta = (service: (typeof STUDIO_SERVICES)[0]) => {
    if (onSelectServiceForEnquiry) {
      onSelectServiceForEnquiry(service.title);
    } else {
      onOpenBuilder();
    }
  };

  return (
    <section
      id="services"
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        isDark
          ? 'bg-[#0d0f12] border-[#1f2228] text-[#F3F1EC]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Logo variant="full" size="sm" />
              <span className="opacity-30">|</span>
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
                WHAT WE DELIVER · 8 CORE DISCIPLINES
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight">
              Design, Development &amp; AI Solutions
            </h2>
          </div>
          <p
            className={`font-sans text-sm sm:text-base font-light max-w-md ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            From high-conversion websites and custom web apps to distinctive brand identities and AI chatbots. AI-accelerated workflows steered by senior human art direction.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-10 border-b border-inherit">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 text-[10.5px] tracking-[0.18em] uppercase font-mono transition-all whitespace-nowrap border ${
                activeCategory === cat.id
                  ? isDark
                    ? 'bg-[#F3F1EC] text-[#0b0c0e] border-[#F3F1EC] font-semibold shadow-sm'
                    : 'bg-[#14171A] text-[#FAF7F2] border-[#14171A] font-semibold shadow-sm'
                  : isDark
                  ? 'border-[#262A33] text-[#8E929A] hover:text-[#FAF8F5] hover:border-[#D8C7A5]/50'
                  : 'border-[#E0D9CE] text-[#555B66] hover:text-[#14171A] hover:border-[#A58B55]/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 8 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-14">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              className={`p-8 sm:p-10 border transition-all duration-300 flex flex-col justify-between group ${
                isDark
                  ? 'bg-[#121418] border-[#24272D] hover:border-[#D8C7A5]/60'
                  : 'bg-[#FFFFFF] border-[#E2DDD5] hover:border-[#A58B55]/60 shadow-sm'
              }`}
            >
              <div>
                {/* Card Top Meta */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-inherit">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(service.id)}
                    <span className="text-[10px] tracking-[0.25em] uppercase font-mono opacity-60">
                      {service.category || 'CORE SERVICE'}
                    </span>
                  </div>
                  {service.priceText && (
                    <span className="text-[11px] font-mono tracking-wider px-2.5 py-0.5 border border-[#D8C7A5]/40 text-[#A58B55] dark:text-[#D8C7A5] font-semibold">
                      {service.priceText}
                    </span>
                  )}
                </div>

                {/* Service Name */}
                <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mb-3 group-hover:text-[#D8C7A5] transition-colors">
                  {service.title}
                </h3>

                {/* Short Description */}
                <p
                  className={`font-sans text-sm sm:text-base font-light leading-relaxed mb-6 ${
                    isDark ? 'text-[#B4B7BF]' : 'text-[#555B66]'
                  }`}
                >
                  {service.description}
                </p>
              </div>

              {/* What's Included & CTA */}
              <div>
                <span className="text-[10px] tracking-[0.22em] uppercase font-medium block mb-3 opacity-70 font-mono">
                  WHAT&apos;S INCLUDED:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] tracking-wide font-light opacity-90 mb-8">
                  {service.includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#D8C7A5] shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>

                {/* Card CTA */}
                <button
                  type="button"
                  onClick={() => handleCardCta(service)}
                  className={`w-full py-3 px-4 text-[11px] tracking-[0.2em] font-medium uppercase font-mono transition-all flex items-center justify-center gap-2 active:scale-98 border ${
                    isDark
                      ? 'border-[#2E333D] text-[#FAF8F5] hover:border-[#D8C7A5] hover:bg-[#181B22]'
                      : 'border-[#DDD7CD] text-[#14171A] hover:border-[#A58B55] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>{service.ctaText || 'START A PROJECT'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D8C7A5] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================================================================= */}
        {/* THE ARKAJA DISTINCTION: WEBSITE VS. WEB APPS & BUSINESS SYSTEMS   */}
        {/* ================================================================= */}
        <div
          className={`p-8 sm:p-12 border mb-10 transition-all ${
            isDark ? 'bg-[#12151B] border-[#2A2F3A]' : 'bg-[#FFFFFF] border-[#DDD7CD] shadow-sm'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 mb-8 border-b border-inherit">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#A58B55] dark:text-[#D8C7A5] mb-2 font-semibold">
                <Code className="w-3.5 h-3.5" />
                <span>ARCHITECTURAL DISTINCTION · WEB APPS &amp; BUSINESS SYSTEMS</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight mb-2">
                Website vs. Web App: How We Build For Your Operations
              </h3>
              <p
                className={`font-sans text-xs sm:text-sm font-light max-w-2xl leading-relaxed ${
                  isDark ? 'text-[#A0A5B2]' : 'text-[#5C6270]'
                }`}
              >
                A website tells the world who you are. A web app actually <strong>does something</strong> for your business—automating bookings, orders, inventory, billing, or entire management workflows.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="px-4 py-2.5 border border-inherit text-xs font-mono">
                <span className="text-[10px] opacity-60 block uppercase">BASIC WEBSITE</span>
                <div className="flex items-center gap-1.5 my-0.5">
                  <span className="line-through text-[11px] text-red-500/80 font-mono">₹12,500</span>
                  <span className="font-semibold text-[#A58B55] dark:text-[#D8C7A5]">₹10,000</span>
                  <span className="text-[9px] text-amber-500 font-bold">20% OFF</span>
                </div>
                <span className="opacity-70 text-[10.5px] block">&quot;Here is my business.&quot;</span>
              </div>
              <div className="px-4 py-2.5 border border-[#D8C7A5]/60 bg-[#D8C7A5]/10 text-xs font-mono">
                <span className="text-[10px] opacity-60 block uppercase">BASIC WEB APP (L1)</span>
                <div className="flex items-center gap-1.5 my-0.5">
                  <span className="line-through text-[11px] text-red-500/80 font-mono">₹18,750</span>
                  <span className="font-semibold text-[#A58B55] dark:text-[#D8C7A5]">₹15,000</span>
                  <span className="text-[9px] text-amber-500 font-bold">20% OFF</span>
                </div>
                <span className="opacity-70 text-[10.5px] block">&quot;Single workflow system.&quot;</span>
              </div>
              <div className="px-4 py-2.5 border border-inherit text-xs font-mono">
                <span className="text-[10px] opacity-60 block uppercase">ADVANCED / PLATFORM</span>
                <span className="font-semibold text-[#A58B55] dark:text-[#D8C7A5] block my-0.5">Custom Quote</span>
                <span className="opacity-70 text-[10.5px] block">&quot;Multi-role &amp; enterprise.&quot;</span>
              </div>
            </div>
          </div>

          {/* Examples Cloud */}
          <div className="mb-8">
            <span className="text-[10.5px] font-mono tracking-widest uppercase text-[#A58B55] dark:text-[#D8C7A5] block mb-3 font-semibold">
              CUSTOM DIGITAL TOOLS DESIGNED AROUND THE WAY YOUR BUSINESS ACTUALLY WORKS:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {[
                'Booking',
                'Inventory',
                'CRM',
                'Dashboards',
                'Customer Portals',
                'Management Systems',
                'AI Tools',
                'Custom Workflows',
                'Appointment Scheduling',
                'Order Requests',
                'Billing & Invoicing',
              ].map((item) => (
                <span
                  key={item}
                  className={`px-3 py-1.5 border text-[11px] ${
                    isDark ? 'bg-[#181C24] border-[#2A2F3A] text-[#F3F1EC]' : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A]'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* 3 Practical Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Level 1 */}
            <div
              className={`p-6 border flex flex-col justify-between ${
                isDark ? 'bg-[#151922] border-[#262B36]' : 'bg-[#FAF8F5] border-[#E2DDD5]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-wider">
                    🟢 LEVEL 1 · BASIC WEB APP
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span className="line-through text-red-400/80">₹18,750</span>
                    <span className="font-semibold text-[#A58B55] dark:text-[#D8C7A5]">
                      ₹15,000
                    </span>
                    <span className="text-[8px] font-bold text-amber-500">20% OFF</span>
                  </div>
                </div>
                <h4 className="font-serif text-lg font-normal mb-2">
                  Streamlined Business Workflows
                </h4>
                <p className="text-xs font-light leading-relaxed mb-4 opacity-80">
                  Straightforward database and workflow designed for single-team or customer booking/ordering.
                </p>
                <ul className="space-y-1.5 text-[11px] font-mono opacity-85">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>User inputs, forms &amp; structured database</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Add, edit, delete &amp; search records</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Status tracking &amp; admin dashboard</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Examples: Salon Booking, Doctor Appointment, Mini Inventory, Billing App</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Level 2 */}
            <div
              className={`p-6 border flex flex-col justify-between ${
                isDark ? 'bg-[#151922] border-[#262B36]' : 'bg-[#FAF8F5] border-[#E2DDD5]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold text-amber-400 tracking-wider">
                    🟡 LEVEL 2 · ADVANCED WEB APP
                  </span>
                  <span className="text-[10px] font-mono opacity-60">CUSTOM QUOTE</span>
                </div>
                <h4 className="font-serif text-lg font-normal mb-2">
                  Multi-Role Operational Systems
                </h4>
                <p className="text-xs font-light leading-relaxed mb-4 opacity-80">
                  Multiple account levels, automated communications, and payment-enabled operational processing.
                </p>
                <ul className="space-y-1.5 text-[11px] font-mono opacity-85">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>Customer, Staff &amp; Director account roles</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>Razorpay / Stripe payment gateway flow</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>Automated email &amp; WhatsApp notifications</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>Advanced analytics, PDF invoices &amp; API hooks</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Level 3 */}
            <div
              className={`p-6 border flex flex-col justify-between ${
                isDark ? 'bg-[#151922] border-[#262B36]' : 'bg-[#FAF8F5] border-[#E2DDD5]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold text-rose-400 tracking-wider">
                    🔴 LEVEL 3 · CUSTOM PLATFORM
                  </span>
                  <span className="text-[10px] font-mono opacity-60">CUSTOM QUOTE</span>
                </div>
                <h4 className="font-serif text-lg font-normal mb-2">
                  Enterprise &amp; Specialized Solutions
                </h4>
                <p className="text-xs font-light leading-relaxed mb-4 opacity-80">
                  Comprehensive custom platforms engineered around specialized domain workflows.
                </p>
                <ul className="space-y-1.5 text-[11px] font-mono opacity-85">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                    <span>Hospital / Healthcare clinic management</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                    <span>Scholarship &amp; educational administration</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                    <span>Parental monitoring &amp; email security systems</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                    <span>Multi-tenant SaaS, AI platforms &amp; real-time sync</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-inherit">
            <p className="text-xs font-light opacity-80 max-w-2xl">
              <strong>Transparent Scoping:</strong> A basic web app costs <strong>₹15,000</strong>. Anything aside from that (multiple user roles, payment systems, complex enterprise architectures like hospital management or multi-tenant platforms) is quoted custom based on requirements.
            </p>
            <button
              onClick={() => onSelectServiceForEnquiry ? onSelectServiceForEnquiry('Web Apps & Business Systems') : onOpenBuilder()}
              className="px-6 py-2.5 text-[11px] font-mono tracking-widest uppercase bg-[#D8C7A5] text-[#0b0c0e] hover:bg-white transition-colors font-medium shrink-0"
            >
              DISCUSS WEB APP BRIEF →
            </button>
          </div>
        </div>
        <div
          className={`p-8 sm:p-10 border mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 transition-all ${
            isDark
              ? 'bg-[#151820] border-[#D8C7A5]/50 shadow-2xl'
              : 'bg-[#FFFFFF] border-[#A58B55]/50 shadow-md ring-1 ring-[#A58B55]/20'
          }`}
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D8C7A5]/15 border border-[#D8C7A5]/40 text-[#A58B55] dark:text-[#D8C7A5] text-[10px] font-mono tracking-widest uppercase mb-3">
              <Rocket className="w-3.5 h-3.5" />
              <span>COMPREHENSIVE BUNDLE · REQUEST A CUSTOM QUOTE</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal mb-2">
              {BUSINESS_LAUNCH_PACKAGE.name}
            </h3>
            <p
              className={`font-sans text-sm sm:text-base font-light leading-relaxed mb-4 ${
                isDark ? 'text-[#C5CAD5]' : 'text-[#4A505C]'
              }`}
            >
              {BUSINESS_LAUNCH_PACKAGE.subtitle}
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono opacity-80">
              <span className="px-2.5 py-1 bg-black/10 dark:bg-white/5 border border-inherit">Logo Design</span>
              <span className="px-2.5 py-1 bg-black/10 dark:bg-white/5 border border-inherit">Brand Identity</span>
              <span className="px-2.5 py-1 bg-black/10 dark:bg-white/5 border border-inherit">Website</span>
              <span className="px-2.5 py-1 bg-black/10 dark:bg-white/5 border border-inherit">Enquiry Integration</span>
              <span className="px-2.5 py-1 bg-black/10 dark:bg-white/5 border border-inherit">AI Chatbot</span>
              <span className="px-2.5 py-1 bg-black/10 dark:bg-white/5 border border-inherit">Social Media Creative</span>
              <span className="px-2.5 py-1 bg-black/10 dark:bg-white/5 border border-inherit">Custom Web App</span>
            </div>
          </div>

          <button
            onClick={onOpenBuilder}
            className={`px-8 py-4 text-[11.5px] tracking-[0.22em] font-semibold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 shadow-lg ${
              isDark
                ? 'bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#FAF8F5]'
                : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
            }`}
          >
            <span>REQUEST A CUSTOM QUOTE</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Video / Motion Note */}
        <div
          className={`p-6 sm:p-8 border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors ${
            isDark ? 'bg-[#121418] border-[#24272D]' : 'bg-[#F2ECE1] border-[#DDD7CC]'
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 text-[9.5px] font-mono tracking-widest text-[#D8C7A5] uppercase mb-1">
              <span>SPECIALIZED SERVICE</span>
              <span>·</span>
              <span>KINETIC MOTION</span>
            </div>
            <h4 className="font-serif text-xl sm:text-2xl font-normal mb-1">
              {CUSTOM_VIDEO_SERVICE.title}
            </h4>
            <p
              className={`font-sans text-xs sm:text-sm font-light leading-relaxed max-w-xl ${
                isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
              }`}
            >
              {CUSTOM_VIDEO_SERVICE.description}
            </p>
          </div>

          <button
            onClick={onOpenBuilder}
            className={`px-6 py-2.5 text-[10.5px] tracking-[0.2em] font-medium uppercase font-mono transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 border ${
              isDark
                ? 'border-[#2E333B] text-[#FAF8F5] hover:border-[#D8C7A5]'
                : 'border-[#DDD7CD] text-[#14171A] hover:border-[#A58B55]'
            }`}
          >
            <span>CUSTOMISE YOUR BRIEF</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
