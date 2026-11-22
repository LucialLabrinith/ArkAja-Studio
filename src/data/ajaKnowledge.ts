/**
 * Unified Knowledge Base, System Prompt, Live Bundle Estimator, & Smart Advisor Engine
 * for Aja — ArkAja Studio's Senior Creative & Technical Concierge.
 * Shared by both the Express Gemini backend (server.ts) and client-side instant readiness layer.
 */

export type AjaActionType = 'builder' | 'enquiry' | 'pricing' | 'work' | 'services';

export interface AjaAction {
  type: AjaActionType;
  label: string;
}

export interface AjaSmartReply {
  reply: string;
  action?: AjaAction;
  followUps: string[];
}

export const AJA_SYSTEM_INSTRUCTION = `You are "Aja", the sharp, warm, articulate, witty, and exceptionally capable Senior Creative Advisor & Solutions Architect for ARKAJA STUDIO.

CORE PERSONALITY & CONVERSATIONAL INTELLIGENCE:
- You are genuinely intelligent, observant, emotionally perceptive, and natural.
- When people chat casually ("how was your day?", life, movies, books, humor, philosophy, tech, coding, random curiosity), engage warmly, wittily, and authentically without pushing sales.
- When people ask about design, branding, websites, web apps, AI, social content, pricing, timelines, or their business, step seamlessly into Senior Art Director & Solutions Architect mode: give specific, high-signal, actionable guidance immediately—never generic fluff.
- Keep responses crisp, structured, and easy to scan (short paragraphs, clean bullets, bold key numbers/names). Aim for high value in ~80–180 words unless the user asks for a deep breakdown.

ARKAJA STUDIO COMPLETE KNOWLEDGE BASE (EXACT LIVE FACTS):
- Studio Name: ArkAja Studio (Arkaja Designers) · Mumbai, India · Working with clients worldwide.
- Founder & Creative Director: Divyaam.
- Contact: arkajastudio@gmail.com | Instagram: [@arkajastudio](https://www.instagram.com/arkajastudio/).
- Positioning: "AI-assisted creative production. Human-led art direction."
- Live Studio Capacity: Engineered in-house · Avg. Turnaround: 48–72 hrs · **2 Client Slots Open** · Now booking Creative & Web Projects for December & January.
- Payment: Official Razorpay global checkout (UPI, Cards, Netbanking, International Cards in INR with auto-conversion for USD, EUR, GBP). Transparent one-time project fees—zero monthly SaaS retainers.

EXACT STANDARD PACKAGE PRICING (NO HIDDEN FEES, NO DISCOUNTS/STRIKETHROUGHS):
1. Websites & Add-Ons:
   - **Basic Website**: **₹10,000** (~$120 USD / €110 EUR / £95 GBP) · 5–7 business days · Responsive mobile + desktop, 4 standard pages (Home, About, Services, Contact), basic animations, live deployment, contact display (Email/Phone/WhatsApp).
   - **Urgent Basic Website**: **₹12,000** (~$145 USD / €135 EUR / £115 GBP) · 48–72h priority delivery (includes ₹10,000 Basic Website + ₹2,000 priority fee).
   - **Add-on — Urgent Delivery**: **+₹2,000** (priority fast-track queue).
   - **Add-on — Enquiry Form Integration**: **+₹3,000** (collects & manages customer enquiries with Firestore database + real-time inbox notifications).
   - **Add-on — AI Chatbot Integration**: **+₹5,000** (website-integrated conversational AI trained on your business knowledge & FAQ).
   - **Custom Domain**: Domain registration cost + applicable ArkAja setup/handling fee (not included in base website price; configured to client's registrar).
   - **Custom Website Features**: Custom Quote (extra pages beyond 4, advanced 3D/WebGL, booking sync, user login, payment checkout).

2. Web Apps & Business Systems:
   - **Basic Web App (Level 1)**: **₹15,000** fixed (~$180 USD / €165 EUR / £140 GBP) · 7–10 business days · Single-workflow operational system with database (Add/Edit/Delete/Search), responsive UI, input forms, status tracking, basic auth, email alerts & admin dashboard (e.g., Salon/Clinic Appointments, Restaurant Orders, Mini Inventory, Billing/Invoicing, Coaching Records, Property Listings).
   - **Advanced Web Apps & Custom Platforms (Level 2 & 3)**: Custom Quote (anything beyond single-workflow Level 1: multi-role Customer/Staff/Admin permissions, Razorpay/Stripe payments, WhatsApp/SMS automation, analytics, hospital/school/marketplace/SaaS).
   - Core Distinction to Explain Clearly: Basic Website (₹10,000) = *"Here is my business."* Basic Web App (₹15,000) = *"Here is a system that runs a workflow."* Anything beyond that = Custom Quote.

3. Branding & Logo Design:
   - **Logo Design**: **₹3,000** (~$36 USD / €33 EUR / £29 GBP) · 3–5 business days · 3-stage kit: primary concept, logo variations (primary, compact, icon/mark), high-res transparent/color/monochrome files for web/social/print. Up to 2 revision rounds included.
   - **Brand Identity**: Custom Quote (complete logo system, HEX/RGB/CMYK color palette, typography hierarchy, moodboards, social grid templates, brand guidelines & stationery).

4. Editorial & Social Content Packages:
   - **Starter Content**: **₹2,499** (~$30 USD / €28 EUR / £24 GBP) · 3–5 business days · 4 bespoke posts, 2 editorial stories, 1 promotional creative, 1 short-form visual, consistent visual direction.
   - **Signature Content**: **₹4,999** (~$60 USD / €55 EUR / £48 GBP) · **48-Hour Delivery** · 8 bespoke posts, 4 editorial stories, 2 promotional creatives, brand-tailored captions included, priority turnaround.
   - **Custom Campaign**: Custom Quote / As Per Requirement (large product drops, multi-SKU shoots, video/Reels direction, custom volumes).

5. AI Solutions & Business Launch Bundle:
   - **AI-Assisted Business Solutions**: Custom Quote (workflow automation, smart data pipelines, custom AI integrations).
   - **Business Launch Bundle**: Custom Quote (end-to-end combination of Logo + Brand Identity + Website + Enquiry/Chatbot + Social Launch Creatives).

PORTFOLIO & INTERACTIVE SITE FEATURES YOU KNOW INTIMATELY:
- **Selected Concept Projects** (clickable slide-over Case Study Drawers in the Selected Work section):
  1. **LUMIÈRE** (Beauty · "Your Glow. Elevated.") — Clinical-luxury skincare & hydrafacial visuals in gold, warm bone & obsidian.
  2. **NOIR & BEAN** (Hospitality · "Your 4PM Deserves This.") — Specialty café, Vanilla Cloud Latte & Saturday Brunch Club editorial storytelling.
  3. **ÉLAN** (Fashion · "The Autumn Edit") — Contemporary womenswear, quiet luxury tailoring & "3 Ways to Style One Blazer" carousels.
  4. **MUSE BEAUTY LONDON** (Beauty · "Minimalist British Luxury") — Botanical skincare rituals & amber-glass minimalism.
  5. **ETHNIC FASHION EDIT** (Fashion · "The Heirloom Drape") — Heritage Indian handloom & contemporary saree styling.
- **Interactive Website Redesigns & Live Coded Demos** (inside Selected Work → "Try Cake Shop Live ↗", "Try Nexora SaaS Live ↗" & "Before & After Slider"):
  1. **Vera's Cake Shop** — Live, clickable coded bakery website & WhatsApp ordering web app demo (real cake photography, interactive menu filters, 500g/1kg weight selectors, custom cake builder, live bag & WhatsApp order summary) plus Before & After slider.
  2. **Nexora** — Live, clickable coded modern SaaS website demo (interactive Pro/Cloud/Analytics live telemetry console, edge region switcher, speed benchmark, dynamic team-seat pricing calculator & sandbox workspace launcher) plus Before & After slider.
- **4-Step Studio Process**: 1. Brief → 2. Direction → 3. Create → 4. Deliver.

HOW TO BE PROACTIVELY SMART:
- **Live Bundle Math**: If a user asks about combining services (e.g., "Basic Website + Logo + AI Chatbot"), immediately compute and show the exact itemized INR total (e.g., ₹10,000 + ₹3,000 + ₹5,000 = **₹18,000**, approx. $216 USD / €198 EUR) and mention if any selected item requires a custom quote.
- **Budget Optimization**: If a user shares a budget (e.g. "I have ₹15,000" or "around ₹5,000"), recommend the single highest-impact package or bundle that fits without overselling.
- **Bespoke Mini Art Direction**: If a user mentions their business/industry (e.g., café, clinic, jewelry, gym, bakery, salon, SaaS, clothing brand, real estate), immediately pitch a sharp mini creative direction (aesthetic vibe, palette suggestion, and exact website/web app/content recommendation).
- **Never hallucinate discounts, fake promos, or unlisted prices.** Stick strictly to the exact standard rates above.`;

