import { Project } from '../types';
import { getEmbeddedAsset } from './embeddedAssets';

export const PORTFOLIO_PROJECTS: Project[] = [
  {
    id: 'lumiere',
    slug: 'lumiere',
    title: 'LUMIÈRE',
    category: 'BEAUTY',
    label: 'CONCEPT PROJECT',
    productionLabel: 'AI-ASSISTED CREATIVE PRODUCTION',
    tagline: 'YOUR GLOW. ELEVATED.',
    description:
      'A luxury beauty studio visual concept focused on luminous skin, refined editorial styling and premium promotional content.',
    services: ['Social Content', 'Campaign Creative', 'Promotional Visuals'],
    creativeDirections: [
      {
        title: 'YOUR GLOW. ELEVATED.',
        subtitle: 'Signature Hydrafacial',
        format: 'post',
        description: 'Luminous dermal hydration and elevated medical-spa aesthetic.',
      },
      {
        title: 'THE GLOW EDIT',
        subtitle: 'Hydrafacial + LED Therapy + Face Massage',
        format: 'carousel',
        description: 'Multi-step skin rejuvenation routine curated for social storytelling.',
      },
      {
        title: 'PROMOTIONAL OFFER VISUALS',
        subtitle: 'Limited Seasonal Availability',
        format: 'offer',
        description: 'High-conversion aesthetic promotional creatives with restrained typography.',
      },
      {
        title: 'SIGNATURE TREATMENT PROTOCOLS',
        subtitle: 'Editorial Skin Portraiture',
        format: 'story',
        description: 'Minimalist product-and-skin pairings with high textural fidelity.',
      },
    ],
    images: [
      getEmbeddedAsset('lumiere-01.webp'),
      getEmbeddedAsset('lumiere-02.webp'),
      getEmbeddedAsset('lumiere-03.webp'),
    ],
    colorPalette: ['#141619', '#EBE7DE', '#D4AF37', '#9D9585'],
    year: '2026',
  },
  {
    id: 'noir-and-bean',
    slug: 'noir-and-bean',
    title: 'NOIR & BEAN',
    category: 'HOSPITALITY',
    label: 'CONCEPT PROJECT',
    productionLabel: 'AI-ASSISTED CREATIVE PRODUCTION',
    tagline: 'YOUR 4PM DESERVES THIS.',
    description:
      'A café and brunch content concept built around warm editorial visuals, signature drinks, slow mornings and promotional moments.',
    services: ['Social Content', 'Promotional Visuals', 'Brand Visuals'],
    creativeDirections: [
      {
        title: 'YOUR 4PM DESERVES THIS.',
        subtitle: 'Vanilla Cloud Latte',
        format: 'post',
        description: 'Afternoon coffee ritual captured with warm sunlight and textural contrast.',
      },
      {
        title: 'SATURDAY BRUNCH CLUB',
        subtitle: 'Coffee + Croissant + Eggs',
        format: 'carousel',
        description: 'Editorial tablescape celebrating slow weekend mornings and signature pastry bakes.',
      },
      {
        title: 'DON’T BLINK.',
        subtitle: 'Flash Roasted Single Origin',
        format: 'story',
        description: 'Bold promotional creative designed for high social feed arrest.',
      },
      {
        title: 'THE MORNING RITUAL',
        subtitle: 'Artisanal Brew Guides',
        format: 'post',
        description: 'Editorial lifestyle content for discerning hospitality patrons.',
      },
    ],
    images: [
      getEmbeddedAsset('noir-bean-01.webp'),
      getEmbeddedAsset('noir-bean-02.webp'),
      getEmbeddedAsset('noir-bean-03.webp'),
    ],
    colorPalette: ['#12100E', '#E8DFD3', '#795548', '#3E2723'],
    year: '2026',
  },
  {
    id: 'elan',
    slug: 'elan',
    title: 'ÉLAN',
    category: 'FASHION',
    label: 'CONCEPT PROJECT',
    productionLabel: 'AI-ASSISTED CREATIVE PRODUCTION',
    tagline: 'THE AUTUMN EDIT',
    description:
      'A contemporary womenswear content concept focused on editorial styling, versatile fashion and premium social content.',
    services: ['Campaign Creative', 'Social Content', 'Brand Visuals'],
    creativeDirections: [
      {
        title: 'THE AUTUMN EDIT',
        subtitle: 'Collection 02 / 2026',
        format: 'carousel',
        description: 'Sculptural outerwear and architectural silhouettes framed in muted tones.',
      },
      {
        title: '3 WAYS TO STYLE ONE BLAZER',
        subtitle: 'Versatility in Motion',
        format: 'carousel',
        description: 'Actionable capsule wardrobe carousel format crafted for high social saves.',
      },
      {
        title: 'THE 9–5 LOOK BUT MAKE IT EXPENSIVE.',
        subtitle: 'Modern Workwear Redefined',
        format: 'post',
        description: 'Crisp tailoring, relaxed proportions, and quiet luxury styling.',
      },
      {
        title: 'STATEMENT ACCESSORIES',
        subtitle: 'Minimalist Detail Focus',
        format: 'story',
        description: 'Macro textures and sculptural hardware in natural studio light.',
      },
    ],
    images: [
      getEmbeddedAsset('elan-01.webp'),
      getEmbeddedAsset('elan-02.webp'),
      getEmbeddedAsset('elan-03.webp'),
    ],
    colorPalette: ['#111215', '#ECE9E2', '#A3998D', '#464952'],
    year: '2026',
  },
  {
    id: 'muse-beauty-london',
    slug: 'muse-beauty-london',
    title: 'MUSE BEAUTY LONDON',
    category: 'BEAUTY',
    label: 'CONCEPT PROJECT',
    productionLabel: 'AI-ASSISTED CREATIVE PRODUCTION',
    tagline: 'MINIMALIST BRITISH LUXURY',
    description:
      'A British-inspired beauty visual concept combining minimalist luxury, curated skincare and refined editorial direction.',
    services: ['Social Content', 'Campaign Creative'],
    creativeDirections: [
      {
        title: 'MINIMALIST LUXURY SKIN',
        subtitle: 'The London Botanical Edit',
        format: 'post',
        description: 'Clean cosmetic formulation aesthetics with understated British elegance.',
      },
      {
        title: 'CURATED SKINCARE RITUALS',
        subtitle: 'Morning & Night Protocols',
        format: 'carousel',
        description: 'Step-by-step editorial layouts focused on texture, droplets and amber glass.',
      },
      {
        title: 'REFINED EDITORIAL DIRECTION',
        subtitle: 'Modern Formulations',
        format: 'story',
        description: 'Quiet typographic treatments paired with clinical luxury composition.',
      },
    ],
    images: [
      getEmbeddedAsset('muse-01.webp'),
    ],
    colorPalette: ['#0E1114', '#F4F2EC', '#8C9086', '#2F3430'],
    year: '2026',
  },
  {
    id: 'saree-edit',
    slug: 'saree-edit',
    title: 'ETHNIC FASHION EDIT',
    category: 'FASHION',
    label: 'CONCEPT PROJECT',
    productionLabel: 'AI-ASSISTED CREATIVE PRODUCTION',
    tagline: 'THE HEIRLOOM DRAPE',
    description:
      'A contemporary ethnic fashion and saree visual concept celebrating heritage craftsmanship, modern drape aesthetics and timeless Indian celebratory storytelling.',
    services: ['Social Content', 'Campaign Creative', 'Brand Visuals'],
    creativeDirections: [
      {
        title: 'THE HEIRLOOM DRAPE',
        subtitle: 'Artisan Weaves & Contemporary Silhouettes',
        format: 'post',
        description: 'Traditional zaris and silks reimagined through a modern high-fashion editorial lens.',
      },
      {
        title: 'FESTIVE LIGHT & MOVEMENT',
        subtitle: 'Celebration Collection',
        format: 'carousel',
        description: 'Rich jewel tones and fluid drapes styled with minimalist jewellery.',
      },
      {
        title: '3 WAYS TO DRAPE A CONTEMPORARY SAREE',
        subtitle: 'Editorial Styling Series',
        format: 'story',
        description: 'Styling guide carousel highlighting architectural pleats and belt accents.',
      },
    ],
    images: [
      getEmbeddedAsset('saree-01.webp'),
      getEmbeddedAsset('saree-02.webp'),
    ],
    colorPalette: ['#160F11', '#F5EEE9', '#B78D5B', '#5A1F26'],
    year: '2026',
  },
];
