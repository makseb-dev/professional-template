export interface FieldGroup {
  id: string;
  label: string;
  description?: string;
  fields: string[];
}

const INTRO = ['heading', 'eyebrow', 'title', 'subtitle', 'tagline', 'intro', 'badge', 'text', 'content', 'paragraph', 'lead'];
const MEDIA = ['image', 'imageurl', 'heroimage', 'hero', 'logo', 'avatar', 'banner', 'thumb', 'thumbnail', 'photo', 'picture', 'background', 'cover'];
const MEDIA_LIST = ['media', 'images', 'gallery', 'photos'];
const ITEM_LIST = ['items', 'cards', 'list', 'offer', 'offers', 'package', 'packages', 'testimonials', 'faq', 'faqs', 'posts', 'blog', 'blogposts', 'destinations', 'members', 'partners', 'activities'];
const CTA = ['cta', 'button', 'link', 'url', 'ctatext', 'ctalink', 'buttontext', 'buttonlink', 'whatsapp', 'whatsappurl'];
const CONTACT = ['phone', 'phoneNumber', 'email', 'address', 'map', 'location', 'coordinates', 'lat', 'lng', 'longitude', 'latitude', 'city', 'country'];
const SOCIAL = ['instagram', 'facebook', 'twitter', 'x', 'tiktok', 'youtube', 'linkedin', 'social'];
const OPENING = ['hours', 'schedule', 'timing', 'opening', 'openhours', 'worktime'];

const ITEM_GROUP_LABEL: Record<string, string> = {
  about: 'About blocks',
  services: 'Services',
  destinations: 'Destinations',
  packages: 'Packages',
  offers: 'Offers',
  gallery: 'Gallery images',
  testimonials: 'Testimonials',
  faq: 'FAQ items',
  blog: 'Blog posts',
  contact: 'Contact items',
};

const GROUP_ORDER: string[] = [
  'intro',
  'media',
  'items',
  'cta',
  'contact',
  'social',
  'opening',
  'advanced',
];

const GROUP_META: Record<string, { label: string; description?: string }> = {
  intro: { label: 'Heading & intro', description: 'Titles, subtitles and introductory text shown above the section body.' },
  media: { label: 'Media & images', description: 'Images and visuals. Paste an image URL to preview it.' },
  items: { label: 'Items list', description: 'The main cards / items rendered inside this section.' },
  cta: { label: 'Buttons & links', description: 'Call-to-action buttons and navigation links.' },
  contact: { label: 'Contact & location', description: 'Phone, email, address and map settings.' },
  social: { label: 'Social links', description: 'Social media profile links.' },
  opening: { label: 'Opening hours', description: 'Working hours or schedule information.' },
  advanced: { label: 'Advanced', description: "Other fields that don't fit the categories above." },
};

function classify(field: string): string {
  const f = field.toLowerCase();
  const hit = (words: string[]) => words.some((w) => f.includes(w));
  if (hit(INTRO)) return 'intro';
  if (hit(MEDIA) || hit(MEDIA_LIST)) return 'media';
  if (hit(ITEM_LIST)) return 'items';
  if (hit(CTA)) return 'cta';
  if (hit(CONTACT)) return 'contact';
  if (hit(SOCIAL)) return 'social';
  if (hit(OPENING)) return 'opening';
  return 'advanced';
}

export function buildGroups(sectionKey: string, fields: string[]): FieldGroup[] {
  const buckets: Record<string, string[]> = {};
  for (const field of fields) {
    const id = classify(field);
    (buckets[id] ??= []).push(field);
  }

  const groups: FieldGroup[] = [];
  for (const id of GROUP_ORDER) {
    const groupFields = buckets[id];
    if (!groupFields || groupFields.length === 0) continue;
    const meta = GROUP_META[id];
    const label = id === 'items' ? (ITEM_GROUP_LABEL[sectionKey] ?? 'Items list') : meta.label;
    groups.push({
      id,
      label,
      description: id === 'items' && ITEM_GROUP_LABEL[sectionKey]
        ? `The ${label.toLowerCase()} shown in this section.`
        : meta.description,
      fields: groupFields,
    });
  }
  return groups;
}