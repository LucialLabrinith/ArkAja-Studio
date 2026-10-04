import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PORTFOLIO_PROJECTS } from '../data/portfolioData';
import { PRICING_PACKAGES } from '../data/pricingData';
import { SERVICES_LIST } from '../data/servicesData';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { Search, X, ArrowUpRight, Sparkles, Layers, CreditCard, Compass } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: any) => void;
  onNavigateToSection: (sectionId: string) => void;
  onOpenAdvisor: () => void;
  allProjects?: any[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onNavigateToSection,
  onOpenAdvisor,
  allProjects,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedProjects: any[] = [];
    const pool = (allProjects && allProjects.length > 0) ? allProjects : PORTFOLIO_PROJECTS;
    pool.forEach((p) => {
      const inTitle = (p.title || '').toLowerCase().includes(q);
      const inCat = (p.category || '').toLowerCase().includes(q);
      const inDesc = (p.description || '').toLowerCase().includes(q);
      const inTagline = (p.tagline || '').toLowerCase().includes(q);
      const inDirections = (p.creativeDirections || []).some(
        (cd: any) => (cd?.title || '').toLowerCase().includes(q) || (cd?.subtitle ? cd.subtitle.toLowerCase().includes(q) : false)
      );
      if (inTitle || inCat || inDesc || inTagline || inDirections) {
        matchedProjects.push(p);
      }
    });

    const matchedServices: any[] = [];
    SERVICES_LIST.forEach((s) => {
      if (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.includes.some((inc: string) => inc.toLowerCase().includes(q))
      ) {
        matchedServices.push(s);
      }
    });

    const matchedPricing: any[] = [];
    PRICING_PACKAGES.forEach((pkg) => {
      if (
        pkg.name.toLowerCase().includes(q) ||
        pkg.subtitle.toLowerCase().includes(q) ||
        pkg.priceInr.toLowerCase().includes(q) ||
        pkg.features.some((f) => f.toLowerCase().includes(q))
      ) {
        matchedPricing.push(pkg);
      }
    });

    return {
      projects: matchedProjects,
      services: matchedServices,
      pricing: matchedPricing,
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-w-2xl w-full rounded-none shadow-2xl border transition-colors overflow-hidden ${
          isDark
            ? 'bg-[#121418] border-[#2E333C] text-[#F3F1EC]'
            : 'bg-[#FFFFFF] border-[#DDD7CD] text-[#14171A]'
        }`}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-inherit gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <Logo variant="full" size="sm" />
            <Search className="w-4 h-4 text-[#D8C7A5]" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, services, directions, pricing, or keywords..."
            className="w-full bg-transparent text-sm sm:text-base outline-none tracking-wide placeholder:text-stone-400 placeholder:font-light"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs uppercase tracking-wider text-[#8E929A] hover:text-inherit px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-[#8E929A] hover:text-inherit transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {!query && (
            <div className="space-y-4">
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#D8C7A5] font-mono block">
                QUICK DIRECTORY
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'Selected Work', id: 'work', icon: Layers },
                  { name: 'Services', id: 'services', icon: Compass },
                  { name: 'Project Builder', id: 'builder', icon: Sparkles },
                  { name: 'Pricing Packages', id: 'pricing', icon: CreditCard },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onClose();
                      onNavigateToSection(item.id);
                    }}
                    className={`p-3 text-left border flex flex-col justify-between transition-colors ${
                      isDark
                        ? 'border-[#22262E] hover:border-[#D8C7A5] bg-[#161920]'
                        : 'border-[#EAE6DF] hover:border-[#D8C7A5] bg-[#FAF8F5]'
                    }`}
                  >
                    <item.icon className="w-4 h-4 text-[#D8C7A5] mb-2" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </button>
                ))}
              </div>

              {/* Suggested Search Terms */}
              <div className="pt-2">
                <span className="text-[10px] tracking-[0.18em] uppercase text-[#8E929A] block mb-2 font-mono">
                  SUGGESTED EXPLORATIONS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Lumière', 'Noir & Bean', 'Élan', 'Saree Edit', 'Starter ₹2,499', 'Signature ₹4,999', 'Social Content', 'Hydrafacial'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className={`px-2.5 py-1 text-xs border rounded-none tracking-wide transition-colors ${
                        isDark
                          ? 'border-[#262B34] text-[#A6ABB6] hover:text-[#F3F1EC] hover:border-[#3D4452]'
                          : 'border-[#E2DDD5] text-[#555A64] hover:text-[#14171A] hover:border-[#14171A]'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query && searchResults && (
            <div className="space-y-6">
              {/* Projects Matched */}
              {searchResults.projects.length > 0 && (
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#D8C7A5] font-mono block mb-3">
                    PROJECTS ({searchResults.projects.length})
                  </span>
                  <div className="space-y-2">
                    {searchResults.projects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          onClose();
                          onSelectProject(proj);
                        }}
                        className={`p-3.5 border cursor-pointer flex items-center justify-between transition-colors group ${
                          isDark
                            ? 'border-[#242831] hover:border-[#D8C7A5] bg-[#161920]'
                            : 'border-[#E7E2D8] hover:border-[#D8C7A5] bg-[#FAF8F5]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-lg font-medium group-hover:text-[#D8C7A5] transition-colors">
                              {proj.title}
                            </h4>
                            <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-inherit font-mono opacity-80">
                              {proj.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#8E929A] mt-0.5 line-clamp-1">
                            {proj.description}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#8E929A] group-hover:text-[#D8C7A5] transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Matched */}
              {searchResults.services.length > 0 && (
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#D8C7A5] font-mono block mb-3">
                    SERVICES ({searchResults.services.length})
                  </span>
                  <div className="space-y-2">
                    {searchResults.services.map((svc) => (
                      <div
                        key={svc.id}
                        onClick={() => {
                          onClose();
                          onNavigateToSection('services');
                        }}
                        className={`p-3.5 border cursor-pointer flex items-center justify-between transition-colors group ${
                          isDark
                            ? 'border-[#242831] hover:border-[#D8C7A5] bg-[#161920]'
                            : 'border-[#E7E2D8] hover:border-[#D8C7A5] bg-[#FAF8F5]'
                        }`}
                      >
                        <div>
                          <h4 className="text-sm font-medium font-serif group-hover:text-[#D8C7A5]">
                            {svc.title}
                          </h4>
                          <p className="text-xs text-[#8E929A] mt-0.5 line-clamp-1">
                            {svc.description}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#8E929A] group-hover:text-[#D8C7A5] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Packages Matched */}
              {searchResults.pricing.length > 0 && (
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#D8C7A5] font-mono block mb-3">
                    PACKAGES ({searchResults.pricing.length})
                  </span>
                  <div className="space-y-2">
                    {searchResults.pricing.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          onClose();
                          onNavigateToSection('pricing');
                        }}
                        className={`p-3.5 border cursor-pointer flex items-center justify-between transition-colors group ${
                          isDark
                            ? 'border-[#242831] hover:border-[#D8C7A5] bg-[#161920]'
                            : 'border-[#E7E2D8] hover:border-[#D8C7A5] bg-[#FAF8F5]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium font-serif group-hover:text-[#D8C7A5]">
                              {pkg.name} Package
                            </h4>
                            <span className="text-xs font-mono text-[#D8C7A5] font-semibold">
                              {pkg.priceInr}
                            </span>
                          </div>
                          <p className="text-xs text-[#8E929A] mt-0.5 line-clamp-1">
                            {pkg.subtitle}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#8E929A] group-hover:text-[#D8C7A5] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No match found */}
              {searchResults.projects.length === 0 &&
                searchResults.services.length === 0 &&
                searchResults.pricing.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#8E929A] font-light">
                      No exact matches for &ldquo;{query}&rdquo;.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdvisor();
                      }}
                      className="mt-3 px-4 py-2 border border-[#D8C7A5] text-[#D8C7A5] text-xs uppercase tracking-widest hover:bg-[#D8C7A5] hover:text-[#0b0c0e] transition-colors"
                    >
                      Ask AI Advisor &ldquo;Aja&rdquo; Instead
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-inherit flex items-center justify-between text-[11px] text-[#787E8B] font-mono">
          <span>Search ArkAja Studio Index</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
