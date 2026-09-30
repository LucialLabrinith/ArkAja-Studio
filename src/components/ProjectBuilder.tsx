import React, { useState } from 'react';
import { CustomBuilderState } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { saveDraftToFirestore } from '../lib/firebase';
import { Logo } from './Logo';
import { Minus, Plus, ArrowRight, Check, Sparkles, Bookmark, CheckCircle2 } from 'lucide-react';

interface ProjectBuilderProps {
  onContinueToEnquiry: (builderState: CustomBuilderState) => void;
  onOpenAdvisor: () => void;
}

export const ProjectBuilder: React.FC<ProjectBuilderProps> = ({
  onContinueToEnquiry,
  onOpenAdvisor,
}) => {
  const { isDark } = useTheme();
  const { user, refreshUserData } = useAuth();
  const [draftSaved, setDraftSaved] = useState(false);

  const [state, setState] = useState<CustomBuilderState>({
    categories: ['Social Media Content'],
    socialFormats: ['Instagram Post', 'Story'],
    campaignTypes: [],
    brandVisuals: [],
    videoTypes: [],
    counts: {
      posts: 4,
      stories: 2,
      carousels: 0,
      promotionalCreatives: 1,
      reels: 0,
    },
    somethingElse: '',
    businessType: 'Beauty',
    country: 'India',
    timeline: '3–5 days',
    budget: '₹5,000–₹10,000',
  });

  const categories = [
    'Social Media Content',
    'Campaign Creative',
    'Promotional Visuals',
    'Brand Visuals',
    'Short-form Video / Reels',
    'Other',
  ];

  const socialOptions = [
    'Instagram Post',
    'Carousel',
    'Story',
    'Promotional Creative',
    'Caption Writing',
  ];

  const campaignOptions = [
    'Product Launch',
    'Seasonal Campaign',
    'Festival Campaign',
    'Offer / Sale',
    'Brand Campaign',
  ];

  const brandOptions = [
    'Creative Direction',
    'Social Visual System',
    'Content Templates',
    'Visual Mood / Art Direction',
  ];

  const videoOptions = [
    'Short-form Reel',
    'Product Reel',
    'Promotional Reel',
    'Editing',
  ];

  const businessTypes = [
    'Beauty',
    'Fashion',
    'Café / Restaurant',
    'Wellness',
    'E-commerce',
    'Real Estate',
    'Personal Brand',
    'Other',
  ];

  const countries = [
    'India',
    'United States',
    'United Kingdom',
    'United Arab Emirates',
    'Australia',
    'Canada',
    'Singapore',
    'Germany',
    'France',
    'Other Country',
  ];

  const timelines = ['ASAP', '48 hours', '3–5 days', '1 week', 'Flexible'];

  const budgetOptions = [
    'Under ₹5,000',
    '₹5,000–₹10,000',
    '₹10,000–₹25,000',
    '₹25,000+',
    'Not sure yet',
  ];

  const toggleArrayItem = (
    key: keyof Pick<
      CustomBuilderState,
      'categories' | 'socialFormats' | 'campaignTypes' | 'brandVisuals' | 'videoTypes'
    >,
    item: string
  ) => {
    setState((prev) => {
      const current = prev[key];
      const next = current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item];
      return { ...prev, [key]: next };
    });
  };

  const updateCount = (key: keyof CustomBuilderState['counts'], delta: number) => {
    setState((prev) => ({
      ...prev,
      counts: {
        ...prev.counts,
        [key]: Math.max(0, prev.counts[key] + delta),
      },
    }));
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    try {
      await saveDraftToFirestore(user.uid, {
        draftId: `draft-${Date.now()}`,
        brandName: `${state.businessType} Campaign Draft`,
        category: state.businessType,
        timeline: state.timeline,
        budget: state.budget,
        deliverables: state.counts,
        selectedServices: state.categories,
      });
      setDraftSaved(true);
      refreshUserData();
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (e) {
      console.warn('Draft save error:', e);
    }
  };

  return (
    <section
      id="builder"
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        isDark
          ? 'bg-[#0b0c0e] border-[#1f2228] text-[#F3F1EC]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 mb-3">
            <Logo variant="full" size="sm" />
            <span className="opacity-30">|</span>
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
              INTERACTIVE ESTIMATION · TAILORED SCOPE
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight mb-4">
            Build Your Project
          </h2>
          <p
            className={`font-sans text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            Customise your deliverables, choose your timeline, and shape a brief tailored specifically to your brand requirements.
          </p>
        </div>

        {/* Builder Container */}
        <div
          className={`border p-6 sm:p-10 space-y-12 transition-colors shadow-2xl ${
            isDark
              ? 'bg-[#111317] border-[#22252D]'
              : 'bg-[#FFFFFF] border-[#E2DDD5]'
          }`}
        >
          {/* STEP 1: What are you looking for? */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-inherit mb-6">
              <span className="text-xs tracking-[0.2em] uppercase font-mono text-[#D8C7A5]">
                STEP 01 — WHAT ARE YOU LOOKING FOR?
              </span>
              <span className="text-[11px] opacity-60 font-mono">
                SELECT ALL THAT APPLY
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const isSelected = state.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleArrayItem('categories', cat)}
                    className={`p-4 text-left border transition-all text-xs tracking-wider flex items-center justify-between ${
                      isSelected
                        ? isDark
                          ? 'bg-[#D8C7A5] text-[#0b0c0e] border-[#D8C7A5] font-medium'
                          : 'bg-[#A58B55] text-[#FAF7F2] border-[#A58B55] font-medium'
                        : isDark
                        ? 'bg-[#14161a] border-[#24272D] text-[#8E929A] hover:text-[#F3F1EC] hover:border-[#383d47]'
                        : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#555A64] hover:text-[#14171A] hover:border-[#A58B55]'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Deliverable Quantities */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-inherit mb-6">
              <span className="text-xs tracking-[0.2em] uppercase font-mono text-[#D8C7A5]">
                STEP 02 — CHOOSE DELIVERABLES VOLUME
              </span>
              <span className="text-[11px] opacity-60 font-mono">
                ADJUST QUANTITIES
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'posts', label: 'Instagram Posts', sub: 'Single static or high-contrast creatives' },
                { key: 'stories', label: 'Stories', sub: 'Ephemeral branded storytelling layouts' },
                { key: 'carousels', label: 'Carousels', sub: 'Multi-slide narrative sets' },
                { key: 'promotionalCreatives', label: 'Promotional Offers', sub: 'Sale & high-conversion assets' },
                { key: 'reels', label: 'Reels / Video Direction', sub: 'Custom short-form direction' },
              ].map(({ key, label, sub }) => {
                const countKey = key as keyof CustomBuilderState['counts'];
                const val = state.counts[countKey];
                return (
                  <div
                    key={key}
                    className={`p-4 border flex flex-col justify-between ${
                      isDark ? 'bg-[#14171d] border-[#24272D]' : 'bg-[#FAF8F5] border-[#E0DBD2]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium">{label}</div>
                      <div className="text-[10px] opacity-60 mt-0.5 line-clamp-1">{sub}</div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-inherit">
                      <button
                        type="button"
                        onClick={() => updateCount(countKey, -1)}
                        className={`w-7 h-7 flex items-center justify-center border transition-colors ${
                          isDark
                            ? 'border-[#2E333C] text-[#8E929A] hover:text-[#F3F1EC]'
                            : 'border-[#DDD7CD] text-[#636875] hover:text-[#14171A]'
                        }`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-sm font-semibold">{val}</span>
                      <button
                        type="button"
                        onClick={() => updateCount(countKey, 1)}
                        className={`w-7 h-7 flex items-center justify-center border transition-colors ${
                          isDark
                            ? 'border-[#2E333C] text-[#8E929A] hover:text-[#F3F1EC]'
                            : 'border-[#DDD7CD] text-[#636875] hover:text-[#14171A]'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Timeline & Budget */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-inherit mb-6">
              <span className="text-xs tracking-[0.2em] uppercase font-mono text-[#D8C7A5]">
                STEP 03 — CONTEXT & PARAMETERS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block mb-2 font-medium">
                  BUSINESS TYPE
                </label>
                <select
                  value={state.businessType}
                  onChange={(e) => setState({ ...state, businessType: e.target.value })}
                  className={`w-full border text-xs px-3 py-2.5 focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#14161a] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                      : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A] focus:border-[#A58B55]'
                  }`}
                >
                  {businessTypes.map((bt) => (
                    <option
                      key={bt}
                      value={bt}
                      className={isDark ? 'bg-[#121418] text-[#F3F1EC]' : 'bg-[#FFFFFF] text-[#14171A]'}
                    >
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block mb-2 font-medium">
                  OPERATING COUNTRY
                </label>
                <select
                  value={state.country}
                  onChange={(e) => setState({ ...state, country: e.target.value })}
                  className={`w-full border text-xs px-3 py-2.5 focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#14161a] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                      : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A] focus:border-[#A58B55]'
                  }`}
                >
                  {countries.map((c) => (
                    <option
                      key={c}
                      value={c}
                      className={isDark ? 'bg-[#121418] text-[#F3F1EC]' : 'bg-[#FFFFFF] text-[#14171A]'}
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block mb-2 font-medium">
                  TIMELINE
                </label>
                <select
                  value={state.timeline}
                  onChange={(e) => setState({ ...state, timeline: e.target.value })}
                  className={`w-full border text-xs px-3 py-2.5 focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#14161a] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                      : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A] focus:border-[#A58B55]'
                  }`}
                >
                  {timelines.map((tl) => (
                    <option
                      key={tl}
                      value={tl}
                      className={isDark ? 'bg-[#121418] text-[#F3F1EC]' : 'bg-[#FFFFFF] text-[#14171A]'}
                    >
                      {tl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block mb-2 font-medium">
                  BUDGET
                </label>
                <select
                  value={state.budget}
                  onChange={(e) => setState({ ...state, budget: e.target.value })}
                  className={`w-full border text-xs px-3 py-2.5 focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#14161a] border-[#24272D] text-[#F3F1EC] focus:border-[#D8C7A5]'
                      : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A] focus:border-[#A58B55]'
                  }`}
                >
                  {budgetOptions.map((b) => (
                    <option
                      key={b}
                      value={b}
                      className={isDark ? 'bg-[#121418] text-[#F3F1EC]' : 'bg-[#FFFFFF] text-[#14171A]'}
                    >
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 4: Summary & Call to Action */}
          <div
            className={`pt-8 border-t p-6 sm:p-8 border transition-colors ${
              isDark ? 'bg-[#14171d] border-[#24272D]' : 'bg-[#FAF8F5] border-[#E0DBD2]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit mb-4">
              <span className="text-[11px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono">
                YOUR PROJECT SUMMARY
              </span>
              <div className="flex items-center gap-4">
                {user && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="text-[11px] tracking-wider uppercase text-[#D8C7A5] hover:underline flex items-center gap-1 font-mono"
                  >
                    {draftSaved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved to Cloud!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save Draft</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenAdvisor}
                  className="text-[11px] tracking-[0.15em] text-[#D8C7A5] hover:opacity-80 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discuss with Aja</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-light mb-6 opacity-90">
              <div>
                <span className="opacity-60 block text-[10px] tracking-wider uppercase font-mono">
                  SERVICES
                </span>
                <span className="font-normal">{state.categories.join(', ') || 'Custom'}</span>
              </div>
              <div>
                <span className="opacity-60 block text-[10px] tracking-wider uppercase font-mono">
                  DELIVERABLES
                </span>
                <span className="font-mono">
                  {state.counts.posts} posts · {state.counts.stories} stories · {state.counts.carousels} carousels · {state.counts.promotionalCreatives} promo · {state.counts.reels} reels
                </span>
              </div>
              <div>
                <span className="opacity-60 block text-[10px] tracking-wider uppercase font-mono">
                  TIMELINE
                </span>
                <span>{state.timeline}</span>
              </div>
              <div>
                <span className="opacity-60 block text-[10px] tracking-wider uppercase font-mono">
                  BUDGET RANGE
                </span>
                <span className="text-[#D8C7A5] font-mono font-medium">{state.budget}</span>
              </div>
            </div>

            {/* Honest Pricing Rule Notice */}
            <div
              className={`p-3 border text-[11.5px] mb-6 leading-relaxed ${
                isDark
                  ? 'bg-[#0e1014] border-[#24272D] text-[#8E929A]'
                  : 'bg-[#FFFFFF] border-[#E2DDD5] text-[#636875]'
              }`}
            >
              Your selections have been saved for enquiry. ArkAja Studio will confirm the final quote after reviewing your brief.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] tracking-[0.18em] opacity-70">
                Ready to review and submit your brief?
              </span>
              <button
                type="button"
                onClick={() => onContinueToEnquiry(state)}
                className={`w-full sm:w-auto px-8 py-3 text-[12px] tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 active:scale-95 ${
                  isDark
                    ? 'text-[#0b0c0e] bg-[#F3F1EC] hover:bg-[#D8C7A5]'
                    : 'text-[#FAF7F2] bg-[#14171A] hover:bg-[#A58B55]'
                }`}
              >
                <span>CONTINUE TO ENQUIRY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
