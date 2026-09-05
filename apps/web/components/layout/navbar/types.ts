export interface SearchSuggestionItem {
  id: string;
  label: string;
  type: 'product' | 'category';
  price?: string | number | null;
  image?: string | null;
}

export interface AnnouncementItem {
  badge: string;
  text: string;
  code: string;
  cta: string;
  link: string;
}

export interface NavLinkItem {
  name: string;
  href: string;
}

export const navLinks: NavLinkItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Shop Products', href: '/products' },
  { name: 'About Us', href: '/about' },
  { name: 'R&D Focus', href: '/research' },
  { name: 'Quality Standards', href: '/quality' },
  { name: 'Contact Us', href: '/contact' },
];

export const categories: string[] = [
  'Respiratory',
  'Cardiovascular',
  'Neurology',
  'Anti-Infectives',
  'OTC & Wellness',
  'Pediatrics',
];

export const announcements: AnnouncementItem[] = [
  {
    badge: 'Limited Offer',
    text: 'Save 20% on your first order with code',
    code: 'WELLNESS20',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    badge: 'Free Shipping',
    text: 'Free express shipping on medical catalog above',
    code: '₹1,999',
    cta: 'Claim Offer',
    link: '/products',
  },
  {
    badge: 'R&D Labs',
    text: 'Discover our certified formulations and clinical quality',
    code: 'WHO-GMP',
    cta: 'Our Process',
    link: '/quality',
  },
];