interface BundleItem {
  key: string;
  label: string;
  price: number;
  patterns: RegExp[];
}

const BUNDLE_ITEMS: BundleItem[] = [
  {
    key: 'basic-website',
    label: 'Basic Website',
    price: 10000,
    patterns: [/\bbasic\s*website\b/, /\bwebsite\b/, /\bsite\b/, /\blanding\s*page\b/],
  },
  {
    key: 'urgent-delivery',
    label: 'Urgent 48–72h Delivery Add-on',
    price: 2000,
    patterns: [/\burgent\b/, /\brush\b/, /\bfast[\s-]*track\b/, /\bpriority\b/],
  },
  {
    key: 'enquiry-form',
    label: 'Enquiry Form Integration',
    price: 3000,
    patterns: [/\benquiry\s*(form|integration)\b/, /\bcontact\s*form\b/, /\blead\s*form\b/, /\binquiry\s*form\b/],
  },
  {
    key: 'ai-chatbot',
    label: 'AI Chatbot Integration',
    price: 5000,
    patterns: [/\bchatbot\b/, /\bchat\s*bot\b/, /\bai\s*assistant\b/, /\bai\s*chat\b/],
  },
  {
    key: 'logo-design',
    label: 'Logo Design Kit',
    price: 3000,
    patterns: [/\blogo\b/],
  },
  {
    key: 'basic-web-app',
    label: 'Basic Web App (Level 1)',
    price: 15000,
    patterns: [/\bweb\s*app\b/, /\bwebapp\b/, /\bbooking\s*system\b/, /\binventory\b/, /\bappointment\b/, /\bbilling\b/],
  },
  {
    key: 'starter-content',
    label: 'Starter Social Content',
    price: 2499,
    patterns: [/\bstarter\b/],
  },
  {
    key: 'signature-content',
    label: 'Signature Social Content',
    price: 4999,
    patterns: [/\bsignature\b/],
  },
];

function formatInrWithFx(amount: number): string {
  const usd = Math.round(amount / 83.5);
  const eur = Math.round(amount / 91);
  return `**₹${amount.toLocaleString('en-IN')}** (~$${usd} USD / €${eur} EUR)`;
}

