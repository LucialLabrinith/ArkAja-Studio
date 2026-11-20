import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  MoveHorizontal,
  X,
  Layers,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RedesignDemoItem {
  id: 'cute' | 'professional';
  styleTag: string;
  title: string;
  url: string;
  beforeSrc: string;
  afterSrc: string;
  afterBg: string;
}

const REDESIGN_DEMOS: RedesignDemoItem[] = [
  {
    id: 'cute',
    styleTag: 'Cute & Playful',
    title: "Vera's Cake Shop",
    url: 'verascakeshop.in',
    beforeSrc: '/assets/redesign-demos/vera-before.png',
    afterSrc: '/assets/redesign-demos/vera-after.png',
    afterBg: '#FDF5F1',
  },
  {
    id: 'professional',
    styleTag: 'Modern & Professional',
    title: 'Nexora',
    url: 'nexora.io',
    beforeSrc: '/assets/redesign-demos/nexora-before.png',
    afterSrc: '/assets/redesign-demos/nexora-after.png',
    afterBg: '#F8F5FC',
  },
];

// Starts at 50/50 so both full Before and After websites immediately occupy the full-screen widget clearly
const INITIAL_POSITION = 50;

export const BeforeAfterSlider: React.FC = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [position, setPosition] = useState<number>(INITIAL_POSITION);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showPullHint, setShowPullHint] = useState<boolean>(true);
  const [viewportWidth, setViewportWidth] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeDemo = REDESIGN_DEMOS[activeIndex];

  // Measure live full-screen browser viewport width for crisp push-aside panes
  useEffect(() => {
    if (!isOpen) return;
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      setViewportWidth(el.clientWidth);
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, [isOpen, activeIndex]);

  const updatePositionFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const rawPercent = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, rawPercent));
    setPosition(clamped);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button[data-slider-action]')) {
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setShowPullHint(false);
    setIsDragging(true);
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  // Smooth one-click arrow actions (effortless on laptop trackpads)
  const slideToAfter = useCallback(() => {
    setShowPullHint(false);
    setIsDragging(false);
    setPosition(0);
  }, []);

  const slideToBefore = useCallback(() => {
    setShowPullHint(false);
    setIsDragging(false);
    setPosition(100);
  }, []);

  const slideToSplit = useCallback(() => {
    setShowPullHint(false);
    setIsDragging(false);
    setPosition(50);
  }, []);

  const handleLeftArrowClick = useCallback(() => {
    setShowPullHint(false);
    setIsDragging(false);
    setPosition((prev) => (prev > 60 ? 50 : 0));
  }, []);

  const handleRightArrowClick = useCallback(() => {
    setShowPullHint(false);
    setIsDragging(false);
    setPosition((prev) => (prev < 40 ? 50 : 100));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleLeftArrowClick();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleRightArrowClick();
    } else if (e.key === 'Home') {
      e.preventDefault();
      slideToAfter();
    } else if (e.key === 'End') {
      e.preventDefault();
      slideToBefore();
    }
  };

  const handleSwitchDemo = (idx: number) => {
    setActiveIndex(idx);
    setPosition(INITIAL_POSITION);
    setShowPullHint(true);
  };

  const openDemoAt = (idx: number) => {
    setActiveIndex(idx);
    setPosition(INITIAL_POSITION);
    setShowPullHint(true);
    setIsOpen(true);
  };

  // Lock body scroll & support Escape to close while full-screen demo is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onEsc);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isOpen]);

  const panelTransition = isDragging
    ? 'none'
    : 'width 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
  const handleTransition = isDragging
    ? 'none'
    : 'left 0.55s cubic-bezier(0.22, 1, 0.36, 1)';

  // On desktop/tablet (>=640px), each pane's minimum inner width is 50% of the full viewport so
  // both pics fit 100% side-by-side at 50/50 and cleanly push off-screen without squishing when dragged.
  // On mobile (<640px), keep minWidth at 100% so each full mobile-width screen pushes cleanly aside.
  const isMobileViewport = viewportWidth > 0 && viewportWidth < 640;
  const paneMinWidth = viewportWidth
    ? `${Math.round(isMobileViewport ? viewportWidth : viewportWidth * 0.5)}px`
    : '50%';

  const beforeDimOpacity =
    position < 28 ? Math.min(0.42, ((28 - position) / 28) * 0.42) : 0;
  const afterDimOpacity =
    100 - position < 28 ? Math.min(0.42, ((28 - (100 - position)) / 28) * 0.42) : 0;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-3.5 md:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Before and After Website Redesign Demo"
        >
          {/* Dimmed Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* FULL-SCREEN COMPARISON WIDGET (occupies ~97% width x ~95% height of screen) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full h-full flex flex-col border overflow-hidden shadow-[0_32px_100px_-20px_rgba(0,0,0,0.9)] ${
              isDark
                ? 'bg-[#0e1014] border-white/[0.15] text-[#FAF8F5]'
                : 'bg-[#FFFFFF] border-[#14171A]/[0.15] text-[#14171A]'
            }`}
          >
            {/* 1. Slim Top Control Bar: Style Switcher + One-Click View Controls + Close */}
            <div
              className={`px-3 sm:px-5 py-2 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 ${
                isDark
                  ? 'border-white/[0.09] bg-[#12151B]'
                  : 'border-[#14171A]/[0.09] bg-[#FAF8F5]'
              }`}
            >
              {/* Style Switcher Tabs */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {REDESIGN_DEMOS.map((demo, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleSwitchDemo(idx)}
                      className={`px-2.5 sm:px-3.5 py-1.5 text-[10px] sm:text-[10.5px] font-mono tracking-[0.12em] uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? isDark
                            ? 'bg-[#FAF8F5] text-[#0b0c0e] border-[#FAF8F5] font-semibold'
                            : 'bg-[#14171A] text-[#FAF8F5] border-[#14171A] font-semibold'
                          : isDark
                          ? 'bg-[#161922] text-[#B4B7BF] border-white/[0.10] hover:border-[#D8C7A5]/60 hover:text-[#FAF8F5]'
                          : 'bg-[#FFFFFF] text-[#555B66] border-[#14171A]/[0.12] hover:border-[#8C6E33]/60 hover:text-[#14171A]'
                      }`}
                    >
                      <span>0{idx + 1} · {demo.styleTag}</span>
                      <span className="hidden md:inline opacity-70">({demo.title})</span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Quick Compare Buttons + Close */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                <div className="hidden sm:flex items-center gap-1.5 mr-1">
                  <button
                    type="button"
                    onClick={slideToBefore}
                    className={`px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                      position >= 85
                        ? isDark
                          ? 'border-[#D8C7A5] text-[#D8C7A5] bg-[#D8C7A5]/15 font-semibold'
                          : 'border-[#8C6E33] text-[#7A5E29] bg-[#8C6E33]/15 font-semibold'
                        : isDark
                        ? 'border-white/15 text-[#B4B7BF] hover:text-white'
                        : 'border-[#14171A]/15 text-[#555B66] hover:text-[#14171A] bg-white'
                    }`}
                  >
                    <span>Full Before</span>
                  </button>
                  <button
                    type="button"
                    onClick={slideToSplit}
                    className={`px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                      position > 15 && position < 85
                        ? isDark
                          ? 'border-[#D8C7A5] text-[#D8C7A5] bg-[#D8C7A5]/15 font-semibold'
                          : 'border-[#8C6E33] text-[#7A5E29] bg-[#8C6E33]/15 font-semibold'
                        : isDark
                        ? 'border-white/15 text-[#B4B7BF] hover:text-white'
                        : 'border-[#14171A]/15 text-[#555B66] hover:text-[#14171A] bg-white'
                    }`}
                  >
                    50 / 50 Split
                  </button>
                  <button
                    type="button"
                    onClick={slideToAfter}
                    className={`px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                      position <= 15
                        ? isDark
                          ? 'border-[#D8C7A5] text-[#D8C7A5] bg-[#D8C7A5]/15 font-semibold'
                          : 'border-[#8C6E33] text-[#7A5E29] bg-[#8C6E33]/15 font-semibold'
                        : isDark
                        ? 'border-white/15 text-[#B4B7BF] hover:text-white'
                        : 'border-[#14171A]/15 text-[#555B66] hover:text-[#14171A] bg-white'
                    }`}
                  >
                    <span>Full After</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`px-2.5 py-1.5 border transition-colors inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.16em] uppercase shrink-0 cursor-pointer ${
                    isDark
                      ? 'border-white/[0.18] text-[#FAF8F5] hover:border-[#D8C7A5] bg-white/[0.05]'
                      : 'border-[#14171A]/[0.18] text-[#14171A] hover:border-[#8C6E33] bg-white'
                  }`}
                  aria-label="Close Before and After Demo"
                >
                  <span className="hidden sm:inline">CLOSE</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Slim Authentic Browser Chrome Bar */}
            <div
              className={`px-3 sm:px-5 py-1.5 border-b flex items-center justify-between gap-2 shrink-0 ${
                isDark
                  ? 'bg-[#1a1d24] border-white/[0.08]'
                  : 'bg-[#EFECE6] border-[#14171A]/[0.10]'
              }`}
            >
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <span
                  className={`hidden md:inline text-[9.5px] font-mono tracking-[0.18em] uppercase font-semibold ${
                    isDark ? 'text-[#9EA4B0]' : 'text-[#555B66]'
                  }`}
                >
                  BEFORE · GENERIC LAYOUT
                </span>
              </div>

              <div
                className={`flex-1 max-w-md mx-auto px-3 py-0.5 rounded text-[10px] sm:text-[10.5px] font-mono flex items-center justify-center gap-1.5 truncate ${
                  isDark
                    ? 'bg-[#0e1014] text-[#C5CAD5] border border-white/[0.08]'
                    : 'bg-[#FFFFFF] text-[#3F4550] border border-[#14171A]/[0.10]'
                }`}
              >
                <Lock className="w-2.5 h-2.5 opacity-60 shrink-0" />
                <span className="truncate">https://{activeDemo.url}</span>
              </div>

              <span
                className={`hidden md:inline text-[9.5px] font-mono tracking-[0.18em] uppercase font-semibold shrink-0 ${
                  isDark ? 'text-[#D8C7A5]' : 'text-[#8C6E33]'
                }`}
              >
                AFTER · ARKAJA REDESIGN
              </span>
            </div>

            {/* ================================================================ */}
            {/* 3. FULL-SCREEN PUSH-ASIDE VIEWPORT (100% WIDTH x FULL HEIGHT)    */}
            {/* ================================================================ */}
            <div
              ref={containerRef}
              role="slider"
              tabIndex={0}
              aria-label={`${activeDemo.title} Before and After website comparison slider`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(position)}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={handleKeyDown}
              className="relative flex-1 min-h-0 w-full overflow-hidden flex select-none touch-none cursor-ew-resize focus:outline-none"
            >
              {/* ------------------------------------------------------------ */}
              {/* LEFT PANE: BEFORE WEBSITE — fills left half, pushes aside    */}
              {/* ------------------------------------------------------------ */}
              <div
                className="relative h-full overflow-hidden shrink-0 bg-white"
                style={{ width: `${position}%`, transition: panelTransition }}
              >
                <div
                  className="absolute top-0 right-0 bottom-0 bg-white flex items-center justify-center p-2 sm:p-4"
                  style={{ minWidth: paneMinWidth, width: '100%' }}
                >
                  <img
                    key={`${activeDemo.id}-before`}
                    src={activeDemo.beforeSrc}
                    alt={`${activeDemo.title} — Before generic website`}
                    draggable={false}
                    className="w-full h-full object-contain object-center block select-none pointer-events-none"
                  />

                  {/* Subtle corner label */}
                  <div className="pointer-events-none absolute bottom-3 left-3 px-2.5 py-1 bg-[#14171A]/85 text-white text-[9.5px] font-mono tracking-[0.15em] uppercase font-semibold shadow-sm">
                    BEFORE · GENERIC
                  </div>

                  {/* Gentle dim scrim when pushed off-screen */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-150"
                    style={{ opacity: beforeDimOpacity }}
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* RIGHT PANE: AFTER WEBSITE — fills right half, pushes aside   */}
              {/* ------------------------------------------------------------ */}
              <div
                className="relative h-full overflow-hidden shrink-0"
                style={{
                  width: `${100 - position}%`,
                  transition: panelTransition,
                  backgroundColor: activeDemo.afterBg,
                }}
              >
                <div
                  className="absolute top-0 left-0 bottom-0 flex items-center justify-center p-1 sm:p-2"
                  style={{
                    minWidth: paneMinWidth,
                    width: '100%',
                    backgroundColor: activeDemo.afterBg,
                  }}
                >
                  <img
                    key={`${activeDemo.id}-after`}
                    src={activeDemo.afterSrc}
                    alt={`${activeDemo.title} — After ArkAja Studio redesign`}
                    draggable={false}
                    className="w-full h-full object-contain object-center block select-none pointer-events-none"
                  />

                  {/* Subtle corner label */}
                  <div className="pointer-events-none absolute bottom-3 right-3 px-2.5 py-1 bg-[#14171A]/85 text-[#D8C7A5] border border-[#D8C7A5]/45 text-[9.5px] font-mono tracking-[0.15em] uppercase font-semibold shadow-sm">
                    AFTER · ARKAJA REDESIGN
                  </div>

                  {/* Gentle dim scrim when pushed off-screen */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-150"
                    style={{ opacity: afterDimOpacity }}
                  />
                </div>
              </div>

              {/* ============================================================ */}
              {/* VERTICAL DIVIDER + CLICKABLE ARROW HANDLE + FLOATING HINT    */}
              {/* ============================================================ */}
              <div
                className="pointer-events-none absolute top-0 bottom-0 z-20 -translate-x-1/2"
                style={{ left: `${position}%`, transition: handleTransition }}
              >
                {/* Crisp Gold Vertical Line */}
                <div
                  className={`h-full w-[3px] shadow-[0_0_20px_rgba(0,0,0,0.55)] ${
                    isDark ? 'bg-[#D8C7A5]' : 'bg-[#8C6E33]'
                  }`}
                />

                {/* Clickable 3-Zone Arrow Pill Handle (unclipped at 0% and 100%) */}
                <div
                  className={`pointer-events-auto absolute top-1/2 -translate-y-1/2 flex items-center rounded-full border-2 transition-transform duration-150 overflow-hidden ${
                    position < 8
                      ? 'left-2 translate-x-0'
                      : position > 92
                      ? 'right-2 translate-x-0'
                      : 'left-1/2 -translate-x-1/2'
                  } ${isDragging ? 'scale-105' : 'scale-100'} ${
                    isDark
                      ? 'bg-[#0b0c0e] border-[#D8C7A5] text-[#D8C7A5] shadow-[0_12px_32px_rgba(0,0,0,0.9)]'
                      : 'bg-[#FAF8F5] border-[#8C6E33] text-[#8C6E33] shadow-[0_12px_30px_rgba(20,23,26,0.38)]'
                  }`}
                >
                  {/* Click Left Arrow -> Push Before aside & expand After */}
                  <button
                    type="button"
                    data-slider-action="left"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeftArrowClick();
                    }}
                    title="Click to slide left and expand After Redesign"
                    aria-label="Slide left to expand After Redesign"
                    className={`w-10 h-11 flex items-center justify-center transition-colors cursor-pointer ${
                      isDark
                        ? 'hover:bg-[#D8C7A5] hover:text-[#0b0c0e]'
                        : 'hover:bg-[#8C6E33] hover:text-[#FAF8F5]'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Center Drag Grip */}
                  <div
                    title="Drag left or right"
                    className={`w-8 h-11 flex items-center justify-center border-x cursor-ew-resize ${
                      isDark
                        ? 'border-[#D8C7A5]/25 text-[#D8C7A5]/80'
                        : 'border-[#8C6E33]/25 text-[#8C6E33]/80'
                    }`}
                  >
                    <MoveHorizontal className="w-4 h-4" />
                  </div>

                  {/* Click Right Arrow -> Push After aside & expand Before */}
                  <button
                    type="button"
                    data-slider-action="right"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRightArrowClick();
                    }}
                    title="Click to slide right and expand Before Layout"
                    aria-label="Slide right to expand Before Layout"
                    className={`w-10 h-11 flex items-center justify-center transition-colors cursor-pointer ${
                      isDark
                        ? 'hover:bg-[#D8C7A5] hover:text-[#0b0c0e]'
                        : 'hover:bg-[#8C6E33] hover:text-[#FAF8F5]'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Clickable Animated Floating Prompt Tooltip */}
                <AnimatePresence>
                  {showPullHint && (
                    <motion.button
                      type="button"
                      data-slider-action="reveal"
                      onClick={(e) => {
                        e.stopPropagation();
                        slideToAfter();
                      }}
                      initial={{ opacity: 0, y: 10, scale: 0.94 }}
                      animate={{
                        opacity: 1,
                        y: [0, -5, 0],
                        scale: 1,
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        opacity: { duration: 0.25 },
                        scale: { duration: 0.25 },
                        y: {
                          repeat: Infinity,
                          duration: 1.8,
                          ease: 'easeInOut',
                          delay: 0.25,
                        },
                      }}
                      className="pointer-events-auto cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -mt-[72px] whitespace-nowrap z-30 group"
                    >
                      <div
                        className={`relative px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-mono tracking-[0.12em] uppercase font-bold flex items-center gap-2 shadow-[0_12px_30px_rgba(0,0,0,0.45)] border transition-transform group-hover:scale-105 ${
                          isDark
                            ? 'bg-[#D8C7A5] text-[#0b0c0e] border-[#FAF8F5]/40'
                            : 'bg-[#14171A] text-[#FAF8F5] border-[#8C6E33]/60'
                        }`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                        <span>Click arrows or drag to slide</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        <span
                          className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                            isDark ? 'bg-[#D8C7A5]' : 'bg-[#14171A]'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 4. Mobile Bottom Quick Controls Bar */}
            <div
              className={`sm:hidden px-3 py-2 border-t flex items-center justify-between gap-2 text-[10px] font-mono shrink-0 ${
                isDark
                  ? 'border-white/[0.08] bg-[#12151B] text-[#9EA4B0]'
                  : 'border-[#14171A]/[0.08] bg-[#FAF8F5] text-[#555B66]'
              }`}
            >
              <button
                type="button"
                onClick={slideToBefore}
                className={`flex-1 py-1.5 border uppercase text-center cursor-pointer ${
                  position >= 85
                    ? isDark
                      ? 'border-[#D8C7A5] text-[#D8C7A5] bg-[#D8C7A5]/15 font-semibold'
                      : 'border-[#8C6E33] text-[#7A5E29] bg-[#8C6E33]/15 font-semibold'
                    : 'border-current/20 opacity-80'
                }`}
              >
                Full Before
              </button>
              <button
                type="button"
                onClick={slideToSplit}
                className={`flex-1 py-1.5 border uppercase text-center cursor-pointer ${
                  position > 15 && position < 85
                    ? isDark
                      ? 'border-[#D8C7A5] text-[#D8C7A5] bg-[#D8C7A5]/15 font-semibold'
                      : 'border-[#8C6E33] text-[#7A5E29] bg-[#8C6E33]/15 font-semibold'
                    : 'border-current/20 opacity-80'
                }`}
              >
                50 / 50
              </button>
              <button
                type="button"
                onClick={slideToAfter}
                className={`flex-1 py-1.5 border uppercase text-center cursor-pointer ${
                  position <= 15
                    ? isDark
                      ? 'border-[#D8C7A5] text-[#D8C7A5] bg-[#D8C7A5]/15 font-semibold'
                      : 'border-[#8C6E33] text-[#7A5E29] bg-[#8C6E33]/15 font-semibold'
                    : 'border-current/20 opacity-80'
                }`}
              >
                Full After
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Clean Full-Width Trigger Card inside Selected Work (opens layered full-screen demo on click) */}
      <div
        className={`mt-14 border transition-all duration-300 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
          isDark
            ? 'bg-[#111317] border-white/[0.10] hover:border-[#D8C7A5]/50 shadow-[0_14px_38px_-16px_rgba(0,0,0,0.6)]'
            : 'bg-[#FFFFFF] border-[#14171A]/[0.10] hover:border-[#8C6E33]/50 shadow-[0_1px_2px_rgba(20,23,26,0.03),0_14px_34px_-16px_rgba(20,23,26,0.10)]'
        }`}
      >
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2">
            <Layers
              className={`w-3.5 h-3.5 ${isDark ? 'text-[#D8C7A5]' : 'text-[#8C6E33]'}`}
            />
            <span
              className={`text-[10px] font-mono tracking-[0.24em] uppercase font-semibold ${
                isDark ? 'text-[#D8C7A5]' : 'text-[#8C6E33]'
              }`}
            >
              INTERACTIVE PREVIEW · WEBSITE REDESIGNS
            </span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
            Before &amp; After Website Redesign Demos
          </h3>
          <p
            className={`font-sans text-xs sm:text-sm font-light leading-relaxed ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            Click to launch our interactive comparison showcase across two distinct aesthetics —{' '}
            <span className={isDark ? 'text-[#FAF8F5] font-normal' : 'text-[#14171A] font-normal'}>
              Cute &amp; Playful (Vera&rsquo;s Cake Shop)
            </span>{' '}
            and{' '}
            <span className={isDark ? 'text-[#FAF8F5] font-normal' : 'text-[#14171A] font-normal'}>
              Modern &amp; Professional (Nexora)
            </span>
            .
          </p>
        </div>

        {/* Crisp Visual Preview Thumbnails + Show Demo CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            {REDESIGN_DEMOS.map((demo, idx) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => openDemoAt(idx)}
                className={`group relative w-24 sm:w-28 h-20 border overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 ${
                  isDark
                    ? 'border-white/[0.14] hover:border-[#D8C7A5] bg-[#171A21]'
                    : 'border-[#14171A]/[0.14] hover:border-[#8C6E33] bg-[#FAF8F5]'
                }`}
                title={`Preview ${demo.title} (${demo.styleTag})`}
              >
                <img
                  src={demo.afterSrc}
                  alt={`${demo.title} redesign preview`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 px-1.5 py-0.5 bg-black/75 text-[8.5px] font-mono tracking-wider uppercase text-[#FAF8F5] truncate text-left">
                  0{idx + 1} · {demo.title}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openDemoAt(0)}
            className={`px-6 py-3.5 text-[11px] font-mono tracking-[0.2em] uppercase font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-[#FAF8F5] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                : 'bg-[#14171A] text-[#FAF8F5] hover:bg-[#8C6E33]'
            }`}
          >
            <MoveHorizontal className="w-4 h-4" />
            <span>SHOW DEMO</span>
          </button>
        </div>
      </div>

      {/* Render layered full-screen modal directly in document.body */}
      {typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null}
    </>
  );
};
