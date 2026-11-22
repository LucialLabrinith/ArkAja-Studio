import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  Lock,
  ArrowUpRight,
  ArrowRight,
  Layers,
  Zap,
  ShieldCheck,
  Headphones,
  Award,
  Cloud,
  BarChart3,
  Cpu,
  CheckCircle2,
  Play,
  RefreshCw,
  Terminal,
  Sparkles,
  Check,
  Users,
} from 'lucide-react';

interface LiveNexoraDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToCompare?: () => void;
}

type ProductKey = 'pro' | 'cloud' | 'analytics';
type RegionKey = 'ap-south-1' | 'eu-central-1' | 'us-east-1';

interface ProductSpec {
  id: ProductKey;
  name: string;
  tagline: string;
  summary: string;
  latencyMs: number;
  uptime: string;
  throughput: string;
  bars: number[];
  features: string[];
  accent: string;
}

const PRODUCTS: Record<ProductKey, ProductSpec> = {
  pro: {
    id: 'pro',
    name: 'Nexora Pro',
    tagline: 'Work smarter, not harder.',
    summary:
      'Unified workspace automation, instant AI command workflows, and zero-friction team handoffs.',
    latencyMs: 18,
    uptime: '99.99%',
    throughput: '14.2k ops/s',
    bars: [58, 72, 66, 84, 79, 94, 88, 97],
    features: [
      'Real-time collaborative workflow canvas & approval pipelines',
      'Automated SLA alerts & instant Slack / WhatsApp webhooks',
      'Role-based access controls & SSO ready out of the box',
    ],
    accent: '#7C4DFF',
  },
  cloud: {
    id: 'cloud',
    name: 'Nexora Cloud',
    tagline: 'Your data, your control.',
    summary:
      'Edge-replicated cloud infrastructure with zero-downtime deploys and instant global failover.',
    latencyMs: 11,
    uptime: '99.995%',
    throughput: '48.6k req/s',
    bars: [76, 81, 88, 84, 92, 95, 91, 99],
    features: [
      'Multi-region auto-scaling across Mumbai, Frankfurt & Virginia',
      'End-to-end AES-256 encryption with automated daily snapshots',
      'One-click rollback & zero-downtime blue/green deployments',
    ],
    accent: '#6366F1',
  },
  analytics: {
    id: 'analytics',
    name: 'Nexora Analytics',
    tagline: 'Turn insights into growth.',
    summary:
      'Sub-second funnel attribution, live revenue telemetry, and predictive churn forecasting.',
    latencyMs: 24,
    uptime: '99.98%',
    throughput: '2.4M events/m',
    bars: [44, 59, 63, 74, 82, 86, 93, 96],
    features: [
      'Real-time conversion funnels & cohort retention curves',
      'Automated weekly executive digests delivered to your inbox',
      'Custom SQL & natural-language chart exploration',
    ],
    accent: '#9333EA',
  },
};

const REGION_META: Record<RegionKey, { label: string; delta: number }> = {
  'ap-south-1': { label: 'Mumbai · ap-south-1', delta: 0 },
  'eu-central-1': { label: 'Frankfurt · eu-central-1', delta: 6 },
  'us-east-1': { label: 'Virginia · us-east-1', delta: 9 },
};

