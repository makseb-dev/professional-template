export const BRAND = {
  name: 'professional traveling',
  tagline: 'Curated journeys. Elevated service.',
  siteTitle: 'professional traveling',
  email: 'hello@professionaltraveling.com',
  phoneDisplay: '+212 555 123 456',
  whatsapp: '212555123456',
  address: '12 Boulevard Mohammed V, Casablanca',
} as const;

export const NAV_LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/destinations', label: 'Destinations' },
  { to: '/packages', label: 'Packages' },
  { to: '/offers', label: 'Offers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/support', label: 'Support' },
];
