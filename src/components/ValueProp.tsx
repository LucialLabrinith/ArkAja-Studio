import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';

interface ValuePropProps {
  onViewServices: () => void;
}

export const ValueProp: React.FC<ValuePropProps> = ({ onViewServices }) => {
  const { isDark } = useTheme();
  const isDarkCanvas = isDark;

  return (
    <section
      className={`py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b transition-colors relative overflow-hidden ${
        isDarkCanvas
          ? 'bg-[#0e1014] border-[#1f2228] text-[#FAF8F5]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Layout: Statement & Positioning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-16">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-4">
              <Logo variant="full" size="sm" />
              <span className="opacity-30">|</span>
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
                STUDIO PHILOSOPHY &amp; POSITIONING
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.14] text-balance">
              Visuals built to make brands feel considered.
            </h2>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between h-full pt-2">
            <p
              className={`font-sans text-base sm:text-lg font-light leading-relaxed mb-8 ${
                isDarkCanvas ? 'text-[#B4B7BF]' : 'text-[#555B66]'
              }`}
            >
              ArkAja Studio creates modern, visually-led content for emerging brands and businesses. We combine AI-assisted creative production with human art direction, visual design and content strategy to create work that feels intentional, contemporary and brand-specific.
            </p>
            <div>
              <button
                onClick={onViewServices}
                className={`inline-flex items-center gap-3 text-[12px] tracking-[0.2em] font-medium transition-colors group pb-1 border-b ${
                  isDarkCanvas
                    ? 'text-[#D8C7A5] hover:text-[#FAF8F5] border-[#D8C7A5]/50 hover:border-[#D8C7A5]'
                    : 'text-[#A58B55] hover:text-[#14171A] border-[#A58B55]/50 hover:border-[#A58B55]'
                }`}
              >
                <span>EXPLORE STUDIO DISCIPLINES</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t ${
            isDarkCanvas ? 'border-[#22262E]' : 'border-[#E3DDD4]'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.3em] font-mono text-[#D8C7A5] mb-3">
              01 / PILLAR
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal mb-2">
              SOCIAL CONTENT
            </h3>
            <p
              className={`font-sans text-sm font-light leading-relaxed ${
                isDarkCanvas ? 'text-[#8E929A]' : 'text-[#646A77]'
              }`}
            >
              Campaign-ready posts, carousels, stories and promotional creatives crafted with clear editorial pacing.
            </p>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.3em] font-mono text-[#D8C7A5] mb-3">
              02 / PILLAR
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal mb-2">
              CAMPAIGN CREATIVE
            </h3>
            <p
              className={`font-sans text-sm font-light leading-relaxed ${
                isDarkCanvas ? 'text-[#8E929A]' : 'text-[#646A77]'
              }`}
            >
              Launches, seasonal campaigns, festive moments, offers and high-impact product or service visual narratives.
            </p>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.3em] font-mono text-[#D8C7A5] mb-3">
              03 / PILLAR
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal mb-2">
              BRAND VISUALS
            </h3>
            <p
              className={`font-sans text-sm font-light leading-relaxed ${
                isDarkCanvas ? 'text-[#8E929A]' : 'text-[#646A77]'
              }`}
            >
              Creative direction, cohesive visual systems and recognizable social identities that transcend algorithmic trends.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