function tryCalculateBundle(q: string): AjaSmartReply | null {
  const matched: BundleItem[] = [];
  for (const item of BUNDLE_ITEMS) {
    if (item.patterns.some((p) => p.test(q))) {
      matched.push(item);
    }
  }

  const hasCustomItem =
    /\bbrand\s*identity\b/.test(q) ||
    /\bcustom\s*(platform|app|feature|campaign|saas|marketplace)\b/.test(q) ||
    /\bpayment\s*gateway\b/.test(q) ||
    /\bmulti[\s-]*role\b/.test(q);

  // Trigger bundle calculator if 2+ items matched OR user explicitly asked to calculate/combine/estimate
  const wantsCalc =
    matched.length >= 2 ||
    (matched.length >= 1 && hasCustomItem) ||
    (matched.length >= 1 && /\b(total|estimate|bundle|combine|plus|\+|with|and|cost|price|how much)\b/.test(q));

  if (!wantsCalc || matched.length === 0) return null;

  // Prevent double-counting "urgent" if user only asked "how fast is urgent delivery" without website/bundle context
  if (matched.length === 1 && matched[0].key === 'urgent-delivery' && !hasCustomItem) {
    return null;
  }

  // If both web app AND generic "site" matched only because of "website", keep both; if "basic web app" only, don't duplicate
  const filtered = matched.filter((m) => {
    if (m.key === 'basic-website' && matched.some((x) => x.key === 'basic-web-app') && !/\bwebsite\b/.test(q)) {
      return false;
    }
    return true;
  });

  if (filtered.length < 2 && !hasCustomItem && !/\b(total|estimate|bundle|cost|price|how much)\b/.test(q)) {
    return null;
  }

  const total = filtered.reduce((acc, item) => acc + item.price, 0);
  const lines = filtered.map((item) => `• **${item.label}**: ₹${item.price.toLocaleString('en-IN')}`);

  if (hasCustomItem) {
    lines.push('• **Custom / Bespoke Scope**: Custom Quote (scoped to your exact requirements)');
  }

  const totalLine = hasCustomItem
    ? `**Estimated Fixed Base:** ${formatInrWithFx(total)} + Custom Quote for bespoke features.`
    : `**Estimated Total:** ${formatInrWithFx(total)} *(one-time fee, no monthly retainers)*`;

  return {
    reply:
      `Here's your live ArkAja Studio estimate based on what you mentioned:\n\n` +
      `${lines.join('\n')}\n\n` +
      `${totalLine}\n\n` +
      `We currently have **2 client slots open** with an average 48–72 hr kickoff turnaround. Want to customize this inside our Interactive Scope Builder or send your brief directly?`,
    action: { type: 'builder', label: 'Open Scope Builder →' },
    followUps: [
      'What turnaround time should I expect?',
      'Add Enquiry Form (+₹3,000) or AI Chatbot (+₹5,000)?',
      'How do Razorpay payments work?',
    ],
  };
}

function tryMatchBudget(q: string): AjaSmartReply | null {
  const budgetMatch =
    q.match(/(?:₹|rs\.?|inr)\s*([\d,]+)(k)?/i) ||
    q.match(/\b(\d+(?:\.\d+)?)\s*k\b/i) ||
    q.match(/\bbudget(?:\s+is|\s+of|\s+around|\s+under)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i);

  if (!budgetMatch) return null;

  let raw = parseFloat(budgetMatch[1].replace(/,/g, ''));
  if (Number.isNaN(raw)) return null;
  if (budgetMatch[2]?.toLowerCase() === 'k' || /\b\d+(?:\.\d+)?\s*k\b/i.test(budgetMatch[0])) {
    raw = raw * 1000;
  }
  if (raw < 1000) return null;

  let rec = '';
  if (raw < 3500) {
    rec =
      `With a budget around **₹${raw.toLocaleString('en-IN')}**, here are the highest-impact starting options:\n\n` +
      `• **Starter Content Package (₹2,499)** — 4 bespoke posts, 2 editorial stories, 1 promo visual & 1 short-form visual (3–5 days).\n` +
      `• **Logo Design Kit (₹3,000)** — Full 3-stage logo identity kit (primary, compact & icon marks for web + print, up to 2 revisions).`;
  } else if (raw < 9500) {
    rec =
      `With a budget around **₹${raw.toLocaleString('en-IN')}**, you can get serious studio firepower:\n\n` +
      `• **Signature Content Package (₹4,999)** — 8 bespoke posts, 4 stories, 2 promo visuals, brand captions & **48-hour priority delivery**.\n` +
      `• **Logo Design + Starter Content (₹5,499)** — Fresh brand mark (₹3,000) paired with launch-ready social visuals (₹2,499).\n` +
      `• **Logo Design + Signature Content (₹7,999)** — Complete visual identity kick-off plus a full editorial feed drop.`;
  } else if (raw < 14500) {
    rec =
      `With a budget around **₹${raw.toLocaleString('en-IN')}**, your best ROI moves are:\n\n` +
      `• **Basic Website (₹10,000)** — Clean, responsive 4-page business site (Home, About, Services, Contact) deployed live.\n` +
      `• **Urgent Basic Website (₹12,000)** — Same complete website fast-tracked in **48–72 hours**.\n` +
      `• **Website + Logo Bundle (₹13,000)** — Complete Basic Website (₹10,000) + 3-stage Logo Kit (₹3,000).`;
  } else if (raw < 20000) {
    rec =
      `With a budget around **₹${raw.toLocaleString('en-IN')}**, you unlock our strongest web & operational builds:\n\n` +
      `• **Basic Web App — Level 1 (₹15,000)** — A real single-workflow system (booking, appointments, mini inventory, billing or orders) with database & admin dashboard.\n` +
      `• **Website + AI Chatbot (₹15,000)** — Basic Website (₹10,000) + Website AI Chatbot (+₹5,000).\n` +
      `• **Website + Enquiry Form + Logo (₹16,000)** — Full online presence, automated lead capture & custom logo kit.`;
  } else {
    rec =
      `With a budget of **₹${raw.toLocaleString('en-IN')}**, we can craft a full **Business Launch** presence:\n\n` +
      `• **Website + Enquiry Form + AI Chatbot + Logo (₹21,000)** — Complete website, automated lead capture, 24/7 AI assistant & logo kit.\n` +
      `• **Basic Web App + Logo + Signature Content (₹22,999)** — Operational workflow system + identity + 48h social launch kit.\n` +
      `• Or a **Custom Quote** for an Advanced Multi-Role Web App / Full Brand Identity system.`;
  }

  return {
    reply: `${rec}\n\nTell me a bit about your business and I'll narrow this down to the exact ideal scope!`,
    action: { type: 'builder', label: 'Build This Scope →' },
    followUps: [
      'Compare Website (₹10k) vs Web App (₹15k)',
      'Show Before & After Website Redesigns',
      'I want to book one of the 2 open slots',
    ],
  };
}

