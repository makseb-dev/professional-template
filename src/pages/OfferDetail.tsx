import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, Check, ChevronRight, Clock, MapPin, MessageCircle,
  Plane, Star, X,
} from 'lucide-react';
import type { WebsiteData } from '../types';
import { arr, num, str } from '../types';
import { useI18n } from '../i18n';
import { BRAND } from '../config';
import {
  getOfferGallery, getOfferImage, localizeOffer, offerUrlId, slugify,
  type RichOffer,
} from '../offer';

interface Props {
  data: WebsiteData | null;
  slug: string;
}

export function OfferDetail({ data, slug }: Props) {
  const { t, locale } = useI18n();
  const offersSection = data?.sections?.find((s) => s.sectionKey === 'offers');
  const rawItems = arr<RichOffer>(offersSection ? offersSection.content : {}, 'items');

  const offer = useMemo(() => {
    const localized = rawItems.map((it) => localizeOffer(it, locale));
    const match = (it: RichOffer) =>
      offerUrlId(it) === slug ||
      it.id === slug ||
      (typeof it.title === 'string' && slugify(it.title) === slug);
    return localized.find(match) ?? null;
  }, [rawItems, slug, locale]);

  const [activeImg, setActiveImg] = useState(0);

  if (!offer) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 720, textAlign: 'center', padding: '4rem 1rem' }}>
          <h1 className="section-title">{t('detail.notFound')}</h1>
          <p style={{ color: 'var(--muted-foreground)', margin: '1rem 0 1.5rem' }}>{t('detail.notFoundText')}</p>
          <Link className="btn btn-primary" to="/offers">{t('detail.back')}</Link>
        </div>
      </section>
    );
  }

  const gallery = getOfferGallery(offer);
  const image = gallery[activeImg] ?? getOfferImage(offer);

  const duration = offer.durationDays
    ? `${offer.durationDays} ${t('detail.days')}${offer.durationNights ? ` · ${offer.durationNights} ${t('detail.nights')}` : ''}`
    : '';

  return (
    <section className="section" style={{ padding: 0 }}>
      <div className="offer-detail-band">
        <div className="container">
          <nav className="offer-breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <ChevronRight size={13} />
            <Link to="/offers">{t('nav.offers')}</Link>
            <ChevronRight size={13} />
            <span>{str(offer, 'title')}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <span className="eyebrow">{t('eyebrow.offers')}</span>
            {num(offer, 'discountPercentage', 0) > 0 && (
              <span className="offer-detail-discount">−{num(offer, 'discountPercentage', 0)}% OFF</span>
            )}
          </div>
        </div>
      </div>
      <div className="container" style={{ maxWidth: 1080, paddingTop: '2rem', paddingBottom: '3rem' }}>
        <Link to="/offers" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={16} /> {t('detail.back')}
        </Link>

        <div className="grid" style={{ gridTemplateColumns: '1.15fr 1fr', gap: '2.5rem', marginTop: '1.5rem' }}>
          <div>
            <div className="media-card" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <img src={image} alt={str(offer, 'title')} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
            </div>
            {gallery.length > 1 && (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    style={{
                      border: i === activeImg ? '2px solid var(--primary)' : '2px solid transparent',
                      borderRadius: '0.6rem', overflow: 'hidden', padding: 0, cursor: 'pointer', background: 'none',
                    }}
                  >
                    <img src={g} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1.25rem 0' }}>
              {offer.countryFlag && <span className="badge" style={{ background: 'var(--accent)' }}>{offer.countryFlag} {str(offer, 'country')}</span>}
              {typeof offer.rating === 'number' && offer.rating > 0 && (
                <span className="badge" style={{ background: 'var(--accent)' }}><Star size={12} fill="currentColor" /> {offer.rating.toFixed(1)} · {offer.reviewsCount ?? 0}</span>
              )}
              {duration && <span className="badge" style={{ background: 'var(--accent)' }}><Clock size={12} /> {duration}</span>}
              {offer.departureDate && <span className="badge" style={{ background: 'var(--accent)' }}><CalendarDays size={12} /> {str(offer, 'departureDate')}</span>}
              {offer.returnDate && <span className="badge" style={{ background: 'var(--accent)' }}><CalendarDays size={12} /> → {str(offer, 'returnDate')}</span>}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '0.5rem' }}>{str(offer, 'title')}</h1>
            {offer.tagline && <p style={{ color: 'var(--muted-foreground)', fontSize: '1.05rem', marginBottom: '1.25rem' }}>{str(offer, 'tagline')}</p>}

            {offer.overview && (
              <Section title={t('detail.overview')}>
                <p style={{ lineHeight: 1.7, color: 'var(--muted-foreground)' }}>{str(offer, 'overview')}</p>
              </Section>
            )}

            {Array.isArray(offer.highlights) && offer.highlights.length > 0 && (
              <Section title={t('detail.highlights')}>
                <ul style={{ margin: 0, paddingInlineStart: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {(offer.highlights as string[]).map((h, i) => (
                    <li key={i} style={{ fontSize: '0.95rem' }}>{h}</li>
                  ))}
                </ul>
              </Section>
            )}

            {offer.flight && Object.keys(offer.flight).length > 0 && (
              <Section title={t('detail.flight')}>
                <FlightLegs flight={offer.flight} t={t} />
              </Section>
            )}

            {offer.hotel && Object.keys(offer.hotel).length > 0 && (
              <Section title={t('detail.hotel')}>
                <HotelBlock hotel={offer.hotel} t={t} />
              </Section>
            )}

            {Array.isArray(offer.activities) && offer.activities.length > 0 && (
              <Section title={t('detail.activities')}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {(offer.activities as Record<string, unknown>[]).map((a, i) => (
                    <div key={i} className="card" style={{ padding: '0.9rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{str(a, 'title')}</strong>
                      {str(a, 'description') && <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.35rem' }}>{str(a, 'description')}</p>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {Array.isArray(offer.included) && offer.included.length > 0 && (
                <Section title={t('detail.included')}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {(offer.included as string[]).map((x, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.92rem' }}>
                        <Check size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {x}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {Array.isArray(offer.excluded) && offer.excluded.length > 0 && (
                <Section title={t('detail.excluded')}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {(offer.excluded as string[]).map((x, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.92rem' }}>
                        <X size={15} style={{ color: 'var(--destructive)', flexShrink: 0 }} /> {x}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

            {offer.pricing && Object.keys(offer.pricing).length > 0 && (
              <Section title={t('detail.pricing')}>
                <PricingTable pricing={offer.pricing} t={t} />
              </Section>
            )}

            {offer.requirements && Object.keys(offer.requirements).length > 0 && (
              <Section title={t('detail.requirements')}>
                <RequirementsBlock requirements={offer.requirements} t={t} />
              </Section>
            )}

            {offer.conditions && Object.keys(offer.conditions).length > 0 && (
              <Section title={t('detail.conditions')}>
                <ConditionsBlock conditions={offer.conditions} t={t} />
              </Section>
            )}

            {Array.isArray(offer.reviews) && offer.reviews.length > 0 && (
              <Section title={t('detail.reviews')}>
                <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  {(offer.reviews as Record<string, unknown>[]).map((r, i) => (
                    <div key={i} className="card" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        {str(r, 'avatar') && <img src={str(r, 'avatar')} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />}
                        <div>
                          <strong style={{ fontSize: '0.92rem' }}>{str(r, 'name')}</strong>
                          <div style={{ display: 'flex', gap: '0.1rem', alignItems: 'center' }}>
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} size={12} fill={j < num(r, 'rating', 0) ? 'currentColor' : 'none'} style={{ color: '#eab308' }} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {str(r, 'text') && <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{str(r, 'text')}</p>}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div>
            <div className="card" style={{ position: 'sticky', top: '6.5rem', padding: '1.5rem' }}>
              {typeof offer.priceFrom === 'number' && offer.priceFrom > 0 && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{t('detail.from')}</span>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {offer.priceFrom.toLocaleString()} {offer.currency ?? BRAND.currency}
                  </span>
                </div>
              )}
              {offer.destination && <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}><MapPin size={13} style={{ verticalAlign: '-2px' }} /> {str(offer, 'destination')}</p>}

              <BookingForm offer={offer} t={t} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

type Tfn = (k: string) => string;

function FlightLegs({ flight, t }: { flight: Record<string, unknown>; t: Tfn }) {
  const s = (k: string, fb = '') => str(flight, k, fb);
  const from = s('departureCity');
  const to = s('arrivalCity');
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Plane size={16} style={{ color: 'var(--primary)' }} /> {s('airline', BRAND.name)}</strong>
        {s('duration') && <span className="badge" style={{ background: 'var(--accent)' }}><Clock size={12} /> {s('duration')}</span>}
      </div>
      {from && to && (
        <div className="flight-route" aria-hidden="true">
          <span className="flight-route-plane"><Plane size={15} /></span>
          <span className="flight-route-track">
            <span className="flight-route-dot" style={{ left: 0 }} />
            <span className="flight-route-line" />
            <span className="flight-route-dot" style={{ right: 0 }} />
          </span>
          <div className="flight-route-cities">
            <span>{from}{s('departureAirport') ? ` (${s('departureAirport')})` : ''}</span>
            <span>{to}{s('arrivalAirport') ? ` (${s('arrivalAirport')})` : ''}</span>
          </div>
        </div>
      )}
      {[['out', from, s('departureAirport'), s('departureTime')], ['in', to, s('arrivalAirport'), s('arrivalTime')]].map(([kind, city, airport, time], i) => (
        <div key={String(kind)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderTop: i ? '1px dashed var(--border)' : undefined }}>
          <span className="badge" style={{ background: 'var(--accent)', minWidth: 34, textAlign: 'center' }}>{i === 0 ? '→' : '←'}</span>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.92rem' }}>{city || '—'}</strong>
            {airport && <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{airport}</div>}
          </div>
          {time && <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{time}</span>}
        </div>
      ))}
      <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
        {s('transit') && <span>{t('detail.transit')}: {s('transit')} · </span>}
        {s('baggage') && <span>{t('detail.baggage')}: {s('baggage')}</span>}
        {!s('transit') && !s('baggage') && s('returnDepartureTime') && `${t('detail.arrivalTime')}: ${s('returnDepartureTime')}`}
      </div>
    </div>
  );
}

function HotelBlock({ hotel, t }: { hotel: Record<string, unknown>; t: Tfn }) {
  const stars = num(hotel, 'stars', 0);
  const amenities = arr<string>(hotel, 'amenities');
  const rooms = arr<Record<string, unknown>>(hotel, 'rooms');
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <strong style={{ fontSize: '1.05rem' }}>{str(hotel, 'name', 'Hotel')}</strong>
        {stars > 0 && <span className="badge" style={{ background: 'var(--accent)' }}>{stars} {t('detail.hotelStars')}</span>}
      </div>
      {str(hotel, 'description') && <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{str(hotel, 'description')}</p>}
      {amenities.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
          {amenities.map((a, i) => <span key={i} className="badge" style={{ background: 'var(--accent)' }}>{a}</span>)}
        </div>
      )}
      {rooms.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <strong style={{ fontSize: '0.85rem' }}>{t('detail.rooms')}</strong>
          {rooms.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.4rem 0', borderTop: '1px dashed var(--border)', fontSize: '0.88rem' }}>
              <span>{str(r, 'type', `Room ${i + 1}`)} · <span style={{ color: 'var(--muted-foreground)' }}>{str(r, 'occupancy')}</span></span>
              {Array.isArray(r.includes) && (r.includes as string[]).length > 0 && (
                <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', textAlign: 'right' }}>{t('detail.includes')}: {(r.includes as string[]).join(', ')}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PricingTable({ pricing, t }: { pricing: Record<string, unknown>; t: Tfn }) {
  const rows: [string, string | number][] = [
    [t('detail.adult'), num(pricing, 'adult', 0)],
    [t('detail.child'), num(pricing, 'child', 0)],
    [t('detail.singleSupp'), num(pricing, 'singleSupplement', 0)],
    [t('detail.taxes'), num(pricing, 'taxes', 0)],
  ].filter((entry): entry is [string, number] => entry[1] !== 0);
  return (
    <div className="card" style={{ padding: '1rem' }}>
      {rows.map(([label, v], i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: i ? '1px dashed var(--border)' : undefined, fontSize: '0.92rem' }}>
          <span>{label}</span>
          <strong>{typeof v === 'number' ? v.toLocaleString() : v}</strong>
        </div>
      ))}
    </div>
  );
}

function RequirementsBlock({ requirements, t }: { requirements: Record<string, unknown>; t: Tfn }) {
  const docs = arr<string>(requirements, 'documents');
  return (
    <div className="card" style={{ padding: '1rem' }}>
      {str(requirements, 'passport') && <p style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}><strong>{t('detail.passport')}:</strong> {str(requirements, 'passport')}</p>}
      {str(requirements, 'visa') && <p style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}><strong>{t('detail.visa')}:</strong> {str(requirements, 'visa')}</p>}
      {docs.length > 0 && (
        <p style={{ fontSize: '0.92rem' }}><strong>{t('detail.documents')}:</strong> {docs.join(', ')}</p>
      )}
    </div>
  );
}

function ConditionsBlock({ conditions, t }: { conditions: Record<string, unknown>; t: Tfn }) {
  const rows: [string, string][] = [
    [t('detail.cancellation'), str(conditions, 'cancellation')],
    [t('detail.refund'), str(conditions, 'refund')],
    [t('detail.booking'), str(conditions, 'booking')],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  return (
    <div className="card" style={{ padding: '1rem' }}>
      {rows.map(([label, value], i) => (
        <p key={i} style={{ fontSize: '0.92rem', marginBottom: rows.length - 1 === i ? 0 : '0.4rem' }}>
          <strong>{label}:</strong> {value}
        </p>
      ))}
    </div>
  );
}

function BookingForm({ offer, t }: { offer: RichOffer; t: Tfn }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', adults: '2', children: '0', date: '', message: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      `*${t('detail.book')}* ${str(offer, 'title')}`,
      `— ${str(offer, 'destination') || ''}`.trim(),
      `${t('detail.form.name')}: ${form.name}`,
      `${t('detail.form.email')}: ${form.email}`,
      `${t('detail.form.phone')}: ${form.phone}`,
      `${t('detail.form.adults')}: ${form.adults} · ${t('detail.form.children')}: ${form.children}`,
      form.date && `${t('detail.form.date')}: ${form.date}`,
      form.message && `${t('detail.form.message')}: ${form.message}`,
    ].filter(Boolean).join('\n');

    const whatsapp = (BRAND.whatsapp || '').replace(/\D/g, '');
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(lines)}`, '_blank');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.6rem',
    border: '1px solid var(--border)', background: 'var(--background)', fontSize: '0.92rem',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em',
    color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: '0.3rem', display: 'block',
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div>
        <label style={labelStyle}>{t('detail.form.name')}</label>
        <input style={inputStyle} required value={form.name} onChange={set('name')} placeholder={t('detail.form.namePh')} />
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>{t('detail.form.email')}</label>
          <input style={inputStyle} type="email" required value={form.email} onChange={set('email')} placeholder="email@example.com" />
        </div>
        <div>
          <label style={labelStyle}>{t('detail.form.phone')}</label>
          <input style={inputStyle} type="tel" required value={form.phone} onChange={set('phone')} placeholder="+213 …" />
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>{t('detail.form.adults')}</label>
          <input style={inputStyle} type="number" min={1} value={form.adults} onChange={set('adults')} />
        </div>
        <div>
          <label style={labelStyle}>{t('detail.form.children')}</label>
          <input style={inputStyle} type="number" min={0} value={form.children} onChange={set('children')} />
        </div>
        <div>
          <label style={labelStyle}>{t('detail.form.date')}</label>
          <input style={inputStyle} type="date" value={form.date} onChange={set('date')} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>{t('detail.form.message')}</label>
        <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} value={form.message} onChange={set('message')} placeholder={t('detail.form.messagePh')} />
      </div>
      <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageCircle size={16} /> {t('detail.form.submit')}
      </button>
    </form>
  );
}
