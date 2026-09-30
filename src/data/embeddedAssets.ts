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
  const clean = filename.split('/').pop() || filename;
  const baseName = clean.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  return (
    EMBEDDED_PORTFOLIO_ASSETS[clean] ||
    EMBEDDED_PORTFOLIO_ASSETS[`${baseName}.webp`] ||
    EMBEDDED_PORTFOLIO_ASSETS[`${baseName}.png`] ||
    `/assets/portfolio/${baseName}.webp`
  );
}
