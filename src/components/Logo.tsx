import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  variant?: 'full' | 'monogram';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  forceTheme?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  forceTheme,
}) => {
  const { isDark, isCombo } = useTheme();
  // In combo mode, default text on light/ivory backgrounds is dark ink (#14171A)
  const isDarkCanvas = forceTheme ? forceTheme === 'dark' : isDark;

  if (variant === 'monogram') {
    const sizePx = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/arkaja-monogram.svg"
          alt="ArkAja Studio Monogram"
          width={sizePx}
          height={sizePx}
          className="object-contain"
        />
      </div>
    );
  }

  // Full Wordmark + Monogram
  const monogramPx = size === 'sm' ? 26 : size === 'lg' ? 42 : 34;

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none whitespace-nowrap ${className}`}>
      {/* Official Geometric AA Monogram */}
      <img
        src="/arkaja-monogram.svg"
        alt="ArkAja Studio"
        width={monogramPx}
        height={monogramPx}
        className="object-contain shrink-0"
      />

      {/* Editorial Wordmark matching brandkit */}
      <div className="flex flex-col text-left justify-center whitespace-nowrap">
        <span
          className={`font-serif tracking-[0.22em] uppercase leading-none font-semibold transition-colors ${
            size === 'sm' ? 'text-sm sm:text-base' : size === 'lg' ? 'text-2xl' : 'text-lg sm:text-xl'
          } ${isDarkCanvas ? 'text-[#FAF8F5]' : 'text-[#14171A]'}`}
        >
          ARKAJA
        </span>
        <span
          className={`font-sans tracking-[0.4em] uppercase leading-none font-medium mt-1 transition-colors ${
            size === 'sm' ? 'text-[7.5px] sm:text-[8px]' : size === 'lg' ? 'text-[10px]' : 'text-[9px]'
          } ${isDarkCanvas ? 'text-[#D8C7A5]' : 'text-[#A58B55]'}`}
        >
          STUDIO
        </span>
      </div>
    </div>
  );
};
