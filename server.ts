import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import {
  AJA_SYSTEM_INSTRUCTION,
  getAjaSmartFallback,
  inferAjaSuggestions,
} from './src/data/ajaKnowledge';

dotenv.config({ override: true });

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';
const isServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY
);

// Razorpay Credentials (configured securely via environment variables)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID?.trim() || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

const razorpayClient =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;

// Ensure public upload directories exist (safe on read-only serverless FS like Vercel)
const uploadDir = isServerless
  ? path.join('/tmp', 'arkaja-uploads')
  : path.resolve(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch {
  // Ignore on read-only filesystem
}

// Ensure public portfolio asset directory exists
const portfolioDir = path.resolve(process.cwd(), 'public', 'assets', 'portfolio');
try {
  if (!fs.existsSync(portfolioDir)) {
    fs.mkdirSync(portfolioDir, { recursive: true });
  }
} catch {
  // Ignore on read-only filesystem
}

// Persistent JSON backup store for uploaded portfolio artwork
const portfolioStoreFile = isServerless
  ? path.join('/tmp', 'portfolio-assets-store.json')
  : path.resolve(process.cwd(), 'portfolio-assets-store.json');

// Auto-restore any saved base64 images from JSON store to disk on server boot
function restorePortfolioAssetsFromStore() {
  if (isServerless) return;
  try {
    if (fs.existsSync(portfolioStoreFile)) {
      const store: Record<string, string> = JSON.parse(fs.readFileSync(portfolioStoreFile, 'utf-8'));
      for (const [filename, base64Payload] of Object.entries(store)) {
        const cleanName = path.basename(filename);
        const targetPath = path.join(portfolioDir, cleanName);
        if (!fs.existsSync(targetPath) && (base64Payload.startsWith('data:') || base64Payload.length > 500)) {
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
    console.log(`[PortfolioStore] Saved ${cleanName} to persistent JSON store and disk`);
  } catch (err) {
    console.error('Error saving to portfolio store:', err);
  }
}

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.resolve(process.cwd(), 'public')));
app.use('/assets/portfolio', express.static(portfolioDir));

// Google Search Console Site Verification file direct route
app.get('/googlef6578e8f54a279b1.html', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.send('google-site-verification: googlef6578e8f54a279b1.html\n');
});

// Initialize Gemini SDK lazily with User-Agent header as required
function getAiClient(): GoogleGenAI | null {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildAjaContents(message: string, history: any): any[] {
  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    const firstUserIndex = history.findIndex((h) => h?.role === 'user');
    if (firstUserIndex !== -1) {
      const userHistory = history.slice(firstUserIndex);
      let lastRole: string | null = null;
      for (const turn of userHistory.slice(-12)) {
        const role = turn?.role === 'user' ? 'user' : 'model';
        const text = (turn?.text || '').trim();
        if (text && role !== lastRole) {
          contents.push({
            role,
            parts: [{ text }],
          });
          lastRole = role;
        }
      }
    }
  }

  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents.pop();
  }
  contents.push({
    role: 'user',
    parts: [{ text: message.trim() }],
  });
  return contents;
}

