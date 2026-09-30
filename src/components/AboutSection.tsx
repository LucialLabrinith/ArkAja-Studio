import React from 'react';
import { Instagram, Mail, Globe, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';

export const AboutSection: React.FC = () => {
  const { isDark } = useTheme();
  const isDarkCanvas = isDark;

  return (
    <section
      id="about"
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors relative overflow-hidden ${
        isDarkCanvas
          ? 'bg-[#111317] border-[#22252C] text-[#FAF8F5]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Monogram & Identity Anchor */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#D8C7A5] font-semibold font-mono block mb-4">
                THE STUDIO · MUMBAI
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.08] mb-6">
                About ArkAja
              </h2>
            </div>

            <div
              className={`p-8 border my-6 transition-colors shadow-lg ${
                isDarkCanvas
                  ? 'bg-[#161920] border-[#2A2E38]'
                  : 'bg-[#FFFFFF] border-[#E2DDD5]'
              }`}
            >
              <Logo variant="full" size="lg" forceTheme={isDarkCanvas ? 'dark' : 'light'} className="mb-6" />
              <div className="space-y-3.5 text-xs font-light tracking-wide">
                <div className="flex items-center gap-2.5 text-[#D8C7A5]">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Based in Mumbai, India. Working with brands worldwide.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0 text-[#D8C7A5]" />
                  <a
                    href="mailto:ARKAJASTUDIO@GMAIL.COM"
                    className={`hover:text-[#D8C7A5] transition-colors uppercase font-mono tracking-widest ${
                      isDarkCanvas ? 'text-[#FAF8F5]' : 'text-[#14171A]'
                    }`}
                  >
                    ARKAJASTUDIO@GMAIL.COM
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 shrink-0 text-[#D8C7A5]" />
                  <a
                    href="https://www.instagram.com/arkajadesigner6208?stkn=aHBmdnFtc241djZ6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`hover:text-[#D8C7A5] transition-colors inline-flex items-center gap-1 ${
                      isDarkCanvas ? 'text-[#FAF8F5]' : 'text-[#14171A]'
                    }`}
                  >
                    <span>@arkajadesigner6208</span>
                    <ArrowUpRight className="w-3 h-3 text-[#D8C7A5]" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Philosophy & AI-Assisted Positioning */}
          <div className="lg:col-span-7 space-y-6 pt-2">
            <p className="font-serif text-2xl sm:text-3xl font-normal leading-snug">
              ArkAja Studio is an independent creative studio focused on modern, visually-led content for emerging brands and businesses.
            </p>

            <p
              className={`font-sans text-base sm:text-lg font-light leading-relaxed ${
                isDarkCanvas ? 'text-[#B4B7BF]' : 'text-[#555B66]'
              }`}
            >
              We combine AI-assisted creative production with human art direction, visual design and content strategy to create social content that feels intentional, contemporary and brand-specific.
            </p>

            <div
              className={`p-6 border-l-2 border-[#D8C7A5] space-y-2 mt-8 transition-colors ${
                isDarkCanvas ? 'bg-[#161920]' : 'bg-[#FFFFFF] border-y border-r border-[#E8E4DC]'
              }`}
            >
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono block">
                CREATIVE DISCIPLINE
              </span>
              <p
                className={`font-serif italic text-lg sm:text-xl ${
                  isDarkCanvas ? 'text-[#FAF8F5]' : 'text-[#14171A]'
                }`}
              >
                &ldquo;AI-assisted creative production. Human-led art direction.&rdquo;
              </p>
              <p
                className={`text-xs font-sans font-light leading-relaxed pt-1 ${
                  isDarkCanvas ? 'text-[#8E929A]' : 'text-[#646A77]'
                }`}
              >
                We believe algorithmic speed is meaningless without editorial restraint. AI provides swift visual synthesis and technical velocity; human taste, typographic discernment, and nuanced cultural understanding determine whether content is memorable or disposable.
              </p>
            </div>

            {/* Core Competencies Badges */}
            <div className={`pt-6 border-t ${isDarkCanvas ? 'border-[#22252C]' : 'border-[#E5E0D6]'}`}>
              <span
                className={`text-[10px] tracking-[0.25em] uppercase block mb-3 font-mono ${
                  isDarkCanvas ? 'text-[#8E929A]' : 'text-[#858C9B]'
                }`}
              >
                PRACTICE AREAS
              </span>
              <div
                className={`flex flex-wrap items-center gap-y-2 gap-x-3 text-xs tracking-wider uppercase ${
                  isDarkCanvas ? 'text-[#B4B7BF]' : 'text-[#4B5261]'
                }`}
              >
                <span>Creative Direction</span>
                <span className="opacity-40">·</span>
                <span>Visual Design</span>
                <span className="opacity-40">·</span>
                <span>Content Strategy</span>
                <span className="opacity-40">·</span>
                <span>Art Direction</span>
                <span className="opacity-40">·</span>
                <span>Campaign Thinking</span>
                <span className="opacity-40">·</span>
                <span>AI-Assisted Production</span>
                <span className="opacity-40">·</span>
                <span className="text-[#D8C7A5] font-semibold">Human Refinement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
