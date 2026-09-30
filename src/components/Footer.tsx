import React from 'react';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';
import { Mail, Instagram, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { isDark } = useTheme();
  const isDarkCanvas = isDark;

  const instagramUrl =
    'https://www.instagram.com/arkajadesigner6208?stkn=aHBmdnFtc241djZ6';
  const gmailAddress = 'ARKAJASTUDIO@GMAIL.COM';

  const navLinks = [
    { label: 'WORK', href: '#work' },
    { label: 'SERVICES', href: '#services' },
    { label: 'PROCESS', href: '#process' },
    { label: 'PRICING', href: '#pricing' },
    { label: 'ABOUT', href: '#about' },
    { label: 'ENQUIRE', href: '#enquire' },
  ];

  return (
    <footer
      className={`border-t pt-16 pb-12 px-4 sm:px-6 lg:px-8 transition-colors ${
        isDarkCanvas
          ? 'bg-[#08090b] border-[#1f2228] text-[#A6ABB5]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#555B66]'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-inherit">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <Logo variant="full" size="md" forceTheme={isDarkCanvas ? 'dark' : 'light'} />
            <p
              className={`font-serif text-lg font-normal italic pt-2 ${
                isDarkCanvas ? 'text-[#FAF8F5]' : 'text-[#14171A]'
              }`}
            >
              &ldquo;Creative content for brands with something to say.&rdquo;
            </p>
            <p className="text-xs tracking-[0.2em] uppercase font-mono opacity-80">
              Social Content • Campaigns • Promotional Visuals
            </p>
            <div className="pt-2 text-xs font-light">
              Mumbai, India · Working with brands worldwide.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#D8C7A5] font-mono block mb-2 font-semibold">
              NAVIGATION
            </span>
            <ul className="space-y-2 text-xs tracking-wider font-medium">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={`transition-colors inline-block py-0.5 ${
                      isDarkCanvas ? 'hover:text-[#FAF8F5]' : 'hover:text-[#14171A]'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social Column */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#D8C7A5] font-mono block mb-2 font-semibold">
              STUDIO CONNECT
            </span>
            <div className="space-y-2.5 text-xs font-light">
              <a
                href={`mailto:${gmailAddress}`}
                className={`flex items-center gap-2 transition-colors ${
                  isDarkCanvas ? 'hover:text-[#FAF8F5]' : 'hover:text-[#14171A]'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-[#D8C7A5]" />
                <span className="font-mono">{gmailAddress}</span>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 transition-colors ${
                  isDarkCanvas ? 'hover:text-[#FAF8F5]' : 'hover:text-[#14171A]'
                }`}
              >
                <Instagram className="w-3.5 h-3.5 text-[#D8C7A5]" />
                <span>@arkajadesigner6208</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            </div>

            <div className="pt-4 border-t border-inherit">
              <span className="text-[10px] tracking-[0.2em] uppercase opacity-70 block mb-1">
                POSITIONING
              </span>
              <p className="text-[11px] font-light leading-relaxed">
                AI-assisted creative production. Human-led art direction.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Disclosure Line */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] opacity-70 font-light">
          <div>
            © 2026 ArkAja Studio. All rights reserved.
          </div>

          <p className="text-center md:text-right max-w-xl text-[10.5px] leading-relaxed">
            Portfolio projects marked <span>CONCEPT PROJECT</span> are independent creative concepts and are not represented as commissioned client work.
          </p>
        </div>
      </div>
    </footer>
  );
};