export const LiveNexoraDemo: React.FC<LiveNexoraDemoProps> = ({
  isOpen,
  onClose,
  onSwitchToCompare,
}) => {
  const [activeProduct, setActiveProduct] = useState<ProductKey>('pro');
  const [activeRegion, setActiveRegion] = useState<RegionKey>('ap-south-1');
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkRunCount, setBenchmarkRunCount] = useState<number>(0);
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [teamSeats, setTeamSeats] = useState<number>(12);
  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [isLaunchOpen, setIsLaunchOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [workEmail, setWorkEmail] = useState<string>('');
  const [provisionedSlug, setProvisionedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLaunchOpen) setIsLaunchOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, isLaunchOpen, onClose]);

  const spec = PRODUCTS[activeProduct];
  const region = REGION_META[activeRegion];
  const computedLatency = Math.max(
    8,
    spec.latencyMs + region.delta - (benchmarkRunCount % 3)
  );

  const runLiveBenchmark = () => {
    if (isBenchmarking) return;
    setIsBenchmarking(true);
    setTimeout(() => {
      setBenchmarkRunCount((c) => c + 1);
      setIsBenchmarking(false);
    }, 650);
  };

  const scrollInsideDemo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBuildForMyBusiness = () => {
    onClose();
    setTimeout(() => {
      document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  const handleProvisionWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = (companyName.trim() || 'acme-team')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setProvisionedSlug(raw || 'acme-team');
  };

  const discountMultiplier = billingCycle === 'annual' ? 0.8 : 1;
  const starterMonthly = Math.round(teamSeats * 14 * discountMultiplier);
  const growthMonthly = Math.round(teamSeats * 29 * discountMultiplier);
  const enterpriseMonthly = Math.round(teamSeats * 54 * discountMultiplier);

  const modalNode = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-1.5 sm:p-3 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Nexora — Live Interactive Website Demo"
        >
          {/* Dimmed Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Full-Screen Interactive Browser Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.985, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full h-full max-w-[1440px] flex flex-col border border-[#7C4DFF]/45 bg-[#F8F5FC] shadow-[0_32px_100px_-15px_rgba(0,0,0,0.92)] overflow-hidden"
          >
            {/* 1. ArkAja Studio Interactive Demo Top Banner */}
            <div className="px-3 sm:px-5 py-2 bg-[#13111C] text-[#FAF8F5] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-violet-500/20 border border-violet-400/45 text-violet-200 text-[9.5px] font-mono uppercase tracking-[0.16em] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE CODED SAAS WEBSITE
                </span>
                <span className="text-[11px] font-sans text-[#CFC8E8] hidden sm:inline">
                  Switch modules, run live speed benchmarks, adjust seat pricing &amp; launch a workspace
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {onSwitchToCompare && (
                  <button
                    type="button"
                    onClick={onSwitchToCompare}
                    className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border border-white/20 text-[#FAF8F5] hover:border-[#C4B5FD] hover:text-[#C4B5FD] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3 h-3" />
                    <span className="hidden md:inline">Before &amp; After</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBuildForMyBusiness}
                  className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#FAF8F5] transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Build This for My Brand</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close Nexora Live Interactive Website Demo"
                  className="p-1.5 border border-white/20 text-[#FAF8F5] hover:border-[#C4B5FD] hover:text-[#C4B5FD] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Authentic Browser Chrome Bar */}
            <div className="px-3 sm:px-5 py-1.5 bg-[#EFEBF7] border-b border-[#E1D9EE] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>

              <div className="flex-1 max-w-md mx-auto px-3 py-0.5 rounded bg-white border border-[#DED5EC] text-[10.5px] font-mono text-[#4B4460] flex items-center justify-center gap-1.5">
                <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span className="truncate">https://nexora.io</span>
                <span className="text-[9px] text-[#7C4DFF] font-semibold hidden sm:inline">
                  · INTERACTIVE
                </span>
              </div>

              <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#6D638A] hidden md:inline">
                Coded by ArkAja Studio
              </span>
            </div>

            {/* 3. Scrollable Interactive Nexora SaaS Site */}
            <div className="relative flex-1 min-h-0 overflow-y-auto bg-[#F8F5FC] text-[#171324]">
              {/* Sticky Nexora Navbar */}
              <header className="sticky top-0 z-20 bg-[#F8F5FC]/92 backdrop-blur-md border-b border-[#E8E0F4] px-4 sm:px-8 py-3.5">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C4DFF] to-[#4338CA] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      N
                    </div>
                    <span className="font-sans text-lg font-bold tracking-tight text-[#171324]">
                      Nexora
                    </span>
                  </div>

                  <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#534A6B]">
                    <button
                      type="button"
                      onClick={() => scrollInsideDemo('nexora-hero')}
                      className="hover:text-[#7C4DFF] transition-colors cursor-pointer"
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollInsideDemo('nexora-products')}
                      className="hover:text-[#7C4DFF] transition-colors cursor-pointer"
                    >
                      Products
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollInsideDemo('nexora-pricing')}
                      className="hover:text-[#7C4DFF] transition-colors cursor-pointer"
                    >
                      Pricing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProvisionedSlug(null);
                        setIsLaunchOpen(true);
                      }}
                      className="hover:text-[#7C4DFF] transition-colors cursor-pointer"
                    >
                      Contact
                    </button>
                  </nav>

                  <button
                    type="button"
                    onClick={() => {
                      setProvisionedSlug(null);
                      setIsLaunchOpen(true);
                    }}
                    className="px-4 py-2 rounded-full bg-[#171324] hover:bg-[#7C4DFF] text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </header>

              {/* Hero + Interactive Live Console Laptop */}
              <section
                id="nexora-hero"
                className="relative overflow-hidden px-4 sm:px-8 pt-10 pb-12 border-b border-[#E8E0F4]"
                style={{
                  background:
                    'radial-gradient(circle at 80% 25%, rgba(124,77,255,0.22) 0%, rgba(248,245,252,0.95) 55%)',
                }}
              >
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#DED4F0] text-[11px] font-semibold text-[#6D3DF2] shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Next-Gen Cloud &amp; Workflow Suite</span>
                    </div>

                    <h2 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-[#171324]">
                      Smarter Solutions.{' '}
                      <span className="bg-gradient-to-r from-[#7C4DFF] to-[#4F46E5] bg-clip-text text-transparent block">
                        A Brighter Tomorrow.
                      </span>
                    </h2>

                    <p className="text-sm sm:text-base text-[#59506E] max-w-md leading-relaxed">
                      Innovative tools. Effortless experiences. Switch between Nexora Pro, Cloud, and Analytics in the live console to test real-time speed and telemetry.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => scrollInsideDemo('nexora-products')}
                        className="px-6 py-3 rounded-full bg-[#171324] hover:bg-[#7C4DFF] text-white text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                      >
                        <span>Explore Products</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={runLiveBenchmark}
                        className="px-5 py-3 rounded-full bg-white hover:bg-[#F2ECFD] text-[#171324] border border-[#D8CCE9] text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-[#7C4DFF] fill-[#7C4DFF]" />
                        <span>Run Speed Benchmark</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Laptop Telemetry Console */}
                  <div className="lg:col-span-6">
                    <div className="rounded-2xl bg-[#13111C] text-white border border-[#2F2847] shadow-[0_24px_60px_-14px_rgba(79,70,229,0.4)] overflow-hidden">
                      {/* Console Top Tabs */}
                      <div className="px-4 py-3 bg-[#1B1729] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {(['pro', 'cloud', 'analytics'] as ProductKey[]).map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setActiveProduct(key)}
                              className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                activeProduct === key
                                  ? 'bg-[#7C4DFF] text-white font-semibold shadow-sm'
                                  : 'text-[#A69DC2] hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {PRODUCTS[key].name.replace('Nexora ', '')}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={runLiveBenchmark}
                          className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-[10px] font-mono text-emerald-300 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${isBenchmarking ? 'animate-spin' : ''}`}
                          />
                          <span>{isBenchmarking ? 'Pinging...' : 'Live Test'}</span>
                        </button>
                      </div>

                      {/* Console Body */}
                      <div className="p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#A998E8] block">
                              ACTIVE MODULE
                            </span>
                            <h3 className="text-lg font-bold text-white">{spec.name}</h3>
                          </div>

                          {/* Edge Region Switcher */}
                          <div className="flex items-center gap-1 bg-[#1D192B] p-1 rounded-lg border border-white/10">
                            {(Object.keys(REGION_META) as RegionKey[]).map((rKey) => (
                              <button
                                key={rKey}
                                type="button"
                                onClick={() => setActiveRegion(rKey)}
                                className={`px-2 py-0.5 rounded text-[9.5px] font-mono transition-colors cursor-pointer ${
                                  activeRegion === rKey
                                    ? 'bg-[#7C4DFF] text-white font-semibold'
                                    : 'text-[#9F96BD] hover:text-white'
                                }`}
                              >
                                {rKey.split('-')[0].toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Live KPI Grid */}
                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-[#1D192B] border border-white/10">
                            <span className="text-[9.5px] font-mono text-[#9F96BD] block">
                              LATENCY
                            </span>
                            <span className="text-lg font-bold text-emerald-400 font-mono">
                              {computedLatency}ms
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#1D192B] border border-white/10">
                            <span className="text-[9.5px] font-mono text-[#9F96BD] block">
                              UPTIME
                            </span>
                            <span className="text-lg font-bold text-white font-mono">
                              {spec.uptime}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#1D192B] border border-white/10">
                            <span className="text-[9.5px] font-mono text-[#9F96BD] block">
                              THROUGHPUT
                            </span>
                            <span className="text-sm sm:text-base font-bold text-[#C4B5FD] font-mono">
                              {spec.throughput}
                            </span>
                          </div>
                        </div>

                        {/* Animated Live Bar Graph */}
                        <div className="p-3.5 rounded-xl bg-[#1A1626] border border-white/10">
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#9F96BD] mb-2.5">
                            <span className="inline-flex items-center gap-1.5">
                              <Terminal className="w-3 h-3 text-[#A998E8]" />
                              {region.label}
                            </span>
                            <span className="text-emerald-400">● Healthy</span>
                          </div>
                          <div className="h-20 flex items-end gap-2">
                            {spec.bars.map((val, idx) => {
                              const heightPct = Math.min(
                                100,
                                Math.max(25, val + ((benchmarkRunCount * 7 + idx * 3) % 9) - 4)
                              );
                              return (
                                <motion.div
                                  key={`${activeProduct}-${idx}`}
                                  initial={{ height: '20%' }}
                                  animate={{ height: `${heightPct}%` }}
                                  transition={{ duration: 0.35 }}
                                  className="flex-1 rounded-t-md"
                                  style={{
                                    background: `linear-gradient(180deg, ${spec.accent} 0%, rgba(124,77,255,0.28) 100%)`,
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4-Column Trust Strip (matches redesign) */}
                <div className="max-w-5xl mx-auto mt-10 bg-white rounded-2xl border border-[#E6DDF5] p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm">
                  {[
                    { icon: Zap, label: 'Lightning Fast', sub: 'Sub-20ms edge response' },
                    { icon: ShieldCheck, label: 'Secure & Reliable', sub: 'SOC2 & AES-256 ready' },
                    { icon: Headphones, label: '24/7 Support', sub: 'Dedicated engineering desk' },
                    { icon: Award, label: 'Premium Quality', sub: '99.99% uptime SLA' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F2ECFD] text-[#7C4DFF] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#171324]">{label}</p>
                        <p className="text-[10.5px] text-[#6D638A]">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Products Suite ("Built for What's Next") */}
              <section
                id="nexora-products"
                className="px-4 sm:px-8 py-12 max-w-5xl mx-auto space-y-6"
              >
                <div className="text-center space-y-1.5">
                  <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] font-bold text-[#7C4DFF]">
                    OUR PRODUCTS
                  </span>
                  <h3 className="text-3xl font-bold tracking-tight text-[#171324]">
                    Built for What&rsquo;s Next
                  </h3>
                  <p className="text-xs sm:text-sm text-[#615778]">
                    Click any product card below to inspect live capabilities and sync the console above.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(
                    [
                      { key: 'pro' as ProductKey, Icon: Cpu },
                      { key: 'cloud' as ProductKey, Icon: Cloud },
                      { key: 'analytics' as ProductKey, Icon: BarChart3 },
                    ] as const
                  ).map(({ key, Icon }) => {
                    const item = PRODUCTS[key];
                    const isSelected = activeProduct === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveProduct(key)}
                        className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#7C4DFF] ring-2 ring-[#7C4DFF]/20 shadow-md'
                            : 'bg-white/80 border-[#E5DCF3] hover:border-[#B69DF8]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#7C4DFF] text-white'
                                : 'bg-[#F2ECFD] text-[#7C4DFF]'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7C4DFF] font-semibold">
                            {isSelected ? 'Selected' : 'Inspect →'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#171324]">{item.name}</h4>
                        <p className="text-xs text-[#655B7E] mt-1">{item.tagline}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Product Interactive Detail Drawer */}
                <div className="rounded-2xl bg-white border border-[#E4DBF3] p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xs">
                  <div className="md:col-span-7 space-y-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#7C4DFF]">
                      {spec.name} · CAPABILITIES
                    </span>
                    <p className="text-sm text-[#433A59] leading-relaxed">{spec.summary}</p>
                    <ul className="space-y-2 pt-1">
                      {spec.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-xs text-[#2B2440]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#7C4DFF] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:col-span-5 flex flex-col gap-2.5 bg-[#F7F3FD] p-5 rounded-xl border border-[#E6DDF7]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5D5378]">Avg. Edge Response</span>
                      <span className="font-mono font-bold text-[#171324]">
                        {computedLatency}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5D5378]">Guaranteed Uptime</span>
                      <span className="font-mono font-bold text-emerald-700">{spec.uptime}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProvisionedSlug(null);
                        setIsLaunchOpen(true);
                      }}
                      className="mt-2 w-full py-2.5 rounded-xl bg-[#171324] hover:bg-[#7C4DFF] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Try {spec.name} Free →
                    </button>
                  </div>
                </div>
              </section>

              {/* Interactive Team Seat & Billing Estimator */}
              <section
                id="nexora-pricing"
                className="px-4 sm:px-8 pb-12 max-w-5xl mx-auto space-y-6"
              >
                <div className="rounded-3xl bg-white border border-[#E4DBF3] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#7C4DFF] block">
                        LIVE PRICING ESTIMATOR
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#171324]">
                        Scale with Your Team
                      </h3>
                    </div>

                    {/* Monthly / Annual Billing Switch */}
                    <div className="inline-flex items-center p-1 rounded-full bg-[#F2ECFD] border border-[#E2D6F7]">
                      <button
                        type="button"
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          billingCycle === 'monthly'
                            ? 'bg-white text-[#171324] shadow-xs'
                            : 'text-[#62587D]'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle('annual')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          billingCycle === 'annual'
                            ? 'bg-[#7C4DFF] text-white shadow-xs'
                            : 'text-[#62587D]'
                        }`}
                      >
                        Annual · Save 20%
                      </button>
                    </div>
                  </div>

                  {/* Interactive Seats Slider */}
                  <div className="p-4 rounded-2xl bg-[#F8F5FC] border border-[#E6DDF5] flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                      <Users className="w-4 h-4 text-[#7C4DFF]" />
                      <span className="text-xs font-semibold text-[#171324]">
                        Team Seats:{' '}
                        <span className="text-[#7C4DFF] font-mono text-sm">
                          {teamSeats}
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={teamSeats}
                      onChange={(e) => setTeamSeats(Number(e.target.value))}
                      aria-label="Number of team seats"
                      className="flex-1 accent-[#7C4DFF] cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-[#6D638A] shrink-0">
                      5 – 100 seats
                    </span>
                  </div>

                  {/* 3 Dynamic Pricing Tiers */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(
                      [
                        {
                          name: 'Starter',
                          price: starterMonthly,
                          desc: 'For lean startups shipping fast',
                          perks: ['Nexora Pro workspace', '100GB cloud storage', 'Email support'],
                        },
                        {
                          name: 'Growth',
                          price: growthMonthly,
                          desc: 'Full Pro + Cloud + Analytics suite',
                          perks: [
                            'All 3 Nexora modules',
                            'Multi-region failover',
                            '24/7 priority engineering',
                          ],
                          popular: true,
                        },
                        {
                          name: 'Enterprise',
                          price: enterpriseMonthly,
                          desc: 'Dedicated clusters & custom SLAs',
                          perks: [
                            'Custom VPC deployment',
                            'SAML SSO & audit logs',
                            'Dedicated solutions architect',
                          ],
                        },
                      ] as Array<{
                        name: 'Starter' | 'Growth' | 'Enterprise';
                        price: number;
                        desc: string;
                        perks: string[];
                        popular?: boolean;
                      }>
                    ).map((tier) => (
                      <div
                        key={tier.name}
                        className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                          tier.popular
                            ? 'bg-[#171324] text-white border-[#7C4DFF] shadow-lg'
                            : 'bg-[#FAF8FD] text-[#171324] border-[#E5DCF3]'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{tier.name}</span>
                            {tier.popular && (
                              <span className="px-2 py-0.5 rounded-full bg-[#7C4DFF] text-white text-[9.5px] font-mono uppercase font-bold">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold font-mono">
                              ${tier.price.toLocaleString('en-US')}
                            </span>
                            <span className="text-xs opacity-70">/mo</span>
                          </div>
                          <p className="text-xs opacity-75">{tier.desc}</p>
                          <ul className="space-y-1.5 pt-2 text-xs">
                            {tier.perks.map((p) => (
                              <li key={p} className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-[#9F7AEA] shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlan(tier.name);
                            setProvisionedSlug(null);
                            setIsLaunchOpen(true);
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            tier.popular
                              ? 'bg-[#7C4DFF] hover:bg-[#6A3CEB] text-white'
                              : 'bg-[#171324] hover:bg-[#7C4DFF] text-white'
                          }`}
                        >
                          Select {tier.name} →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Dark Footer */}
              <footer className="bg-[#13111C] text-[#CFC8E8] px-4 sm:px-8 py-6 border-t border-white/10">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#7C4DFF] text-white font-bold flex items-center justify-center text-xs">
                      N
                    </span>
                    <span className="font-bold text-white">Nexora</span>
                    <span className="opacity-50">· Interactive SaaS Redesign Demo</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBuildForMyBusiness}
                    className="text-[#D8C7A5] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Want a modern tech website like this? Talk to ArkAja Studio</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </footer>

              {/* Interactive Workspace Provisioning Modal */}
              <AnimatePresence>
                {isLaunchOpen && (
                  <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsLaunchOpen(false)}
                      className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-[#E3DAF2] p-6 shadow-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C4DFF] font-bold">
                            {selectedPlan} PLAN · {teamSeats} SEATS
                          </span>
                          <h4 className="text-xl font-bold text-[#171324]">
                            Launch Nexora Workspace
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsLaunchOpen(false)}
                          aria-label="Close workspace modal"
                          className="p-1.5 rounded-full hover:bg-[#F2ECFD] text-[#5D5378] cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {provisionedSlug ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Sandbox Workspace Ready!</span>
                            </div>
                            <p className="text-xs font-mono text-emerald-900">
                              https://{provisionedSlug}.nexora.io
                            </p>
                            <p className="text-[11px] text-emerald-700">
                              Module: {spec.name} · Region: {region.label}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleBuildForMyBusiness}
                            className="w-full py-2.5 rounded-xl bg-[#171324] hover:bg-[#7C4DFF] text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Build a SaaS Website Like This with ArkAja →
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleProvisionWorkspace} className="space-y-3">
                          <div>
                            <label className="text-[11px] font-semibold text-[#4D4466] block mb-1">
                              Company / Brand Name
                            </label>
                            <input
                              type="text"
                              required
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="e.g. Acme Labs"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD4EE] bg-[#FAF8FD] text-xs text-[#171324] focus:outline-none focus:border-[#7C4DFF]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-[#4D4466] block mb-1">
                              Work Email
                            </label>
                            <input
                              type="email"
                              required
                              value={workEmail}
                              onChange={(e) => setWorkEmail(e.target.value)}
                              placeholder="you@company.com"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD4EE] bg-[#FAF8FD] text-xs text-[#171324] focus:outline-none focus:border-[#7C4DFF]"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-[#7C4DFF] hover:bg-[#6A3CEB] text-white text-xs font-bold tracking-wide transition-colors cursor-pointer"
                          >
                            Provision Instant Demo Workspace →
                          </button>
                        </form>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
