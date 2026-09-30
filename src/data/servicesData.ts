import { ServiceItem } from '../types';

export const STUDIO_SERVICES: ServiceItem[] = [
  {
    id: 'social-content',
    title: 'SOCIAL CONTENT',
    description: 'Designed social content that gives your feed a clear visual identity.',
    includes: [
      'Instagram posts',
      'Carousels',
      'Stories',
      'Promotional creatives',
      'Captions',
      'Content direction',
    ],
  },
  {
    id: 'campaign-creative',
    title: 'CAMPAIGN CREATIVE',
    description: 'Cohesive visual campaigns for launches, offers, seasons and brand moments.',
    includes: [
      'Campaign concepts',
      'Launch visuals',
      'Seasonal campaigns',
      'Promotional campaigns',
      'Offer creatives',
      'Visual direction',
    ],
  },
  {
    id: 'promotional-visuals',
    title: 'PROMOTIONAL VISUALS',
    description: 'Clear, premium visuals designed to make an offer, product or service impossible to overlook.',
    includes: [
      'Product promotions',
      'Service promotions',
      'Events',
      'Offers',
      'Announcements',
    ],
  },
  {
    id: 'brand-visuals',
    title: 'BRAND VISUALS',
    description: 'Visual systems that help a brand look consistent, intentional and recognisable.',
    includes: [
      'Creative direction',
      'Visual identity direction',
      'Social media visual systems',
      'Campaign aesthetics',
      'Content templates',
    ],
  },
];

export const CUSTOM_VIDEO_SERVICE = {
  title: 'SHORT-FORM VIDEO / REELS',
  badge: 'AVAILABLE AS A CUSTOM SERVICE',
  description:
    'Tailored short-form video concepts and motion direction created on request for brands requiring kinetic social storytelling.',
  includes: [
    'Concept & storyboard direction',
    'Promotional video edits',
    'Product showcase reels',
    'Custom pacing & audio treatment',
  ],
};

export const SERVICES_LIST = STUDIO_SERVICES;