function tryIndustryPitch(q: string): AjaSmartReply | null {
  if (/\b(salon|clinic|doctor|dentist|dermatolog|spa|physio)\b/.test(q)) {
    return {
      reply:
        `For a **salon, clinic, or wellness practice**, here is the studio direction I'd recommend:\n\n` +
        `• **Best Technical Fit**: **Basic Web App — Level 1 (₹15,000)** so clients can book appointment slots directly while your desk tracks status in a clean admin dashboard—with zero monthly SaaS fees.\n` +
        `• **Or Pure Showcase**: **Basic Website (₹10,000)** + **Enquiry Form (+₹3,000)** if you prefer simple WhatsApp/form bookings.\n` +
        `• **Visual Direction**: Look at our **LUMIÈRE** concept in Selected Work—luminous editorial tones, clean service cards, and understated gold/ivory restraint.`,
      action: { type: 'work', label: 'Explore Work & Case Studies →' },
      followUps: [
        'Calculate Web App + Logo total',
        'How long does a Basic Web App take?',
        'What is included in Level 1 Web App?',
      ],
    };
  }

  if (/\b(bakery|cake|sweet|pastry|dessert|cafe|café|coffee|restaurant|brunch|food|bistro)\b/.test(q)) {
    return {
      reply:
        `For a **bakery, café, or hospitality brand**, warmth and craving-first art direction win instantly:\n\n` +
        `• **Website Redesign Style**: Check out our **Vera's Cake Shop** Before & After demo (Cute & Playful pastel charm) and our **NOIR & BEAN** concept (warm afternoon editorial coffee storytelling).\n` +
        `• **Best Package Fit**: **Basic Website (₹10,000)** for menu & story, or **Basic Web App (₹15,000)** if you want direct custom cake/table order requests with status tracking.\n` +
        `• **Social Boost**: Pair with **Starter (₹2,499)** or **Signature (₹4,999)** for launch-ready feed & story visuals.`,
      action: { type: 'work', label: 'View Vera’s Cake Shop Redesign →' },
      followUps: [
        'Estimate Website + Starter Content',
        'Can we add an AI menu/order chatbot?',
        'How fast can we launch?',
      ],
    };
  }

  if (/\b(saas|tech|startup|agency|consulting|b2b|software|fintech|ai\s*company)\b/.test(q)) {
    return {
      reply:
        `For a **tech, SaaS, or consulting brand**, authority and conversion clarity are everything:\n\n` +
        `• **Redesign Reference**: Open our **Nexora** Before & After demo in Selected Work to see how we transform dated pages into crisp, modern high-trust interfaces.\n` +
        `• **Recommended Build**: **Basic Website (₹10,000)** + **AI Chatbot (+₹5,000)** to answer buyer FAQs 24/7, or a **Custom Quote** for multi-role SaaS dashboards and payment gateways.\n` +
        `• **Identity**: Add a sharp geometric **Logo Kit (₹3,000)** or full **Brand Identity**.`,
      action: { type: 'work', label: 'View Nexora Redesign Demo →' },
      followUps: [
        'Estimate Website + AI Chatbot + Logo',
        'Difference between Level 1 & Advanced Web Apps',
        'Start a project brief',
      ],
    };
  }

  if (/\b(real\s*estate|property|architect|interior|gym|fitness|coaching|tutor|academy|school)\b/.test(q)) {
    return {
      reply:
        `For **real estate, interiors, fitness, or coaching**, structured lead capture and workflow clarity pay for themselves fast:\n\n` +
        `• **Operational Fit**: **Basic Web App — Level 1 (₹15,000)** works brilliantly for property listings, student/member records, or class/visit bookings with search & admin dashboard.\n` +
        `• **Lead-Gen Website**: **Basic Website (₹10,000)** + **Enquiry Form (+₹3,000)** + **AI Chatbot (+₹5,000)** = **₹18,000** for a 24/7 inquiry machine.\n` +
        `• **Turnaround**: 5–7 days for websites (or 48–72h urgent), 7–10 days for Level 1 Web Apps.`,
      action: { type: 'builder', label: 'Customize in Scope Builder →' },
      followUps: [
        'Can I pay via Razorpay / UPI?',
        'What does Enquiry Integration include?',
        'Fill out the Enquiry Form',
      ],
    };
  }

  return null;
}

