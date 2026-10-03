import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Sparkles,
  Search,
  Sun,
  Moon,
  Layers,
  User as UserIcon,
  LogIn,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  onOpenBuilder: () => void;
  onOpenAdvisor: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBuilder,
  onOpenAdvisor,
  onOpenSearch,
  onOpenAccount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, isOwner } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'WORK', href: '#work' },
    { label: 'SERVICES', href: '#services' },
    { label: 'PROCESS', href: '#process' },
    { label: 'PRICING', href: '#pricing' },
    { label: 'ABOUT', href: '#about' },
  ];

  // Universal Cross-OS Smooth Scroll Handler
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      const navHeader = document.querySelector('header');
      const offset = (navHeader?.clientHeight || 80) + 10;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
      window.history.pushState(null, '', href);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? isDark
            ? 'bg-[#0b0c0e]/95 backdrop-blur-md border-b border-[#24272D]/80 py-2.5 shadow-lg'
            : 'bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D7] py-2.5 shadow-sm'
          : isDark
          ? 'bg-[#0b0c0e]/90 backdrop-blur-sm border-b border-[#24272D]/50 py-3 sm:py-4'
          : 'bg-[#FAF8F5]/90 backdrop-blur-sm border-b border-[#E8E2D7]/60 py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Official Brand Logo & Monogram */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.history.pushState(null, '', '/');
            }}
            className="group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D8C7A5]"
            aria-label="ArkAja Studio Home"
          >
            <Logo variant="full" size="md" />
          </a>

          {/* Zone 2: Direct Top Navigation Links (Desktop & Laptops) */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-[12px] tracking-[0.2em] font-medium transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#D8C7A5] hover:after:w-full after:transition-all after:duration-200 ${
                  isDark
                    ? 'text-[#B4B7BF] hover:text-[#FAF8F5]'
                    : 'text-[#555B66] hover:text-[#14171A]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Interactive Suite (Search, Theme Toggle, Auth, AI Advisor & Start Project) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className={`p-2 border transition-all duration-200 flex items-center gap-1.5 ${
                isDark
                  ? 'border-[#262B34] text-[#A6ABB6] hover:text-[#FAF8F5] hover:border-[#D8C7A5] bg-[#14161B]'
                  : 'border-[#E0D9CE] text-[#555B66] hover:text-[#14171A] hover:border-[#A58B55] bg-[#FFFFFF]'
              }`}
              title="Search Portfolio & Services (Cmd+K)"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[10px] tracking-widest uppercase font-mono hidden xl:inline">
                Search
              </span>
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className={`px-2.5 py-1.5 border transition-all duration-200 flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase ${
                isDark
                  ? 'border-[#262B34] text-[#D8C7A5] hover:text-[#FAF8F5] hover:border-[#D8C7A5] bg-[#14161B]'
                  : 'border-[#E0D9CE] text-[#A58B55] hover:text-[#14171A] hover:border-[#A58B55] bg-[#FFFFFF]'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#D8C7A5]" />
                  <span className="hidden sm:inline">DARK</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#A58B55]" />
                  <span className="hidden sm:inline">LIGHT</span>
                </>
              )}
            </button>

            {/* Studio Director Portal & Authentication */}
            {isOwner ? (
              <button
                onClick={onOpenAccount}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#D8C7A5] bg-[#D8C7A5]/10 text-[#D8C7A5] transition-all duration-200 shadow-sm"
                title="Studio Director Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D8C7A5]" />
                <span className="text-[10px] tracking-wider uppercase font-mono font-semibold">
                  OWNER: DIVYAAM
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAccount}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-[10px] tracking-widest uppercase font-mono transition-all duration-200 ${
                  isDark
                    ? 'border-[#262B34] text-[#C5CAD5] hover:text-[#FAF8F5] hover:border-[#D8C7A5] bg-[#14161B]'
                    : 'border-[#E0D9CE] text-[#555B66] hover:text-[#14171A] hover:border-[#A58B55] bg-[#FFFFFF]'
                }`}
                title="Studio Director Login"
              >
                <Lock className="w-3 h-3 text-[#D8C7A5]" />
                <span className="hidden sm:inline">DIRECTOR ACCESS</span>
              </button>
            )}

            {/* AI Advisor Button */}
            <button
              onClick={onOpenAdvisor}
              className={`flex items-center gap-2 px-3 py-2 text-[11px] tracking-[0.15em] font-medium transition-all duration-200 whitespace-nowrap ${
                isDark
                  ? 'text-[#D8C7A5] hover:text-[#FAF8F5] border border-[#D8C7A5]/40 hover:border-[#D8C7A5] bg-[#14161a]'
                  : 'text-[#8C723E] hover:text-[#14171A] border border-[#A58B55]/40 hover:border-[#A58B55] bg-[#FFFFFF]'
              }`}
              title="Chat with Aja, Studio Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D8C7A5]" />
              <span className="hidden sm:inline">ASK AJA</span>
            </button>

            {/* Primary CTA */}
            <button
              onClick={onOpenBuilder}
              className={`px-3.5 sm:px-5 py-2 sm:py-2 text-[11px] sm:text-[12px] tracking-[0.2em] font-medium transition-all duration-200 whitespace-nowrap active:scale-95 shadow-sm ${
                isDark
                  ? 'text-[#0b0c0e] bg-[#FAF8F5] hover:bg-[#D8C7A5]'
                  : 'text-[#FFFFFF] bg-[#9E824C] hover:bg-[#866D3D]'
              }`}
            >
              START PROJECT
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors ${
                isDark ? 'text-[#FAF8F5] hover:text-[#D8C7A5]' : 'text-[#14171A] hover:text-[#A58B55]'
              }`}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Direct Top Navigation Ribbon: WORK, SERVICES, PROCESS, PRICING, ABOUT (Visible on top across all OS & while scrolling) */}
      <nav
        className={`lg:hidden border-t px-2 py-2 flex items-center justify-around overflow-x-auto no-scrollbar transition-colors ${
          isDark
            ? 'bg-[#0b0c0e]/95 border-[#24272D]/70'
            : 'bg-[#FAF8F5]/95 border-[#E8E2D7]/80'
        }`}
        aria-label="Direct Top Navigation"
      >
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className={`text-[10.5px] sm:text-xs tracking-[0.2em] font-medium uppercase px-2 py-1 transition-colors relative whitespace-nowrap active:scale-95 ${
              isDark
                ? 'text-[#C5CAD5] hover:text-[#FAF8F5] active:text-[#D8C7A5]'
                : 'text-[#4A505C] hover:text-[#14171A] active:text-[#A58B55]'
            }`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-b px-6 py-6 transition-all animate-in fade-in slide-in-from-top-4 ${
            isDark ? 'bg-[#0e1014] border-[#24272D]' : 'bg-[#FAF8F5] border-[#E8E2D7]'
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="pb-3 border-b border-inherit flex items-center justify-between">
              <Logo variant="monogram" size="sm" />
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className={`px-2.5 py-1 text-xs border flex items-center gap-1.5 ${
                    isDark
                      ? 'border-[#262B34] text-[#D8C7A5]'
                      : 'border-[#DDD7CC] text-[#8C723E]'
                  }`}
                >
                  {isDark ? (
                    <>
                      <Moon className="w-3.5 h-3.5" />
                      <span className="uppercase font-mono text-[10px]">Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5" />
                      <span className="uppercase font-mono text-[10px]">Light Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setMobileMenuOpen(false);
                }}
                className={`text-[13px] tracking-[0.2em] font-medium py-1.5 transition-colors ${
                  isDark
                    ? 'text-[#B4B7BF] hover:text-[#FAF8F5]'
                    : 'text-[#646A77] hover:text-[#14171A]'
                }`}
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-inherit flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccount();
                }}
                className="w-full py-2.5 px-4 text-xs font-mono tracking-widest uppercase border border-[#D8C7A5]/60 text-[#D8C7A5] text-center flex items-center justify-center gap-2 bg-[#D8C7A5]/5"
              >
                {isOwner ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Owner Portal (Divyaam)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Studio Director Access</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full py-2.5 px-4 text-xs font-mono tracking-widest uppercase border border-inherit text-center flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Portfolio</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdvisor();
                }}
                className="w-full py-2.5 px-4 text-xs font-medium tracking-widest uppercase border border-[#D8C7A5] text-[#D8C7A5] text-center flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Aja (AI Advisor)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBuilder();
                }}
                className={`w-full py-3 px-4 text-xs font-medium tracking-widest uppercase transition-colors text-center shadow-sm ${
                  isDark
                    ? 'bg-[#FAF8F5] text-[#0b0c0e]'
                    : 'bg-[#9E824C] text-[#FFFFFF] hover:bg-[#866D3D]'
                }`}
              >
                START A PROJECT
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