const AJA_MODEL_CONFIGS: Array<{
  model: string;
  config: Record<string, any>;
}> = [
  {
    model: 'gemini-4-hydrogen',
    config: {
      systemInstruction: AJA_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  },
  {
    model: 'gemini-3.1-flash-lite',
    config: {
      systemInstruction: AJA_SYSTEM_INSTRUCTION,
    },
  },
];

// Store enquiries in a lightweight JSON store (uses /tmp on read-only serverless FS)
const enquiriesFile = isServerless
  ? path.join('/tmp', 'enquiries.json')
  : path.resolve(process.cwd(), 'enquiries.json');
function saveEnquiry(data: any) {
  let list = [];
  try {
    if (fs.existsSync(enquiriesFile)) {
      list = JSON.parse(fs.readFileSync(enquiriesFile, 'utf-8'));
    }
  } catch {
    list = [];
  }
  const enquiry = {
    id: `ARK-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  list.unshift(enquiry);
  try {
    fs.writeFileSync(enquiriesFile, JSON.stringify(list, null, 2));
  } catch (err) {
    console.warn('Could not persist enquiry to local disk:', err);
  }
  return enquiry;
}

// Store custom portfolio projects added by studio director
const customProjectsFile = isServerless
  ? path.join('/tmp', 'custom-projects.json')
  : path.resolve(process.cwd(), 'custom-projects.json');
function getCustomProjects() {
  try {
    if (fs.existsSync(customProjectsFile)) {
      return JSON.parse(fs.readFileSync(customProjectsFile, 'utf-8'));
    }
  } catch {
    return [];
  }
  return [];
}
function saveCustomProject(project: any) {
  const list = getCustomProjects();
  const existingIdx = list.findIndex((p: any) => p.id === project.id);
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...project, updatedAt: new Date().toISOString() };
  } else {
    list.unshift({ ...project, createdAt: new Date().toISOString() });
  }
  try {
    fs.writeFileSync(customProjectsFile, JSON.stringify(list, null, 2));
  } catch (err) {
    console.warn('Could not persist custom project to local disk:', err);
  }
  return project;
}
function removeCustomProject(projectId: string) {
  let list = getCustomProjects();
  list = list.filter((p: any) => p.id !== projectId);
  try {
    fs.writeFileSync(customProjectsFile, JSON.stringify(list, null, 2));
  } catch (err) {
    console.warn('Could not update custom projects file:', err);
  }
  return true;
}

function sanitizePaymentUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return '';
}

// Authoritative server-side fixed package pricing in paise (1 INR = 100 paise)
const FIXED_PACKAGE_PRICES_PAISE: Record<string, number> = {
  'starter': 249900,
  'signature': 499900,
  'basic-website': 1000000,
  'urgent-website': 1200000,
  'logo-design': 300000,
  'ai-chatbot': 500000,
  'ai-chatbot-pkg': 500000,
  'basic-web-app': 1500000,
};

// Custom-quoted or calculator-bundle packages allowed to supply a validated custom INR amount
const CUSTOM_PACKAGE_DEFAULTS_PAISE: Record<string, number> = {
  'custom': 1000000,
  'web-apps': 2500000,
  'web-app': 2500000,
  'brand-identity': 1500000,
  'ai-business': 2000000,
  'business-launch': 3000000,
  'custom-website-features': 1000000,
};

function isAllowedCustomScopeId(packageId: string): boolean {
  return (
    Object.prototype.hasOwnProperty.call(CUSTOM_PACKAGE_DEFAULTS_PAISE, packageId) ||
    packageId.startsWith('bundle-') ||
    packageId.startsWith('builder-bundle-')
  );
}

const DEFAULT_RAZORPAY_ME_URL = 'https://razorpay.me/@divyamithileshmishra';

// 1. API: Studio Config & Razorpay Integration
app.get('/api/config', (_req: Request, res: Response) => {
  const starterUrl = sanitizePaymentUrl(process.env.RAZORPAY_STARTER_PAYMENT_URL);
  const signatureUrl = sanitizePaymentUrl(process.env.RAZORPAY_SIGNATURE_PAYMENT_URL);
  const customUrl = sanitizePaymentUrl(process.env.RAZORPAY_CUSTOM_PAYMENT_URL) || DEFAULT_RAZORPAY_ME_URL;
  const basicWebsiteUrl = sanitizePaymentUrl(process.env.RAZORPAY_BASIC_WEBSITE_PAYMENT_URL);
  const urgentWebsiteUrl = sanitizePaymentUrl(process.env.RAZORPAY_URGENT_WEBSITE_PAYMENT_URL);
  const logoDesignUrl = sanitizePaymentUrl(process.env.RAZORPAY_LOGO_DESIGN_PAYMENT_URL);
  const aiChatbotUrl = sanitizePaymentUrl(process.env.RAZORPAY_AI_CHATBOT_PAYMENT_URL);
  const basicWebAppUrl = sanitizePaymentUrl(process.env.RAZORPAY_BASIC_WEB_APP_PAYMENT_URL);
  const webAppUrl = sanitizePaymentUrl(process.env.RAZORPAY_WEB_APP_PAYMENT_URL);
  const brandIdentityUrl = sanitizePaymentUrl(process.env.RAZORPAY_BRAND_IDENTITY_PAYMENT_URL);
  const aiBusinessUrl = sanitizePaymentUrl(process.env.RAZORPAY_AI_BUSINESS_PAYMENT_URL);
  const businessLaunchUrl = sanitizePaymentUrl(process.env.RAZORPAY_BUSINESS_LAUNCH_PAYMENT_URL);
  const isGatewayReady = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
  const isLiveKey = Boolean(isGatewayReady && RAZORPAY_KEY_ID.startsWith('rzp_live_'));

  res.json({
    email: 'arkajastudio@gmail.com',
    instagram: '@arkajastudio',
    instagramUrl: 'https://www.instagram.com/arkajastudio/',
    location: 'Mumbai, India (Working Worldwide)',
    razorpayKeyId: isGatewayReady ? RAZORPAY_KEY_ID : '',
    isRazorpayConfigured: isGatewayReady,
    isRazorpayLiveKey: isLiveKey,
    starterUrl,
    signatureUrl,
    customUrl,
    basicWebsiteUrl,
    urgentWebsiteUrl,
    logoDesignUrl,
    aiChatbotUrl,
    basicWebAppUrl,
    webAppUrl,
    brandIdentityUrl,
    aiBusinessUrl,
    businessLaunchUrl,
    hasStarterPayment: Boolean(starterUrl),
    hasSignaturePayment: Boolean(signatureUrl),
    hasCustomPayment: Boolean(customUrl),
  });
});

// 1b. API: Razorpay Create Order Handler (Standard + Studio Package Checkout)
async function handleCreateOrder(req: Request, res: Response) {
  try {
    const {
      amount,
      currency,
      receipt: customReceipt,
      packageId,
      packageName,
      clientName,
      clientEmail,
      clientPhone,
      customAmount,
    } = req.body || {};

    if (!razorpayClient || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      res.status(401).json({
        code: 'GATEWAY_NOT_CONFIGURED',
        error: 'Razorpay credentials are not configured on the server.',
      });
      return;
    }

    const safeCurrency =
      typeof currency === 'string' && /^[A-Z]{3}$/.test(currency.trim().toUpperCase())
        ? currency.trim().toUpperCase()
        : 'INR';

    const normalizedPkgId = typeof packageId === 'string' ? packageId.trim() : '';
    const safeName = typeof clientName === 'string' ? clientName.trim().slice(0, 120) : '';
    const safeEmail = typeof clientEmail === 'string' ? clientEmail.trim().slice(0, 160) : '';
    const safePhone = typeof clientPhone === 'string' ? clientPhone.trim().slice(0, 32) : '';
    const safePkgName = typeof packageName === 'string' ? packageName.trim().slice(0, 120) : normalizedPkgId || 'ArkAja Studio Order';

    let amountPaise: number;

    if (normalizedPkgId) {
      if (normalizedPkgId.length > 80) {
        res.status(400).json({ error: 'Invalid package identifier.' });
        return;
      }
      if (Object.prototype.hasOwnProperty.call(FIXED_PACKAGE_PRICES_PAISE, normalizedPkgId)) {
        // Authoritative server-side price for fixed packages (prevents client-side price tampering)
        amountPaise = FIXED_PACKAGE_PRICES_PAISE[normalizedPkgId];
      } else if (isAllowedCustomScopeId(normalizedPkgId)) {
        const parsedInr = Number(customAmount);
        if (!Number.isFinite(parsedInr) || parsedInr < 1 || parsedInr > 5000000) {
          res.status(400).json({ error: 'Custom project amount must be at least ₹1 (100 paise) and within valid bounds.' });
          return;
        }
        amountPaise = Math.round(parsedInr * 100);
      } else {
        res.status(400).json({ error: 'Unrecognized package selection.' });
        return;
      }
    } else {
      // Standard Razorpay order creation with amount in paise
      const parsedPaise = Math.round(Number(amount));
      if (!Number.isFinite(parsedPaise) || parsedPaise < 100 || parsedPaise > 500000000) {
        res.status(400).json({ error: 'Invalid amount. Minimum order amount is 100 paise (₹1).' });
        return;
      }
      amountPaise = parsedPaise;
    }

    if (amountPaise < 100) {
      res.status(400).json({ error: 'Minimum order amount is 100 paise.' });
      return;
    }

    const receipt =
      typeof customReceipt === 'string' && customReceipt.trim()
        ? customReceipt.trim().slice(0, 40)
        : `rcpt_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;

    const orderData = await razorpayClient.orders.create({
      amount: amountPaise,
      currency: safeCurrency,
      receipt,
      notes: {
        packageId: normalizedPkgId || 'standard',
        packageName: safePkgName,
        clientName: safeName,
        clientEmail: safeEmail,
        clientPhone: safePhone,
        studio: 'ArkAja Studio',
      },
    });

    console.log(`[Razorpay] Order created: ${orderData.id} for ${amountPaise} paise (${safeCurrency})`);

    res.json({
      success: true,
      order_id: orderData.id,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.status;
    console.error('[Razorpay] Error creating order:', statusCode || '', error?.error || error?.message || error);

    if (statusCode === 401 || error?.error?.code === 'BAD_REQUEST_ERROR' && /auth/i.test(error?.error?.description || '')) {
      res.status(401).json({
        error: 'Razorpay authentication failed. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      });
      return;
    }

    res.status(500).json({
      error: error?.error?.description || 'Failed to create Razorpay order.',
    });
  }
}

app.post('/api/create-order', handleCreateOrder);
app.post('/api/razorpay/create-order', handleCreateOrder);

// 1c. API: Razorpay Verify Payment Signature Handler
function handleVerifyPayment(req: Request, res: Response) {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      res.status(401).json({
        success: false,
        verified: false,
        error: 'Payment gateway verification secret is not configured on the server.',
      });
      return;
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      packageId,
      packageName,
      clientName,
      clientEmail,
      clientPhone,
      amount,
    } = req.body || {};

    if (
      typeof razorpay_order_id !== 'string' ||
      !razorpay_order_id.trim() ||
      typeof razorpay_payment_id !== 'string' ||
      !razorpay_payment_id.trim() ||
      typeof razorpay_signature !== 'string' ||
      !razorpay_signature.trim()
    ) {
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing required Razorpay payment verification fields',
      });
      return;
    }

    // Verify HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET) using constant-time comparison
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id.trim()}|${razorpay_payment_id.trim()}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(razorpay_signature.trim(), 'utf8');
    const isValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValid) {
      console.warn('[Razorpay] Signature mismatch for order:', razorpay_order_id);
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment signature verification failed',
      });
      return;
    }

    const normalizedPkgId = typeof packageId === 'string' ? packageId.trim() : 'standard';
    const authoritativeAmountInr = Object.prototype.hasOwnProperty.call(FIXED_PACKAGE_PRICES_PAISE, normalizedPkgId)
      ? FIXED_PACKAGE_PRICES_PAISE[normalizedPkgId] / 100
      : Math.max(1, Math.round(Number(amount) || 0));

    // Record verified transaction in payments store (serverless-safe path)
    const paymentRecord = {
      orderId: razorpay_order_id.trim(),
      paymentId: razorpay_payment_id.trim(),
      packageId: normalizedPkgId,
      packageName: typeof packageName === 'string' && packageName.trim() ? packageName.trim() : 'Studio Package',
      clientName: typeof clientName === 'string' && clientName.trim() ? clientName.trim() : 'Guest Client',
      clientEmail: typeof clientEmail === 'string' ? clientEmail.trim() : '',
      clientPhone: typeof clientPhone === 'string' ? clientPhone.trim() : '',
      amount: authoritativeAmountInr,
      currency: 'INR',
      status: 'captured',
      timestamp: new Date().toISOString(),
    };

    const paymentsFile = isServerless
      ? path.join('/tmp', 'payments.json')
      : path.resolve(process.cwd(), 'payments.json');
    try {
      let existingPayments: any[] = [];
      if (fs.existsSync(paymentsFile)) {
        try {
          existingPayments = JSON.parse(fs.readFileSync(paymentsFile, 'utf-8'));
          if (!Array.isArray(existingPayments)) existingPayments = [];
        } catch {
          existingPayments = [];
        }
      }
      existingPayments.unshift(paymentRecord);
      fs.writeFileSync(paymentsFile, JSON.stringify(existingPayments, null, 2));
    } catch (fsErr) {
      console.warn('[Razorpay] Could not persist payment log to disk:', fsErr);
    }

    console.log(`[Razorpay] Payment ${paymentRecord.paymentId} successfully verified for ${paymentRecord.packageName}`);

    res.json({
      success: true,
      verified: true,
      paymentId: paymentRecord.paymentId,
      orderId: paymentRecord.orderId,
      packageName: paymentRecord.packageName,
      amount: paymentRecord.amount,
      message: 'Payment verified and studio production slot secured.',
    });
  } catch (error: any) {
    console.error('[Razorpay] Verification error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      error: 'Error verifying payment',
    });
  }
}

