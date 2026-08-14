import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, MapPin } from 'lucide-react';
import type { WebsiteData } from '../types';
import { arr, str } from '../types';
import { useI18n } from '../i18n';
import {
  getCoordinates, getOfferSlug, itemSlug, localizeOffer, osmEmbedUrl, type RichOffer,
} from '../offer';
import { OfferCard, type DestCard } from '../components/SectionRenderers';
import { Reveal } from '../components/Reveal';

interface Props {
  data: WebsiteData | null;
  slug: string;
}

export function DestinationDetail({ data, slug }: Props) {
  const { t, locale } = useI18n();

  const dest = useMemo(() => {
    const section = (data?.sections ?? []).find((s) => s.sectionKey === 'destinations');
    const cards = arr<DestCard>(section ? section.content : {}, 'cards');
    return cards.find((c, i) => itemSlug(c, str(c, 'title'), i) === slug) ?? null;
  }, [data, slug]);

  const offers = useMemo(() => {
    const section = (data?.sections ?? []).find((s) => s.sectionKey === 'offers');
    const raw = arr<RichOffer>(section ? section.content : {}, 'items');
    const localized = raw.map((it) => localizeOffer(it, locale));
    if (!dest) return [];
    const name = str(dest, 'title').toLowerCase();
    return localized.filter((o) =>
      str(o, 'destination').toLowerCase() === name ||
      str(o, 'country').toLowerCase() === name,
    );
  }, [data, dest, locale]);

  const mapped = offers.filter((o) => getCoordinates(o) !== null);

  if (!dest) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 720, textAlign: 'center', padding: '4rem 1rem' }}>
          <h1 className="section-title">{t('detail.notFound')}</h1>
          <p style={{ color: 'var(--muted-foreground)', margin: '1rem 0 1.5rem' }}>{t('detail.notFoundText')}</p>
          <Link className="btn btn-primary" to="/destinations">{t('nav.destinations')}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ padding: 0 }}>
      <div className="offer-detail-band">
        <div className="container">
          <nav className="offer-breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <ChevronRight size={13} />
            <Link to="/destinations">{t('nav.destinations')}</Link>
            <ChevronRight size={13} />
            <span>{str(dest, 'title')}</span>
          </nav>
          <div style={{ marginTop: '1rem' }}>
            <span className="eyebrow">{t('eyebrow.destinations')}</span>
          </div>
        </div>
      </div>
      <div className="container" style={{ maxWidth: 1080, paddingTop: '2rem', paddingBottom: '3rem' }}>
        <Link to="/destinations" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={16} /> {t('detail.back')}
        </Link>

        <div className="grid" style={{ gridTemplateColumns: '1.15fr 1fr', gap: '2.5rem', marginTop: '1.5rem', alignItems: 'start' }}>
          <div>
            <div className="media-card" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              {str(dest, 'image') && (
                <img src={str(dest, 'image')} alt={str(dest, 'title')} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
              )}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.15, margin: '1rem 0 0.5rem' }}>{str(dest, 'title')}</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              {str(dest, 'shortDescription')}
            </p>
            <strong className="price" style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>{str(dest, 'price')}</strong>
          </div>

          {mapped.length > 0 && (
            <Reveal>
              <div className="card" style={{ padding: '1rem' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <MapPin size={15} style={{ color: 'var(--secondary)' }} /> {str(dest, 'title')} on the map
                </strong>
                <iframe
                  title={`Map of ${str(dest, 'title')}`}
                  src={osmEmbedUrl(getCoordinates(mapped[0])!.lat, getCoordinates(mapped[0])!.lng)}
                  style={{ width: '100%', border: 0, minHeight: 320, borderRadius: 'var(--radius)' }}
                  loading="lazy"
                />
              </div>
            </Reveal>
          )}
        </div>

        {offers.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <Reveal className="section-header-center">
              <span className="eyebrow">{t('eyebrow.offers')}</span>
              <h2 className="section-title">{t('destination.related')}</h2>
            </Reveal>
            <div className="grid grid-3">
              {offers.map((o, i) => <OfferCard key={getOfferSlug(o) || i} offer={o} delay={i * 80} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
