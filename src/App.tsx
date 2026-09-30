import React, { useState, useEffect } from 'react';
import { PORTFOLIO_PROJECTS } from './data/portfolioData';
import { Project, CustomBuilderState } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValueProp } from './components/ValueProp';
import { PortfolioGrid } from './components/PortfolioGrid';
import { ProjectModal } from './components/ProjectModal';
import { ServicesSection } from './components/ServicesSection';
import { ProjectBuilder } from './components/ProjectBuilder';
import { PricingSection } from './components/PricingSection';
import { ProcessSection } from './components/ProcessSection';
import { AboutSection } from './components/AboutSection';
import { EnquirySection } from './components/EnquirySection';
import { StudioConcierge } from './components/StudioConcierge';
import { SearchModal } from './components/SearchModal';
import { ClientAccountModal } from './components/ClientAccountModal';
import { Footer } from './components/Footer';
import { AssetProtectionShield } from './components/AssetProtectionShield';
import { Sparkles } from 'lucide-react';

function StudioApp() {
  const { isDark } = useTheme();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<Record<string, string[]>>({});
  const [assetRefreshKey, setAssetRefreshKey] = useState(0);
  const [studioConfig, setStudioConfig] = useState<any>({});
  const [builderPrefill, setBuilderPrefill] = useState<CustomBuilderState | null>(null);
  const [packagePrefill, setPackagePrefill] = useState<string | null>(null);

  // Keyboard shortcut: Cmd+K or Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Studio configuration and uploaded project assets
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setStudioConfig(data))
      .catch((err) => console.log('Config fetch note:', err));

    fetch('/api/projects-assets')
      .then((res) => res.json())
      .then((data) => {
        if (data.assets) {
          setUploadedAssets(data.assets);
        }
      })
      .catch((err) => console.log('Asset fetch note:', err));
  }, []);

  const handleAssetUploaded = (slug: string, url: string) => {
    setUploadedAssets((prev) => {
      const current = prev[slug] || [];
      return {
        ...prev,
        [slug]: [url, ...current],
      };
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContinueFromBuilderToEnquiry = (state: CustomBuilderState) => {
    setBuilderPrefill(state);
    scrollToSection('enquire');
  };

  const handleSelectPackageForEnquiry = (pkgName: string) => {
    setPackagePrefill(pkgName);
    scrollToSection('enquire');
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative selection:bg-[#D8C7A5] selection:text-[#0b0c0e] ${
        isDark
          ? 'bg-[#0b0c0e] text-[#F3F1EC]'
          : 'bg-[#FAF8F5] text-[#14171A]'
      }`}
    >
      {/* Editorial Navigation */}
      <Navbar
        onOpenBuilder={() => scrollToSection('builder')}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      <main>
        {/* 1. Hero Section */}
        <Hero
          onExploreWork={() => scrollToSection('work')}
          onStartProject={() => scrollToSection('builder')}
        />

        {/* 2. Value Proposition */}
        <ValueProp onViewServices={() => scrollToSection('services')} />

        {/* 3. Selected Work */}
        <PortfolioGrid
          key={assetRefreshKey}
          projects={PORTFOLIO_PROJECTS}
          uploadedAssets={uploadedAssets}
          onSelectProject={(project) => setSelectedProject(project)}
        />

        {/* 4. Services Section */}
        <ServicesSection onOpenBuilder={() => scrollToSection('builder')} />

        {/* 5. Custom Service Builder ("Build Your Project") */}
        <ProjectBuilder
          onContinueToEnquiry={handleContinueFromBuilderToEnquiry}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
        />

        {/* 6. Transparent Package Pricing (with Razorpay redirect logic) */}
        <PricingSection
          config={studioConfig}
          onOpenBuilder={() => scrollToSection('builder')}
          onSelectPackageForEnquiry={handleSelectPackageForEnquiry}
        />

        {/* 7. Process Section ("How it works") */}
        <ProcessSection />

        {/* 8. About Section */}
        <AboutSection />

        {/* 9. Dedicated Enquiry Section & Form */}
        <EnquirySection
          prefillBuilderState={builderPrefill}
          prefillPackage={packagePrefill}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Project Detail Modal / Gallery */}
      <ProjectModal
        project={selectedProject}
        allProjects={PORTFOLIO_PROJECTS}
        uploadedAssets={uploadedAssets}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(p) => setSelectedProject(p)}
        onStartProject={() => {
          setSelectedProject(null);
          scrollToSection('builder');
        }}
        onAssetUploaded={handleAssetUploaded}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProject={(proj) => {
          setSelectedProject(proj);
          setIsSearchOpen(false);
        }}
        onNavigateToSection={(id) => {
          scrollToSection(id);
          setIsSearchOpen(false);
        }}
        onOpenAdvisor={() => {
          setIsSearchOpen(false);
          setIsAdvisorOpen(true);
        }}
      />

      {/* Client Account & Firestore Briefs Modal */}
      <ClientAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenBuilder={() => {
          setIsAccountOpen(false);
          scrollToSection('builder');
        }}
        onOpenEnquiry={() => {
          setIsAccountOpen(false);
          scrollToSection('enquire');
        }}
      />

      {/* AI Studio Advisor ("Aja") Drawer */}
      <StudioConcierge
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        onOpenBuilder={() => {
          setIsAdvisorOpen(false);
          scrollToSection('builder');
        }}
      />

      {/* Floating Aja Trigger Button when closed */}
      {!isAdvisorOpen && (
        <button
          onClick={() => setIsAdvisorOpen(true)}
          className={`fixed bottom-5 right-5 z-40 px-3.5 py-2.5 border shadow-2xl flex items-center gap-2.5 transition-all duration-200 group active:scale-95 ${
            isDark
              ? 'bg-[#14171d] hover:bg-[#1a1e26] border-[#D8C7A5]/60 hover:border-[#D8C7A5] text-[#F3F1EC]'
              : 'bg-[#FFFFFF] hover:bg-[#F6F2E9] border-[#A58B55]/60 hover:border-[#A58B55] text-[#14171A]'
          }`}
          aria-label="Open Aja, Studio Advisor"
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-[#1e222b]' : 'bg-[#F2ECE1]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8C7A5] group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-[11px] tracking-[0.16em] uppercase font-medium block leading-none">
              AJA · ADVISOR
            </span>
            <span className="text-[9px] text-[#D8C7A5] tracking-widest uppercase font-mono leading-none mt-0.5 block">
              ASK ANYTHING
            </span>
          </div>
        </button>
      )}
      {/* Global Asset Protection & Persistent Atelier Logo Stamp */}
      <AssetProtectionShield />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudioApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
