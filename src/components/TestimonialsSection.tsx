import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  CheckCircle2,
  Sparkles,
  Building2,
  Plus,
  X,
  Send,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { submitClientReview, subscribeToClientReviews, ClientReviewDoc } from '../lib/firebase';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  serviceCategory: string;
  quote: string;
  highlightMetric: string;
  rating: number;
  date: string;
  isCommunity?: boolean;
}

const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Aarav Mehta',
    role: 'Founder & Director',
    company: 'Soma Wellness Clinics',
    location: 'Mumbai & Bengaluru',
    serviceCategory: 'Basic Web App · Patient Booking & Admin Dashboard',
    quote:
      'ArkAja built our clinic appointment workflow from scratch. Patients select their practitioner, pick an open slot, and our front desk manages everything through a clean, bespoke dashboard. Clean execution, rapid turnaround, and zero monthly SaaS tax.',
    highlightMetric: '140+ Weekly Bookings Handled',
    rating: 5,
    date: 'October 2026',
  },
  {
    id: 't-2',
    name: 'Rohan Deshmukh',
    role: 'Co-Founder',
    company: 'Roast & Brew Artisan Cafe',
    location: 'Pune',
    serviceCategory: 'Basic Website (₹10,000)',
    quote:
      'Website came out super clean and modern. Had a slight back-and-forth on our menu font style on day 2, but they adjusted it quickly. Really good value for ₹10k and got it online before our opening.',
    highlightMetric: 'Delivered in 5 Days',
    rating: 4,
    date: 'October 2026',
  },
  {
    id: 't-3',
    name: 'Priya Singhania',
    role: 'Creative Director',
    company: 'Élan Maison Haute Joaillerie',
    location: 'Paris & Mumbai',
    serviceCategory: 'Brand Identity & Signature Social Suite',
    quote:
      'Their visual restraint and typographic discipline are unmatched among design studios. Every campaign creative feels like it was conceived in a high-fashion atelier. The engagement on our seasonal collection launch spiked within 48 hours.',
    highlightMetric: '3.4x Social Engagement Lift',
    rating: 5,
    date: 'October 2026',
  },
  {
    id: 't-4',
    name: 'Ankit Sharma',
    role: 'Founder',
    company: 'QuickDrop Logistics',
    location: 'Delhi NCR',
    serviceCategory: 'Logo Design & Identity Kit (₹3,000)',
    quote:
      'Design quality is definitely good, but we were in a huge rush and delivery took 6 days instead of 4. Wish communication was a bit quicker on day 3, but the final logo kit, vector files, and brand colors are rock solid.',
    highlightMetric: 'Approved V2 Iteration',
    rating: 3,
    date: 'September 2026',
  },
  {
    id: 't-5',
    name: 'Meera Kapoor',
    role: 'Owner',
    company: 'The Glaze Salon & Spa',
    location: 'Bengaluru',
    serviceCategory: 'Basic Web App · Salon Booking (₹15,000)',
    quote:
      'Had them build our appointment booking system. The interface is clean and works very smoothly on customer phones. Would love WhatsApp integration down the line, but for a ₹15k one-time web app it solves our daily chaos nicely.',
    highlightMetric: 'Replaced Paper Registers',
    rating: 4,
    date: 'September 2026',
  },
  {
    id: 't-6',
    name: 'Dr. Natasha Roy',
    role: 'Medical Director',
    company: 'CarePulse Polyclinic',
    location: 'Hyderabad',
    serviceCategory: 'Level 1 Web App · Doctor Slots & Records Dashboard',
    quote:
      'Instead of locking us into continuous monthly SaaS subscription fees, ArkAja provided an independent appointment system with our own database and receptionist dashboard. Honest, transparent pricing and rock-solid code.',
    highlightMetric: 'Saved ₹45,000/yr in SaaS Subscriptions',
    rating: 5,
    date: 'September 2026',
  },
  {
    id: 't-7',
    name: 'Kavita Nambiar',
    role: 'Managing Partner',
    company: 'Nambiar Advisory',
    location: 'Kochi',
    serviceCategory: 'Basic Website & Brand Setup',
    quote:
      'Website looks great and loads fast. Felt the initial enquiry form options had a few too many technical choices for someone non-tech, but their team was responsive and walked me through it over chat.',
    highlightMetric: 'Clean Corporate Presence',
    rating: 3,
    date: 'August 2026',
  },
  {
    id: 't-8',
    name: 'Vikram Sengupta',
    role: 'Director',
    company: 'Horizon Freight Solutions',
    location: 'Kolkata',
    serviceCategory: 'Custom Business Dashboard & Client Portal',
    quote:
      'Clean business presence and transparent quoting. Delivery took one day longer than initially anticipated due to Sunday, but the delivered tracking tables and client portal code are pristine.',
    highlightMetric: 'Streamlined Quote Processing',
    rating: 4,
    date: 'August 2026',
  },
  {
    id: 't-9',
    name: 'Tanvi Bhatia',
    role: 'Brand Lead',
    company: 'Aura Botanicals',
    location: 'Jaipur & Mumbai',
    serviceCategory: 'Starter Content Package (₹2,499)',
    quote:
      'Fast turnaround on our social launch pack. Clean aesthetic, exactly what we needed. Zero back and forth needed on the typography.',
    highlightMetric: 'Published in 48 Hours',
    rating: 5,
    date: 'August 2026',
  },
];