app.post('/api/verify-payment', handleVerifyPayment);
app.post('/api/razorpay/verify-payment', handleVerifyPayment);

// 2. API: AI Studio Advisor / Concierge (Standard JSON endpoint)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const contents = buildAjaContents(message, history);
    const ai = getAiClient();
    let replyText = '';

    if (ai) {
      for (const candidate of AJA_MODEL_CONFIGS) {
        let timerId: ReturnType<typeof setTimeout> | undefined;
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timerId = setTimeout(
              () => reject(new Error(`Timeout waiting for ${candidate.model}`)),
              8000
            );
          });
          const callPromise = ai.models.generateContent({
            model: candidate.model,
            contents,
            config: candidate.config,
          });
          callPromise.catch(() => {});
          const response = await Promise.race([callPromise, timeoutPromise]);
          if (response?.text) {
            replyText = response.text.trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Gemini API candidate ${candidate.model} note:`, err?.message || err);
        } finally {
          if (timerId) clearTimeout(timerId);
        }
      }
    }

    if (replyText) {
      const suggestions = inferAjaSuggestions(message, replyText);
      res.json({
        reply: replyText,
        action: suggestions.action,
        followUps: suggestions.followUps,
        engine: 'gemini',
      });
      return;
    }

    const smartFallback = getAjaSmartFallback(message, history);
    res.json({
      reply: smartFallback.reply,
      action: smartFallback.action,
      followUps: smartFallback.followUps,
      engine: 'studio',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    const smartFallback = getAjaSmartFallback(req.body?.message || '');
    res.json({
      reply: smartFallback.reply,
      action: smartFallback.action,
      followUps: smartFallback.followUps,
      engine: 'studio',
    });
  }
});

// 2b. API: AI Studio Advisor Real-Time SSE Streaming Endpoint
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  // Send immediate SSE comment frame so clients/proxies recognize live stream right away
  res.write(': connected\n\n');

  const sendEvent = (payload: Record<string, any>) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };

  let clientClosed = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      clientClosed = true;
    }
  });

  const raceWithTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timeout waiting for ${label}`)), ms);
    });
    promise.catch(() => {});
    return Promise.race([promise, timeoutPromise]).finally(() => {
      if (timer) clearTimeout(timer);
    });
  };

  try {
    const contents = buildAjaContents(message, history);
    const ai = getAiClient();
    let fullText = '';

    if (ai) {
      for (const candidate of AJA_MODEL_CONFIGS) {
        if (clientClosed) break;
        try {
          const stream = await raceWithTimeout(
            ai.models.generateContentStream({
              model: candidate.model,
              contents,
              config: candidate.config,
            }),
            6500,
            `${candidate.model} stream open`
          );

          const iterator = stream[Symbol.asyncIterator]();
          let firstChunkReceived = false;

          while (!clientClosed) {
            const nextResult = await raceWithTimeout(
              iterator.next(),
              firstChunkReceived ? 10000 : 6500,
              `${candidate.model} chunk`
            );
            if (nextResult.done) break;
            firstChunkReceived = true;
            const delta = nextResult.value?.text;
            if (delta) {
              fullText += delta;
              sendEvent({ type: 'chunk', text: delta });
            }
          }

          if (fullText.trim()) {
            const suggestions = inferAjaSuggestions(message, fullText);
            sendEvent({
              type: 'done',
              action: suggestions.action,
              followUps: suggestions.followUps,
              engine: 'gemini',
            });
            res.end();
            return;
          }
        } catch (err: any) {
          console.warn(`Gemini Stream candidate ${candidate.model} note:`, err?.message || err);
          if (fullText.trim()) {
            const suggestions = inferAjaSuggestions(message, fullText);
            sendEvent({
              type: 'done',
              action: suggestions.action,
              followUps: suggestions.followUps,
              engine: 'gemini',
            });
            res.end();
            return;
          }
        }
      }
    }

    // Instant smart studio fallback when Gemini is unavailable or slow
    const smartFallback = getAjaSmartFallback(message, history);
    sendEvent({ type: 'chunk', text: smartFallback.reply });
    sendEvent({
      type: 'done',
      action: smartFallback.action,
      followUps: smartFallback.followUps,
      engine: 'studio',
    });
    res.end();
  } catch (error: any) {
    console.error('Chat stream error:', error);
    const smartFallback = getAjaSmartFallback(message || '');
    sendEvent({ type: 'chunk', text: smartFallback.reply });
    sendEvent({
      type: 'done',
      action: smartFallback.action,
      followUps: smartFallback.followUps,
      engine: 'studio',
    });
    res.end();
  }
});

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
      calculatedSubtotal,
      pricingSummary,
    } = req.body;

    if (!fullName || !brandName || !email || !projectDetails) {
      res.status(400).json({ error: 'Please provide all required fields' });
      return;
    }

    const saved = saveEnquiry(req.body);

    // Format plain-text message for Gmail and email clients
    const formattedMessage = [
      `✨ NEW ARKAJA STUDIO PROJECT ENQUIRY [${saved.id}]`,
      `==================================================`,
      ``,
      `1. CLIENT CONTACT INFORMATION:`,
      `• Full Name: ${fullName}`,
      `• Brand / Business: ${brandName}`,
      `• Email: ${email}`,
      `• Operating Country: ${country || 'Not specified'}`,
      `• Phone / WhatsApp: ${phone || 'Not provided'}`,
      ``,
      `2. PROJECT SCOPE & SPECIFICATIONS:`,
      `• Business Category: ${businessCategory || 'General'}`,
      `• Selected Package: ${preferredPackage || 'Custom Scope'}`,
      `• Required Creative Services: ${Array.isArray(neededServices) ? neededServices.join(', ') : (neededServices || 'Custom')}`,
      pricingSummary ? `• Pricing Calculation: ${pricingSummary}` : (calculatedSubtotal ? `• Base Subtotal: ₹${calculatedSubtotal}` : ''),
      `• Deliverables: ${typeof deliverableCounts === 'object' ? JSON.stringify(deliverableCounts) : (deliverableCounts || 'As per custom requirement')}`,
      `• Desired Timeline: ${timeline || 'Flexible'}`,
      `• Target Budget: ${budget || 'Not specified'}`,
      `• Reference / Moodboard Links: ${referenceLinks || 'None provided'}`,
      ``,
      `3. PROJECT DETAILS & CREATIVE BRIEF:`,
      `${projectDetails}`,
      ``,
      `==================================================`,
      `Submitted via ArkAja Studio Platform [${saved.id}]`,
      `Timestamp: ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n');

    const subjectStr = `Project Enquiry: ${brandName} [${saved.id}]`;
    const subject = encodeURIComponent(subjectStr);
    const body = encodeURIComponent(formattedMessage);

    // Direct Gmail web compose URL and mailto fallback
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=arkajastudio@gmail.com&su=${subject}&body=${body}`;
    const mailtoUrl = `mailto:arkajastudio@gmail.com?subject=${subject}&body=${body}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`*New Project Brief for ArkAja Studio [${saved.id}]*\n\n*Brand:* ${brandName}\n*Client:* ${fullName} (${email})\n*Package:* ${preferredPackage}\n*Brief:* ${projectDetails}`)}`;

    // Forward enquiry in real time to arkajastudio@gmail.com and studio director
    const emailPayload = {
      _subject: subjectStr,
      _template: 'table',
      _captcha: 'false',
      _cc: 'divyaam2008@gmail.com',
      Client_Name: fullName,
      Brand_Name: brandName,
      Client_Email: email,
      Country: country || 'Not specified',
      Phone_WhatsApp: phone || 'Not provided',
      Category: businessCategory || 'General',
      Preferred_Package: preferredPackage || 'Custom',
      Services_Needed: Array.isArray(neededServices) ? neededServices.join(', ') : (neededServices || 'Custom'),
      Pricing_Calculation: pricingSummary || (calculatedSubtotal ? `₹${calculatedSubtotal}` : 'Custom Scope'),
      Deliverables: typeof deliverableCounts === 'object' ? JSON.stringify(deliverableCounts) : (deliverableCounts || 'Not specified'),
      Timeline: timeline || 'Flexible',
      Budget: budget || 'Not specified',
      Reference_Links: referenceLinks || 'None',
      Project_Brief: projectDetails,
      Message_Summary: formattedMessage,
      Submitted_At: new Date().toISOString(),
    };

    fetch('https://formsubmit.co/ajax/arkajastudio@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    }).catch((err) => console.warn('[Email Forwarding] arkajastudio@gmail.com note:', err?.message || err));

    fetch('https://formsubmit.co/ajax/divyaam2008@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    }).catch((err) => console.warn('[Email Forwarding] divyaam2008@gmail.com note:', err?.message || err));

    res.json({
      success: true,
      enquiryId: saved.id,
      gmailComposeUrl,
      mailtoUrl,
      whatsappUrl,
      formattedMessage,
      message: 'Thank you. Your enquiry has been received and forwarded to arkajastudio@gmail.com in real time.',
    });
  } catch (error: any) {
    console.error('Enquiry error:', error);
    res.status(500).json({ error: 'Failed to save enquiry' });
  }
});

