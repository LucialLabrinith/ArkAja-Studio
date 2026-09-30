import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Ensure public upload directories exist
const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure public portfolio asset directory exists
const portfolioDir = path.resolve(process.cwd(), 'public', 'assets', 'portfolio');
if (!fs.existsSync(portfolioDir)) {
  fs.mkdirSync(portfolioDir, { recursive: true });
}

// Persistent JSON backup store for uploaded portfolio artwork
const portfolioStoreFile = path.resolve(process.cwd(), 'portfolio-assets-store.json');

// Auto-restore any saved base64 images from JSON store to disk on server boot
function restorePortfolioAssetsFromStore() {
  try {
    if (fs.existsSync(portfolioStoreFile)) {
      const store: Record<string, string> = JSON.parse(fs.readFileSync(portfolioStoreFile, 'utf-8'));
      for (const [filename, base64Payload] of Object.entries(store)) {
        const cleanName = path.basename(filename);
        const targetPath = path.join(portfolioDir, cleanName);
        if (!fs.existsSync(targetPath)) {
          const base64Data = base64Payload.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
          fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
          console.log(`[PortfolioStore] Restored ${cleanName} from persistent JSON store`);
        }
      }
    }
  } catch (err) {
    console.error('Error restoring portfolio assets:', err);
  }
}
restorePortfolioAssetsFromStore();