export function inferAjaSuggestions(
  userInput: string,
  replyText: string
): { action?: AjaAction; followUps: string[] } {
  const combined = `${userInput} ${replyText}`.toLowerCase();

  let action: AjaAction | undefined;
  if (
    combined.includes('before & after') ||
    combined.includes('redesign') ||
    combined.includes('vera') ||
    combined.includes('nexora') ||
    combined.includes('lumière') ||
    combined.includes('lumiere') ||
    combined.includes('noir & bean') ||
    combined.includes('élan') ||
    combined.includes('case study') ||
    combined.includes('portfolio')
  ) {
    action = { type: 'work', label: 'Explore Work & Redesign Demos →' };
  } else if (
    combined.includes('builder') ||
    combined.includes('estimate') ||
    combined.includes('subtotal') ||
    combined.includes('bundle') ||
    combined.includes('combine')
  ) {
    action = { type: 'builder', label: 'Launch Scope Builder →' };
  } else if (
    combined.includes('enquiry') ||
    combined.includes('brief') ||
    combined.includes('book') ||
    combined.includes('slot') ||
    combined.includes('quote')
  ) {
    action = { type: 'enquiry', label: 'Open Enquiry Brief →' };
  } else if (
    combined.includes('₹') ||
    combined.includes('pricing') ||
    combined.includes('package') ||
    combined.includes('razorpay')
  ) {
    action = { type: 'pricing', label: 'View Full Pricing →' };
  } else if (combined.includes('service') || combined.includes('discipline')) {
    action = { type: 'services', label: 'Explore Services →' };
  }

  // Contextual follow-up chips
  if (combined.includes('web app') || combined.includes('level 1')) {
    return {
      action,
      followUps: [
        'Estimate Website + Logo + Chatbot',
        'How long does a Level 1 Web App take?',
        'Start my project brief',
      ],
    };
  }
  if (combined.includes('redesign') || combined.includes('vera') || combined.includes('nexora')) {
    return {
      action,
      followUps: [
        'How much does a website redesign cost?',
        'Can you redesign in 48–72 hours?',
        'Recommend a style for my business',
      ],
    };
  }
  if (combined.includes('starter') || combined.includes('signature') || combined.includes('social')) {
    return {
      action,
      followUps: [
        'Compare Starter (₹2,499) vs Signature (₹4,999)',
        'Do you include Reels / video direction?',
        'How do payments & revisions work?',
      ],
    };
  }
  if (combined.includes('price') || combined.includes('₹') || combined.includes('package')) {
    return {
      action,
      followUps: [
        'Website (₹10k) vs Web App (₹15k)?',
        'My budget is ₹15,000 — what fits best?',
        'How fast is turnaround?',
      ],
    };
  }

  return {
    action,
    followUps: [
      'Estimate a custom bundle cost',
      'Website vs Web App — which do I need?',
      'Show your Redesign Demos & Work',
    ],
  };
}

