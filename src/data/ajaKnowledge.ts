/**
 * Comprehensive Knowledge Base & Conversational Engine for Aja (ArkAja Studio Advisor).
 * Provides rich, authoritative, non-repeating answers on pricing, turnaround,
 * art direction, concept projects, and custom deliverables.
 */
export function getAjaContextualResponse(userInput: string): string {
  const q = (userInput || '').toLowerCase().trim();

  // 1. Pricing, Packages, Cost
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
    q.includes('signature')
  ) {
    return (
      "ArkAja Studio provides transparent, one-time project packages without recurring monthly subscriptions, currently featuring our **Navratri 20% Festive Celebration Discount**:\n\n" +
      "• **Basic Website (₹10,000)**: Clean, responsive online presence (Home, About, Services, Contact, Deployment). Was ~~₹12,500~~ (20% off).\n\n" +
      "• **Basic Web App (Level 1) (₹15,000)**: Single workflow system with database & admin dashboard. Was ~~₹18,750~~ (20% off). Anything aside is custom quote.\n\n" +
      "• **Starter Content Package (₹2,499)**: 4 feed posts, 2 stories, 1 promo creative. Was ~~₹3,125~~ (20% off).\n\n" +
      "• **Signature Content Package (₹4,999)**: 8 feed posts, 4 stories, 2 promo visuals, caption writing, and 48-hour priority queue. Was ~~₹6,249~~ (20% off).\n\n" +
      "• **Logo Design (₹3,000)**: 3-stage identity kit (concept, variations, kit, up to 2 revisions). Was ~~₹3,750~~ (20% off).\n\n" +
      "• **Custom Solutions**: Brand Identity, AI Chatbots (+₹5,000, was ~~₹6,250~~), and Advanced Web Apps / Business Systems (Custom Quote)."
    );
  }

  // 1a-festive. Navratri Discounts & Offers
  if (
    q.includes('discount') ||
    q.includes('offer') ||
    q.includes('navratri') ||
    q.includes('sale') ||
    q.includes('coupon') ||
    q.includes('deal')
  ) {
    return (
      "🌸 **Navratri Utsav Special Offer — Flat 20% Festive Discount Active!**\n\n" +
      "ArkAja Studio is celebrating the festive season with a flat 20% discount across all packages:\n\n" +
      "• **Basic Website**: ₹10,000 (was ~~₹12,500~~ · 20% off)\n" +
      "• **Basic Web App (Level 1)**: ₹15,000 (was ~~₹18,750~~ · 20% off)\n" +
      "• **Logo Design**: ₹3,000 (was ~~₹3,750~~ · 20% off)\n" +
      "• **Starter Content**: ₹2,499 (was ~~₹3,125~~ · 20% off)\n" +
      "• **Signature Content**: ₹4,999 (was ~~₹6,249~~ · 20% off)\n" +
      "• **Website Add-ons**: Urgent Delivery (+₹2,000), Enquiry Form (+₹3,000), AI Chatbot (+₹5,000)\n\n" +
      "All rates shown on the studio platform are the final 20% discounted rates, with the 20% higher standard rates strikethrough!"
    );
  }

  // 1b. Web Apps & Business Systems vs. Basic Website
  if (
    q.includes('web app') ||
    q.includes('webapp') ||
    q.includes('business system') ||
    q.includes('crm') ||
    q.includes('inventory') ||
    q.includes('dashboard') ||
    q.includes('portal') ||
    q.includes('saas') ||
    (q.includes('website') && q.includes('difference')) ||
    (q.includes('website') && q.includes('vs'))
  ) {
    return (
      "Here is the pricing and architectural structure at ArkAja Studio:\n\n" +
      "• **Basic Website (₹10,000)** — *\"Here is my business.\"*\n" +
      "  Mostly information + contact (e.g. for a salon: Home → About → Services → Gallery → Contact). The visitor reads information and contacts you.\n\n" +
      "• **Basic Web App (Level 1) — ₹15,000 only** — *\"Here is a system that runs a workflow.\"*\n" +
      "  Costs ₹15,000 fixed price. Includes a single workflow, limited users, structured database with Add/Edit/Delete/Search, user input forms, responsive UI, status tracking, and admin dashboard (e.g. Salon/Doctor Appointments, Restaurant Order Requests, Mini Inventory, Billing & Invoicing, Coaching Records, Property Listings).\n\n" +
      "• **Anything Aside From That — Custom Quote**\n" +
      "  🟡 **Level 2 — Advanced Web Apps**: Multi-role accounts (customer + staff + admin), payment gateway flows, automated WhatsApp/email notifications, workflows, reports, and file uploads.\n" +
      "  🔴 **Level 3 — Custom Platforms**: Enterprise systems, hospital management, scholarship systems, parental monitoring, email security, marketplaces, multi-tenant SaaS.\n\n" +
      "So: **Basic Website is ₹10,000**, the **Basic Web App is ₹15,000 only**, and **anything aside from that is Custom Quote** based on complexity!"
    );
  }

  // 2. Turnaround, Delivery Time, Rush
  if (
    q.includes('turnaround') ||
    q.includes('delivery') ||
    q.includes('how long') ||
    q.includes('fast') ||
    q.includes('quick') ||
    q.includes('urgent') ||
    q.includes('deadline') ||
    q.includes('48 hour') ||
    q.includes('days')
  ) {
    return (
      "We design for rapid, editorial-grade turnaround:\n\n" +
      "• **Signature Package**: Offers our signature **48-hour delivery** with priority queue placement.\n" +
      "• **Starter Package**: Completed and delivered within **3 to 5 business days**.\n" +
      "• **Custom Campaigns**: Usually delivered within **5 to 7 days**, depending on volume.\n\n" +
      "Every project follows our 4-step workflow: Brief → Direction → Create → Deliver."
    );
  }

  // 3. AI + Human Art Direction, Why AI, Method
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
    return (
      "At ArkAja Studio, our philosophy is simple: **\"AI-assisted creative production. Human-led art direction.\"**\n\n" +
      "• **Why AI?** We use generative synthesis and neural pipelines as an accelerator to explore complex lighting, textural concepts, and high-fashion backdrops in hours rather than weeks.\n\n" +
      "• **Why Human Art Direction?** Pure AI output often suffers from generic tropes, poor typography, and lack of brand intent. Senior human designers oversee every composition, typographic pairing, color grading, and editorial pacing. Nothing leaves the studio without meticulous human refinement."
    );
  }

  // 4. Services & What ArkAja Does
  if (
    q.includes('service') ||
    q.includes('what do you do') ||
    q.includes('what can you do') ||
    q.includes('offer') ||
    q.includes('discipline') ||
    q.includes('deliverable')
  ) {
    return (
      "ArkAja Studio specializes in modern, visually-led content across 4 core disciplines:\n\n" +
      "1. **Social Content**: High-engagement Instagram posts, swipe-worthy educational/styling carousels, immersive stories, and promotional creatives.\n" +
      "2. **Campaign Creative**: Product launches, seasonal edits, festival campaigns, and promotional sale visuals.\n" +
      "3. **Promotional Visuals**: High-conversion treatments, offer announcement cards, and hero treatment features.\n" +
      "4. **Brand Visuals**: Art direction guides, cohesive visual systems, and unified color & typographic palettes.\n\n" +
      "We also craft custom video concepts and reel directions upon request!"
    );
  }

  // 5. How to start, Book, Hire, Process
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
    return (
      "Starting a project with ArkAja Studio is frictionless:\n\n" +
      "1. **Brief**: Tell us about your brand, products, aesthetic goals, and timeline using our **Build Your Project** section or Enquiry form.\n" +
      "2. **Direction**: We propose a cohesive visual direction, references, and styling approach.\n" +
      "3. **Create**: AI-assisted production paired with human art direction to craft your campaign assets.\n" +
      "4. **Deliver**: Receive polished, high-resolution raster assets ready for social channels.\n\n" +
      "Click **START PROJECT** in the top navigation or scroll to our Enquiry section to submit your brief!"
    );
  }

  // 6. Lumière / Beauty / Skincare
  if (
    q.includes('lumiere') ||
    q.includes('beauty') ||
    q.includes('skin') ||
    q.includes('facial') ||
    q.includes('spa') ||
    q.includes('wellness') ||
    q.includes('cosmetic')
  ) {
    return (
      "For beauty, skincare, and wellness labels, we design luminous, clinical-luxury aesthetics.\n\n" +
      "Our featured concept, **LUMIÈRE** (\"Your Glow. Elevated.\"), showcases signature hydrafacial treatments, macro droplet texture pairings, and restrained typography in gold, warm bone, and deep obsidian.\n\n" +
      "We can tailor this luminous editorial standard to your formulations, serums, clinic protocols, or treatment menus."
    );
  }

  // 7. Noir & Bean / Hospitality / Cafes / Food
  if (
    q.includes('noir') ||
    q.includes('bean') ||
    q.includes('cafe') ||
    q.includes('coffee') ||
    q.includes('restaurant') ||
    q.includes('brunch') ||
    q.includes('food') ||
    q.includes('hospitality')
  ) {
    return (
      "For hospitality, specialty cafés, and dining spaces, our concept **NOIR & BEAN** (\"Your 4PM Deserves This\") demonstrates how to turn coffee rituals into craving-worthy visual culture.\n\n" +
      "Featuring iced vanilla cloud lattes, slow weekend brunch club carousels, and afternoon golden-hour light, it proves how editorial art direction elevates everyday culinary moments.\n\n" +
      "Would you like to build a menu launch or beverage campaign with this warm café palette?"
    );
  }

  // 8. Élan / Contemporary Fashion / Womenswear
  if (
    q.includes('elan') ||
    q.includes('fashion') ||
    q.includes('clothes') ||
    q.includes('blazer') ||
    q.includes('womenswear') ||
    q.includes('apparel') ||
    q.includes('style') ||
    q.includes('autumn')
  ) {
    return (
      "For contemporary apparel and fashion labels, our concept **ÉLAN** (\"The Autumn Edit\") embodies Parisian architectural tailoring and quiet luxury capsule styling.\n\n" +
      "It features highly saved social formats like '3 Ways to Style One Blazer', muted warm-stone studio lighting, and sculptural silhouette crops.\n\n" +
      "We can create similar lookbooks, seasonal drops, or capsule guides for your clothing brand."
    );
  }

  // 9. Saree / Ethnic Fashion / Handloom
  if (
    q.includes('saree') ||
    q.includes('ethnic') ||
    q.includes('handloom') ||
    q.includes('indian') ||
    q.includes('drape') ||
    q.includes('festive') ||
    q.includes('heritage')
  ) {
    return (
      "Our **ETHNIC FASHION EDIT** (\"The Heirloom Drape\") reinterprets traditional Indian craftsmanship through a modern high-fashion editorial lens.\n\n" +
      "It celebrates rich handloom weaves, festive drape storytelling, and contemporary styling guides (like '3 Ways to Drape a Contemporary Saree') with jewel tones and natural light.\n\n" +
      "Perfect for bridal, festive, or contemporary artisan labels looking for elevated social campaigns."
    );
  }

  // 10. Reels, Video, Motion
  if (
    q.includes('reel') ||
    q.includes('video') ||
    q.includes('motion') ||
    q.includes('tiktok') ||
    q.includes('animation')
  ) {
    return (
      "We provide specialized visual direction and concepts for short-form video and Instagram Reels!\n\n" +
      "This includes storyboard frames, pacing guides, visual transition concepts, and audio pairing recommendations tailored for viral aesthetic arrest. You can select 'Short-form Video' directly inside our **Project Builder**."
    );
  }

  // 11. Revisions, File Formats & Deliverables
  if (
    q.includes('revision') ||
    q.includes('change') ||
    q.includes('format') ||
    q.includes('file') ||
    q.includes('psd') ||
    q.includes('canva') ||
    q.includes('resolution')
  ) {
    return (
      "All ArkAja Studio deliverables are exported in pixel-perfect, high-resolution raster formats (PNG/JPEG) optimized specifically for Instagram feed (4:5 vertical), stories (9:16), and carousels.\n\n" +
      "Every package includes collaborative revision rounds to ensure typography, tone, and brand colors align exactly with your vision before final sign-off."
    );
  }

  // 12. Payment, Razorpay, Invoicing
  if (
    q.includes('payment') ||
    q.includes('pay') ||
    q.includes('razorpay') ||
    q.includes('upi') ||
    q.includes('card') ||
    q.includes('invoice')
  ) {
    return (
      "We support smooth, transparent payments powered by Razorpay:\n\n" +
      "• **Starter Package**: ₹2,499 INR (~$30 USD / €28 EUR)\n" +
      "• **Signature Package**: ₹4,999 INR (~$60 USD / €55 EUR)\n" +
      "• **Custom Campaign**: As per requirement (no fixed price; custom quoted based on your exact deliverables & timeline).\n" +
      "• **Currencies & Methods**: INR (₹), USD ($), EUR (€), and GBP (£) via UPI, Cards, Net Banking, and International Cards.\n" +
      "• **Invoices**: Official studio transaction receipt issued with every project commission."
    );
  }

  // 13. Contact, Location, Social
  if (
    q.includes('contact') ||
    q.includes('email') ||
    q.includes('instagram') ||
    q.includes('where') ||
    q.includes('mumbai') ||
    q.includes('phone')
  ) {
    return (
      "You can connect directly with the ArkAja Studio team:\n\n" +
      "• **Official Email**: arkajastudio@gmail.com\n" +
      "• **Instagram**: [@arkajadesigner6208](https://www.instagram.com/arkajadesigner6208?stkn=aHBmdnFtc241djZ6)\n" +
      "• **Studio Base**: Mumbai, India — accepting bespoke client projects worldwide.\n\n" +
      "Or fill out the Enquiry brief at the bottom of this page for a same-day response!"
    );
  }

  // 14. Which package should I choose?
  if (
    q.includes('recommend') ||
    q.includes('which package') ||
    q.includes('help me choose') ||
    q.includes('difference') ||
    q.includes('compare')
  ) {
    return (
      "Here is how to choose between our packages:\n\n" +
      "• Choose **STARTER (₹2,499)** if you have a single product launch, weekend offer, or want to test our editorial direction with 4 high-impact posts and 2 stories (delivered in 3–5 days).\n\n" +
      "• Choose **SIGNATURE (₹4,999)** if you need a cohesive month-long aesthetic or major campaign. It gives you 8 posts, 4 stories, 2 promo visuals, full caption writing, and priority **48-hour delivery**.\n\n" +
      "• Choose **CUSTOM** if you have multiple SKUs or need ongoing quarterly campaign creative."
    );
  }

  // 15. Casual Day-to-Day Questions (How was your day, How are you, etc.)
  if (
    q.includes('how was your day') ||
    q.includes('how is your day') ||
    q.includes("how's your day") ||
    q.includes('how are you') ||
    q.includes("how's it going") ||
    q.includes('what are you doing') ||
    q.includes('what are you up to') ||
    q.includes('how do you feel')
  ) {
    return (
      "My day has been wonderful! I've been immersed in curating new visual aesthetics, reviewing atelier concepts, and talking with brilliant creators and brands. Thank you so much for asking!\n\n" +
      "How has your day been going? Are you working on a creative venture today, or just taking some time to explore?"
    );
  }

  // 15b. Who are you / Persona
  if (
    q.includes('who are you') ||
    q.includes('what is your name') ||
    q.includes('tell me about yourself')
  ) {
    return (
      "I'm Aja—the creative guide, conversation partner, and art-direction advisor for ArkAja Studio! ✨\n\n" +
      "I love typography, editorial aesthetics, storytelling, and helping brands stand out. But I'm also here to chat about anything under the sun—from day-to-day musings to big creative dreams. What's on your mind today?"
    );
  }

  // 15c. Jokes & Humor
  if (q.includes('joke') || q.includes('funny') || q.includes('laugh')) {
    return (
      "Here's one for you:\n\n" +
      "Why did the graphic designer break up with the minimalist? ... Because they needed more space! 😉\n\n" +
      "How's your mood today? Need creative inspiration, or just good banter?"
    );
  }

  // 16. Greetings & Pleasantries
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.startsWith('hi ') ||
    q.startsWith('hello ') ||
    q.includes('good morning') ||
    q.includes('good evening')
  ) {
    return (
      "Hello! Welcome to ArkAja Studio. I'm Aja, your guide and creative companion.\n\n" +
      "Whether you want to talk about website design, brand identity, campaign visuals—or just chat about your day, creative ideas, or life—I'm right here! What would you like to talk about today?"
    );
  }

  // 17. Acknowledgements
  if (
    q === 'thanks' ||
    q === 'thank you' ||
    q === 'ok' ||
    q === 'okay' ||
    q === 'got it' ||
    q === 'cool' ||
    q === 'great' ||
    q === 'understood'
  ) {
    return (
      "You're very welcome! If you ever want to brainstorm, chat about projects, or just talk, I'm right here!"
    );
  }

  // 18. Adaptive conversational response for any topic
  return (
    `That's an interesting topic! As Aja, I'm always up for discussing diverse ideas, creativity, culture, or whatever is on your mind.\n\n` +
    `Tell me more about what you're thinking, or let me know if you also want to explore our studio design and development services!`
  );
}
