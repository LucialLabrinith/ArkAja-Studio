import React, { useState, useMemo } from 'react';
import { Project, ProjectCategory } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Search, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { getEmbeddedAsset } from '../data/embeddedAssets';

interface PortfolioGridProps {
  projects: Project[];
  uploadedAssets: Record<string, string[]>;
  onSelectProject: (project: Project) => void;
}

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({
  projects,
  uploadedAssets,
  onSelectProject,
}) => {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: ProjectCategory[] = ['ALL', 'BEAUTY', 'FASHION', 'HOSPITALITY'];

  // Filter and search logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        activeCategory === 'ALL' || project.category === activeCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const titleMatch = project.title.toLowerCase().includes(q);
      const categoryMatch = project.category.toLowerCase().includes(q);
      const descMatch = project.description.toLowerCase().includes(q);
      const taglineMatch = project.tagline.toLowerCase().includes(q);
      const servicesMatch = project.services.some((s) => s.toLowerCase().includes(q));
      const directionsMatch = project.creativeDirections.some(
        (d) => d.title.toLowerCase().includes(q) || (d.subtitle && d.subtitle.toLowerCase().includes(q))
      );

      return titleMatch || categoryMatch || descMatch || taglineMatch || servicesMatch || directionsMatch;
    });
  }, [projects, activeCategory, searchQuery]);

  return (
    <section
      id="work"
      className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        isDark
          ? 'bg-[#0b0c0e] border-[#1f2228] text-[#FAF8F5]'
          : 'bg-[#FAF8F5] border-[#E8E2D7] text-[#14171A]'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <Logo variant="full" size="sm" />
              <span className="opacity-30">|</span>
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#A58B55] dark:text-[#D8C7A5] font-semibold font-mono">
                SELECTED WORK · CONCEPT DIRECTIONS
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight">
              Selected Work
            </h2>
            <p
              className={`font-sans text-sm sm:text-base font-light mt-2 max-w-xl ${
                isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
              }`}
            >
              Curated concepts, brand directions and visual systems created by ArkAja Studio.
            </p>
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts & directions…"
              className={`w-full text-xs px-3.5 py-2.5 pl-9 border focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#121418] border-[#24272D] text-[#FAF8F5] placeholder-[#717682] focus:border-[#D8C7A5]'
                  : 'bg-[#FFFFFF] border-[#DCD6CA] text-[#14171A] placeholder-[#8E94A0] focus:border-[#A58B55]'
              }`}
            />
            <Search className="w-3.5 h-3.5 text-[#8E929A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8E929A] hover:text-inherit"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div
          className={`flex flex-wrap items-center gap-2 sm:gap-3 pb-8 mb-10 border-b ${
            isDark ? 'border-[#22252C]' : 'border-[#E5E0D6]'
          }`}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[11px] tracking-[0.2em] font-medium transition-all ${
                activeCategory === cat
                  ? isDark
                    ? 'bg-[#FAF8F5] text-[#0b0c0e]'
                    : 'bg-[#14171A] text-[#FAF8F5]'
                  : isDark
                  ? 'bg-[#121418] text-[#8E929A] hover:text-[#FAF8F5] border border-[#24272D]'
                  : 'bg-[#FFFFFF] text-[#646A77] hover:text-[#14171A] border border-[#DCD6CA]'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-[11px] tracking-[0.2em] opacity-60 hidden sm:inline font-mono ml-auto">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'CONCEPT' : 'CONCEPTS'}
          </span>
        </div>

        {/* Portfolio Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-stretch">
            {filteredProjects.map((project, index) => {
              const isLarge = index === 0 || index === 3;
              const colSpan = isLarge ? 'lg:col-span-7' : 'lg:col-span-5';
              const projectUploads = uploadedAssets[project.slug] || [];
              const firstImage = project.images[0] || projectUploads[0] || '';

              return (
                <article
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`${colSpan} group cursor-pointer flex flex-col justify-between border transition-all duration-300 p-6 sm:p-7 relative overflow-hidden ${
                    isDark
                      ? 'bg-[#111317] border-[#24272D] hover:border-[#D8C7A5]'
                      : 'bg-[#FFFFFF] border-[#E8E2D5] hover:border-[#A58B55] shadow-sm'
                  }`}
                >
                  {/* Top Meta Line: Category & Concept Label */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase font-medium">
                      <span className="text-[#A58B55] dark:text-[#D8C7A5] font-semibold">{project.category}</span>
                      <span className="opacity-40">·</span>
                      <span className="opacity-70">{project.label}</span>
                    </div>
                    <span className="font-mono text-[10px] opacity-60 tracking-widest">
                      {project.year}
                    </span>
                  </div>

                  {/* Visual Asset Stage: Flat Raster Artwork */}
                  <div
                    className={`aspect-[16/10] w-full border mb-5 overflow-hidden relative flex items-center justify-center select-none ${
                      isDark ? 'bg-[#16181f] border-[#24272D]' : 'bg-[#FDFBF7] border-[#E8E2D5]'
                    }`}
                    data-protected-asset="true"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <img
                      src={firstImage}
                      alt={`${project.title} - ${project.tagline}`}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out pointer-events-none select-none"
                      loading="lazy"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallbackApplied) {
                          target.dataset.fallbackApplied = 'true';
                          const currentSrc = target.src || firstImage || '';
                          const clean = currentSrc.split('/').pop()?.split('?')[0] || '';
                          const slugMatch = clean.match(/^([a-z0-9]+-[a-z0-9]+-\d+|[a-z0-9]+-\d+)/i);
                          const slug = slugMatch ? slugMatch[1] : clean.replace(/\.[^/.]+$/, '');
                          if (slug) {
                            target.src = `/assets/portfolio/${slug}.webp`;
                          }
                        }
                      }}
                    />

                    {/* Transparent Protection Shield Layer */}
                    <div
                      className="absolute inset-0 z-10 select-none cursor-pointer"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    />

                    {/* Studio Logo Watermark Stamp on Artwork */}
                    <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 bg-black/70 backdrop-blur-md border border-[#D8C7A5]/40 text-[9px] font-mono tracking-widest text-[#D8C7A5] select-none shadow-sm">
                      <Logo variant="monogram" size="sm" className="scale-75 origin-left" />
                      <span className="font-semibold">ARKAJA</span>
                    </div>

                    {/* Gallery Count Badge */}
                    <div className="absolute top-3 right-3 z-20 px-2 py-0.5 bg-black/75 backdrop-blur-md border border-[#D8C7A5]/30 text-[9px] font-mono tracking-widest text-[#D8C7A5] flex items-center gap-1 pointer-events-none select-none">
                      <span>{project.images.length + projectUploads.length} VISUALS</span>
                    </div>
                  </div>

                  {/* Project Info Block */}
                  <div>
                    <div className="flex items-baseline justify-between gap-4 mb-2">
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight group-hover:text-[#A58B55] dark:group-hover:text-[#D8C7A5] transition-colors">
                        {project.title}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:text-[#A58B55] dark:group-hover:text-[#D8C7A5] group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>

                    <p
                      className={`font-sans text-xs sm:text-sm font-light leading-relaxed mb-4 line-clamp-2 ${
                        isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
                      }`}
                    >
                      {project.description}
                    </p>

                    {/* Project Card Bottom Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-inherit">
                      <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">
                        EXPLORE ARTWORK
                      </span>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-[#A58B55] dark:text-[#D8C7A5] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>VIEW GALLERY</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div
            className={`text-center py-20 border p-8 ${
              isDark ? 'border-[#24272D] bg-[#121418]' : 'border-[#E2DDD5] bg-[#FFFFFF]'
            }`}
          >
            <h3 className="font-serif text-2xl mb-2 font-normal">
              No projects found.
            </h3>
            <p
              className={`font-sans text-sm mb-6 ${
                isDark ? 'text-[#8E929A]' : 'text-[#646A77]'
              }`}
            >
              Try another search term or browse all creative directions.
            </p>
            <button
              onClick={() => {
                setActiveCategory('ALL');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 text-[11px] tracking-[0.2em] font-medium bg-[#14171A] text-[#FAF8F5] hover:bg-[#A58B55] transition-colors"
            >
              BROWSE ALL WORK
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
