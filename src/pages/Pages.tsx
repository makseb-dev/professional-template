import type { WebsiteData } from '../types';
import { arr, num, str } from '../types';
import { renderPageSections, renderHomeSections, getSectionContent, PageHero } from '../components/SectionsView';
import {
  BlogCard,
  OfferCard,
  isOfferActive,
  type BlogItem,
} from '../components/SectionRenderers';
import { Reveal } from '../components/Reveal';
import type { OfferItem } from '../components/SectionRenderers';
import { useI18n } from '../i18n';
import { getCoordinates, hasFlight, osmEmbedUrl } from '../offer';
import { useState } from 'react';

export function PageView({
  data,
  page,
}: {
  data: WebsiteData | null;
  page: string;
}) {
  const sections = data?.sections ?? [];
  return <>{renderPageSections(sections, page)}</>;
}

export function Home({ data }: { data: WebsiteData | null }) {
  const sections = data?.sections ?? [];
  return <>{renderHomeSections(sections)}</>;
}

export function AboutPage({ data }: { data: WebsiteData | null }) {
  const { t } = useI18n();
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="about" title={t('nav.about')} subtitle={t('page.about.sub')} />
      {renderPageSections(sections, '/about')}
    </>
  );
}

export function DestinationsPage({ data }: { data: WebsiteData | null }) {
  const { t } = useI18n();
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="destinations" title={t('nav.destinations')} subtitle={t('page.destinations.sub')} />
      {renderPageSections(sections, '/destinations')}
    </>
  );
}

export function PackagesPage({ data }: { data: WebsiteData | null }) {
  const { t } = useI18n();
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="packages" title={t('nav.packages')} subtitle={t('page.packages.sub')} />
      {renderPageSections(sections, '/packages')}
    </>
  );
}

export function OffersPage({ data }: { data: WebsiteData | null }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<'all' | 'flights'>('all');
  const sections = data?.sections ?? [];
  const offersSection = getSectionContent(sections, 'offers');
  if (!offersSection) {
    return <PageHero sections={sections} key="offers" title={t('nav.offers')} subtitle={t('page.offers.sub')} />;
  }
  const content = offersSection.content ?? {};
  const items = arr<OfferItem>(content, 'items').filter(isOfferActive);
  const shown = filter === 'flights' ? items.filter((o) => hasFlight(o)) : items;
  const mapped = items.filter((o) => getCoordinates(o) !== null);
  const avg = items.length
    ? (items.reduce((sum, o) => sum + num(o, 'rating', 0), 0) / items.length).toFixed(1)
    : '0.0';
  return (
    <>
      <section className="offer-page-hero">
        <div className="container">
          <Reveal className="offer-page-hero-inner">
            <span className="eyebrow">{t('eyebrow.offers')}</span>
            <h1 className="offer-page-title">{str(content, 'heading', t('nav.offers'))}</h1>
            <p className="offer-page-lead">{str(content, 'description', t('page.offers.sub'))}</p>
            <div className="offer-stats">
              <div className="offer-stat">
                <strong>{items.length}</strong>
                <span>{t('detail.packages')}</span>
              </div>
              {items.length > 0 && (
                <div className="offer-stat">
                  <strong>★ {avg} <span className="offer-stat-slash">/ 5</span></strong>
                  <span>{t('offers.satisfaction')}</span>
                </div>
              )}
              <div className="offer-stat">
                <strong>{t('offers.support')}</strong>
                <span>{t('common.validUntil')}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {items.length > 0 && (
            <Reveal className="offer-filters">
              <button
                type="button"
                className={`chip ${filter === 'all' ? 'chip-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                {t('offers.all')} ({items.length})
              </button>
              <button
                type="button"
                className={`chip ${filter === 'flights' ? 'chip-active' : ''}`}
                onClick={() => setFilter('flights')}
              >
                ✈ {t('offers.flights')} ({items.filter((o) => hasFlight(o)).length})
              </button>
            </Reveal>
          )}
          {shown.length === 0 ? (
            <div className="offer-empty">
              <p>{t('page.offers.empty')}</p>
            </div>
          ) : (
            <div className="offer-grid">
              {shown.map((o, i) => <OfferCard key={o.id || i} offer={o} delay={i * 80} />)}
            </div>
          )}
        </div>
      </section>
      {mapped.length > 0 && (
        <section className="section section-alt" id="offers-map">
          <div className="container">
            <Reveal className="section-header-center">
              <span className="eyebrow">{t('offers.mapEyebrow')}</span>
              <h2 className="section-title">{t('offers.mapTitle')}</h2>
              <p className="section-lead">{t('offers.mapSub')}</p>
            </Reveal>
            <div className="offers-map-grid">
              {mapped.map((o, i) => {
                const c = getCoordinates(o);
                return (
                  <Reveal key={o.id || i} delay={(i % 2) * 80}>
                    <div className="offer-map-card">
                      <iframe
                        title={`Map of ${str(o, 'title')}`}
                        src={osmEmbedUrl(c!.lat, c!.lng)}
                        loading="lazy"
                        style={{ width: '100%', border: 0, minHeight: 240, display: 'block' }}
                      />
                      <div className="offer-map-label">
                        <strong>{str(o, 'title')}</strong>
                        <span>{str(o, 'country')}{str(o, 'country') && str(o, 'destination') ? ' · ' : ''}{str(o, 'destination')}</span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export function GalleryPage({ data }: { data: WebsiteData | null }) {
  const { t } = useI18n();
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="gallery" title={t('nav.gallery')} subtitle={t('page.gallery.sub')} />
      {renderPageSections(sections, '/gallery')}
    </>
  );
}

export function SupportPage({ data }: { data: WebsiteData | null }) {
  const { t } = useI18n();
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="contact" title={t('nav.support')} subtitle={t('page.support.sub')} />
      {renderPageSections(sections, '/support')}
    </>
  );
}

export function BlogPage({ data }: { data: WebsiteData | null }) {
  const { t } = useI18n();
  const sections = data?.sections ?? [];
  const blogSection = getSectionContent(sections, 'blog');
  const content = blogSection?.content ?? {};
  const items = arr<BlogItem>(content, 'items');
  return (
    <>
      <PageHero sections={sections} key="blog" title={t('nav.blog')} subtitle={t('page.blog.sub')} />
      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <div className="offer-empty">
              <p>{t('page.blog.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {items.map((b, i) => <BlogCard key={i} b={b} delay={i * 80} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