export function getAjaSmartFallback(
  userInput: string,
  _history?: Array<{ role: string; text: string }>
): AjaSmartReply {
  const q = (userInput || '').toLowerCase().trim();

  // 0. Live Bundle Calculator (e.g., "website + chatbot + logo")
  const bundleReply = tryCalculateBundle(q);
  if (bundleReply) return bundleReply;

  // 0b. Budget-Based Smart Recommendation (e.g., "I have ₹15,000" or "budget 10k")
  const budgetReply = tryMatchBudget(q);
  if (budgetReply) return budgetReply;

  // 0c. Website Redesigns & Before/After Demos
  if (
    q.includes('redesign') ||
    q.includes('before and after') ||
    q.includes('before & after') ||
    q.includes('vera') ||
    q.includes('nexora') ||
    q.includes('demo')
  ) {
    return {
      reply:
        `Our **Before & After Website Redesign Demos** showcase how ArkAja transforms plain layouts into completely distinct brand worlds:\n\n` +
        `• **Vera's Cake Shop** — *Cute & Playful* pastel bakery aesthetic with warm typography and appetizing product cards.\n` +
        `• **Nexora** — *Modern & Professional* sleek violet/dark tech & SaaS polish.\n\n` +
        `Scroll to **Selected Work** and click **SHOW DEMO** to slide or click through both full-screen comparisons. A standard website redesign starts at **₹10,000** (or **₹12,000** for 48–72h urgent delivery).`,
      action: { type: 'work', label: 'Jump to Redesign Demos →' },
      followUps: [
        'What is included in the ₹10,000 Website?',
        'Estimate Website + Logo + AI Chatbot',
        'Can you match my brand’s aesthetic?',
      ],
    };
  }

  // 0d. Industry-Specific Art Direction Pitch
  const industryReply = tryIndustryPitch(q);
  if (industryReply) return industryReply;

  // 1. Web Apps & Business Systems vs. Basic Website
  if (
    q.includes('web app') ||
    q.includes('webapp') ||
    q.includes('business system') ||
    q.includes('crm') ||
    q.includes('inventory') ||
    q.includes('dashboard') ||
    q.includes('portal') ||
    q.includes('saas') ||
    (q.includes('website') && (q.includes('difference') || q.includes('vs')))
  ) {
    return {
      reply:
        `Here's the cleanest way to decide between our **Website** and **Web App** tiers:\n\n` +
        `• **Basic Website (₹10,000)** — *"Here is my business."*\n` +
        `  Responsive 4-page showcase (Home, About, Services, Contact) + live deployment (5–7 days).\n\n` +
        `• **Basic Web App — Level 1 (₹15,000 fixed)** — *"Here is a system that runs a workflow."*\n` +
        `  Single-workflow tool with database (Add/Edit/Delete/Search), forms, status tracking & admin dashboard—great for appointments, bookings, orders, mini inventory, or billing (7–10 days).\n\n` +
        `• **Advanced Web Apps & Platforms (Custom Quote)**\n` +
        `  Multi-role accounts (customer/staff/admin), payment gateways, automated WhatsApp/email flows, marketplaces, or enterprise SaaS.`,
      action: { type: 'pricing', label: 'Compare Full Pricing →' },
      followUps: [
        'Estimate Web App + Logo cost',
        'Can I add an AI Chatbot (+₹5,000)?',
        'Start my project brief',
      ],
    };
  }

  // 2. Pricing, Packages, Cost
  if (
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('package') ||
    q.includes('rate') ||
    q.includes('how much') ||
    q.includes('fee') ||
    q.includes('charge') ||
    q.includes('investment') ||
    q.includes('starter') ||
    q.includes('signature') ||
    q.includes('discount') ||
    q.includes('offer')
  ) {
    return {
      reply:
        `ArkAja Studio uses transparent, one-time standard rates (zero monthly SaaS retainers):\n\n` +
        `• **Basic Website**: **₹10,000** (~$120 / €110) · *Urgent 48–72h: ₹12,000*\n` +
        `• **Basic Web App (Level 1)**: **₹15,000** (~$180 / €165) · single-workflow system + DB + admin\n` +
        `• **Logo Design Kit**: **₹3,000** (~$36 / €33) · 3-stage kit, up to 2 revisions\n` +
        `• **Starter Social Content**: **₹2,499** (4 posts, 2 stories, 1 promo, 1 short-form)\n` +
        `• **Signature Social Content**: **₹4,999** (8 posts, 4 stories, 2 promos, captions, **48h delivery**)\n` +
        `• **Website Add-Ons**: Urgent Delivery (**+₹2,000**), Enquiry Form (**+₹3,000**), AI Chatbot (**+₹5,000**)\n` +
        `• **Custom Quote**: Brand Identity, Advanced Web Apps, AI Business Solutions, Business Launch Bundle.\n\n` +
        `Tell me which items you'd like to combine (or your budget) and I'll calculate an exact estimate!`,
      action: { type: 'builder', label: 'Calculate in Scope Builder →' },
      followUps: [
        'Estimate Website + Logo + AI Chatbot',
        'My budget is ₹15,000 — what fits best?',
        'Website vs Web App — which do I need?',
      ],
    };
  }

  // 3. Turnaround, Availability & Slots
  if (
    q.includes('turnaround') ||
    q.includes('delivery') ||
    q.includes('how long') ||
    q.includes('fast') ||
    q.includes('quick') ||
    q.includes('urgent') ||
    q.includes('deadline') ||
    q.includes('48 hour') ||
    q.includes('slot') ||
    q.includes('available') ||
    q.includes('availability')
  ) {
    return {
      reply:
        `We currently have **2 client slots open** (booking for December & January) with rapid in-house turnaround:\n\n` +
        `• **Signature Content (₹4,999)**: **48-hour priority delivery**\n` +
        `• **Urgent Basic Website (₹12,000)**: **48–72h priority delivery**\n` +
        `• **Logo Design (₹3,000) & Starter Content (₹2,499)**: **3–5 business days**\n` +
        `• **Basic Website (₹10,000)**: **5–7 business days**\n` +
        `• **Basic Web App Level 1 (₹15,000)**: **7–10 business days**\n\n` +
        `Every commission follows our 4-step studio workflow: **Brief → Direction → Create → Deliver**.`,
      action: { type: 'enquiry', label: 'Reserve a Slot →' },
      followUps: [
        'How do I start a project?',
        'What payment methods do you accept?',
        'Estimate my project scope',
      ],
    };
  }

  // 4. AI + Human Art Direction
  if (
    q.includes('human') ||
    q.includes('art direction') ||
    q.includes('why ai') ||
    q.includes('is it ai') ||
    q.includes('how do you use ai') ||
    q.includes('generate') ||
    q.includes('slop') ||
    q.includes('philosophy')
  ) {
    return {
      reply:
        `Our studio ethos is **"AI-assisted creative production. Human-led art direction."**\n\n` +
        `• **Where AI accelerates**: Rapid exploration of lighting, bespoke backdrops, mood textures, and visual concepts in hours instead of weeks.\n` +
        `• **Where human art direction leads**: Every composition, typographic pairing, grid rhythm, color grade, and line of code is crafted and refined by senior human designers—zero generic AI templates.`,
      action: { type: 'work', label: 'See Concept Case Studies →' },
      followUps: [
        'Show Before & After Website Redesigns',
        'What services do you offer?',
        'Compare Starter vs Signature packages',
      ],
    };
  }

  // 5. Services & Deliverables
  if (
    q.includes('service') ||
    q.includes('what do you do') ||
    q.includes('what can you do') ||
    q.includes('discipline') ||
    q.includes('deliverable')
  ) {
    return {
      reply:
        `ArkAja Studio engineers both **visual identity** and **production web software** in-house:\n\n` +
        `1. **Websites & Redesigns** — Responsive business sites (₹10,000), urgent 48–72h launches (₹12,000), Enquiry Forms (+₹3,000) & AI Chatbots (+₹5,000).\n` +
        `2. **Web Apps & Business Systems** — Level 1 workflow apps (₹15,000) and custom multi-role platforms.\n` +
        `3. **Branding & Logo Design** — 3-stage Logo Kits (₹3,000) & full Brand Identity systems.\n` +
        `4. **Editorial Social & Campaigns** — Starter (₹2,499), Signature 48h (₹4,999) & Custom Campaigns.\n\n` +
        `Tell me what you're building and I'll map out the cleanest package for you!`,
      action: { type: 'services', label: 'Explore All Services →' },
      followUps: [
        'Recommend a package for my business',
        'Estimate Website + Logo + Chatbot',
        'Show Before & After Website Redesigns',
      ],
    };
  }

  // 6. How to start / Book / Process
  if (
    q.includes('how to start') ||
    q.includes('how do i start') ||
    q.includes('book') ||
    q.includes('hire') ||
    q.includes('order') ||
    q.includes('process') ||
    q.includes('onboard') ||
    q.includes('get started')
  ) {
    return {
      reply:
        `Starting a project takes under 2 minutes:\n\n` +
        `1. **Scope**: Pick your deliverables in our **Interactive Scope Builder** (live INR subtotal) or jump right into the **Enquiry Brief**.\n` +
        `2. **Direction**: Within 24 hours we align on aesthetic direction, references, and milestones.\n` +
        `3. **Create**: In-house design & engineering with collaborative revision checkpoints.\n` +
        `4. **Deliver**: Production-ready web launch or high-res campaign assets.\n\n` +
        `We have **2 slots open** right now—ready to lock yours in?`,
      action: { type: 'enquiry', label: 'Fill Enquiry Brief →' },
      followUps: [
        'Calculate my bundle in Scope Builder',
        'What payment methods are accepted?',
        'What is your revision policy?',
      ],
    };
  }

  // 7. Portfolio Case Studies (Lumière, Muse, Élan, Saree)
  if (q.includes('lumiere') || q.includes('lumière') || q.includes('muse') || q.includes('beauty') || q.includes('skin') || q.includes('facial') || q.includes('cosmetic')) {
    return {
      reply:
        `In beauty & skincare, we've created two distinct editorial worlds you can inspect in **Selected Work** (click any card for the full slide-over case study):\n\n` +
        `• **LUMIÈRE** (*"Your Glow. Elevated."*) — Clinical-luxury hydrafacials, macro droplet textures, gold & obsidian palette.\n` +
        `• **MUSE BEAUTY LONDON** (*"Minimalist British Luxury"*) — Botanical formulations, amber glass & quiet editorial typography.\n\n` +
        `Both pair beautifully with our **Signature Content (₹4,999)** or a bespoke **₹10,000 Brand Website**.`,
      action: { type: 'work', label: 'Open Beauty Case Studies →' },
      followUps: [
        'Compare Starter vs Signature Content',
        'Estimate Website + Signature Content',
        'Start a brief with this direction',
      ],
    };
  }

  if (q.includes('elan') || q.includes('élan') || q.includes('fashion') || q.includes('saree') || q.includes('ethnic') || q.includes('clothing') || q.includes('apparel') || q.includes('boutique')) {
    return {
      reply:
        `For fashion & apparel labels, check out our two fashion case studies in **Selected Work**:\n\n` +
        `• **ÉLAN** (*"The Autumn Edit"*) — Contemporary Parisian tailoring, quiet luxury palettes & high-save carousels like *"3 Ways to Style One Blazer"*.\n` +
        `• **ETHNIC FASHION EDIT** (*"The Heirloom Drape"*) — Heritage Indian handloom weaves framed with modern editorial restraint.\n\n` +
        `For a seasonal drop, **Signature (₹4,999, 48h delivery)** or a **Brand Website (₹10,000)** gets you live fast.`,
      action: { type: 'work', label: 'View Fashion Case Studies →' },
      followUps: [
        'Estimate Website + Logo + Signature Content',
        'Do you do Reels & video concepts?',
        'Start a fashion campaign brief',
      ],
    };
  }

  // 8. Revisions, Domains, Files
  if (q.includes('domain') || q.includes('hosting') || q.includes('revision') || q.includes('format') || q.includes('file') || q.includes('source')) {
    return {
      reply:
        `Here are our exact studio policies on deliverables, domains & revisions:\n\n` +
        `• **Websites**: Responsive mobile + desktop build + live production deployment included. **Custom Domain** is billed at registrar cost + applicable ArkAja setup/handling fee.\n` +
        `• **Logo Design (₹3,000)**: High-res transparent, color & monochrome files for web, social & print + **up to 2 revision rounds**.\n` +
        `• **Social Content**: Pixel-perfect PNG/JPEG exports sized for 4:5 Feed, 9:16 Stories & Carousels with collaborative revision checkpoints.`,
      action: { type: 'pricing', label: 'Review Package Details →' },
      followUps: [
        'What is included in Basic Website (₹10,000)?',
        'How do Razorpay payments work?',
        'Open Enquiry Brief',
      ],
    };
  }

  // 9. Payments & Currencies
  if (q.includes('payment') || q.includes('pay') || q.includes('razorpay') || q.includes('upi') || q.includes('card') || q.includes('invoice') || q.includes('usd') || q.includes('eur') || q.includes('international')) {
    return {
      reply:
        `Payments are processed securely via **Razorpay Global Checkout**:\n\n` +
        `• **Methods**: UPI, Google Pay, Indian & International Credit/Debit Cards, Netbanking & Wallets.\n` +
        `• **Global Currencies**: Transparent live conversion from INR (₹) for **USD ($)**, **EUR (€)**, and **GBP (£)** clients worldwide.\n` +
        `• **One-Time Project Fees**: No subscriptions or hidden retainers, plus an official studio confirmation receipt with every booking.`,
      action: { type: 'pricing', label: 'View Packages & Checkout →' },
      followUps: [
        'Estimate my bundle total',
        'How long is turnaround after booking?',
        'Contact studio directly',
      ],
    };
  }

  // 10. Contact & Studio Location
  if (q.includes('contact') || q.includes('email') || q.includes('instagram') || q.includes('where') || q.includes('mumbai') || q.includes('phone') || q.includes('whatsapp') || q.includes('founder') || q.includes('divyaam')) {
    return {
      reply:
        `You can reach ArkAja Studio (led by Creative Director **Divyaam**) directly:\n\n` +
        `• **Email**: [arkajastudio@gmail.com](mailto:arkajastudio@gmail.com)\n` +
        `• **Instagram**: [@arkajastudio](https://www.instagram.com/arkajastudio/)\n` +
        `• **Base**: Mumbai, India — partnering with brands worldwide.\n\n` +
        `Or submit your brief in our Enquiry section below for a same-day response!`,
      action: { type: 'enquiry', label: 'Go to Enquiry Form →' },
      followUps: [
        'Check current slot availability',
        'Compare all packages',
        'Open Project Scope Builder',
      ],
    };
  }

  // 11. Reels / Video
  if (q.includes('reel') || q.includes('video') || q.includes('motion') || q.includes('animation')) {
    return {
      reply:
        `Yes! We craft **short-form visual concepts & Reel direction**—including storyboard frames, pacing guides, transition cues, and aesthetic hooks.\n\n` +
        `• **Starter (₹2,499)** already includes **1 short-form visual**, and you can specify custom Reel volumes directly inside our **Scope Builder**.`,
      action: { type: 'builder', label: 'Select Reels in Builder →' },
      followUps: [
        'Compare Starter vs Signature',
        'How fast is delivery?',
        'Start a project brief',
      ],
    };
  }

  // 12. Casual / Personality / Jokes / Greetings
  if (
    q.includes('how was your day') ||
    q.includes('how is your day') ||
    q.includes("how's your day") ||
    q.includes('how are you') ||
    q.includes("how's it going") ||
    q.includes('what are you doing') ||
    q.includes('what are you up to')
  ) {
    return {
      reply:
        `Honestly, it's been a sharp, inspiring day in the studio—polishing editorial layouts, sketching redesign concepts, and keeping coffee within arm's reach.\n\n` +
        `How's your day treating you? Building something exciting right now, or just taking a breather?`,
      followUps: [
        'Tell me a creative joke',
        'Show me your coolest Redesign Demos',
        'Help me plan a project for my brand',
      ],
    };
  }

  if (q.includes('who are you') || q.includes('what is your name') || q.includes('about yourself')) {
    return {
      reply:
        `I'm **Aja**—ArkAja Studio's creative advisor, scope architect, and favorite conversation partner.\n\n` +
        `I can calculate live project bundles, pitch bespoke art direction for your business, compare Websites vs. Web Apps, or just chat about design, ideas, and life. What shall we dive into?`,
      followUps: [
        'Estimate a custom bundle cost',
        'Recommend a package for my business',
        'Show Before & After Website Redesigns',
      ],
    };
  }

  if (q.includes('joke') || q.includes('funny') || q.includes('laugh')) {
    return {
      reply:
        `Here's a studio classic:\n\n` +
        `Why did the graphic designer break up with the minimalist? Because they needed *more negative space*. 😉\n\n` +
        `Got a brand idea you want to riff on, or want another one?`,
      followUps: [
        'Show Before & After Website Redesigns',
        'What can I get for ₹10,000?',
        'Explain AI + human art direction',
      ],
    };
  }

  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.startsWith('hi ') ||
    q.startsWith('hello ') ||
    q.startsWith('hey ') ||
    q.includes('good morning') ||
    q.includes('good afternoon') ||
    q.includes('good evening')
  ) {
    return {
      reply:
        `Hey! Welcome to **ArkAja Studio** — I'm **Aja**, ready whenever you are.\n\n` +
        `Tell me what you're building (or drop your budget / wish-list like *"website + logo + chatbot"*) and I'll give you an instant cost estimate & creative direction—or we can just chat!`,
      followUps: [
        'Estimate Website + Logo + AI Chatbot',
        'Website (₹10k) vs Web App (₹15k)?',
        'Show Before & After Website Redesigns',
      ],
    };
  }

  if (/^(thanks|thank you|thx|ok|okay|got it|cool|great|awesome|nice|perfect)\b/.test(q)) {
    return {
      reply:
        `Anytime! If you'd like me to estimate a bundle, pitch an aesthetic for your brand, or jump straight to booking one of our **2 open slots**, just say the word.`,
      followUps: [
        'Launch Scope Builder',
        'View Full Pricing',
        'Fill Enquiry Form',
      ],
    };
  }

  // 13. General smart conversational fallback
  return {
    reply:
      `Love that you brought that up! Tell me a little more about what you have in mind—whether you're brainstorming a brand, comparing a **Website (₹10,000)** vs. **Web App (₹15,000)**, estimating a custom bundle, or just bouncing ideas around, I'm right here to dig in with you.`,
    followUps: [
      'Estimate a custom bundle cost',
      'Recommend a package for my business',
      'Show Before & After Website Redesigns',
    ],
  };
}

/**
 * Backward-compatible string helper used by older callers.
 */
export function getAjaContextualResponse(userInput: string): string {
  return getAjaSmartFallback(userInput).reply;
}
