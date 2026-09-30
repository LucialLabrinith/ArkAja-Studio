import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';

export const ProcessSection: React.FC = () => {
  const { isDark } = useTheme();

  const steps = [
    {
      num: '01',
      title: 'BRIEF',
      desc: "Tell us what you're building, what you need and who you're speaking to.",
    },
    {
      num: '02',
      title: 'DIRECTION',
      desc: 'We define the visual direction, references, tone and content approach.',
    },
    {
      num: '03',
      title: 'CREATE',
      desc: 'AI-assisted production combined with human-led art direction, design and refinement.',
    },
    {
      num: '04',
      title: 'DELIVER',
      desc: 'Final approved assets are prepared and delivered in the agreed formats.',
    },
  ];

  return (
    <section
      id="process"
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        isDark
          ? 'bg-[#0b0c0e] border-[#1f2228] text-[#F3F1EC]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Logo variant="full" size="sm" />
              <span className="opacity-30">|</span>
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
                METHODOLOGY · 4-STEP ATELIER WORKFLOW
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight">
              How it works.
            </h2>
          </div>
          <p className="font-serif text-xl sm:text-2xl text-[#D8C7A5] font-normal italic">
            Simple process. Intentional work.
          </p>
        </div>

        {/* 4 Steps Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`p-8 border flex flex-col justify-between transition-colors ${
                isDark
                  ? 'bg-[#111317] border-[#24272D] hover:border-[#D8C7A5]/50'
                  : 'bg-[#FFFFFF] border-[#E2DDD5] hover:border-[#A58B55]/50 shadow-sm'
              }`}
            >
              <div>
                <span className="font-mono text-2xl text-[#D8C7A5] block mb-4 font-light">
                  {step.num} —
                </span>
                <h3 className="font-serif text-xl font-normal tracking-wide mb-3">
                  {step.title}
                </h3>
              </div>
              <p
                className={`font-sans text-xs sm:text-sm font-light leading-relaxed pt-4 border-t border-inherit ${
                  isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
                }`}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
