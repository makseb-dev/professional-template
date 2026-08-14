import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import type { SectionContent } from '../types';
import { arr, num, obj, str } from '../types';
import { Reveal } from './Reveal';
import { useI18n } from '../i18n';
import { getOfferImage, hasFlight, itemSlug, localizeOffer, offerUrlId, type RichOffer } from '../offer';
import {
  Building2, Check, ChevronRight, Clock, Compass, Mail, MapPin, MessageCircle,
  Phone, Plane, Send, ShieldCheck, Sparkles, Star, Users,
} from 'lucide-react';

interface CtaObj { text: string; link: string }
function cta(v: unknown): CtaObj {
  const o = v && typeof v === 'object' && !Array.isArray(v) ? (v as SectionContent) : {};
  return { text: str(o, 'text', 'Learn more'), link: str(o, 'link', '#') };
}

/* ============================== HERO ============================== */
export function Hero({ content }: { content: SectionContent }) {
  const { t } = useI18n();
  const ctaBtn = cta(content.ctaButton);
  const secondary = cta(content.secondaryCTA);
  const bg = str(content, 'backgroundImage');
  const placement = str(content, 'placement', 'left');
  const scrollToOffers = () => {
    document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <section className={`hero hero-align-${placement}`}>
      {bg && <img className="hero-bg" src={bg} alt="" />}
      <div className="hero-overlay" />
      <div className="container hero-content">
        <div>
          <span className="hero-badge">
            <Sparkles size={14} />
            {str(content, 'subtitle', t('hero.badge'))}
          </span>
          <h1 className="hero-title">
            {str(content, 'title', 'Travel beyond boundaries.')}
          </h1>
          <p className="hero-lead">
            {str(
              content,
              'description',
              'We design journeys that transcend the ordinary. Every detail crafted to create moments that last a lifetime.',
            )}
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={scrollToOffers}>
              {ctaBtn.text} <ChevronRight size={18} />
            </button>
            <a className="btn btn-secondary btn-lg" href={secondary.link}>
              {secondary.text}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== ABOUT ============================== */
interface Stat { label: string; value: string }
export function About({ content }: { content: SectionContent }) {
  const { t } = useI18n();
  const stats = arr<Stat>(content, 'statistics');
  const image = str(content, 'image');
  return (
    <section className="section">
      <div className="container">
        <div className="grid" style={{ gridTemplateColumns: '1.1fr 1fr', alignItems: 'center', gap: '3rem' }}>
          <div>
            <Reveal>
              <span className="eyebrow">{t('eyebrow.about')}</span>
              <h2 className="section-title">{str(content, 'heading', 'Crafted for the Modern Explorer')}</h2>
              <p className="section-lead">{str(content, 'content')}</p>
            </Reveal>
            <Reveal delay={120}>
              <div className="grid grid-2" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>{t('about.mission')}</h3>
                  <p className="card-text">{str(content, 'mission')}</p>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>{t('about.vision')}</h3>
                  <p className="card-text">{str(content, 'vision')}</p>
                </div>
              </div>
            </Reveal>
            {stats.length > 0 && (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                {stats.map((s, i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div className="stat-value" style={{ color: 'var(--secondary)' }}>{str(s, 'value')}</div>
                    <div className="stat-label">{str(s, 'label')}</div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
          {image && (
            <Reveal delay={100}>
              <div className="card-media" style={{ borderRadius: 'var(--radius)' }}>
                <img src={image} alt={str(content, 'heading', 'About professional traveling')} loading="lazy" />
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================== SERVICES ============================== */
function ServiceIcon({ icon }: { icon: string }) {
  const name = icon.toLowerCase();
  if (name.includes('plane')) return <Plane size={22} />;
  if (name.includes('building')) return <Building2 size={22} />;
  if (name.includes('shield')) return <ShieldCheck size={22} />;
  if (name.includes('users')) return <Users size={22} />;
  if (name.includes('compass')) return <Compass size={22} />;
  if (name.includes('map')) return <MapPin size={22} />;
  return <Sparkles size={22} />;
}

interface ServiceItem { title: string; icon: string; description: string }
export function Services({ content }: { content: SectionContent }) {
  const { t } = useI18n();
  const items = arr<ServiceItem>(content, 'items');
  if (items.length === 0) return null;
  return (
    <section className="section section-alt">
      <div className="container">
        <Reveal className="section-header-center">
          <span className="eyebrow">{t('eyebrow.services')}</span>
          <h2 className="section-title">{str(content, 'heading', 'Our Services')}</h2>
        </Reveal>
        <div className="grid grid-4">
          {items.map((it, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="card card-hover" style={{ height: '100%' }}>
                <div className="card-body">
                  <div className="icon-tile"><ServiceIcon icon={str(it, 'icon', 'sparkles')} /></div>
                  <h3 className="card-title">{str(it, 'title')}</h3>
                  <p className="card-text">{str(it, 'description')}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== DESTINATIONS ============================== */
export interface DestCard { title: string; image: string; shortDescription: string; price: string }
export function DestinationCard({ card, delay = 0 }: { card: DestCard; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        className="card card-hover card-link"
        style={{ height: '100%', display: 'block' }}
        to={`/destinations/${itemSlug(card, str(card, 'title'))}`}
      >
        <div className="card-media">
          {str(card, 'image') && <img src={str(card, 'image')} alt={str(card, 'title')} loading="lazy" />}
        </div>
        <div className="card-body">
          <h3 className="card-title">{str(card, 'title')}</h3>
          <p className="card-text">{str(card, 'shortDescription')}</p>
          <strong className="price" style={{ color: 'var(--secondary)' }}>{str(card, 'price')}</strong>
          <span className="card-arrow"><ChevronRight size={16} /></span>
        </div>
      </Link>
    </Reveal>
  );
}

export function Destinations({
  content,
  featured = false,
}: {
  content: SectionContent;
  featured?: boolean;
}) {
  const { t } = useI18n();
  const cards = arr<DestCard>(content, 'cards').slice(0, featured ? 6 : undefined);
  if (cards.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <Reveal className="section-header-center">
          <span className="eyebrow">{t('eyebrow.destinations')}</span>
          <h2 className="section-title">{str(content, 'heading', 'Destinations')}</h2>
        </Reveal>
        <div className="grid grid-3">
          {cards.map((c, i) => <DestinationCard key={i} card={c} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
}

/* ============================== PACKAGES ============================== */
export interface PkgItem {
  title: string; destination: string; duration: string; price: string;
  rating: number; image: string; features: string[];
}
export function PackageCard({ item, delay = 0 }: { item: PkgItem; delay?: number }) {
  const features = Array.isArray(item.features) ? item.features : [];
  return (
    <Reveal delay={delay}>
      <Link
        className="card card-hover card-link"
        style={{ height: '100%', display: 'block' }}
        to={`/packages/${itemSlug(item, str(item, 'title'))}`}
      >
        <div className="card-media">
          {str(item, 'image') && <img src={str(item, 'image')} alt={str(item, 'title')} loading="lazy" />}
          <span className="badge badge-discount"><Star size={12} fill="currentColor" /> {num(item, 'rating', 0).toFixed(1)}</span>
        </div>
        <div className="card-body">
          <p className="card-meta">{str(item, 'destination')} · {str(item, 'duration')}</p>
          <h3 className="card-title">{str(item, 'title')}</h3>
          <div className="price" style={{ marginTop: '0.35rem', marginBottom: '0.5rem' }}>{str(item, 'price')}</div>
          <ul className="feature-list">
            {features.map((f, j) => (
              <li key={j}><Check className="check" size={14} /> {f}</li>
            ))}
          </ul>
          <span className="card-arrow"><ChevronRight size={16} /></span>
        </div>
      </Link>
    </Reveal>
  );
}

export function Packages({
  content,
  featured = false,
}: {
  content: SectionContent;
  featured?: boolean;
}) {
  const { t } = useI18n();
  const items = arr<PkgItem>(content, 'items').slice(0, featured ? 3 : undefined);
  if (items.length === 0) return null;
  return (
    <section className="section section-alt">
      <div className="container">
        <Reveal className="section-header-center">
          <span className="eyebrow">{t('eyebrow.packages')}</span>
          <h2 className="section-title">{str(content, 'heading', 'Popular Packages')}</h2>
          {featured && (
            <Link to="/packages" className="btn btn-secondary" style={{ marginTop: '0.75rem' }}>
              View all packages <ChevronRight size={16} />
            </Link>
          )}
        </Reveal>
        <div className="grid grid-3">
          {items.map((it, i) => <PackageCard key={i} item={it} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
}

/* ============================== OFFERS ============================== */
export interface OfferItem {
  id: string; title: string; subtitle: string; imageUrl: string;
  discountPercentage: number; validFrom?: string; validTo: string; ctaLink: string;
}
export function isOfferActive(offer: OfferItem): boolean {
  const validTo = str(offer, 'validTo');
  if (!validTo) return true;
  const end = new Date(validTo);
  if (isNaN(end.getTime())) return true;
  return end.getTime() >= Date.now();
}

export function OfferCard({ offer, delay = 0 }: { offer: RichOffer | OfferItem; delay?: number }) {
  const { t, locale } = useI18n();
  const o = localizeOffer(offer, locale);
  const discount = num(o, 'discountPercentage', 0);
  const days = num(o, 'durationDays', 0);
  const nights = num(o, 'durationNights', 0);
  const price = num(o, 'priceFrom', 0);
  const rating = num(o, 'rating', 0);
  const reviews = num(o, 'reviewsCount', 0);
  const image = getOfferImage(o);
  return (
    <Reveal delay={delay}>
      <Link className="offer-card" style={{ height: '100%' }} to={`/offers/${offerUrlId(o)}`}>
        <div className="offer-media">
          {image && <img src={image} alt={str(o, 'title')} loading="lazy" />}
          <div className="offer-media-overlay" />
          {discount > 0 && <span className="badge badge-discount">−{discount}%</span>}
          {hasFlight(o) && (
            <span className="offer-flight-badge"><Plane size={13} /> {t('detail.flight')}</span>
          )}
          {str(o, 'validTo') && (
            <span className="offer-valid">
              {t('common.validUntil')} {new Date(str(o, 'validTo')).toLocaleDateString(locale)}
            </span>
          )}
        </div>
        <div className="offer-body">
          <div className="offer-chips">
            {str(o, 'countryFlag') && (
              <span className="offer-chip">{str(o, 'countryFlag')} {str(o, 'country')}</span>
            )}
            {days > 0 && (
              <span className="offer-chip"><Clock size={12} /> {days} {t('detail.days')}{nights > 0 ? ` / ${nights} ${t('detail.nights')}` : ''}</span>
            )}
          </div>
          <h3 className="offer-title">{str(o, 'title')}</h3>
          <p className="offer-sub">{str(o, 'tagline') || str(o, 'subtitle')}</p>
          {rating > 0 && (
            <div className="offer-rating">
              <Star size={13} fill="var(--secondary)" color="var(--secondary)" />
              <strong>{rating.toFixed(1)}</strong>
              <span>{reviews > 0 ? `${reviews} ${t('detail.reviews')}` : t('common.topRated')}</span>
            </div>
          )}
          <div className="offer-foot">
            <div className="offer-price-wrap">
              <span className="offer-from">{t('detail.from')}</span>
              <span className="offer-price">{t('detail.price')}{' '}{price.toLocaleString(locale)} <small>{str(o, 'currency', 'DZD')}</small></span>
            </div>
            <span className="btn btn-primary offer-cta">{t('detail.book')} <ChevronRight size={16} /></span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function Offers({
  content,
  featured = false,
}: {
  content: SectionContent;
  featured?: boolean;
}) {
  const { t } = useI18n();
  const items = arr<OfferItem>(content, 'items').filter(isOfferActive);
  if (items.length === 0) return null;
  const shown = featured ? items.slice(0, 3) : items;
  return (
    <section className="section" id="offers">
      <div className="container">
        <Reveal className="section-header-center">
          <span className="eyebrow">{t('eyebrow.offers')}</span>
          <h2 className="section-title">{str(content, 'heading', 'Special Offers')}</h2>
          <p className="section-lead">{str(content, 'description')}</p>
          {featured && (
            <Link to="/offers" className="btn btn-secondary" style={{ marginTop: '0.75rem' }}>
              {t('common.viewAll')} <ChevronRight size={16} />
            </Link>
          )}
        </Reveal>
        <div className="grid grid-3">
          {shown.map((o, i) => <OfferCard key={o.id || i} offer={o} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
}

/* ============================== GALLERY ============================== */
export function Gallery({
  content,
  featured = false,
}: {
  content: SectionContent;
  featured?: boolean;
}) {
  const { t } = useI18n();
  const images = arr<string>(content, 'images').slice(0, featured ? 6 : undefined);
  if (images.length === 0) return null;
  return (
    <section className="section section-alt">
      <div className="container">
        <Reveal className="section-header-center">
          <span className="eyebrow">{t('eyebrow.gallery')}</span>
          <h2 className="section-title">{str(content, 'heading', 'Travel Gallery')}</h2>
          {featured && (
            <Link to="/gallery" className="btn btn-secondary" style={{ marginTop: '0.75rem' }}>
              {t('common.viewAll')} <ChevronRight size={16} />
            </Link>
          )}
        </Reveal>
        <div className="grid grid-3">
          {images.map((src, i) => (
            <Reveal key={i} delay={(i % 3) * 80}>
              <div className="card-media" style={{ borderRadius: 'var(--radius)' }}>
                <img src={src} alt={`Gallery photo ${i + 1}`} loading="lazy" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== TESTIMONIALS ============================== */
interface Testimonial { authorName: string; authorImage: string; rating: number; text: string }
export function TestimonialCard({ t, delay = 0 }: { t: Testimonial; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="card card-hover" style={{ height: '100%' }}>
        <div className="card-body">
          <div className="stars" style={{ marginBottom: '0.75rem' }}>
            {Array.from({ length: 5 }).map((_, j) => (
              <Star key={j} size={16} fill={j < num(t, 'rating', 5) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>"{str(t, 'text')}"</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            {str(t, 'authorImage') && <img src={str(t, 'authorImage')} alt="" className="avatar" loading="lazy" />}
            <strong style={{ fontSize: '0.9rem' }}>{str(t, 'authorName')}</strong>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Testimonials({ content }: { content: SectionContent }) {
  const { t } = useI18n();
  const items = arr<Testimonial>(content, 'items');
  if (items.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <Reveal className="section-header-center">
          <span className="eyebrow">{t('eyebrow.testimonials')}</span>
          <h2 className="section-title">{str(content, 'heading', 'What Our Clients Say')}</h2>
        </Reveal>
        <div className="grid grid-3">
          {items.map((tm, i) => <TestimonialCard key={i} t={tm} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
}

/* ============================== FAQ ============================== */
interface FaqItem { question: string; answer: string }
export function FaqAccordionItem({ item, delay = 0 }: { item: FaqItem; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <details className="faq">
        <summary>
          {str(item, 'question')} <span className="faq-toggle">+</span>
        </summary>
        <p className="faq-answer">{str(item, 'answer')}</p>
      </details>
    </Reveal>
  );
}

export function Faq({
  content,
  featured = false,
}: {
  content: SectionContent;
  featured?: boolean;
}) {
  const { t } = useI18n();
  const items = arr<FaqItem>(content, 'items').slice(0, featured ? 4 : undefined);
  if (items.length === 0) return null;
  return (
    <section className="section section-alt">
      <div className="container" style={{ maxWidth: 760 }}>
        <Reveal className="section-header-center">
          <span className="eyebrow">{t('eyebrow.faq')}</span>
          <h2 className="section-title">{str(content, 'heading', 'Frequently Asked Questions')}</h2>
          {featured && (
            <Link to="/support" className="btn btn-secondary" style={{ marginTop: '0.75rem' }}>
              {t('common.viewAll')} <ChevronRight size={16} />
            </Link>
          )}
        </Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((q, i) => <FaqAccordionItem key={i} item={q} delay={i * 60} />)}
        </div>
      </div>
    </section>
  );
}

/* ============================== BLOG ============================== */
export interface BlogItem { title: string; cover: string; author: string; content: string; date: string }
export function BlogCard({ b, delay = 0 }: { b: BlogItem; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        className="card card-hover card-link"
        style={{ height: '100%', display: 'block' }}
        to={`/blog/${itemSlug(b, str(b, 'title'))}`}
      >
        <div className="card-media">
          {str(b, 'cover') && <img src={str(b, 'cover')} alt={str(b, 'title')} loading="lazy" />}
        </div>
        <div className="card-body">
          <p className="card-meta">{str(b, 'date')} · {str(b, 'author')}</p>
          <h3 className="card-title">{str(b, 'title')}</h3>
          <p className="card-text">{str(b, 'content')}</p>
          <span className="card-arrow"><ChevronRight size={16} /></span>
        </div>
      </Link>
    </Reveal>
  );
}

export function Blog({
  content,
  featured = false,
}: {
  content: SectionContent;
  featured?: boolean;
}) {
  const { t } = useI18n();
  const items = arr<BlogItem>(content, 'items').slice(0, featured ? 3 : undefined);
  if (items.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <Reveal className="section-header-center">
          <span className="eyebrow">{t('eyebrow.blog')}</span>
          <h2 className="section-title">{str(content, 'heading', 'Travel Insights')}</h2>
        </Reveal>
        <div className="grid grid-3">
          {items.map((b, i) => <BlogCard key={i} b={b} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
}

/* ============================== CONTACT ============================== */
interface FormField { name: string; type: string; placeholder: string; required: boolean }
export function Contact({
  content,
  compact = false,
}: {
  content: SectionContent;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const contactForm = obj(content, 'contactForm');
  const fields = arr<FormField>(contactForm, 'fields');
  const submitText = str(contactForm, 'submitButtonText', t('contact.submit'));

  const cards = [
    { icon: <Phone size={20} />, label: t('contact.call'), value: str(content, 'phone'), href: `tel:${str(content, 'phone')}` },
    { icon: <MessageCircle size={20} />, label: t('contact.whatsapp'), value: str(content, 'whatsapp'), href: `https://wa.me/${str(content, 'whatsapp').replace(/\s/g, '')}` },
    { icon: <Mail size={20} />, label: t('contact.email'), value: str(content, 'email'), href: `mailto:${str(content, 'email')}` },
    { icon: <MapPin size={20} />, label: t('contact.office'), value: str(content, 'address'), href: '' },
  ];

  const showMap = !compact && str(content, 'googleMap');

  return (
    <section className="section">
      <div className="container">
        <Reveal className="section-header-center">
          <span className="eyebrow">{t('eyebrow.contact')}</span>
          <h2 className="section-title">{str(content, 'heading', 'Get In Touch')}</h2>
        </Reveal>
        <div className="grid" style={{ gridTemplateColumns: compact ? '1fr' : '1fr 1fr', alignItems: 'start', gap: '2rem' }}>
          <Reveal>
            <div>
              <div className="contact-cards">
                {cards.map((c, i) => (
                  <a key={i} className="contact-card" href={c.href || undefined} style={c.href ? {} : { pointerEvents: 'none' }}>
                    <div className="contact-icon">{c.icon}</div>
                    <div>
                      <div className="stat-label">{c.label}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.value || '—'}</div>
                    </div>
                  </a>
                ))}
              </div>
              {showMap && (
                <iframe
                  title="map"
                  src={showMap}
                  style={{ width: '100%', border: 0, minHeight: 260, borderRadius: 'var(--radius)', marginTop: '1rem' }}
                  loading="lazy"
                />
              )}
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="form-panel">
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{t('contact.formTitle')}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>
                {t('contact.formSub')}
              </p>
              <form onSubmit={(e) => { e.preventDefault(); }}>
                {(fields.length ? fields : [
                  { name: 'name', type: 'text', placeholder: t('contact.ph.name'), required: true },
                  { name: 'email', type: 'email', placeholder: t('contact.ph.email'), required: true },
                  { name: 'message', type: 'textarea', placeholder: t('contact.ph.message'), required: true },
                ]).map((f, i) => (
                  <div className="field" key={f.name || i}>
                    <label htmlFor={`field-${f.name || i}`}>{f.placeholder}</label>
                    {f.type === 'textarea' ? (
                      <textarea id={`field-${f.name || i}`} placeholder={f.placeholder} required={!!f.required} rows={5} />
                    ) : (
                      <input id={`field-${f.name || i}`} type={f.type === 'email' ? 'email' : 'text'} placeholder={f.placeholder} required={!!f.required} />
                    )}
                  </div>
                ))}
                <button className="btn btn-primary" type="submit">{submitText} <Send size={16} /></button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================== Registry (12 PROFESSIONAL keys) ============================== */
export const SECTION_RENDERERS: Record<string, ComponentType<{ content: SectionContent }>> = {
  hero: Hero,
  about: About,
  services: Services,
  destinations: Destinations,
  packages: Packages,
  offers: Offers,
  gallery: Gallery,
  testimonials: Testimonials,
  faq: Faq,
  blog: Blog,
  contact: Contact,
};
