import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Project } from '../types';
import { useTheme } from '../context/ThemeContext';
import { getEmbeddedAsset } from '../data/embeddedAssets';
import { Logo } from './Logo';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpRight,
  MoveHorizontal,
  Check,
  Target,
  Layers,
} from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  allProjects: Project[];
  uploadedAssets: Record<string, string[]>;
  onClose: () => void;
  onSelectProject: (p: Project) => void;
  onStartProject: () => void;
  onAssetUploaded: (slug: string, url: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  allProjects,
  uploadedAssets,
  onClose,
  onSelectProject,
  onStartProject,
}) => {
  const { isDark } = useTheme();

  // Gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Swipe / Drag state for preview gallery & lightbox
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const drawerScrollRef = useRef<HTMLDivElement>(null);

  // Reset gallery state & scroll drawer to top when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsLightboxOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setSwipeOffset(0);
    if (drawerScrollRef.current) {
      drawerScrollRef.current.scrollTop = 0;
    }
  }, [project?.id]);

  // Reset zoom & pan when image changes in lightbox
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [currentImageIndex]);

  // Combine project images with any user uploads for this project slug
  const projectUploads = project ? uploadedAssets[project.slug] || [] : [];
  const rawImages = project ? [...project.images, ...projectUploads] : [];
  const allImages = rawImages.map((img) => getEmbeddedAsset(img) || img);
  const hasImages = allImages.length > 0;

  // Previous & Next Project Navigation
  const currentIndex = project ? allProjects.findIndex((p) => p.id === project.id) : -1;
  const prevProject =
    currentIndex > 0 ? allProjects[currentIndex - 1] : allProjects[allProjects.length - 1];
  const nextProject =
    currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : allProjects[0];

  const handleNextImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [hasImages, allImages.length]);

  const handlePrevImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [hasImages, allImages.length]);

  // Keyboard navigation (active only when drawer is open)
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
          setZoomLevel(1);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (isLightboxOpen) {
        if (e.key === '+' || e.key === '=') {
          setZoomLevel((z) => Math.min(3, +(z + 0.5).toFixed(1)));
        } else if (e.key === '-' || e.key === '_') {
          setZoomLevel((z) => Math.max(1, +(z - 0.5).toFixed(1)));
        } else if (e.key === '0') {
          setZoomLevel(1);
          setPanPosition({ x: 0, y: 0 });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, isLightboxOpen, onClose, handleNextImage, handlePrevImage]);

  // Lock background scroll while drawer is open
  useEffect(() => {
    if (!project) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [project]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomLevel === 1) {
      setIsDragging(true);
      setDragStartX(e.touches[0].clientX);
      setDragStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomLevel > 1) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    const deltaY = e.touches[0].clientY - dragStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY) * 0.8) {
      setSwipeOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (swipeOffset < -45) handleNextImage();
    else if (swipeOffset > 45) handlePrevImage();
    setSwipeOffset(0);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel === 1) {
      setIsDragging(true);
      setDragStartX(e.clientX);
      setSwipeOffset(0);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel === 1) {
      setSwipeOffset(e.clientX - dragStartX);
    } else if (isPanning && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (swipeOffset < -45) handleNextImage();
      else if (swipeOffset > 45) handlePrevImage();
      setSwipeOffset(0);
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const handleImgFallback = (e: React.SyntheticEvent<HTMLImageElement>, srcHint: string) => {
    const target = e.currentTarget;
    if (!target.dataset.fallbackApplied) {
      target.dataset.fallbackApplied = 'true';
      const currentSrc = target.src || srcHint || '';
      const clean = currentSrc.split('/').pop()?.split('?')[0] || '';
      const embedded = getEmbeddedAsset(clean);
      if (embedded) {
        target.src = embedded;
        return;
      }
      const slugMatch = clean.match(/^([a-z0-9]+-[a-z0-9]+-\d+|[a-z0-9]+-\d+)/i);
      const slug = slugMatch ? slugMatch[1] : clean.replace(/\.[^/.]+$/, '');
      if (slug) {
        target.src = `/assets/portfolio/${slug}.webp`;
      }
    }
  };

  const activeDirection =
    project?.creativeDirections && project.creativeDirections[currentImageIndex]
      ? project.creativeDirections[currentImageIndex]
      : project?.creativeDirections?.[0];

  const accentText = isDark ? 'text-[#D8C7A5]' : 'text-[#8C6E33]';

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="case-study-drawer-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} case study drawer`}
        >
          {/* Dimmed Frosted Backdrop — clicking returns directly to the main page */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Sleek Right-Side Slide-Over Case Study Drawer */}
          <motion.aside
            key={project.id}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full sm:w-[92vw] sm:max-w-[600px] lg:max-w-[660px] h-full flex flex-col border-l shadow-[0_24px_80px_-16px_rgba(0,0,0,0.7)] transition-colors ${
              isDark
                ? 'bg-[#0d0f13] border-white/[0.10] text-[#F3F1EC]'
                : 'bg-[#FAF8F5] border-[#14171A]/[0.10] text-[#14171A]'
            }`}
          >
            {/* 1. Sticky Frosted Drawer Top Header with Prominent 'X' Close Button */}
            <div
              className={`shrink-0 z-30 flex items-center justify-between px-5 sm:px-6 py-4 border-b backdrop-blur-xl ${
                isDark
                  ? 'border-white/[0.08] bg-[#0d0f13]/90'
                  : 'border-[#14171A]/[0.08] bg-[#FAF8F5]/95'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Logo variant="monogram" size="sm" />
                <span className="opacity-30">|</span>
                <span
                  className={`text-[10px] tracking-[0.24em] uppercase font-semibold font-mono truncate ${accentText}`}
                >
                  CASE STUDY · {project.category}
                </span>
                <span className="hidden sm:inline opacity-35">·</span>
                <span className="hidden sm:inline text-[10px] tracking-[0.18em] uppercase opacity-65 font-mono">
                  {project.year}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`px-2.5 py-2 border transition-colors inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.18em] uppercase cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#A58B55] ${
                  isDark
                    ? 'border-white/[0.16] text-[#FAF8F5] hover:border-[#D8C7A5] bg-white/[0.04]'
                    : 'border-[#14171A]/[0.18] text-[#14171A] hover:border-[#8C6E33] bg-white'
                }`}
                aria-label="Close Case Study Drawer"
              >
                <span className="hidden sm:inline">CLOSE</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Scrollable Case Study Content Body */}
            <div
              ref={drawerScrollRef}
              className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 sm:py-7 space-y-6"
            >
              {/* Project Title, Tagline & Palette Swatches */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono tracking-[0.22em] uppercase opacity-60">
                    {project.label}
                  </span>
                  {project.colorPalette && project.colorPalette.length > 0 && (
                    <div className="flex items-center gap-1.5" title="Color Palette">
                      {project.colorPalette.map((hex) => (
                        <span
                          key={hex}
                          className={`w-3.5 h-3.5 rounded-full border ${
                            isDark ? 'border-white/20' : 'border-black/15'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight leading-tight">
                  {project.title}
                </h2>
                {project.tagline && (
                  <p className={`font-serif italic text-base sm:text-lg mt-1 ${accentText}`}>
                    {project.tagline}
                  </p>
                )}
              </div>

              {/* Larger Interactive Preview Stage */}
              <div
                className={`relative border select-none overflow-hidden shadow-[0_10px_30px_-14px_rgba(0,0,0,0.28)] ${
                  isDark ? 'bg-[#121418] border-white/[0.09]' : 'bg-[#FFFFFF] border-[#14171A]/[0.10]'
                }`}
              >
                {hasImages ? (
                  <div
                    className="relative aspect-[16/10] w-full flex items-center justify-center bg-black overflow-hidden group cursor-grab active:cursor-grabbing select-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* Slide Stage */}
                    <div
                      className="w-full h-full flex items-center justify-center select-none"
                      style={{
                        transform: `translateX(${swipeOffset}px)`,
                        transition: isDragging
                          ? 'none'
                          : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      }}
                    >
                      {allImages[currentImageIndex]?.toLowerCase().endsWith('.pdf') ? (
                        <iframe
                          src={allImages[currentImageIndex]}
                          title={`${project.title} - Document ${currentImageIndex + 1}`}
                          className="w-full h-full border-0 pointer-events-auto bg-white"
                        />
                      ) : (
                        <img
                          src={allImages[currentImageIndex]}
                          alt={`${project.title} - Visual ${currentImageIndex + 1}`}
                          referrerPolicy="no-referrer"
                          draggable={false}
                          className="w-full h-full object-contain"
                          onError={(e) => handleImgFallback(e, allImages[currentImageIndex])}
                        />
                      )}
                    </div>

                    {/* Studio Stamp */}
                    <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-[#D8C7A5]/35 text-[9.5px] font-mono tracking-widest text-[#D8C7A5]">
                      <Logo variant="monogram" size="sm" className="scale-75 origin-left" />
                      <span className="font-semibold">ARKAJA</span>
                    </div>

                    {/* Prev / Next Visual Controls */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevImage();
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black text-white rounded-full transition-all border border-white/20 z-10 cursor-pointer"
                          aria-label="Previous Preview"
                        >
                          <ChevronLeft className="w-4 h-4 text-[#D8C7A5]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextImage();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black text-white rounded-full transition-all border border-white/20 z-10 cursor-pointer"
                          aria-label="Next Preview"
                        >
                          <ChevronRight className="w-4 h-4 text-[#D8C7A5]" />
                        </button>

                        {/* Counter */}
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-widest text-[#FAF8F5] z-10">
                          <span className="text-[#D8C7A5] font-semibold">
                            {String(currentImageIndex + 1).padStart(2, '0')}
                          </span>
                          <span className="opacity-45 mx-1">/</span>
                          <span className="opacity-75">
                            {String(allImages.length).padStart(2, '0')}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Expand Fullscreen Lightbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      className="absolute top-3 right-3 px-2.5 py-1.5 bg-black/75 hover:bg-black text-[#FAF8F5] hover:text-[#D8C7A5] border border-white/20 backdrop-blur-md transition-colors flex items-center gap-1.5 text-[10px] font-mono tracking-wider z-10 cursor-pointer"
                      aria-label="Expand Fullscreen Preview"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">EXPAND</span>
                    </button>

                    {/* Subtle Swipe Hint */}
                    {allImages.length > 1 && (
                      <div className="absolute top-3 left-3 pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm text-[9px] font-mono uppercase tracking-widest text-[#D8C7A5]">
                        <MoveHorizontal className="w-3 h-3" />
                        <span>Swipe</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <span className="font-serif text-xl">No preview visuals available</span>
                  </div>
                )}

                {/* Compact Thumbnail Switcher Strip */}
                {allImages.length > 1 && (
                  <div
                    className={`p-3 border-t flex items-center gap-2.5 overflow-x-auto ${
                      isDark
                        ? 'border-white/[0.08] bg-[#101217]'
                        : 'border-[#14171A]/[0.08] bg-[#FAF8F5]'
                    }`}
                  >
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-20 h-14 shrink-0 border overflow-hidden transition-all cursor-pointer ${
                          idx === currentImageIndex
                            ? isDark
                              ? 'border-[#D8C7A5] ring-1 ring-[#D8C7A5]'
                              : 'border-[#8C6E33] ring-1 ring-[#8C6E33]'
                            : 'border-transparent opacity-55 hover:opacity-100'
                        }`}
                        aria-label={`Preview visual ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImgFallback(e, img)}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Goal Card */}
              <div
                className={`p-5 sm:p-6 border ${
                  isDark
                    ? 'bg-[#12151B] border-white/[0.09]'
                    : 'bg-[#FFFFFF] border-[#14171A]/[0.09]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Target className={`w-3.5 h-3.5 ${accentText}`} />
                  <span
                    className={`text-[10px] font-mono tracking-[0.24em] uppercase font-semibold ${accentText}`}
                  >
                    PROJECT GOAL
                  </span>
                </div>
                <p
                  className={`font-sans text-sm font-light leading-relaxed ${
                    isDark ? 'text-[#D0D4DD]' : 'text-[#3F4550]'
                  }`}
                >
                  {project.description}
                </p>
                {activeDirection && (
                  <div
                    className={`mt-4 pt-3.5 border-t text-xs ${
                      isDark ? 'border-white/[0.08]' : 'border-[#14171A]/[0.08]'
                    }`}
                  >
                    <span
                      className={`text-[9.5px] font-mono tracking-[0.2em] uppercase font-semibold block mb-1 ${accentText}`}
                    >
                      VIEWING FRAME 0{currentImageIndex + 1} · {activeDirection.format}
                    </span>
                    <span className="font-medium">{activeDirection.title}</span>
                    {activeDirection.description && (
                      <span className={isDark ? 'text-[#9EA4B0]' : 'text-[#555B66]'}>
                        {' '}
                        — {activeDirection.description}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Deliverables Card */}
              <div
                className={`p-5 sm:p-6 border ${
                  isDark
                    ? 'bg-[#12151B] border-white/[0.09]'
                    : 'bg-[#FFFFFF] border-[#14171A]/[0.09]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-2">
                    <Layers className={`w-3.5 h-3.5 ${accentText}`} />
                    <span
                      className={`text-[10px] font-mono tracking-[0.24em] uppercase font-semibold ${accentText}`}
                    >
                      DELIVERABLES
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">
                    {project.services.length} CORE SCOPES
                  </span>
                </div>

                {/* Core Deliverables Checklist */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                  {project.services.map((srv) => (
                    <li
                      key={srv}
                      className={`flex items-center gap-2.5 px-3 py-2 border text-xs font-medium ${
                        isDark
                          ? 'bg-[#0e1015] border-white/[0.07] text-[#E6E2D8]'
                          : 'bg-[#FAF8F5] border-[#14171A]/[0.08] text-[#14171A]'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 shrink-0 ${accentText}`} />
                      <span>{srv}</span>
                    </li>
                  ))}
                </ul>

                {/* Included Creative Directions Breakdown */}
                {project.creativeDirections && project.creativeDirections.length > 0 && (
                  <div
                    className={`pt-4 border-t ${
                      isDark ? 'border-white/[0.08]' : 'border-[#14171A]/[0.08]'
                    }`}
                  >
                    <span className="text-[9.5px] font-mono tracking-[0.2em] uppercase opacity-60 block mb-3">
                      INCLUDED CREATIVE DIRECTIONS ({project.creativeDirections.length})
                    </span>
                    <div className="space-y-2">
                      {project.creativeDirections.map((dir, idx) => {
                        const isSelected = idx === currentImageIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (idx < allImages.length) setCurrentImageIndex(idx);
                            }}
                            className={`w-full text-left p-3 border transition-colors cursor-pointer ${
                              isSelected
                                ? isDark
                                  ? 'bg-[#D8C7A5]/10 border-[#D8C7A5]/60'
                                  : 'bg-[#8C6E33]/8 border-[#8C6E33]/60'
                                : isDark
                                ? 'bg-[#0e1015] border-white/[0.06] hover:border-white/[0.18]'
                                : 'bg-[#FAF8F5] border-[#14171A]/[0.06] hover:border-[#14171A]/[0.18]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-xs font-medium">{dir.title}</span>
                              <span
                                className={`text-[9px] font-mono uppercase tracking-widest ${accentText}`}
                              >
                                {dir.format}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] font-light leading-relaxed ${
                                isDark ? 'text-[#9EA4B0]' : 'text-[#555B66]'
                              }`}
                            >
                              {dir.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Sticky Drawer Footer: CTA + Previous / Next Case Study */}
            <div
              className={`shrink-0 z-30 px-5 sm:px-6 py-4 border-t space-y-3 backdrop-blur-xl ${
                isDark
                  ? 'border-white/[0.08] bg-[#0d0f13]/95'
                  : 'border-[#14171A]/[0.08] bg-[#FAF8F5]/95'
              }`}
            >
              <button
                type="button"
                onClick={onStartProject}
                className={`w-full py-3 px-5 text-[11px] font-mono tracking-[0.2em] uppercase font-semibold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                  isDark
                    ? 'bg-[#FAF8F5] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                    : 'bg-[#14171A] text-[#FAF8F5] hover:bg-[#8C6E33]'
                }`}
              >
                <span>START A PROJECT WITH THIS DIRECTION</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {prevProject && nextProject && (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectProject(prevProject)}
                    className={`flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider transition-colors truncate cursor-pointer ${
                      isDark
                        ? 'text-[#A6ABB6] hover:text-[#FAF8F5]'
                        : 'text-[#555B66] hover:text-[#14171A]'
                    }`}
                  >
                    <ChevronLeft className={`w-3.5 h-3.5 shrink-0 ${accentText}`} />
                    <span className="truncate">{prevProject.title}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectProject(nextProject)}
                    className={`flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider transition-colors truncate cursor-pointer ${
                      isDark
                        ? 'text-[#A6ABB6] hover:text-[#FAF8F5]'
                        : 'text-[#555B66] hover:text-[#14171A]'
                    }`}
                  >
                    <span className="truncate">{nextProject.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${accentText}`} />
                  </button>
                </div>
              )}
            </div>
          </motion.aside>

          {/* 4. Fullscreen Lightbox Overlay (rendered outside sliding drawer transform) */}
          {isLightboxOpen && hasImages && (
            <div
              className="fixed inset-0 z-60 bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none"
              role="dialog"
              aria-label="Fullscreen Preview Lightbox"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 text-white z-20 bg-black/80">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono tracking-widest text-[#D8C7A5] uppercase font-semibold">
                    {project.title}
                  </span>
                  <span className="opacity-40">·</span>
                  <span className="text-xs font-mono opacity-80 truncate">
                    {activeDirection?.title || `Visual ${currentImageIndex + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
                    disabled={zoomLevel <= 1}
                    className="p-2 text-white/70 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-[#D8C7A5] w-11 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.5).toFixed(1)))}
                    disabled={zoomLevel >= 3}
                    className="p-2 text-white/70 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  {zoomLevel > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setZoomLevel(1);
                        setPanPosition({ x: 0, y: 0 });
                      }}
                      className="p-2 text-[#D8C7A5] hover:text-white transition-colors cursor-pointer"
                      title="Reset Zoom (0)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-[1px] h-4 bg-white/20 mx-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsLightboxOpen(false);
                      setZoomLevel(1);
                    }}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close Fullscreen Lightbox"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div
                className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4 select-none"
                onDoubleClick={handleDoubleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-5 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black text-white rounded-full border border-white/20 z-30 cursor-pointer"
                      aria-label="Previous Image"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#D8C7A5]" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black text-white rounded-full border border-white/20 z-30 cursor-pointer"
                      aria-label="Next Image"
                    >
                      <ChevronRight className="w-5 h-5 text-[#D8C7A5]" />
                    </button>
                  </>
                )}

                <div
                  className="max-h-[78vh] max-w-[90vw] flex items-center justify-center"
                  style={{
                    transform:
                      zoomLevel > 1
                        ? `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`
                        : `translateX(${swipeOffset}px) scale(1)`,
                    transition:
                      isDragging || isPanning
                        ? 'none'
                        : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <img
                    src={allImages[currentImageIndex]}
                    alt={`${project.title} Fullscreen Preview`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="max-h-[78vh] max-w-[90vw] object-contain drop-shadow-2xl"
                    onError={(e) => handleImgFallback(e, allImages[currentImageIndex])}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
