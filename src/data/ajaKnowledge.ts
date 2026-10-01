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
      "ArkAja Studio provides transparent, one-time project packages without recurring monthly subscriptions:\n\n" +
      "• **Starter Package (₹2,499 / $49 / £39)**:\n" +
      "  Includes 4 feed posts, 2 stories, 1 promotional creative, 1 short-form visual direction, and unified brand aesthetics. Delivered in 3–5 business days.\n\n" +
      "• **Signature Package (₹4,999 / $99 / £79)** (Most Popular):\n" +
      "  Includes 8 feed posts, 4 stories, 2 promotional creatives, caption writing, visual direction, and priority queue with our **48-hour delivery option**.\n\n" +
      "• **Custom Campaign**:\n" +
      "  Tailored scoping for seasonal edits, multi-product launches, or full brand aesthetic overhauls. You can use our interactive **Project Builder** to calculate your exact deliverable counts!"
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

  // 15. Greetings & Pleasantries
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
      "Hello! Welcome to ArkAja Studio. I'm Aja, your personal creative advisor.\n\n" +
      "Whether you're developing a beauty label, launching a fashion collection, or elevating your café's social presence, I'm here to help you navigate our packages, understand our human-led art direction, or draft your project brief.\n\n" +
      "What kind of campaign or content are you planning today?"
    );
  }

  // 16. Acknowledgements
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
      "You're very welcome! If you're ready to shape your campaign, feel free to explore our **Project Builder** to customize your exact deliverables, or scroll to the **Enquire** section to send us your brief. I'm right here if any other questions come up!"
    );
  }

  // 17. Adaptive contextual fallback addressing user's specific query
  return (
    `Thank you for asking about that! ArkAja Studio crafts tailored editorial content, campaigns, and visual identities specifically for brands in beauty, fashion, lifestyle, and hospitality.\n\n` +
    `Regarding your focus on "${userInput.slice(0, 60).replace(/["\n]/g, '')}", our senior art directors combine AI visual acceleration with meticulous human typography and color grading to ensure every asset feels bespoke, high-converting, and quiet-luxury.\n\n` +
    `Would you like to explore our Starter (₹2,499) or Signature (₹4,999 with 48h turnaround) packages, or would you like to build a custom brief in our Project Builder?`
  );
}
