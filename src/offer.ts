export interface RichOffer {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  discountPercentage: number;
  validFrom?: string;
  validTo?: string;
  ctaLink: string;
  slug?: string;
  destination?: string;
  country?: string;
  countryFlag?: string;
  tagline?: string;
  heroImage?: string;
  gallery?: string[];
  priceFrom?: number;
  currency?: string;
  durationDays?: number;
  durationNights?: number;
  departureDate?: string;
  returnDate?: string;
  rating?: number;
  reviewsCount?: number;
  highlights?: string[];
  overview?: string;
  included?: string[];
  excluded?: string[];
  flight?: Record<string, unknown>;
  hotel?: Record<string, unknown>;
  activities?: Record<string, unknown>[];
  pricing?: Record<string, unknown>;
  requirements?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  reviews?: Record<string, unknown>[];
  translations?: Record<string, Record<string, unknown>>;
}

function shortHash(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) - h + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

/**
 * Stable, unique, never-empty URL identifier for an offer.
 * Used by BOTH the card link and the detail-page lookup so they can never
 * disagree. Precedence: explicit slug → id → slugified title → hashed fallback
 * (covers non-Latin/empty titles so the link never resolves to `/offers/`).
 */
export function offerUrlId(offer: RichOffer | Record<string, unknown>): string {
  const o = (offer ?? {}) as Record<string, unknown>;
  const slug = typeof o.slug === 'string' ? o.slug.trim() : '';
  if (slug) return slug;
  const id = typeof o.id === 'string' ? o.id.trim() : '';
  if (id) return id;
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  const base = slugify(title);
  if (base) return base;
  return `offer-${shortHash(id || title)}`;
}

export function getOfferSlug(offer: RichOffer | Record<string, unknown>): string {
  return offerUrlId(offer);
}

export function slugify(value: string): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function itemSlug(
  item: unknown,
  fallback: string,
  index = 0,
): string {
  const explicit = String((item as { slug?: unknown } | null | undefined)?.slug ?? '');
  return explicit || slugify(fallback) || `item-${index}`;
}

export function hasFlight(offer: unknown): boolean {
  const f = (offer as { flight?: unknown } | null | undefined)?.flight;
  return !!f && typeof f === 'object' && !Array.isArray(f) && Object.keys(f).length > 0;
}

export function getCoordinates(
  offer: unknown,
): { lat: number; lng: number } | null {
  const o = (offer ?? {}) as { latitude?: unknown; longitude?: unknown };
  const lat = o.latitude;
  const lng = o.longitude;
  if (
    typeof lat === 'number' && typeof lng === 'number' &&
    Number.isFinite(lat) && Number.isFinite(lng)
  ) {
    return { lat, lng };
  }
  return null;
}

export function osmEmbedUrl(lat: number, lng: number): string {
  const d = 0.045;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function getOfferImage(offer: RichOffer | Record<string, unknown>): string {
  const hero = offer?.heroImage;
  const gallery = offer?.gallery;
  const img = Array.isArray(gallery) && gallery.length > 0 ? gallery[0] : undefined;
  return String(offer?.imageUrl ?? hero ?? img ?? '');
}

export function getOfferGallery(offer: RichOffer | Record<string, unknown>): string[] {
  const gallery = Array.isArray(offer?.gallery) ? offer.gallery : [];
  const image = getOfferImage(offer);
  return gallery.length > 0 ? gallery : image ? [image] : [];
}

export function localizeOffer<T extends RichOffer>(
  offer: T,
  locale: string,
): T {
  if (locale === 'en') return offer;
  const tr = offer.translations?.[locale];
  if (!tr) return offer;
  return {
    ...offer,
    title: (tr.title as string) ?? offer.title,
    subtitle: (tr.subtitle as string) ?? (tr.tagline as string) ?? offer.subtitle,
    tagline: (tr.tagline as string) ?? offer.tagline,
    destination: (tr.destination as string) ?? offer.destination,
    country: (tr.country as string) ?? offer.country,
    overview: (tr.overview as string) ?? offer.overview,
    highlights: Array.isArray(tr.highlights) ? (tr.highlights as string[]) : offer.highlights,
    included: Array.isArray(tr.included) ? (tr.included as string[]) : offer.included,
    excluded: Array.isArray(tr.excluded) ? (tr.excluded as string[]) : offer.excluded,
    flight: tr.flight ? { ...offer.flight, ...(tr.flight as Record<string, unknown>) } : offer.flight,
    hotel: tr.hotel ? { ...offer.hotel, ...(tr.hotel as Record<string, unknown>) } : offer.hotel,
    activities: Array.isArray(tr.activities) ? (tr.activities as Record<string, unknown>[]) : offer.activities,
    requirements: tr.requirements ? (tr.requirements as Record<string, unknown>) : offer.requirements,
    conditions: tr.conditions ? (tr.conditions as Record<string, unknown>) : offer.conditions,
    reviews: Array.isArray(tr.reviews) ? (tr.reviews as Record<string, unknown>[]) : offer.reviews,
  };
}