app.get('/api/enquiries', (_req: Request, res: Response) => {
  try {
    let list = [];
    if (fs.existsSync(enquiriesFile)) {
      list = JSON.parse(fs.readFileSync(enquiriesFile, 'utf-8'));
    }
    res.json({ success: true, enquiries: list });
  } catch {
    res.status(500).json({ error: 'Failed to read enquiries' });
  }
});

// 3b. API: Custom Portfolio Projects endpoints
app.get('/api/custom-projects', (_req: Request, res: Response) => {
  res.json({ projects: getCustomProjects() });
});

app.post('/api/custom-projects', (req: Request, res: Response) => {
  try {
    const project = req.body;
    if (!project || !project.id || !project.title) {
      res.status(400).json({ error: 'Valid project data is required' });
      return;
    }
    const saved = saveCustomProject(project);
    res.json({ success: true, project: saved });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save project' });
  }
});

app.delete('/api/custom-projects/:id', (req: Request, res: Response) => {
  try {
    removeCustomProject(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete project' });
  }
});

// 4. API: Upload Project Image Asset (supports user uploading their authentic artwork)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { projectSlug, base64Data } = req.body;
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
app.get('/api/projects-assets', (_req: Request, res: Response) => {
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
app.get('/api/portfolio-status', (_req: Request, res: Response) => {
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
  } catch {
    res.status(500).json({ error: 'Failed to retrieve portfolio status' });
  }
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
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ArkAja Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

// Export app for serverless environments (e.g. Vercel, Netlify)
export default app;

const isDirectRun = !isServerless && (
  !process.argv[1] ||
  process.argv[1].endsWith('server.ts') ||
  process.argv[1].endsWith('server.js') ||
  process.argv[1].includes('tsx')
);

if (isDirectRun) {
  setupServer();
}