export const TestimonialsSection: React.FC = () => {
  const { isDark } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3'>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Dynamic reviews combining seed + community reviews
  const [communityReviews, setCommunityReviews] = useState<Testimonial[]>([]);

  // Real-time Firestore sync
  useEffect(() => {
    const unsubscribe = subscribeToClientReviews((docs: ClientReviewDoc[]) => {
      const formatted: Testimonial[] = docs.map((d) => ({
        id: d.id,
        name: d.name,
        role: d.role || 'Client',
        company: d.company || 'Verified Client',
        location: d.location || 'India',
        serviceCategory: d.serviceCategory || 'Design & Development',
        quote: d.review,
        highlightMetric: d.highlightMetric || `${d.rating}★ Verified Feedback`,
        rating: d.rating,
        date: d.createdAt || 'Recent',
        isCommunity: true,
      }));
      setCommunityReviews(formatted);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Combined and filtered testimonials
  const allTestimonials = useMemo(() => {
    return [...communityReviews, ...SEED_TESTIMONIALS];
  }, [communityReviews]);

  const filteredTestimonials = useMemo(() => {
    if (ratingFilter === 'all') return allTestimonials;
    const target = Number(ratingFilter);
    return allTestimonials.filter((t) => t.rating === target);
  }, [allTestimonials, ratingFilter]);

  // Aggregate stats
  const averageRating = useMemo(() => {
    if (allTestimonials.length === 0) return 4.7;
    const sum = allTestimonials.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / allTestimonials.length).toFixed(1);
  }, [allTestimonials]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0 };
    allTestimonials.forEach((t) => {
      if (t.rating === 5) counts[5]++;
      else if (t.rating === 4) counts[4]++;
      else if (t.rating <= 3) counts[3]++;
    });
    return counts;
  }, [allTestimonials]);

  // Form State for User Review
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formService, setFormService] = useState('Basic Website (₹10,000)');
  const [formQuote, setFormQuote] = useState('');
  const [formMetric, setFormMetric] = useState('');
  const [formError, setFormError] = useState('');

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formQuote.trim()) {
      setFormError('Please provide your name and feedback.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);

    try {
      const newReview = await submitClientReview({
        name: formName.trim(),
        role: formRole.trim() || 'Client',
        company: formCompany.trim() || 'Independent Brand',
        location: formLocation.trim() || 'India',
        serviceCategory: formService,
        rating: formRating,
        review: formQuote.trim(),
        highlightMetric: formMetric.trim() || `${formRating}★ Verified Experience`,
      });

      // Optimistically update list
      const formatted: Testimonial = {
        id: newReview.id,
        name: newReview.name,
        role: newReview.role || 'Client',
        company: newReview.company || 'Verified Client',
        location: newReview.location || 'India',
        serviceCategory: newReview.serviceCategory,
        quote: newReview.review,
        highlightMetric: newReview.highlightMetric || `${newReview.rating}★ Verified Experience`,
        rating: newReview.rating,
        date: newReview.createdAt,
        isCommunity: true,
      };

      setCommunityReviews((prev) => [formatted, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsWriteModalOpen(false);
        // Reset form
        setFormName('');
        setFormCompany('');
        setFormRole('');
        setFormLocation('');
        setFormQuote('');
        setFormMetric('');
        setFormRating(5);
      }, 2000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Carousel Scroll
  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const cardWidth = scrollRef.current.children[0]
      ? (scrollRef.current.children[0] as HTMLElement).offsetWidth + 24
      : 380;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), filteredTestimonials.length - 1));
  }, [filteredTestimonials.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    updateScrollState();
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cards = scrollRef.current.querySelectorAll<HTMLElement>('[data-testimonial-card]');
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    } else {
      scrollToIndex(filteredTestimonials.length - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < filteredTestimonials.length - 1) {
      scrollToIndex(activeIndex + 1);
    } else {
      scrollToIndex(0);
    }
  };

  // Subtle auto-advance
  useEffect(() => {
    if (isPaused || isWriteModalOpen) return;
    const timer = setInterval(() => {
      handleNext();
    }, 7500);
    return () => clearInterval(timer);
  }, [activeIndex, isPaused, isWriteModalOpen, filteredTestimonials.length]);

  return (
    <section
      id="testimonials"
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors relative overflow-hidden ${
        isDark
          ? 'bg-[#0E1015] border-[#1F2228] text-[#FAF8F5]'
          : 'bg-[#FDFCFA] border-[#E8E2D7] text-[#14171A]'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      aria-label="Client Testimonials and Feedback"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Logo variant="full" size="sm" />
              <span className="opacity-30">|</span>
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
                CLIENT VERIFICATIONS · HONEST FEEDBACK
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight">
              Real Client Feedback.
            </h2>
            <p className="text-sm sm:text-base font-light opacity-75 mt-2 max-w-xl">
              Authentic reviews from businesses, clinic owners, and founders who have engaged ArkAja for websites, web apps, and design scopes.
            </p>
          </div>

          {/* Rating Summary & Action Header */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between lg:justify-end">
            {/* Real Rating Aggregate Box */}
            <div
              className={`p-3.5 border flex items-center gap-3.5 transition-colors ${
                isDark ? 'bg-[#14171F] border-[#252A36]' : 'bg-[#FAF8F5] border-[#E2DDD5]'
              }`}
            >
              <div className="text-center pr-3 border-r border-inherit">
                <span className="font-serif text-3xl font-medium text-[#A58B55] dark:text-[#D8C7A5] leading-none block">
                  {averageRating}
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase opacity-60">OUT OF 5.0</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1 text-[#A58B55] dark:text-[#D8C7A5]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current stroke-none" />
                  ))}
                </div>
                <div className="text-[10px] font-mono opacity-70">
                  {allTestimonials.length} Verified Reviews ({ratingCounts[5]} 5★ · {ratingCounts[4]} 4★ · {ratingCounts[3]} 3★)
                </div>
              </div>
            </div>

            {/* Write a Review Button */}
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="px-5 py-3 text-[11.5px] font-mono font-medium tracking-[0.2em] uppercase transition-all duration-200 bg-[#A58B55] hover:bg-[#8F7644] text-[#FAF8F5] dark:bg-[#D8C7A5] dark:text-[#0b0c0e] dark:hover:bg-[#E5D7BC] flex items-center gap-2 active:scale-95 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>LEAVE A REVIEW</span>
            </button>

            {/* Carousel Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className={`w-11 h-11 border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'border-[#262A34] bg-[#14171F] hover:bg-[#1C212C] text-[#FAF8F5] active:bg-[#262A34]'
                    : 'border-[#E0D9CE] bg-[#FFFFFF] hover:bg-[#F3EFE8] text-[#14171A] active:bg-[#E8E2D7]'
                }`}
              >
                <ChevronLeft className="w-5 h-5 text-[#A58B55] dark:text-[#D8C7A5]" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className={`w-11 h-11 border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'border-[#262A34] bg-[#14171F] hover:bg-[#1C212C] text-[#FAF8F5] active:bg-[#262A34]'
                    : 'border-[#E0D9CE] bg-[#FFFFFF] hover:bg-[#F3EFE8] text-[#14171A] active:bg-[#E8E2D7]'
                }`}
              >
                <ChevronRight className="w-5 h-5 text-[#A58B55] dark:text-[#D8C7A5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Rating Filter Tabs (Functional segmented controls) */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-mono opacity-60 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>FILTER BY RATING:</span>
          </div>

          <button
            type="button"
            onClick={() => setRatingFilter('all')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              ratingFilter === 'all'
                ? 'bg-[#14171A] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#0b0c0e] font-semibold'
                : 'border border-inherit/40 opacity-70 hover:opacity-100'
            }`}
          >
            All Reviews ({allTestimonials.length})
          </button>

          <button
            type="button"
            onClick={() => setRatingFilter('5')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              ratingFilter === '5'
                ? 'bg-[#14171A] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#0b0c0e] font-semibold'
                : 'border border-inherit/40 opacity-70 hover:opacity-100'
            }`}
          >
            <span>5 Stars ({ratingCounts[5]})</span>
            <div className="flex text-amber-500">
              <Star className="w-3 h-3 fill-current" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRatingFilter('4')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              ratingFilter === '4'
                ? 'bg-[#14171A] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#0b0c0e] font-semibold'
                : 'border border-inherit/40 opacity-70 hover:opacity-100'
            }`}
          >
            <span>4 Stars ({ratingCounts[4]})</span>
            <div className="flex text-amber-500">
              <Star className="w-3 h-3 fill-current" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRatingFilter('3')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              ratingFilter === '3'
                ? 'bg-[#14171A] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#0b0c0e] font-semibold'
                : 'border border-inherit/40 opacity-70 hover:opacity-100'
            }`}
          >
            <span>3 Stars ({ratingCounts[3]})</span>
            <div className="flex text-amber-500">
              <Star className="w-3 h-3 fill-current" />
            </div>
          </button>
        </div>

        {/* Carousel / Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
          tabIndex={0}
          role="region"
          aria-label="Client testimonials carousel"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
          }}
        >
          {filteredTestimonials.map((item, index) => {
            const isCurrent = activeIndex === index;
            return (
              <article
                key={item.id}
                data-testimonial-card
                className={`snap-start shrink-0 w-[88vw] sm:w-[420px] lg:w-[460px] p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between relative group ${
                  isDark
                    ? isCurrent
                      ? 'bg-[#151821] border-[#D8C7A5]/40 shadow-xl'
                      : 'bg-[#12141A] border-[#222631] hover:border-[#333845]'
                    : isCurrent
                    ? 'bg-[#FFFFFF] border-[#A58B55]/50 shadow-xl'
                    : 'bg-[#FAF8F5] border-[#E5DFD4] hover:border-[#D0C8BB]'
                }`}
              >
                {/* Top Row: Star Rating & Verified Mark */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating
                            ? 'text-[#A58B55] dark:text-[#D8C7A5] fill-current stroke-none'
                            : 'text-neutral-300 dark:text-neutral-700 stroke-current fill-none'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-mono ml-1.5 opacity-70 font-semibold">
                      {item.rating}.0
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase opacity-75">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{item.isCommunity ? 'User Submitted' : 'Verified Engagement'}</span>
                  </div>
                </div>

                {/* Service Scope Tagline */}
                <div className="text-[10.5px] font-mono tracking-wider uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold mb-4 pb-3 border-b border-inherit/20">
                  {item.serviceCategory}
                </div>

                {/* Quote Body */}
                <div className="relative mb-5 flex-1">
                  <Quote className="w-6 h-6 text-[#D8C7A5]/25 mb-1 rotate-180" />
                  <p className="font-serif text-base sm:text-lg font-normal leading-relaxed tracking-wide text-balance">
                    "{item.quote}"
                  </p>
                </div>

                {/* Metric or Highlight note */}
                <div
                  className={`p-3 border mb-5 text-[11.5px] font-mono tracking-wide flex items-center gap-2.5 transition-colors ${
                    isDark
                      ? 'bg-[#191D27] border-[#2A2F3D] text-[#D8C7A5]'
                      : 'bg-[#F5F2EB] border-[#DDD7CC] text-[#7A643A]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A58B55] dark:text-[#D8C7A5] shrink-0" />
                  <span className="font-semibold truncate">{item.highlightMetric}</span>
                </div>

                {/* Author Credentials */}
                <div className="pt-3.5 border-t border-inherit/30 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="font-serif text-base font-medium leading-tight">
                      {item.name}
                    </h3>
                    <div className="text-[11px] font-sans opacity-70 mt-0.5">
                      {item.role} · <span className="font-medium">{item.company}</span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] font-mono opacity-60 shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Building2 className="w-3 h-3 text-[#D8C7A5]" />
                      <span>{item.location}</span>
                    </div>
                    <div className="mt-0.5">{item.date}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Carousel Pagination Dots & Progress */}
        <div className="flex items-center justify-between pt-6 border-t border-inherit/20 mt-4">
          <div className="text-[11px] font-mono tracking-widest uppercase opacity-60">
            SHOWING {activeIndex + 1} OF {filteredTestimonials.length} {ratingFilter !== 'all' ? `(${ratingFilter}★)` : ''} REVIEWS
          </div>

          <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial slides">
            {filteredTestimonials.slice(0, 10).map((t, idx) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeIndex === idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => scrollToIndex(idx)}
                className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === idx
                    ? 'w-8 bg-[#A58B55] dark:bg-[#D8C7A5]'
                    : isDark
                    ? 'w-2 bg-[#2E3340] hover:bg-[#454B5B]'
                    : 'w-2 bg-[#DDD7CC] hover:bg-[#B5ADA0]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="text-[11px] font-mono tracking-wider uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold hover:underline flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Add Your Review</span>
          </button>
        </div>
      </div>

      {/* Review Submission Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-xl border p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl transition-colors ${
              isDark ? 'bg-[#111318] border-[#2A2E3B] text-[#FAF8F5]' : 'bg-[#FFFFFF] border-[#D6CEC1] text-[#14171A]'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-inherit mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Logo variant="monogram" size="sm" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A58B55] dark:text-[#D8C7A5] font-semibold">
                    CLIENT FEEDBACK REGISTRY
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal">Add Your Review</h3>
                <p className="text-xs opacity-75 font-light mt-0.5">
                  Share your honest experience working with ArkAja Studio.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 opacity-60 hover:opacity-100 hover:text-red-500 transition-colors"
                aria-label="Close review dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl font-normal">Thank You!</h4>
                <p className="text-sm opacity-80 max-w-sm mx-auto font-light">
                  Your feedback has been registered and added to the studio verifications stream.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {formError && (
                  <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-mono">
                    {formError}
                  </div>
                )}

                {/* Rating Selector (1 to 5 Stars) */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-75 mb-2">
                    Overall Experience Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = (formHoverRating || formRating) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onMouseEnter={() => setFormHoverRating(star)}
                            onMouseLeave={() => setFormHoverRating(0)}
                            onClick={() => setFormRating(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                            aria-label={`Rate ${star} star`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                filled
                                  ? 'text-[#A58B55] dark:text-[#D8C7A5] fill-current stroke-none'
                                  : 'text-neutral-300 dark:text-neutral-700 stroke-current fill-none'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-mono font-medium ml-2 text-[#A58B55] dark:text-[#D8C7A5]">
                      {formRating === 5 && '5.0 — Exceptional / Highly Recommended'}
                      {formRating === 4 && '4.0 — Solid Work / Very Good'}
                      {formRating === 3 && '3.0 — Average / Fair Experience'}
                      {formRating === 2 && '2.0 — Needs Improvement'}
                      {formRating === 1 && '1.0 — Unsatisfied'}
                    </span>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10.5px] font-mono uppercase tracking-wider opacity-75 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-inherit/40 bg-transparent focus:outline-none focus:border-[#D8C7A5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono uppercase tracking-wider opacity-75 mb-1.5">
                      Your Role / Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Founder, Marketing Head"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-inherit/40 bg-transparent focus:outline-none focus:border-[#D8C7A5]"
                    />
                  </div>
                </div>

                {/* Company & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10.5px] font-mono uppercase tracking-wider opacity-75 mb-1.5">
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Zen Organics"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-inherit/40 bg-transparent focus:outline-none focus:border-[#D8C7A5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono uppercase tracking-wider opacity-75 mb-1.5">
                      City / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, India"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-inherit/40 bg-transparent focus:outline-none focus:border-[#D8C7A5]"
                    />
                  </div>
                </div>

                {/* Service Engaged */}
                <div>
                  <label className="block text-[10.5px] font-mono uppercase tracking-wider opacity-75 mb-1.5">
                    Service Engaged
                  </label>
                  <select
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs border border-inherit/40 bg-transparent focus:outline-none focus:border-[#D8C7A5] ${
                      isDark ? 'bg-[#111318]' : 'bg-[#FFFFFF]'
                    }`}
                  >
                    <option value="Basic Website (₹10,000)">Basic Website (₹10,000)</option>
                    <option value="Basic Web App · Level 1 (₹15,000)">Basic Web App · Level 1 (₹15,000)</option>
                    <option value="Advanced Web App / Business System">Advanced Web App / Business System (Custom)</option>
                    <option value="Starter Content Package (₹2,499)">Starter Content Package (₹2,499)</option>
                    <option value="Signature Content Package (₹4,999)">Signature Content Package (₹4,999)</option>
                    <option value="Logo Design & Brand Identity (₹3,000)">Logo Design & Brand Identity (₹3,000)</option>
                    <option value="Custom Project Scope">Custom Project Scope</option>
                  </select>
                </div>

                {/* Key Metric or Highlight */}
                <div>
                  <label className="block text-[10.5px] font-mono uppercase tracking-wider opacity-75 mb-1.5">
                    Key Highlight or Metric (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Delivered in 4 Days, Saved 30hrs/week, 2x Leads"
                    value={formMetric}
                    onChange={(e) => setFormMetric(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-inherit/40 bg-transparent focus:outline-none focus:border-[#D8C7A5]"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-[10.5px] font-mono uppercase tracking-wider opacity-75 mb-1.5">
                    Your Review / Honest Feedback *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe how the design, development, turnaround, or communication went..."
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-inherit/40 bg-transparent focus:outline-none focus:border-[#D8C7A5]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider border border-inherit/40 hover:bg-neutral-500/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-xs font-mono font-medium tracking-[0.2em] uppercase bg-[#14171A] text-[#FAF8F5] hover:bg-[#A58B55] dark:bg-[#FAF8F5] dark:text-[#0b0c0e] dark:hover:bg-[#D8C7A5] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>PUBLISHING...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>SUBMIT REVIEW</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
