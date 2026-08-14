import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Clock, MapPin, Star } from 'lucide-react';
import type { WebsiteData } from '../types';
import { arr, num, str } from '../types';
import { useI18n } from '../i18n';
import { getOfferSlug, itemSlug, localizeOffer, type RichOffer } from '../offer';
import { OfferCard, type PkgItem } from '../components/SectionRenderers';
import { Reveal } from '../components/Reveal';

interface Props {
  data: WebsiteData | null;
  slug: string;
}

export function PackageDetail({ data, slug }: Props) {
  const { t, locale } = useI18n();

  const pkg = useMemo(() => {
    const section = (data?.sections ?? []).find((s) => s.sectionKey === 'packages');
    const items = arr<PkgItem>(section ? section.content : {}, 'items');
    return items.find((it, i) => itemSlug(it, str(it, 'title'), i) === slug) ?? null;
  }, [data, slug]);

  const related = useMemo(() => {
    const section = (data?.sections ?? []).find((s) => s.sectionKey === 'offers');
    const raw = arr<RichOffer>(section ? section.content : {}, 'items');
    const localized = raw.map((it) => localizeOffer(it, locale));
    return pkg
      ? localized.filter((o) => str(o, 'destination').toLowerCase() === str(pkg, 'destination').toLowerCase())
      : [];
  }, [data, pkg, locale]);

  if (!pkg) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 720, textAlign: 'center', padding: '4rem 1rem' }}>
          <h1 className="section-title">{t('detail.notFound')}</h1>
          <p style={{ color: 'var(--muted-foreground)', margin: '1rem 0 1.5rem' }}>{t('detail.notFoundText')}</p>
          <Link className="btn btn-primary" to="/packages">{t('nav.packages')}</Link>
        </div>
      </section>
    );
  }

  const features = Array.isArray(pkg.features) ? pkg.features : [];
  const rating = num(pkg, 'rating', 0);

  return (
    <section className="section" style={{ padding: 0 }}>
      <div className="offer-detail-band">
        <div className="container">
          <nav className="offer-breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <ChevronRight size={13} />
            <Link to="/packages">{t('nav.packages')}</Link>
            <ChevronRight size={13} />
            <span>{str(pkg, 'title')}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <span className="eyebrow">{t('eyebrow.packages')}</span>
            {rating > 0 && (
              <span className="badge badge-discount"><Star size={12} fill="currentColor" /> {rating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="container" style={{ maxWidth: 1080, paddingTop: '2rem', paddingBottom: '3rem' }}>
        <Link to="/packages" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={16} /> {t('detail.back')}
        </Link>

        <div className="grid" style={{ gridTemplateColumns: '1.15fr 1fr', gap: '2.5rem', marginTop: '1.5rem' }}>
          <div>
            <div className="media-card" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              {str(pkg, 'image') && (
                <img src={str(pkg, 'image')} alt={str(pkg, 'title')} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1.25rem 0' }}>
              <span className="badge" style={{ background: 'var(--accent)' }}><MapPin size={12} /> {str(pkg, 'destination')}</span>
              <span className="badge" style={{ background: 'var(--accent)' }}><Clock size={12} /> {str(pkg, 'duration')}</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '0.5rem' }}>{str(pkg, 'title')}</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '1.02rem', marginBottom: '1.25rem' }}>
              {t('package.overview')}
            </p>

            {features.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  {t('detail.highlights')}
                </h2>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.95rem' }}>
                      <Check size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <div className="card" style={{ position: 'sticky', top: '6.5rem', padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{t('detail.from')}</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.15rem 0 1rem' }}>{str(pkg, 'price')}</div>
              <Link className="btn btn-primary" to="/offers" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {t('detail.bookNow')} <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <Reveal className="section-header-center">
              <span className="eyebrow">{t('eyebrow.offers')}</span>
              <h2 className="section-title">{t('package.related')}</h2>
            </Reveal>
            <div className="grid grid-3">
              {related.slice(0, 3).map((o, i) => <OfferCard key={getOfferSlug(o) || i} offer={o} delay={i * 80} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
