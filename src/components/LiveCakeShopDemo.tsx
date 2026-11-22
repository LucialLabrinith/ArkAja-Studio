import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  Lock,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Heart,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Clock,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Layers,
  Star,
  Cake,
  Check,
} from 'lucide-react';
import strawberryDreamImg from '../assets/images/cake_strawberry_dream_1795365056614.jpg';
import chocoBlissImg from '../assets/images/cake_choco_bliss_1795365091054.jpg';
import vanillaCloudImg from '../assets/images/cake_vanilla_cloud_1795365057542.jpg';
import belgianTruffleImg from '../assets/images/cake_belgian_truffle_1795365055392.jpg';
import roseCupcakesImg from '../assets/images/cake_rose_cupcakes_1795365057176.jpg';
import biscoffJarImg from '../assets/images/cake_biscoff_jar_1795365059263.jpg';

interface LiveCakeShopDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToCompare?: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  category: 'Bestsellers' | 'Eggless Specials' | 'Cupcakes & Jars';
  description: string;
  price500g: number;
  price1kg?: number;
  tag: string;
  egglessAvailable: boolean;
  image: string;
  rating: string;
}

interface CartItem {
  key: string;
  id: string;
  name: string;
  variant: string;
  eggless: boolean;
  unitPrice: number;
  qty: number;
  note?: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'strawberry-dream',
    name: 'Strawberry Dream',
    category: 'Bestsellers',
    description:
      'Cloud-soft vanilla sponge layered with whipped mascarpone cream & fresh Mahabaleshwar strawberries.',
    price500g: 499,
    price1kg: 899,
    tag: 'Bestseller',
    egglessAvailable: true,
    image: strawberryDreamImg,
    rating: '4.9',
  },
  {
    id: 'choco-bliss',
    name: 'Choco Bliss',
    category: 'Bestsellers',
    description:
      '55% Belgian dark chocolate sponge finished with silky truffle ganache & dark cocoa curls.',
    price500g: 549,
    price1kg: 999,
    tag: 'Chef’s Pick',
    egglessAvailable: true,
    image: chocoBlissImg,
    rating: '5.0',
  },
  {
    id: 'vanilla-cloud',
    name: 'Vanilla Cloud',
    category: 'Bestsellers',
    description:
      'Madagascar vanilla bean chiffon with Chantilly cream, fresh blueberries & delicate buttercream.',
    price500g: 499,
    price1kg: 899,
    tag: 'Light & Airy',
    egglessAvailable: true,
    image: vanillaCloudImg,
    rating: '4.8',
  },
  {
    id: 'belgian-truffle-celebration',
    name: 'Belgian Truffle Celebration',
    category: 'Eggless Specials',
    description:
      '100% eggless rich chocolate fudge celebration cake crowned with golden macaron & ganache drip.',
    price500g: 649,
    price1kg: 1149,
    tag: '100% Eggless',
    egglessAvailable: true,
    image: belgianTruffleImg,
    rating: '4.9',
  },
  {
    id: 'rose-pistachio-cupcakes',
    name: 'Rose Pistachio Cupcakes (6 pcs)',
    category: 'Cupcakes & Jars',
    description:
      'Six fragrant cardamom-rose cupcakes swirled with blush buttercream & roasted Iranian pistachios.',
    price500g: 399,
    tag: 'Gift Box',
    egglessAvailable: true,
    image: roseCupcakesImg,
    rating: '4.9',
  },
  {
    id: 'biscoff-jar-duo',
    name: 'Lotus Biscoff Cake Jars (Set of 2)',
    category: 'Cupcakes & Jars',
    description:
      'Layered caramel sponge, whipped cream cheese mousse & crunchy Lotus Biscoff cookie butter.',
    price500g: 299,
    tag: 'Ready in 20m',
    egglessAvailable: true,
    image: biscoffJarImg,
    rating: '4.8',
  },
];

const CATEGORIES = ['All', 'Bestsellers', 'Eggless Specials', 'Cupcakes & Jars'] as const;