function savePortfolioAssetToStore(filename: string, base64Payload: string) {
  try {
    let store: Record<string, string> = {};
    if (fs.existsSync(portfolioStoreFile)) {
      try {
        store = JSON.parse(fs.readFileSync(portfolioStoreFile, 'utf-8'));
      } catch (e) {
        store = {};
      }
    }
    const cleanName = path.basename(filename);
    const fullPayload = base64Payload.startsWith('data:')
      ? base64Payload
      : `data:image/png;base64,${base64Payload}`;
    store[cleanName] = fullPayload;
    fs.writeFileSync(portfolioStoreFile, JSON.stringify(store, null, 2));

    // Persist into code file src/data/embeddedAssets.ts so it remains in code permanently
    const codePath = path.resolve(process.cwd(), 'src', 'data', 'embeddedAssets.ts');
    const codeContent = `/**
 * Auto-generated persistent code store for user-uploaded flat portfolio artwork.
 * This stores the images directly in code so they persist across any reloads and restarts.
 */
export const EMBEDDED_PORTFOLIO_ASSETS: Record<string, string> = ${JSON.stringify(store, null, 2)};

export function getEmbeddedAsset(filename: string): string | undefined {
  const clean = filename.split('/').pop() || filename;
  return EMBEDDED_PORTFOLIO_ASSETS[clean];
}
`;
    fs.writeFileSync(codePath, codeContent, 'utf-8');
    console.log(`[PortfolioStore] Saved ${cleanName} to code store (embeddedAssets.ts) and disk`);
  } catch (err) {
    console.error('Error saving to portfolio store:', err);
  }
}

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Store enquiries in a lightweight JSON store
const enquiriesFile = path.resolve(process.cwd(), 'enquiries.json');
function saveEnquiry(data: any) {
  let list = [];
  try {
    if (fs.existsSync(enquiriesFile)) {
      list = JSON.parse(fs.readFileSync(enquiriesFile, 'utf-8'));
    }
  } catch (e) {
    list = [];
  }
  const enquiry = {
    id: `ARK-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  list.unshift(enquiry);
  fs.writeFileSync(enquiriesFile, JSON.stringify(list, null, 2));
  return enquiry;
}

// 1. API: Studio Config & Razorpay Links
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    email: 'arkajastudio@gmail.com',
    instagram: '@arkajadesigner6208',
    instagramUrl: 'https://www.instagram.com/arkajadesigner6208?stkn=aHBmdnFtc241djZ6',
    location: 'Mumbai, India (Working Worldwide)',
    starterUrl: process.env.RAZORPAY_STARTER_PAYMENT_URL || '',
    signatureUrl: process.env.RAZORPAY_SIGNATURE_PAYMENT_URL || '',
    customUrl: process.env.RAZORPAY_CUSTOM_PAYMENT_URL || '',
    hasStarterPayment: Boolean(process.env.RAZORPAY_STARTER_PAYMENT_URL?.trim()),
    hasSignaturePayment: Boolean(process.env.RAZORPAY_SIGNATURE_PAYMENT_URL?.trim()),
    hasCustomPayment: Boolean(process.env.RAZORPAY_CUSTOM_PAYMENT_URL?.trim()),
  });
});

// 2. API: AI Studio Advisor / Concierge
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const systemInstruction = `You are "Aja", the friendly, stylish, articulate, and knowledgeable Creative Advisor for ARKAJA STUDIO.

STUDIO IDENTITY & PHILOSOPHY:
- Name: ArkAja Studio
- Tagline: "Creative content for brands with something to say."
- Positioning: "AI-assisted creative production. Human-led art direction."
- Style: Editorial fashion magazine × Premium creative agency × Modern e-commerce. Quiet luxury, refined aesthetic.
- Location: Mumbai, India — working with emerging and modern brands worldwide.
- Official Email: arkajastudio@gmail.com
- Official Instagram: @arkajadesigner6208

WHAT ARKAJA DOES:
- Social Content: High-impact Instagram posts, multi-slide carousels, editorial stories, promotional creatives, caption writing.
- Campaign Creative: Product launches, seasonal edits, festival campaigns, offer/sale creatives.
- Promotional Visuals: Striking, scroll-stopping visuals for products & treatments.
- Brand Visuals: Creative direction, visual identity systems, and unified social aesthetic.
- Short-form Video / Reels: Custom video directions and concepts tailored upon request.

TRANSPARENCY & INTEGRITY RULES:
- Never fabricate fake client names, reviews, metrics, or revenue claims.
- The studio showcases authentic concept projects:
  1. Lumière (Luxury Beauty studio concept - hydrafacial, glow edits)
  2. Noir & Bean (Café & brunch concept - vanilla cloud latte, slow mornings)
  3. Élan (Contemporary womenswear fashion concept - the autumn edit, blazer styling)
  4. Muse Beauty London (Minimalist luxury British skincare)
  5. Saree / Ethnic Fashion Edit (Artisan handlooms, festive drape storytelling)
- AI is an accelerator, but human art direction and design lead every pixel.

PACKAGES & PRICING (One-time project packages, NO recurring subscriptions):
- STARTER (₹2,499 / $49 / £39): 4 posts, 2 stories, 1 promotional creative, 1 short-form visual, consistent visual direction. Turnaround: 3–5 days.
- SIGNATURE (₹4,999 / $99 / £79): 8 posts, 4 stories, 2 promotional creatives, captions, consistent visual direction, 48-hour delivery option, priority queue.
- CUSTOM CAMPAIGN: Tailored pricing for full brand launches and custom deliverable volumes.

YOUR PERSONALITY & TONE:
- Helpful, conversational, warm, and sophisticated.
- Keep answers concise (2-4 paragraphs max) and formatted for easy reading.
- Point visitors to the "Project Builder" section or the "Enquire" form when they are ready to get started.`;

    // Format multiturn contents: Gemini requires alternating turns starting with 'user'
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      // Find the first turn by 'user'
      const firstUserIndex = history.findIndex((h) => h.role === 'user');
      if (firstUserIndex !== -1) {
        const userHistory = history.slice(firstUserIndex);
        let lastRole: string | null = null;
        for (const turn of userHistory.slice(-8)) {
          const role = turn.role === 'user' ? 'user' : 'model';
          const text = (turn.text || '').trim();
          if (text && role !== lastRole) {
            contents.push({
              role: role,
              parts: [{ text: text }],
            });
            lastRole = role;
          }
        }
      }
    }

    // Ensure the last turn before generation is the current user message
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents.pop(); // Replace last turn if it was already user
    }
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    // Try Gemini model generation with resilient timeout and model fallback
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    let replyText = '';

    if (apiKey) {
      for (const m of candidateModels) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout waiting for ${m}`)), 6500)
          );
          const callPromise = ai.models.generateContent({
            model: m,
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            },
          });
          const response = await Promise.race([callPromise, timeoutPromise]);
          if (response && response.text) {
            replyText = response.text.trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Gemini API candidate ${m} note:`, err?.message || err);
        }
      }
    }

    // Comprehensive contextual advisor fallback engine if Gemini models are in high demand or offline
    if (!replyText) {
      replyText = getAjaContextualResponse(message);
    }

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.json({
      reply: getAjaContextualResponse(req.body?.message || ''),
    });
  }
});

/**
 * Intelligent Multi-Topic Creative Advisor Engine for ArkAja Studio.
 * Handles extensive user questions about packages, pricing, visual direction,
 * AI + human process, concepts, and custom branding without ever repeating generic text.
 */
function getAjaContextualResponse(userInput: string): string {
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
    q.includes('investment')
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
    q.includes('time')
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
      "• **Instant Checkout**: Direct links for Starter (₹2,499) and Signature (₹4,999) packages.\n" +
      "• **Methods Accepted**: UPI, Google Pay, Credit/Debit cards, Net Banking, and International Cards (USD/GBP/EUR).\n" +
      "• **Invoices**: Official GST/Studio receipt issued with every project commission."
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

// 3. API: Enquiries Submission
app.post('/api/enquiries', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      brandName,
      email,
      country,
      phone,
      businessCategory,
      neededServices,
      preferredPackage,
      deliverableCounts,
      timeline,
      budget,
      projectDetails,
      referenceLinks,
    } = req.body;

    if (!fullName || !brandName || !email || !projectDetails) {
      res.status(400).json({ error: 'Please provide all required fields' });
      return;
    }

    const saved = saveEnquiry(req.body);

    // Create formatted email body for mailto fallback
    const subject = encodeURIComponent(`Project Brief: ${brandName} [${saved.id}]`);
    const bodyLines = [
      `Name: ${fullName}`,
      `Brand / Business: ${brandName}`,
      `Email: ${email}`,
      `Country: ${country || 'Not specified'}`,
      `Phone/WhatsApp: ${phone || 'Not provided'}`,
      `Category: ${businessCategory || 'General'}`,
      `Preferred Package: ${preferredPackage || 'Custom'}`,
      `Services Needed: ${(neededServices || []).join(', ')}`,
      `Deliverables: ${JSON.stringify(deliverableCounts || {})}`,
      `Timeline: ${timeline || 'Flexible'}`,
      `Budget: ${budget || 'Not specified'}`,
      `Reference Links: ${referenceLinks || 'None'}`,
      `\nProject Details:\n${projectDetails}`,
      `\n-- Submitted via ArkAja Studio Web Platform [${saved.id}]`,
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    const mailtoUrl = `mailto:arkajastudio@gmail.com?subject=${subject}&body=${body}`;

    res.json({
      success: true,
      enquiryId: saved.id,
      mailtoUrl,
      message: 'Thank you. Your enquiry has been received. ArkAja Studio will review your brief and get back to you.',
    });
  } catch (error: any) {
    console.error('Enquiry error:', error);
    res.status(500).json({ error: 'Failed to save enquiry' });
  }
});

// 4. API: Upload Project Image Asset (supports user uploading their authentic artwork)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { projectSlug, fileName, base64Data } = req.body;
    if (!projectSlug || !base64Data) {
      res.status(400).json({ error: 'projectSlug and base64Data are required' });
      return;
    }

    // Extract base64 payload
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('svg')) ext = 'svg';
      else if (mime.includes('pdf')) ext = 'pdf';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const cleanSlug = projectSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const safeName = `${cleanSlug}-${Date.now()}.${ext}`;
    const targetPath = path.join(uploadDir, safeName);

    fs.writeFileSync(targetPath, buffer);
    savePortfolioAssetToStore(safeName, base64Data);

    const publicUrl = `/uploads/${safeName}`;
    res.json({
      success: true,
      url: publicUrl,
      projectSlug: cleanSlug,
      fileName: safeName,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

// 5. API: Scan Available Uploaded Assets
app.get('/api/projects-assets', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const assetMap: Record<string, string[]> = {
      lumiere: [],
      noir_and_bean: [],
      elan: [],
      muse_beauty: [],
      saree_edit: [],
    };

    for (const f of files) {
      const lower = f.toLowerCase();
      const fileUrl = `/uploads/${f}`;
      if (lower.startsWith('lumiere')) assetMap.lumiere.push(fileUrl);
      else if (lower.startsWith('noir') || lower.startsWith('bean')) assetMap.noir_and_bean.push(fileUrl);
      else if (lower.startsWith('elan')) assetMap.elan.push(fileUrl);
      else if (lower.startsWith('muse')) assetMap.muse_beauty.push(fileUrl);
      else if (lower.startsWith('saree') || lower.startsWith('ethnic')) assetMap.saree_edit.push(fileUrl);
    }

    res.json({ assets: assetMap });
  } catch (e) {
    res.json({ assets: {} });
  }
});

// 6. API: Portfolio Artwork Upload & Persistent Code/JSON Store
app.post('/api/portfolio-upload', (req: Request, res: Response) => {
  try {
    const { targetFilename, fileName, name, base64Data, base64, data, items } = req.body;

    // Handle batch items if provided
    if (Array.isArray(items) && items.length > 0) {
      const results = [];
      for (const item of items) {
        const itemFilename = item.targetFilename || item.fileName || item.name;
        const itemData = item.base64Data || item.base64 || item.data;
        if (itemFilename && itemData) {
          const cleanName = path.basename(itemFilename).replace(/[^a-zA-Z0-9_.-]/g, '_');
          const targetPath = path.join(portfolioDir, cleanName);
          const base64Clean = itemData.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
          const buffer = Buffer.from(base64Clean, 'base64');
          fs.writeFileSync(targetPath, buffer);
          savePortfolioAssetToStore(cleanName, itemData);
          results.push({
            filename: cleanName,
            url: `/assets/portfolio/${cleanName}`,
            sizeBytes: buffer.length,
          });
        }
      }
      res.json({
        success: true,
        savedCount: results.length,
        items: results,
        message: `Successfully stored ${results.length} artwork file(s) in code store and disk.`,
      });
      return;
    }

    const rawFilename = targetFilename || fileName || name;
    const rawData = base64Data || base64 || data;

    if (!rawFilename || !rawData) {
      res.status(400).json({ error: 'targetFilename and base64Data are required' });
      return;
    }

    const cleanName = path.basename(rawFilename).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const targetPath = path.join(portfolioDir, cleanName);

    // Strip data URL scheme prefix if present
    const base64Clean = rawData.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    // 1. Write the flat raster image to /public/assets/portfolio/<filename>
    fs.writeFileSync(targetPath, buffer);

    // 2. Immediately store a copy in persistent code/JSON backup
    savePortfolioAssetToStore(cleanName, rawData);

    const assetUrl = `/assets/portfolio/${cleanName}`;
    res.json({
      success: true,
      filename: cleanName,
      url: assetUrl,
      sizeBytes: buffer.length,
      message: `Artwork stored as ${cleanName} directly in code store (src/data/embeddedAssets.ts) and disk.`,
    });
  } catch (error: any) {
    console.error('Portfolio upload error:', error);
    res.status(500).json({ error: error?.message || 'Failed to process artwork upload' });
  }
});

// 7. API: Get Status of All 12 Portfolio Flat Artwork Slots
app.get('/api/portfolio-status', (req: Request, res: Response) => {
  try {
    const requiredFiles = [
      'lumiere-01.webp',
      'lumiere-02.webp',
      'lumiere-03.webp',
      'noir-bean-01.webp',
      'noir-bean-02.webp',
      'noir-bean-03.webp',
      'elan-01.webp',
      'elan-02.webp',
      'elan-03.webp',
      'muse-01.webp',
      'saree-01.webp',
      'saree-02.webp',
    ];

    const statusMap: Record<string, { exists: boolean; url: string; size: number }> = {};

    for (const file of requiredFiles) {
      const fullPath = path.join(portfolioDir, file);
      const pngPath = path.join(portfolioDir, file.replace('.webp', '.png'));
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        statusMap[file] = {
          exists: true,
          url: `/assets/portfolio/${file}?t=${stats.mtimeMs}`,
          size: stats.size,
        };
      } else if (fs.existsSync(pngPath)) {
        const stats = fs.statSync(pngPath);
        statusMap[file] = {
          exists: true,
          url: `/assets/portfolio/${file.replace('.webp', '.png')}?t=${stats.mtimeMs}`,
          size: stats.size,
        };
      } else {
        statusMap[file] = {
          exists: false,
          url: `/assets/portfolio/${file}`,
          size: 0,
        };
      }
    }

    res.json({
      success: true,
      slots: statusMap,
      totalSlots: requiredFiles.length,
      uploadedCount: Object.values(statusMap).filter((s) => s.exists).length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve portfolio status' });
  }
});

// 8. API: Project Assets endpoint
app.get('/api/projects-assets', (req: Request, res: Response) => {
  res.json({ success: true, assets: {} });
});

// Setup Vite or static serving
async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ArkAja Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
