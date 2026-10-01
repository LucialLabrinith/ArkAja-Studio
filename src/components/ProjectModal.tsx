import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Compass,
  Sparkles,
  Layers,
  MoveHorizontal,
  Expand,
  Minimize,
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
  onAssetUploaded,
}) => {
  const { isDark } = useTheme();

  // Gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Swipe / Drag state for main gallery & lightbox
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Reset index & lightbox when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsLightboxOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setSwipeOffset(0);
  }, [project?.id]);

  // Reset zoom & pan when image changes in lightbox
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [currentImageIndex]);

  // Combine project images with any user uploads for this project slug and resolve embedded assets
  const projectUploads = project ? uploadedAssets[project.slug] || [] : [];
  const rawImages = project ? [...project.images, ...projectUploads] : [];
  const allImages = rawImages.map((img) => {
    return getEmbeddedAsset(img) || img;
  });
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

  // Keyboard navigation
  useEffect(() => {
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
  }, [isLightboxOpen, onClose, handleNextImage, handlePrevImage]);

  // ----------------------------------------------------
  // SWIPE & TOUCH EVENT HANDLERS
  // ----------------------------------------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomLevel === 1) {
      setIsDragging(true);
      setDragStartX(e.touches[0].clientX);
      setDragStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomLevel > 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - dragStartX;
    const deltaY = currentY - dragStartY;

    // Only swipe horizontally if horizontal movement dominates
    if (Math.abs(deltaX) > Math.abs(deltaY) * 0.8) {
      setSwipeOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 45; // pixels
    if (swipeOffset < -threshold) {
      handleNextImage();
    } else if (swipeOffset > threshold) {
      handlePrevImage();
    }
    setSwipeOffset(0);
  };

  // ----------------------------------------------------
  // MOUSE DRAG / SWIPE HANDLERS FOR DESKTOP
  // ----------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel === 1) {
      setIsDragging(true);
      setDragStartX(e.clientX);
      setSwipeOffset(0);
    } else {
      // Panning inside zoomed lightbox
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel === 1) {
      const deltaX = e.clientX - dragStartX;
      setSwipeOffset(deltaX);
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
      const threshold = 45;
      if (swipeOffset < -threshold) {
        handleNextImage();
      } else if (swipeOffset > threshold) {
        handlePrevImage();
      }
      setSwipeOffset(0);
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Double Click Zoom Toggle for Lightbox
  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  if (!project) return null;

  // Active creative direction based on index
  const activeDirection =
    project.creativeDirections && project.creativeDirections[currentImageIndex]
      ? project.creativeDirections[currentImageIndex]
      : project.creativeDirections?.[0];

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto backdrop-blur-xl flex flex-col justify-between transition-colors ${
        isDark ? 'bg-[#0b0c0e]/95 text-[#F3F1EC]' : 'bg-[#FFFFFF]/98 text-[#14171A]'
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar Navigation */}
      <div
        className={`sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md ${
          isDark ? 'border-[#24272D] bg-[#0b0c0e]/90' : 'border-[#E8E2D5] bg-[#FFFFFF]/95'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 mr-2 hover:opacity-80 transition-opacity"
            title="ArkAja Studio"
          >
            <Logo variant="full" size="sm" />
          </button>
          <span className="opacity-30">|</span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8C7A5] font-semibold font-mono">
            {project.category}
          </span>
          <span className="opacity-40">·</span>
          <span className="text-[10px] tracking-[0.2em] uppercase opacity-70 font-mono">
            {project.label}
          </span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span className="hidden sm:inline text-[10px] tracking-[0.2em] opacity-70 font-mono">
            {project.productionLabel}
          </span>
        </div>

        <button
          onClick={onClose}
          className={`p-2 transition-colors rounded-sm focus:outline-none focus:ring-1 focus:ring-[#D8C7A5] ${
            isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7A808C] hover:text-[#14171A]'
          }`}
          aria-label="Close Project Detail"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Editorial Content */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Project Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight">
              {project.title}
            </h1>
            <span className="text-[12px] tracking-[0.25em] text-[#D8C7A5] uppercase font-mono">
              CONCEPT / {project.year}
            </span>
          </div>

          <p
            className={`font-sans text-lg sm:text-xl font-light max-w-3xl leading-relaxed mb-6 ${
              isDark ? 'text-[#B4B7BF]' : 'text-[#555B66]'
            }`}
          >
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-inherit">
            <span className="text-[11px] tracking-[0.2em] uppercase mr-2 font-medium opacity-60 font-mono">
              Deliverables:
            </span>
            {project.services.map((srv, idx) => (
              <span key={srv} className="text-[11px] tracking-[0.18em] uppercase text-[#D8C7A5] font-mono">
                {srv}
                {idx < project.services.length - 1 && <span className="opacity-40 mx-2">/</span>}
              </span>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SWIPEABLE IMAGE GALLERY STAGE */}
        {/* ---------------------------------------------------- */}
        <div
          ref={galleryRef}
          className={`relative mb-8 border select-none overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-[#121418] border-[#24272D]' : 'bg-[#FFFFFF] border-[#E2DDD5]'
          }`}
        >
          {hasImages ? (
            <div
              className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center bg-black overflow-hidden group cursor-grab active:cursor-grabbing select-none"
              data-protected-asset="true"
              onContextMenu={(e) => e.preventDefault()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Studio Watermark & Copyright Stamp */}
              <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 bg-black/75 backdrop-blur-md border border-[#D8C7A5]/40 text-[10px] font-mono tracking-widest text-[#D8C7A5] select-none shadow-md">
                <Logo variant="monogram" size="sm" className="scale-75 origin-left" />
                <span className="font-semibold">ARKAJA ATELIER</span>
                <span className="opacity-40">·</span>
                <span className="text-[9px] opacity-80 uppercase">PROTECTED</span>
              </div>

              {/* Image Slide Container with Live Drag/Swipe Translation */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform select-none"
                style={{
                  transform: `translateX(${swipeOffset}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
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
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallbackApplied) {
                        target.dataset.fallbackApplied = 'true';
                        const currentSrc = target.src || allImages[currentImageIndex] || '';
                        const clean = currentSrc.split('/').pop()?.split('?')[0] || '';
                        const slugMatch = clean.match(/^([a-z0-9]+-[a-z0-9]+-\d+|[a-z0-9]+-\d+)/i);
                        const slug = slugMatch ? slugMatch[1] : clean.replace(/\.[^/.]+$/, '');
                        if (slug) {
                          target.src = `/assets/portfolio/${slug}.webp`;
                        }
                      }
                    }}
                  />
                )}
              </div>

              {/* Prev / Next Chevrons */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black text-white rounded-full transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-10 border border-white/20"
                    aria-label="Previous Visual"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#D8C7A5]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black text-white rounded-full transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-10 border border-white/20"
                    aria-label="Next Visual"
                  >
                    <ChevronRight className="w-5 h-5 text-[#D8C7A5]" />
                  </button>

                  {/* Slide Counter & Progress Bar */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3.5 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono tracking-widest text-[#FAF8F5] z-10">
                    <span className="text-[#D8C7A5] font-semibold">
                      {String(currentImageIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="opacity-40">/</span>
                    <span className="opacity-70">{String(allImages.length).padStart(2, '0')}</span>
                  </div>
                </>
              )}

              {/* Lightbox / Expand Trigger Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute top-4 right-4 p-2.5 bg-black/75 hover:bg-black text-[#FAF8F5] hover:text-[#D8C7A5] border border-white/20 backdrop-blur-md transition-all opacity-90 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-mono tracking-wider z-10"
                aria-label="Open Lightbox Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px]">LIGHTBOX</span>
              </button>

              {/* Swipe Guide Hint (subtle on first render) */}
              <div className="absolute top-4 left-4 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-[9px] font-mono uppercase tracking-widest text-[#D8C7A5]">
                <MoveHorizontal className="w-3 h-3" />
                <span>Swipe / Drag</span>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center">
              <span className="font-serif text-2xl">No visual assets available</span>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* INTERACTIVE THUMBNAIL CAROUSEL STRIP */}
        {/* ---------------------------------------------------- */}
        {allImages.length > 1 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="tracking-[0.2em] text-[#D8C7A5] uppercase font-semibold">
                GALLERY ASSETS ({allImages.length})
              </span>
              <span className="opacity-60 text-[10px]">
                Click thumbnail or swipe to navigate
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-thin">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-28 sm:w-36 h-20 shrink-0 border overflow-hidden transition-all duration-200 group text-left ${
                    idx === currentImageIndex
                      ? 'border-[#D8C7A5] ring-2 ring-[#D8C7A5] scale-[1.02]'
                      : 'border-inherit opacity-60 hover:opacity-100 hover:border-[#D8C7A5]/60'
                  }`}
                  aria-label={`View visual ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[8.5px] font-mono text-white/90">
                    0{idx + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ACTIVE VISUAL DIRECTION CONTEXT CARD */}
        {/* ---------------------------------------------------- */}
        {activeDirection && (
          <div
            className={`p-6 border mb-14 transition-colors ${
              isDark ? 'bg-[#121418] border-[#24272D]' : 'bg-[#FFFFFF] border-[#E2DDD5]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-inherit">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D8C7A5]" />
                <span className="text-[10px] font-mono tracking-widest text-[#D8C7A5] uppercase font-semibold">
                  ACTIVE VISUAL SPECIFICATION · DIRECTION 0{currentImageIndex + 1}
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase opacity-60 font-mono">
                FORMAT: {activeDirection.format}
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-normal mb-1">
              {activeDirection.title}
            </h3>
            {activeDirection.subtitle && (
              <p className="text-xs sm:text-sm text-[#D8C7A5] font-light mb-3 font-mono">
                {activeDirection.subtitle}
              </p>
            )}
            <p
              className={`text-xs sm:text-sm font-light leading-relaxed ${
                isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
              }`}
            >
              {activeDirection.description}
            </p>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ALL CREATIVE DIRECTIONS GRID */}
        {/* ---------------------------------------------------- */}
        <div className="mb-14">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal mb-6">
            All Creative Directions Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.creativeDirections.map((dir, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (idx < allImages.length) setCurrentImageIndex(idx);
                }}
                className={`p-6 border transition-all cursor-pointer ${
                  idx === currentImageIndex
                    ? 'border-[#D8C7A5] ring-1 ring-[#D8C7A5]'
                    : 'border-inherit hover:border-[#D8C7A5]/50'
                } ${isDark ? 'bg-[#121418]' : 'bg-[#FFFFFF]'}`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#D8C7A5] uppercase font-semibold">
                    DIRECTION 0{idx + 1}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase opacity-60 font-mono">
                    {dir.format}
                  </span>
                </div>
                <h4 className="font-serif text-xl font-normal mb-1">
                  {dir.title}
                </h4>
                {dir.subtitle && (
                  <p className="text-xs text-[#D8C7A5] font-light mb-2">
                    {dir.subtitle}
                  </p>
                )}
                <p
                  className={`text-xs font-light leading-relaxed ${
                    isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
                  }`}
                >
                  {dir.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Project CTA Banner */}
        <div
          className={`p-8 sm:p-12 border text-center transition-colors ${
            isDark ? 'bg-[#111317] border-[#24272D]' : 'bg-[#FFFFFF] border-[#E2DDD5]'
          }`}
        >
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#D8C7A5] font-mono block mb-2 font-semibold">
            COMMISSION SIMILAR DIRECTION
          </span>
          <h3 className="font-serif text-2xl sm:text-4xl font-normal mb-3">
            Ready to shape a campaign for your brand?
          </h3>
          <p
            className={`font-sans text-xs sm:text-sm font-light max-w-xl mx-auto mb-6 ${
              isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
            }`}
          >
            We take this elevated visual aesthetic and customize it for your specific products, releases, and social calendar.
          </p>
          <button
            onClick={onStartProject}
            className={`px-8 py-3.5 text-xs tracking-[0.2em] font-medium transition-colors inline-flex items-center gap-2 active:scale-95 ${
              isDark
                ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
            }`}
          >
            <span>START A PROJECT WITH THIS DIRECTION</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Previous / Next Project Bar */}
      <div
        className={`sticky bottom-0 z-30 flex items-center justify-between px-6 py-4 border-t backdrop-blur-md ${
          isDark ? 'border-[#24272D] bg-[#0b0c0e]/90' : 'border-[#E2DDD5] bg-[#FAF8F5]/90'
        }`}
      >
        <button
          onClick={() => onSelectProject(prevProject)}
          className={`flex items-center gap-2 text-xs uppercase tracking-wider transition-colors ${
            isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7A808C] hover:text-[#14171A]'
          }`}
        >
          <ChevronLeft className="w-4 h-4 text-[#D8C7A5]" />
          <span>PREVIOUS: {prevProject.title}</span>
        </button>

        <button
          onClick={() => onSelectProject(nextProject)}
          className={`flex items-center gap-2 text-xs uppercase tracking-wider transition-colors ${
            isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7A808C] hover:text-[#14171A]'
          }`}
        >
          <span>NEXT: {nextProject.title}</span>
          <ChevronRight className="w-4 h-4 text-[#D8C7A5]" />
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FULL-FEATURED LIGHTBOX MODAL OVERLAY */}
      {/* ---------------------------------------------------- */}
      {isLightboxOpen && hasImages && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-60 bg-black/98 backdrop-blur-2xl flex flex-col justify-between select-none"
          role="dialog"
          aria-label="Fullscreen Gallery Lightbox"
        >
          {/* Lightbox Top Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 text-white z-20 bg-black/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#D8C7A5] uppercase font-semibold">
                  {project.title}
                </span>
                <span className="opacity-40">·</span>
                <span className="text-xs font-mono opacity-80">
                  {activeDirection?.title || `Visual ${currentImageIndex + 1}`}
                </span>
              </div>
            </div>

            {/* Zoom Controls & Lightbox Actions */}
            <div className="flex items-center gap-3">
              {/* Zoom Out */}
              <button
                onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
                disabled={zoomLevel <= 1}
                className="p-2 text-white/70 hover:text-white disabled:opacity-30 transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Current Zoom Percentage */}
              <span className="text-[11px] font-mono text-[#D8C7A5] w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              {/* Zoom In */}
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.5).toFixed(1)))}
                disabled={zoomLevel >= 3}
                className="p-2 text-white/70 hover:text-white disabled:opacity-30 transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Reset Zoom */}
              {zoomLevel > 1 && (
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  className="p-2 text-[#D8C7A5] hover:text-white transition-colors"
                  title="Reset Zoom (0)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <div className="w-[1px] h-4 bg-white/20 mx-1" />

              {/* Close Lightbox */}
              <button
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                aria-label="Close Lightbox"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Stage */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4 select-none"
            data-protected-asset="true"
            onContextMenu={(e) => e.preventDefault()}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Lightbox Studio Logo Watermark Stamp */}
            <div className="absolute bottom-6 left-6 z-30 pointer-events-none flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-[#D8C7A5]/40 text-[10px] font-mono tracking-widest text-[#D8C7A5] select-none shadow-lg">
              <Logo variant="monogram" size="sm" className="scale-75 origin-left" />
              <span className="font-semibold">ARKAJA ATELIER</span>
              <span className="opacity-40">·</span>
              <span className="text-[9px] opacity-80 uppercase">PROTECTED ASSET</span>
            </div>

            {/* Prev Button in Lightbox */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3.5 bg-black/70 hover:bg-black text-white rounded-full transition-all border border-white/20 hover:scale-105 active:scale-95 z-30"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-6 h-6 text-[#D8C7A5]" />
              </button>
            )}

            {/* Next Button in Lightbox */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3.5 bg-black/70 hover:bg-black text-white rounded-full transition-all border border-white/20 hover:scale-105 active:scale-95 z-30"
                aria-label="Next Image"
              >
                <ChevronRight className="w-6 h-6 text-[#D8C7A5]" />
              </button>
            )}

            {/* Zoomable & Pannable Image */}
            <div
              className="max-h-[75vh] max-w-[90vw] flex items-center justify-center transition-transform"
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
              {allImages[currentImageIndex]?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={allImages[currentImageIndex]}
                  title={`${project.title} Lightbox View`}
                  className="w-[85vw] h-[75vh] border-0 bg-white shadow-2xl rounded-sm"
                />
              ) : (
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${project.title} Lightbox View`}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className="max-h-[75vh] max-w-[90vw] object-contain drop-shadow-2xl select-none pointer-events-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallbackApplied) {
                      target.dataset.fallbackApplied = 'true';
                      const currentSrc = target.src || allImages[currentImageIndex] || '';
                      const clean = currentSrc.split('/').pop()?.split('?')[0] || '';
                      const slugMatch = clean.match(/^([a-z0-9]+-[a-z0-9]+-\d+|[a-z0-9]+-\d+)/i);
                      const slug = slugMatch ? slugMatch[1] : clean.replace(/\.[^/.]+$/, '');
                      if (slug) {
                        target.src = `/assets/portfolio/${slug}.webp`;
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Lightbox Bottom Bar with Thumbnails & Shortcuts */}
          <div className="border-t border-white/10 px-6 py-4 bg-black/90 z-20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
              {/* Image Counter & Direction Subtitle */}
              <div className="text-white text-xs font-mono flex items-center gap-3">
                <span className="text-[#D8C7A5] font-semibold text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </span>
                {activeDirection?.subtitle && (
                  <span className="hidden sm:inline opacity-70">
                    — {activeDirection.subtitle}
                  </span>
                )}
              </div>

              {/* Thumbnails in Lightbox */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-md py-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-16 h-11 shrink-0 border overflow-hidden transition-all ${
                        idx === currentImageIndex
                          ? 'border-[#D8C7A5] ring-2 ring-[#D8C7A5] scale-105'
                          : 'border-white/20 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Keyboard Shortcuts Hint */}
              <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-white/50">
                <span>← / → Navigate</span>
                <span>•</span>
                <span>Double-click / + - Zoom</span>
                <span>•</span>
                <span>Esc Exit</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