export const LiveCakeShopDemo: React.FC<LiveCakeShopDemoProps> = ({
  isOpen,
  onClose,
  onSwitchToCompare,
}) => {
  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORIES)[number]>('All');
  const [egglessOnly, setEgglessOnly] = useState<boolean>(false);
  const [selectedWeights, setSelectedWeights] = useState<Record<string, '500g' | '1kg'>>({});
  const [cart, setCart] = useState<CartItem[]>([
    {
      key: 'strawberry-dream-500g-eggless',
      id: 'strawberry-dream',
      name: 'Strawberry Dream',
      variant: '500g',
      eggless: true,
      unitPrice: 499,
      qty: 1,
    },
  ]);
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState<string>('');
  const [cakeMessage, setCakeMessage] = useState<string>('Happy Birthday!');
  const [deliverySlot, setDeliverySlot] = useState<string>('Today, 5:00 PM – 7:00 PM');
  const [orderPlacedId, setOrderPlacedId] = useState<string | null>(null);
  const [sweetClubEmail, setSweetClubEmail] = useState<string>('');
  const [sweetClubJoined, setSweetClubJoined] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Custom cake builder state
  const [customFlavour, setCustomFlavour] = useState<string>('Belgian Chocolate Truffle');
  const [customWeight, setCustomWeight] = useState<'500g' | '1kg' | '2kg'>('1kg');
  const [customEggless, setCustomEggless] = useState<boolean>(true);
  const [customNote, setCustomNote] = useState<string>('');
  const [addedToast, setAddedToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isBagOpen) setIsBagOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, isBagOpen, onClose]);

  const showToast = (msg: string) => {
    setAddedToast(msg);
    setTimeout(() => {
      setAddedToast((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  const filteredMenu = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (egglessOnly && !item.egglessAvailable) return false;
      return true;
    });
  }, [activeCategory, egglessOnly]);

  const getWeight = (item: MenuItem): '500g' | '1kg' =>
    selectedWeights[item.id] || '500g';

  const getUnitPrice = (item: MenuItem, weight: '500g' | '1kg'): number =>
    weight === '1kg' && item.price1kg ? item.price1kg : item.price500g;

  const addToCart = (item: MenuItem) => {
    const weight = item.price1kg ? getWeight(item) : 'Standard Box';
    const unitPrice = item.price1kg
      ? getUnitPrice(item, getWeight(item))
      : item.price500g;
    const key = `${item.id}-${weight}-eggless`;

    setOrderPlacedId(null);
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        return prev.map((c) => (c.key === key ? { ...c, qty: c.qty + 1 } : c));
      }
      return [
        ...prev,
        {
          key,
          id: item.id,
          name: item.name,
          variant: weight,
          eggless: true,
          unitPrice,
          qty: 1,
        },
      ];
    });
    showToast(`Added ${item.name} (${weight}) to bag`);
  };

  const addCustomCakeToCart = () => {
    const priceMap = { '500g': 699, '1kg': 1199, '2kg': 2199 };
    const unitPrice = priceMap[customWeight];
    const cleanNote = customNote.trim() || 'Chef’s pastel piping';
    const key = `custom-${customFlavour}-${customWeight}-${customEggless ? 'eggless' : 'classic'}`;

    setOrderPlacedId(null);
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        return prev.map((c) => (c.key === key ? { ...c, qty: c.qty + 1, note: cleanNote } : c));
      }
      return [
        ...prev,
        {
          key,
          id: 'custom-cake',
          name: `Custom ${customFlavour} Cake`,
          variant: customWeight,
          eggless: customEggless,
          unitPrice,
          qty: 1,
          note: cleanNote,
        },
      ];
    });
    showToast(`Added Custom ${customFlavour} (${customWeight}) to bag`);
    setIsBagOpen(true);
  };

  const updateQty = (key: string, delta: number) => {
    setOrderPlacedId(null);
    setCart((prev) =>
      prev
        .map((c) => (c.key === key ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (key: string) => {
    setOrderPlacedId(null);
    setCart((prev) => prev.filter((c) => c.key !== key));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const deliveryFee = fulfillment === 'delivery' && subtotal > 0 && subtotal < 999 ? 49 : 0;
  const grandTotal = subtotal + deliveryFee;

  const whatsappSummaryText = useMemo(() => {
    const itemLines = cart
      .map(
        (c) =>
          `• ${c.qty}x ${c.name} (${c.variant}${c.eggless ? ', Eggless' : ''}) — ₹${(
            c.unitPrice * c.qty
          ).toLocaleString('en-IN')}${c.note ? ` [Note: ${c.note}]` : ''}`
      )
      .join('\n');

    return (
      `Hi Vera's Cake Shop! I'd like to place an order:\n\n` +
      `${itemLines}\n\n` +
      `Cake Message: ${cakeMessage.trim() || 'None'}\n` +
      `Mode: ${fulfillment === 'delivery' ? 'Home Delivery' : 'Bakery Pickup'}\n` +
      `Slot: ${deliverySlot}\n` +
      `Name: ${customerName.trim() || 'Guest Customer'}\n` +
      `Total: ₹${grandTotal.toLocaleString('en-IN')}`
    );
  }, [cart, cakeMessage, fulfillment, deliverySlot, customerName, grandTotal]);

  const handlePlaceDemoOrder = () => {
    if (cart.length === 0) return;
    const id = `VCS-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderPlacedId(id);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(whatsappSummaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 1800);
    } catch {
      // Ignore clipboard errors in restricted frames
    }
  };

  const handleBuildForMyBusiness = () => {
    onClose();
    setTimeout(() => {
      document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  const scrollInsideDemo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const modalNode = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-1.5 sm:p-3 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vera's Cake Shop — Live Interactive Website Demo"
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
            className="relative z-10 w-full h-full max-w-[1440px] flex flex-col border border-[#D8C7A5]/40 bg-[#FFF9F7] shadow-[0_32px_100px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* 1. ArkAja Studio Interactive Demo Top Banner */}
            <div className="px-3 sm:px-5 py-2 bg-[#14171A] text-[#FAF8F5] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[9.5px] font-mono uppercase tracking-[0.16em] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE CODED WEBSITE
                </span>
                <span className="text-[11px] font-sans text-[#D8C7A5] hidden sm:inline">
                  Click menu filters, add cakes &amp; test the live WhatsApp ordering flow
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {onSwitchToCompare && (
                  <button
                    type="button"
                    onClick={onSwitchToCompare}
                    className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border border-white/20 text-[#FAF8F5] hover:border-[#D8C7A5] hover:text-[#D8C7A5] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
                  <span>Build This for My Shop</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close Live Interactive Website Demo"
                  className="p-1.5 border border-white/20 text-[#FAF8F5] hover:border-[#D8C7A5] hover:text-[#D8C7A5] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Authentic Browser Chrome Bar */}
            <div className="px-3 sm:px-5 py-1.5 bg-[#F3ECEA] border-b border-[#E7D8D4] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>

              <div className="flex-1 max-w-md mx-auto px-3 py-0.5 rounded bg-white border border-[#E6D4D0] text-[10.5px] font-mono text-[#6E4F47] flex items-center justify-center gap-1.5">
                <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span className="truncate">https://verascakeshop.in</span>
                <span className="text-[9px] text-[#D85A7F] font-semibold hidden sm:inline">
                  · INTERACTIVE
                </span>
              </div>

              <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#8C645A] hidden md:inline">
                Coded by ArkAja Studio
              </span>
            </div>

            {/* 3. Interactive Scrollable Cake Shop Website */}
            <div className="relative flex-1 min-h-0 overflow-y-auto bg-[#FFF9F7] text-[#5D362E]">
              {/* Toast notification on add-to-bag */}
              <AnimatePresence>
                {addedToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="sticky top-16 z-30 mx-auto w-fit px-4 py-2 rounded-full bg-[#5D362E] text-[#FFF9F7] text-xs font-medium shadow-lg flex items-center gap-2 -mb-10"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F9B4C6]" />
                    <span>{addedToast}</span>
                    <button
                      type="button"
                      onClick={() => setIsBagOpen(true)}
                      className="underline text-[#F9B4C6] font-semibold ml-1 cursor-pointer"
                    >
                      View Bag
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Storefront Sticky Navbar */}
              <header className="sticky top-0 z-20 bg-[#FFF9F7]/95 backdrop-blur-md border-b border-[#F4DDE3] px-4 sm:px-8 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FCE3EA] border border-[#F3BCCC] flex items-center justify-center text-[#D85A7F]">
                      <Cake className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-serif text-xl font-semibold text-[#5D362E] leading-none block">
                        Vera&rsquo;s
                      </span>
                      <span className="text-[9px] tracking-[0.22em] uppercase text-[#B36A7B] font-semibold block mt-0.5">
                        CAKE SHOP
                      </span>
                    </div>
                  </div>

                  <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#7A5147]">
                    <button
                      type="button"
                      onClick={() => scrollInsideDemo('vera-hero')}
                      className="hover:text-[#D85A7F] transition-colors cursor-pointer"
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollInsideDemo('vera-menu')}
                      className="hover:text-[#D85A7F] transition-colors cursor-pointer"
                    >
                      Menu
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollInsideDemo('vera-custom')}
                      className="hover:text-[#D85A7F] transition-colors cursor-pointer"
                    >
                      Custom Cakes
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollInsideDemo('vera-about')}
                      className="hover:text-[#D85A7F] transition-colors cursor-pointer"
                    >
                      About
                    </button>
                  </nav>

                  <button
                    type="button"
                    onClick={() => setIsBagOpen(true)}
                    className="px-4 py-2 rounded-full bg-[#D85A7F] hover:bg-[#C2476B] text-white text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order Bag</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white text-[#D85A7F] text-[10px] font-bold leading-none">
                      {totalItems}
                    </span>
                  </button>
                </div>
              </header>

              {/* Hero Section */}
              <section
                id="vera-hero"
                className="relative overflow-hidden bg-gradient-to-br from-[#FFF8F6] via-[#FCE8EE] to-[#F9D6E2] px-4 sm:px-8 py-10 sm:py-14 border-b border-[#F4D9E1]"
              >
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#F2C7D4] text-[11px] font-medium text-[#B34366]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Same-Day Delivery · 100% Eggless Options</span>
                    </div>

                    <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-[#5D362E] leading-[1.08]">
                      Life is Better with Cake{' '}
                      <Heart className="inline w-8 h-8 text-[#D85A7F] fill-[#D85A7F]/20 -mt-1" />
                    </h2>

                    <p className="text-sm sm:text-base text-[#7E554B] max-w-md leading-relaxed">
                      Freshly baked every morning in small batches. Pick your flavour, add a birthday message, and order straight on WhatsApp in 30 seconds.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => scrollInsideDemo('vera-menu')}
                        className="px-6 py-3 rounded-full bg-[#D85A7F] hover:bg-[#C2476B] text-white text-xs font-semibold tracking-wide shadow-md transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Explore Menu</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollInsideDemo('vera-custom')}
                        className="px-5 py-3 rounded-full bg-white hover:bg-[#FFF3F6] text-[#5D362E] border border-[#EABAC8] text-xs font-semibold tracking-wide transition-all cursor-pointer"
                      >
                        Build Custom Cake
                      </button>
                    </div>
                  </div>

                  {/* Hero Visual Showcase Card */}
                  <div className="md:col-span-5">
                    <div className="bg-white/95 rounded-3xl p-4 border border-[#F2CAD6] shadow-[0_18px_40px_-14px_rgba(216,90,127,0.28)]">
                      <div className="rounded-2xl overflow-hidden mb-3.5 aspect-[4/3] bg-[#FCE8EE]">
                        <img
                          src={strawberryDreamImg}
                          alt="Strawberry Dream freshly baked sponge cake"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#D85A7F] block">
                            Today&rsquo;s #1 Bestseller
                          </span>
                          <span className="font-serif text-lg font-semibold text-[#5D362E]">
                            Strawberry Dream · ₹499
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(MENU_ITEMS[0])}
                          className="px-3.5 py-2 rounded-full bg-[#D85A7F] hover:bg-[#C2476B] text-white text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          + Quick Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Interactive Menu & Ordering Grid */}
              <section id="vera-menu" className="px-4 sm:px-8 py-10 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#D85A7F] block mb-1">
                      FRESHLY BAKED MENU
                    </span>
                    <h3 className="font-serif text-3xl font-semibold text-[#5D362E]">
                      Our Bestsellers &amp; Treats
                    </h3>
                  </div>

                  {/* Interactive Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-[#5D362E] text-white shadow-sm'
                            : 'bg-white text-[#7A5147] border border-[#EED3DB] hover:border-[#D85A7F]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEgglessOnly((v) => !v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        egglessOnly
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-[#EED3DB] text-[#7A5147]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          egglessOnly ? 'bg-emerald-500' : 'bg-emerald-400/60'
                        }`}
                      />
                      <span>Eggless</span>
                    </button>
                  </div>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredMenu.map((item) => {
                    const weight = getWeight(item);
                    const unitPrice = item.price1kg
                      ? getUnitPrice(item, weight)
                      : item.price500g;
                    const variantLabel = item.price1kg ? weight : 'Standard Box';
                    const cartKey = `${item.id}-${variantLabel}-eggless`;
                    const inCart = cart.find((c) => c.key === cartKey);

                    return (
                      <div
                        key={item.id}
                        className="group rounded-2xl bg-white border border-[#F1DAE1] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#FCE8EE]">
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/95 text-[#B34366] text-[10px] font-semibold shadow-sm">
                            {item.tag}
                          </span>
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/95 text-[#5D362E] text-[10px] font-semibold inline-flex items-center gap-1 shadow-sm">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {item.rating}
                          </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-serif text-lg font-semibold text-[#5D362E] leading-snug">
                                {item.name}
                              </h4>
                              <span className="text-sm font-bold text-[#D85A7F] shrink-0">
                                ₹{unitPrice}
                              </span>
                            </div>
                            <p className="text-xs text-[#886258] mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="space-y-2.5 pt-2 border-t border-[#F7E7EC]">
                            {/* Weight Switcher for Cakes */}
                            {item.price1kg ? (
                              <div className="flex items-center gap-1.5">
                                {(['500g', '1kg'] as const).map((w) => (
                                  <button
                                    key={w}
                                    type="button"
                                    onClick={() =>
                                      setSelectedWeights((prev) => ({
                                        ...prev,
                                        [item.id]: w,
                                      }))
                                    }
                                    className={`flex-1 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                                      weight === w
                                        ? 'bg-[#FCE8EE] border-[#D85A7F] text-[#B34366]'
                                        : 'bg-[#FFF9F7] border-[#F0D9E0] text-[#8A655B]'
                                    }`}
                                  >
                                    {w} · ₹{w === '500g' ? item.price500g : item.price1kg}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-[#9A7167] font-medium">
                                Freshly packed · 100% Eggless
                              </div>
                            )}

                            {/* Add to Bag / Live Quantity Stepper */}
                            {inCart ? (
                              <div className="flex items-center justify-between rounded-full bg-[#FCE8EE] border border-[#EAB3C4] px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => updateQty(cartKey, -1)}
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  className="w-7 h-7 rounded-full bg-white text-[#D85A7F] flex items-center justify-center hover:bg-[#D85A7F] hover:text-white transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold text-[#5D362E]">
                                  {inCart.qty} in Bag
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQty(cartKey, 1)}
                                  aria-label={`Increase quantity of ${item.name}`}
                                  className="w-7 h-7 rounded-full bg-[#D85A7F] text-white flex items-center justify-center hover:bg-[#C2476B] transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(item)}
                                className="w-full py-2 rounded-full bg-[#D85A7F] hover:bg-[#C2476B] text-white text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Bag · ₹{unitPrice}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Interactive Custom Celebration Cake Configurator */}
              <section
                id="vera-custom"
                className="px-4 sm:px-8 py-8 max-w-5xl mx-auto"
              >
                <div className="rounded-3xl bg-gradient-to-r from-[#FCE8EE] to-[#FFF2EA] border border-[#F2CCD8] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-5 space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D85A7F]">
                      CUSTOM CAKE BUILDER
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#5D362E]">
                      Design a Birthday or Celebration Cake
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7E554B] leading-relaxed">
                      Pick your sponge, weight, and custom piping message — price updates live and goes straight into your WhatsApp order bag.
                    </p>
                  </div>

                  <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#F1D5DE] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#7A5147] block mb-1">
                          Flavour Base
                        </label>
                        <select
                          value={customFlavour}
                          onChange={(e) => setCustomFlavour(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#ECCBD6] bg-[#FFF9F7] text-xs text-[#5D362E] focus:outline-none focus:border-[#D85A7F]"
                        >
                          <option>Belgian Chocolate Truffle</option>
                          <option>Fresh Strawberry Cream</option>
                          <option>Red Velvet Cream Cheese</option>
                          <option>Lotus Biscoff Caramel</option>
                          <option>Mango Passionfruit</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#7A5147] block mb-1">
                          Size &amp; Live Price
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            [
                              { w: '500g', p: 699 },
                              { w: '1kg', p: 1199 },
                              { w: '2kg', p: 2199 },
                            ] as const
                          ).map(({ w, p }) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setCustomWeight(w)}
                              className={`py-2 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                                customWeight === w
                                  ? 'bg-[#D85A7F] text-white border-[#D85A7F]'
                                  : 'bg-[#FFF9F7] text-[#6E4940] border-[#ECCBD6]'
                              }`}
                            >
                              {w} · ₹{p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="text-[11px] font-semibold text-[#7A5147] block mb-1">
                          Custom Message on Cake
                        </label>
                        <input
                          type="text"
                          value={customNote}
                          onChange={(e) => setCustomNote(e.target.value)}
                          placeholder="e.g. Happy Birthday Ananya ♡"
                          className="w-full px-3 py-2 rounded-xl border border-[#ECCBD6] bg-[#FFF9F7] text-xs text-[#5D362E] focus:outline-none focus:border-[#D85A7F]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomEggless((v) => !v)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer shrink-0 ${
                            customEggless
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                              : 'bg-[#FFF9F7] border-[#ECCBD6] text-[#7A5147]'
                          }`}
                        >
                          {customEggless ? '✓ Eggless' : 'Classic'}
                        </button>
                        <button
                          type="button"
                          onClick={addCustomCakeToCart}
                          className="flex-1 py-2 px-4 rounded-xl bg-[#5D362E] hover:bg-[#46261F] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Add Custom Cake →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* About & Sweet Club Footer */}
              <footer
                id="vera-about"
                className="mt-6 bg-[#FCE8EE] border-t border-[#F2CCD8] px-4 sm:px-8 py-8"
              >
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1.5 max-w-md">
                    <h4 className="font-serif text-2xl font-semibold text-[#5D362E]">
                      About Vera&rsquo;s ♡
                    </h4>
                    <p className="text-xs text-[#7A5147] leading-relaxed">
                      A little neighbourhood bakery with a lot of love. Open daily 9 AM – 10 PM · Bandra &amp; Mumbai delivery within 60 minutes.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (sweetClubEmail.trim()) {
                        setSweetClubJoined(true);
                        setSweetClubEmail('');
                      }
                    }}
                    className="w-full md:w-auto"
                  >
                    <label className="text-[11px] font-semibold text-[#5D362E] block mb-1.5">
                      Join our Sweet Club for 10% off your first box!
                    </label>
                    {sweetClubJoined ? (
                      <div className="px-4 py-2 rounded-full bg-white text-emerald-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Welcome to the Sweet Club! Check your inbox.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          required
                          value={sweetClubEmail}
                          onChange={(e) => setSweetClubEmail(e.target.value)}
                          placeholder="Your email address"
                          className="flex-1 md:w-56 px-3.5 py-2 rounded-full bg-white border border-[#EABAC8] text-xs text-[#5D362E] focus:outline-none focus:border-[#D85A7F]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-full bg-[#D85A7F] hover:bg-[#C2476B] text-white text-xs font-semibold cursor-pointer"
                        >
                          Join
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </footer>

              {/* Floating Bottom Order Bar (when items are in bag) */}
              {totalItems > 0 && !isBagOpen && (
                <div className="sticky bottom-4 z-20 px-4 pointer-events-none">
                  <button
                    type="button"
                    onClick={() => setIsBagOpen(true)}
                    className="pointer-events-auto mx-auto max-w-md w-full px-5 py-3 rounded-full bg-[#5D362E] hover:bg-[#492922] text-white shadow-2xl flex items-center justify-between gap-4 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="w-6 h-6 rounded-full bg-[#D85A7F] text-white font-bold flex items-center justify-center text-[11px]">
                        {totalItems}
                      </span>
                      <span className="font-medium">
                        {totalItems} {totalItems === 1 ? 'item' : 'items'} · ₹
                        {grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#F9B4C6] inline-flex items-center gap-1">
                      <span>Checkout on WhatsApp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </div>
              )}

              {/* Slide-Over WhatsApp Order Bag Drawer */}
              <AnimatePresence>
                {isBagOpen && (
                  <div className="fixed inset-0 z-40 flex justify-end">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsBagOpen(false)}
                      className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                    />

                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                      className="relative z-10 w-full max-w-md bg-[#FFF9F7] h-full shadow-2xl border-l border-[#F0D4DC] flex flex-col"
                    >
                      <div className="px-5 py-4 border-b border-[#F2D9E1] bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-[#D85A7F]" />
                          <h4 className="font-serif text-xl font-semibold text-[#5D362E]">
                            Your Order Bag ({totalItems})
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsBagOpen(false)}
                          aria-label="Close Order Bag"
                          className="p-1.5 rounded-full hover:bg-[#FCE8EE] text-[#7A5147] cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {orderPlacedId ? (
                          <div className="rounded-2xl bg-white border border-emerald-200 p-5 space-y-4">
                            <div className="flex items-center gap-2.5 text-emerald-700">
                              <CheckCircle2 className="w-6 h-6 shrink-0" />
                              <div>
                                <p className="text-sm font-bold">
                                  Demo Order Confirmed · #{orderPlacedId}
                                </p>
                                <p className="text-[11px] text-emerald-600">
                                  Here is the exact WhatsApp message generated for the bakery:
                                </p>
                              </div>
                            </div>

                            <pre className="p-3.5 rounded-xl bg-[#F4FBF6] border border-emerald-200 text-[11px] font-mono text-[#1E3B2B] whitespace-pre-wrap leading-relaxed">
                              {whatsappSummaryText}
                            </pre>

                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={handleCopySummary}
                                className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1FB858] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                              >
                                {copiedSummary ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Copied WhatsApp Order Summary</span>
                                  </>
                                ) : (
                                  <>
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Copy WhatsApp Order Message</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={handleBuildForMyBusiness}
                                className="w-full py-2.5 rounded-xl bg-[#14171A] text-[#D8C7A5] hover:bg-[#23282E] text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span>Want this ordering app for your business? Enquire →</span>
                              </button>
                            </div>
                          </div>
                        ) : cart.length === 0 ? (
                          <div className="text-center py-14 space-y-2">
                            <Cake className="w-10 h-10 mx-auto text-[#E2B4C2]" />
                            <p className="font-serif text-lg text-[#5D362E]">
                              Your bag is empty
                            </p>
                            <p className="text-xs text-[#8D685E]">
                              Tap any cake from the menu to test the ordering flow.
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Cart Items */}
                            <div className="space-y-2.5">
                              {cart.map((item) => (
                                <div
                                  key={item.key}
                                  className="p-3.5 rounded-2xl bg-white border border-[#F2DAE1] flex items-start justify-between gap-3"
                                >
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-[#5D362E]">
                                      {item.name}
                                    </p>
                                    <p className="text-[11px] text-[#8E695F]">
                                      {item.variant} · {item.eggless ? 'Eggless' : 'Classic'} · ₹
                                      {item.unitPrice}
                                    </p>
                                    {item.note && (
                                      <p className="text-[10.5px] text-[#D85A7F] italic">
                                        Note: &ldquo;{item.note}&rdquo;
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => updateQty(item.key, -1)}
                                      className="w-6 h-6 rounded-full bg-[#FCE8EE] text-[#D85A7F] flex items-center justify-center cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold w-4 text-center">
                                      {item.qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateQty(item.key, 1)}
                                      className="w-6 h-6 rounded-full bg-[#D85A7F] text-white flex items-center justify-center cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.key)}
                                      aria-label={`Remove ${item.name}`}
                                      className="p-1 text-[#B08A80] hover:text-rose-600 cursor-pointer ml-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Delivery / Pickup Toggle & Cake Message */}
                            <div className="p-4 rounded-2xl bg-white border border-[#F2DAE1] space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFulfillment('delivery')}
                                  className={`py-2 rounded-xl text-xs font-semibold border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                                    fulfillment === 'delivery'
                                      ? 'bg-[#FCE8EE] border-[#D85A7F] text-[#B34366]'
                                      : 'bg-[#FFF9F7] border-[#F0D9E0] text-[#7A5147]'
                                  }`}
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>Delivery</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFulfillment('pickup')}
                                  className={`py-2 rounded-xl text-xs font-semibold border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                                    fulfillment === 'pickup'
                                      ? 'bg-[#FCE8EE] border-[#D85A7F] text-[#B34366]'
                                      : 'bg-[#FFF9F7] border-[#F0D9E0] text-[#7A5147]'
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Self Pickup</span>
                                </button>
                              </div>

                              <div>
                                <label className="text-[11px] font-semibold text-[#7A5147] block mb-1">
                                  Message on Cake
                                </label>
                                <input
                                  type="text"
                                  value={cakeMessage}
                                  onChange={(e) => setCakeMessage(e.target.value)}
                                  placeholder="Happy Birthday!"
                                  className="w-full px-3 py-2 rounded-xl border border-[#ECCBD6] bg-[#FFF9F7] text-xs text-[#5D362E] focus:outline-none focus:border-[#D85A7F]"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[11px] font-semibold text-[#7A5147] block mb-1">
                                    Your Name
                                  </label>
                                  <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="e.g. Riya"
                                    className="w-full px-3 py-2 rounded-xl border border-[#ECCBD6] bg-[#FFF9F7] text-xs text-[#5D362E] focus:outline-none focus:border-[#D85A7F]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-semibold text-[#7A5147] block mb-1">
                                    Time Slot
                                  </label>
                                  <select
                                    value={deliverySlot}
                                    onChange={(e) => setDeliverySlot(e.target.value)}
                                    className="w-full px-2.5 py-2 rounded-xl border border-[#ECCBD6] bg-[#FFF9F7] text-[11px] text-[#5D362E] focus:outline-none focus:border-[#D85A7F]"
                                  >
                                    <option>Today, 5:00 PM – 7:00 PM</option>
                                    <option>Today, 7:00 PM – 9:00 PM</option>
                                    <option>Tomorrow, 11:00 AM – 1:00 PM</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Bag Footer Totals & CTA */}
                      {cart.length > 0 && !orderPlacedId && (
                        <div className="p-5 border-t border-[#F2D9E1] bg-white space-y-3">
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-[#7A5147]">
                              <span>Subtotal</span>
                              <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-[#7A5147]">
                              <span>
                                {fulfillment === 'delivery'
                                  ? subtotal >= 999
                                    ? 'Delivery (Free above ₹999)'
                                    : 'Local Delivery'
                                  : 'Bakery Pickup'}
                              </span>
                              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-[#5D362E] pt-1.5 border-t border-[#F5E4E9]">
                              <span>Total</span>
                              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handlePlaceDemoOrder}
                            className="w-full py-3 rounded-full bg-[#25D366] hover:bg-[#1FB858] text-white text-xs font-bold tracking-wide shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Place Test Order via WhatsApp · ₹{grandTotal}</span>
                          </button>
                        </div>
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
