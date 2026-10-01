/**
 * Portfolio artwork assets manifest with direct Vite module imports.
 * High-performance, lightweight modern WebP format guaranteeing instantaneous loading,
 * clean git pushes, and zero GitHub / Vercel deployment payload limits.
 */
import lumiere01 from '../assets/portfolio/lumiere-01.webp';
import lumiere02 from '../assets/portfolio/lumiere-02.webp';
import lumiere03 from '../assets/portfolio/lumiere-03.webp';
import noir01 from '../assets/portfolio/noir-bean-01.webp';
import noir02 from '../assets/portfolio/noir-bean-02.webp';
import noir03 from '../assets/portfolio/noir-bean-03.webp';
import elan01 from '../assets/portfolio/elan-01.webp';
import elan02 from '../assets/portfolio/elan-02.webp';
import elan03 from '../assets/portfolio/elan-03.webp';
import muse01 from '../assets/portfolio/muse-01.webp';
import saree01 from '../assets/portfolio/saree-01.webp';
import saree02 from '../assets/portfolio/saree-02.webp';

export const EMBEDDED_PORTFOLIO_ASSETS: Record<string, string> = {
  'lumiere-01.webp': lumiere01,
  'lumiere-02.webp': lumiere02,
  'lumiere-03.webp': lumiere03,
  'noir-bean-01.webp': noir01,
  'noir-bean-02.webp': noir02,
  'noir-bean-03.webp': noir03,
  'elan-01.webp': elan01,
  'elan-02.webp': elan02,
  'elan-03.webp': elan03,
  'muse-01.webp': muse01,
  'saree-01.webp': saree01,
  'saree-02.webp': saree02,
  // Backward compatibility aliases
  'lumiere-01.png': lumiere01,
  'lumiere-02.png': lumiere02,
  'lumiere-03.png': lumiere03,
  'noir-bean-01.png': noir01,
  'noir-bean-02.png': noir02,
  'noir-bean-03.png': noir03,
  'elan-01.png': elan01,
  'elan-02.png': elan02,
  'elan-03.png': elan03,
  'muse-01.png': muse01,
  'saree-01.png': saree01,
  'saree-02.png': saree02,
};

export function getEmbeddedAsset(filename: string): string {
  if (!filename) return '';
  // If it's already a full URL, data URI, or blob, return directly
  if (
    filename.startsWith('data:') ||
    filename.startsWith('blob:') ||
    filename.startsWith('http://') ||
    filename.startsWith('https://')
  ) {
    return filename;
  }

  // If it's already a compiled Vite asset path or known imported value, return directly
  if (Object.values(EMBEDDED_PORTFOLIO_ASSETS).includes(filename)) {
    return filename;
  }
  if (filename.startsWith('/src/assets/portfolio/')) {
    return filename;
  }
  if (filename.startsWith('/assets/') && filename.includes('-') && !filename.startsWith('/assets/portfolio/')) {
    return filename;
  }

  const clean = filename.split('/').pop()?.split('?')[0] || filename;

  // Direct table lookup
  if (EMBEDDED_PORTFOLIO_ASSETS[clean]) {
    return EMBEDDED_PORTFOLIO_ASSETS[clean];
  }

  // Extract base slug (e.g. "lumiere-01" from "lumiere-01.webp" or "lumiere-01-xxxx.webp")
  const slugMatch = clean.match(/^([a-z0-9]+-[a-z0-9]+-\d+|[a-z0-9]+-\d+)/i);
  if (slugMatch) {
    const slug = slugMatch[1];
    if (EMBEDDED_PORTFOLIO_ASSETS[`${slug}.webp`]) {
      return EMBEDDED_PORTFOLIO_ASSETS[`${slug}.webp`];
    }
  }

  const baseName = clean.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  if (EMBEDDED_PORTFOLIO_ASSETS[`${baseName}.webp`]) {
    return EMBEDDED_PORTFOLIO_ASSETS[`${baseName}.webp`];
  }
  if (EMBEDDED_PORTFOLIO_ASSETS[`${baseName}.png`]) {
    return EMBEDDED_PORTFOLIO_ASSETS[`${baseName}.png`];
  }

  return `/assets/portfolio/${baseName}.webp`;
}
