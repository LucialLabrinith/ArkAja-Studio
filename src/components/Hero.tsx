import React from 'react';
import { ArrowDown, ArrowUpRight, Sparkles, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeroProps {
  onExploreWork: () => void;
  onStartProject: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreWork, onStartProject }) => {
  const { isDark, isCombo } = useTheme();

  return (
    <section
      className={`relative pt-32 pb-16 lg:pt-36 lg:pb-24 px-4 sm:px-6 lg:px-8 border-b transition-colors overflow-hidden ${
        isDark
          ? 'bg-[#0b0c0e] border-[#1f2228] text-[#F3F1EC]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      {/* Subtle Atmospheric Lighting Accent */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] blur-[140px] pointer-events-none rounded-full ${
          isDark ? 'bg-[#D8C7A5]/10' : 'bg-[#D8C7A5]/25'
        }`}
        aria-hidden="true"
      />

      {/* Editorial Brand Watermark: Mono Logo / Geometric AA Monogram as Background Design */}
      <div
        className="absolute -right-8 sm:right-6 lg:right-[8%] top-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] lg:w-[680px] h-[340px] sm:h-[520px] lg:h-[680px] pointer-events-none select-none z-0 flex items-center justify-center overflow-visible"
        aria-hidden="true"
      >
        {/* Soft Golden Watermark Radiant Glow */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-700 ${
            isDark ? 'bg-[#D8C7A5]/[0.03]' : 'bg-[#D8C7A5]/20'
          }`}
        />

        {/* Geometric Atelier Compass Orbit Watermark Rings */}
        <div
          className={`absolute w-[98%] h-[98%] rounded-full border transition-colors duration-500 ${
            isDark ? 'border-[#D8C7A5]/[0.08]' : 'border-[#A58B55]/15'
          }`}
        />
        <div
          className={`absolute w-[82%] h-[82%] rounded-full border border-dashed transition-colors duration-500 ${
            isDark ? 'border-[#D8C7A5]/[0.10]' : 'border-[#A58B55]/20'
          }`}
        />

        {/* Subtle Luxury Atelier Coordinate Marks */}
        <div
          className={`absolute top-3 text-[9px] font-mono tracking-[0.45em] uppercase transition-colors duration-500 ${
            isDark ? 'text-[#D8C7A5]/30' : 'text-[#A58B55]/45'
          }`}
        >
          ARKAJA ATELIER · ARCHIVE
        </div>
        <div
          className={`absolute bottom-3 text-[9px] font-mono tracking-[0.45em] uppercase transition-colors duration-500 ${
            isDark ? 'text-[#D8C7A5]/30' : 'text-[#A58B55]/45'
          }`}
        >
          MUMBAI · PARIS · LONDON
        </div>

        {/* The Mono Logo as Watermark */}
        <img
          src="/arkaja-monogram.svg"
          alt=""
          className={`w-[78%] h-[78%] object-contain transition-all duration-700 ${
            isDark
              ? 'opacity-[0.07] brightness-125 filter drop-shadow'
              : 'opacity-[0.11] brightness-95 contrast-125 filter drop-shadow-sm'
          }`}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Combo Hero Grid: Editorial Statement on Left + Luxury Studio Dossier Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Main Editorial Headline & Value */}
          <div className="lg:col-span-7 text-left">
            {/* Studio Eyebrow */}
            <div className="inline-flex items-center gap-3 mb-2">
              <span className="w-6 h-[1.5px] bg-[#D8C7A5]" />
              <span className="text-[11px] sm:text-[12px] tracking-[0.32em] font-semibold text-[#A58B55] dark:text-[#D8C7A5] uppercase font-mono">
                ARKAJA STUDIO
              </span>
              <span className="w-6 h-[1.5px] bg-[#D8C7A5]" />
            </div>

            {/* Specialty Tagline */}
            <div className="text-xs sm:text-[13px] font-mono tracking-widest uppercase font-medium text-[#A58B55] dark:text-[#D8C7A5] mb-6">
              Graphic Designer | Web Developer | App Developer
            </div>

            {/* Main Headline */}
            <h1
              className={`font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] mb-6 text-balance ${
                isDark ? 'text-[#FAF8F5]' : 'text-[#14171A]'
              }`}
            >
              Creative content for brands with something to say.
            </h1>

            {/* Subtitle */}
            <p
              className={`font-sans text-base sm:text-lg md:text-xl font-light tracking-wide mb-6 leading-relaxed max-w-2xl ${
                isDark ? 'text-[#B4B7BF]' : 'text-[#4A505C]'
              }`}
            >
              AI-assisted creative production. Human-led art direction.
            </p>

            {/* Core Deliverable Badges */}
            <div
              className={`inline-flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-[12px] tracking-[0.2em] uppercase font-medium mb-10 pb-4 border-b ${
                isDark
                  ? 'text-[#8E929A] border-[#20242B]'
                  : 'text-[#646A77] border-[#E8E2D7]'
              }`}
            >
              <span className="text-[#14171A] dark:text-[#FAF8F5] font-semibold">Social Content</span>
              <span className="text-[#D8C7A5]">•</span>
              <span className="text-[#14171A] dark:text-[#FAF8F5] font-semibold">Campaigns</span>
              <span className="text-[#D8C7A5]">•</span>
              <span className="text-[#14171A] dark:text-[#FAF8F5] font-semibold">Promotional Visuals</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={onStartProject}
                className="px-8 py-3.5 text-[12px] tracking-[0.22em] font-medium bg-[#14171A] text-[#FAF8F5] hover:bg-[#A58B55] dark:bg-[#FAF8F5] dark:text-[#0b0c0e] dark:hover:bg-[#D8C7A5] transition-all duration-200 group flex items-center justify-center gap-2.5 active:scale-95 shadow-md"
              >
                <span>START A PROJECT</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <a
                href="#enquire"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-8 py-3.5 text-[12px] tracking-[0.22em] font-medium border transition-all duration-200 group flex items-center justify-center gap-2 ${
                  isDark
                    ? 'text-[#D8C7A5] border-[#D8C7A5]/60 hover:bg-[#D8C7A5] hover:text-[#0b0c0e] bg-[#121418]'
                    : 'text-[#8C723E] border-[#A58B55]/70 hover:bg-[#9E824C] hover:text-white bg-[#FFFFFF]'
                }`}
              >
                <span>BOOKINGS</span>
              </a>

              <button
                onClick={onExploreWork}
                className={`px-6 py-3.5 text-[12px] tracking-[0.22em] font-medium border transition-all duration-200 group flex items-center justify-center gap-2 ${
                  isDark
                    ? 'text-[#FAF8F5] border-[#2A2E36] hover:border-[#D8C7A5] bg-[#121418] hover:bg-[#1a1d23]'
                    : 'text-[#14171A] border-[#D4CEBF] hover:border-[#A58B55] bg-[#FFFFFF] hover:bg-[#FAF7F2]'
                }`}
              >
                <span>EXPLORE WORK</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#D8C7A5] group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Studio Brand Dossier Card (Bright in Light Mode) */}
          <div className="lg:col-span-5">
            <div
              className={`p-7 sm:p-9 border relative overflow-hidden transition-all duration-300 ${
                isDark
                  ? 'bg-[#121418] border-[#2A2E37] text-[#FAF8F5] shadow-2xl'
                  : 'bg-[#FFFFFF] border-[#E8E2D5] text-[#14171A] shadow-[0_20px_50px_rgba(216,199,165,0.22)] ring-1 ring-[#D8C7A5]/35'
              }`}
            >
              {/* Subtle Gold Corner Accent */}
              <div
                className={`absolute top-0 right-0 w-28 h-28 rounded-bl-full pointer-events-none ${
                  isDark ? 'bg-[#D8C7A5]/10' : 'bg-[#D8C7A5]/25'
                }`}
              />

              {/* Dossier Header */}
              <div
                className={`flex items-center justify-between pb-6 mb-6 border-b ${
                  isDark ? 'border-[#2A2E37]' : 'border-[#EFEAE1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/arkaja-monogram.svg"
                    alt="ArkAja Studio"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                  <div>
                    <span
                      className={`font-serif text-lg tracking-[0.2em] font-semibold block leading-none ${
                        isDark ? 'text-[#FAF8F5]' : 'text-[#14171A]'
                      }`}
                    >
                      ARKAJA
                    </span>
                    <span
                      className={`font-sans text-[7.5px] tracking-[0.14em] block leading-none mt-1 font-medium ${
                        isDark ? 'text-[#D8C7A5]' : 'text-[#A58B55]'
                      }`}
                    >
                      GRAPHIC DESIGNER | WEB DEVELOPER | APP DEVELOPER
                    </span>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                    isDark
                      ? 'bg-[#1A1D24] border-[#2D323E]'
                      : 'bg-[#FAF7F2] border-[#E5DECF]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span
                    className={`text-[9px] tracking-widest uppercase font-mono ${
                      isDark ? 'text-[#D8C7A5]' : 'text-[#8C723E]'
                    }`}
                  >
                    COMMISSIONS OPEN
                  </span>
                </div>
              </div>

              {/* Dossier Bullet Highlights */}
              <div className="space-y-4 mb-7 text-xs font-light tracking-wide">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isDark ? 'text-[#D8C7A5]' : 'text-[#A58B55]'
                    }`}
                  />
                  <div>
                    <span
                      className={`font-medium block ${
                        isDark ? 'text-[#FAF8F5]' : 'text-[#14171A]'
                      }`}
                    >
                      Authentic Concept Directions
                    </span>
                    <span
                      className={`text-[11px] ${
                        isDark ? 'text-[#8E929A]' : 'text-[#5C6370]'
                      }`}
                    >
                      Lumière, Noir &amp; Bean, Élan, Muse Beauty London, Saree Edit.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isDark ? 'text-[#D8C7A5]' : 'text-[#A58B55]'
                    }`}
                  />
                  <div>
                    <span
                      className={`font-medium block ${
                        isDark ? 'text-[#FAF8F5]' : 'text-[#14171A]'
                      }`}
                    >
                      Transparent Package Pricing
                    </span>
                    <span
                      className={`text-[11px] ${
                        isDark ? 'text-[#8E929A]' : 'text-[#5C6370]'
                      }`}
                    >
                      Starter ₹2,499 · Signature ₹4,999 (48h turnaround) · Custom Scopes.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isDark ? 'text-[#D8C7A5]' : 'text-[#A58B55]'
                    }`}
                  />
                  <div>
                    <span
                      className={`font-medium block ${
                        isDark ? 'text-[#FAF8F5]' : 'text-[#14171A]'
                      }`}
                    >
                      Human Art Direction First
                    </span>
                    <span
                      className={`text-[11px] ${
                        isDark ? 'text-[#8E929A]' : 'text-[#5C6370]'
                      }`}
                    >
                      Zero generic AI slop. Tailored typography, palette fidelity &amp; pacing.
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Studio Email & Location */}
              <div
                className={`pt-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] tracking-widest font-mono ${
                  isDark
                    ? 'border-[#2A2E37] text-[#A6ABB6]'
                    : 'border-[#EFEAE1] text-[#5C6370]'
                }`}
              >
                <a
                  href="mailto:arkajastudio@gmail.com"
                  className={`transition-colors flex items-center gap-1.5 ${
                    isDark
                      ? 'hover:text-[#D8C7A5] text-[#A6ABB6]'
                      : 'hover:text-[#A58B55] text-[#5C6370]'
                  }`}
                >
                  <Mail
                    className={`w-3 h-3 ${
                      isDark ? 'text-[#D8C7A5]' : 'text-[#A58B55]'
                    }`}
                  />
                  <span>ARKAJASTUDIO@GMAIL.COM</span>
                </a>
                <span
                  className={isDark ? 'text-[#D8C7A5]' : 'text-[#A58B55]'}
                >
                  MUMBAI, INDIA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-bar Metadata & Geographic Presence */}
        <div
          className={`mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] tracking-[0.2em] uppercase border-t transition-colors ${
            isDark
              ? 'text-[#737883] border-[#1a1d24]'
              : 'text-[#646A77] border-[#E8E2D7]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8C7A5]" />
            <span className="font-medium">Independent Creative Studio</span>
            <span>·</span>
            <span>Mumbai, India</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Accepting Select Projects Worldwide</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline text-[#A58B55] dark:text-[#D8C7A5] font-semibold">
              Quiet Luxury Editorial
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
