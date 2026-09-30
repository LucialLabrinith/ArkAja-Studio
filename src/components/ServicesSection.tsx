import React from 'react';
import { STUDIO_SERVICES, CUSTOM_VIDEO_SERVICE } from '../data/servicesData';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { ArrowUpRight } from 'lucide-react';

interface ServicesSectionProps {
  onOpenBuilder: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenBuilder }) => {
  const { isDark } = useTheme();

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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Logo variant="full" size="sm" />
              <span className="opacity-30">|</span>
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
                WHAT WE DELIVER · 4 CORE DISCIPLINES
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight">
              Creative services for modern brands.
            </h2>
          </div>
          <p
            className={`font-sans text-sm sm:text-base font-light max-w-md ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            Every deliverable is crafted through AI-accelerated workflows steered by senior human art direction and brand typography.
          </p>
        </div>

        {/* 4 Core Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {STUDIO_SERVICES.map((service, index) => (
            <div
              key={service.id}
              className={`p-8 sm:p-10 border transition-all duration-300 flex flex-col justify-between ${
                isDark
                  ? 'bg-[#121418] border-[#24272D] hover:border-[#D8C7A5]/60'
                  : 'bg-[#FFFFFF] border-[#E2DDD5] hover:border-[#A58B55]/60 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-inherit">
                  <span className="text-[10px] tracking-[0.3em] font-mono text-[#D8C7A5] font-semibold">
                    0{index + 1}
                  </span>
                  <span className="text-[10px] tracking-[0.2em] uppercase opacity-60">
                    CORE DISCIPLINE
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mb-3">
                  {service.title}
                </h3>

                <p
                  className={`font-sans text-sm sm:text-base font-light leading-relaxed mb-6 ${
                    isDark ? 'text-[#B4B7BF]' : 'text-[#555B66]'
                  }`}
                >
                  {service.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] tracking-[0.22em] uppercase font-medium block mb-3 opacity-70">
                  Includes:
                </span>
                <ul className="grid grid-cols-2 gap-2 text-[12px] tracking-wide font-light opacity-90">
                  {service.includes.map((inc) => (
                    <li key={inc} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#D8C7A5] rounded-full shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Video Note & CTA Banner */}
        <div
          className={`p-8 sm:p-10 border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-colors ${
            isDark
              ? 'bg-[#15181f] border-[#262a34]'
              : 'bg-[#F2ECE1] border-[#DDD7CC]'
          }`}
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#D8C7A5] uppercase mb-2">
              <span>SPECIALIZED DISCIPLINE</span>
              <span>·</span>
              <span>CUSTOM PRODUCTION</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal mb-2">
              {CUSTOM_VIDEO_SERVICE.title}
            </h3>
            <p
              className={`font-sans text-sm font-light leading-relaxed ${
                isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
              }`}
            >
              {CUSTOM_VIDEO_SERVICE.description}
            </p>
          </div>

          <button
            onClick={onOpenBuilder}
            className={`px-8 py-3.5 text-[11px] tracking-[0.22em] font-medium transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              isDark
                ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
            }`}
          >
            <span>CUSTOMISE YOUR CONTENT</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
