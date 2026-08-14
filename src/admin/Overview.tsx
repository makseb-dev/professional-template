import { useMemo, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  BadgePercent, FileText, HelpCircle, Image as ImageIcon, LayoutDashboard,
  MapPin, MessagesSquare, Package, Search, Shapes, ShieldCheck, Star, Ticket,
} from 'lucide-react';
import type { AdminSection, SectionContent } from '../types';
import { isOfferActive } from '../components/SectionRenderers';

function listOf(content: SectionContent, keys: string[]): Record<string, unknown>[] {
  for (const key of keys) {
    const v = content[key];
    if (Array.isArray(v)) return v as Record<string, unknown>[];
  }
  return [];
}

export function Overview() {
  const { sections } = useOutletContext<{ sections: AdminSection[] }>();
  const editable = sections ?? [];
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return editable;
    return editable.filter(
      (s) =>
        (s.displayName || '').toLowerCase().includes(q) ||
        s.sectionKey.toLowerCase().includes(q),
    );
  }, [editable, query]);

  const collection = useMemo(() => {
    const contentOf = (key: string): SectionContent =>
      (editable.find((s) => s.sectionKey === key)?.content ?? {}) as SectionContent;

    const offers = listOf(contentOf('offers'), ['items']);
    const packages = listOf(contentOf('packages'), ['items', 'cards']);
    const destinations = listOf(contentOf('destinations'), ['items', 'cards']);
    const testimonials = listOf(contentOf('testimonials'), ['items']);
    const blog = listOf(contentOf('blog'), ['items', 'posts']);
    const faq = listOf(contentOf('faq'), ['items']);
    const gallery = listOf(contentOf('gallery'), ['images', 'items']);

    const offersLive = offers.filter((it) => isOfferActive(it as any)).length;
    const offersMissingImage = offers.filter(
      (it) => typeof it.imageUrl !== 'string' || !(it.imageUrl as string).trim(),
    ).length;

    return {
      offers: offers.length,
      offersLive,
      offersMissingImage,
      packages: packages.length,
      destinations: destinations.length,
      testimonials: testimonials.length,
      blog: blog.length,
      faq: faq.length,
      gallery: gallery.length,
    };
  }, [editable]);

  const enabled = editable.filter((s) => s.isEnabled !== false).length;
  const disabledCount = editable.length - enabled;
  const emptySections = editable.filter(
    (s) => !s.content || Object.keys(s.content).length === 0,
  ).length;

  const health = useMemo(() => {
    const warnings: { level: 'warn' | 'ok'; text: string }[] = [];
    if (collection.offers > 0 && collection.offersMissingImage > 0) {
      warnings.push({
        level: 'warn',
        text: `${collection.offersMissingImage} of ${collection.offers} offers have no image.`,
      });
    }
    if (collection.offers > collection.offersLive) {
      warnings.push({
        level: 'warn',
        text: `${collection.offers - collection.offersLive} offers are expired (validTo in the past).`,
      });
    }
    if (disabledCount > 0) {
      warnings.push({ level: 'warn', text: `${disabledCount} section${disabledCount > 1 ? 's are' : ' is'} disabled — they won't render on the site.` });
    }
    if (emptySections > 0) {
      warnings.push({ level: 'warn', text: `${emptySections} section${emptySections > 1 ? 's have' : ' has'} no content yet.` });
    }
    if (warnings.length === 0) {
      warnings.push({ level: 'ok', text: 'Everything looks healthy — all sections enabled and offers complete.' });
    }
    return warnings;
  }, [collection, disabledCount, emptySections]);

  const aboutLink = editable.find((s) => s.sectionKey === 'about');

  const tiles = [
    { icon: <Shapes size={20} />, value: String(editable.length), label: 'Editable sections' },
    { icon: <Ticket size={20} />, value: `${collection.offersLive} / ${collection.offers}`, label: 'Offers live' },
    { icon: <Package size={20} />, value: String(collection.packages), label: 'Packages' },
    { icon: <MapPin size={20} />, value: String(collection.destinations), label: 'Destinations' },
    { icon: <MessagesSquare size={20} />, value: String(collection.testimonials), label: 'Testimonials' },
    { icon: <FileText size={20} />, value: String(collection.blog), label: 'Blog posts' },
    { icon: <ImageIcon size={20} />, value: String(collection.gallery), label: 'Gallery images' },
    { icon: <HelpCircle size={20} />, value: String(collection.faq), label: 'FAQ items' },
  ];

  return (
    <div>
      <h2 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
        Overview
      </h2>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
        Manage the content of your website. Every change is published with one click.
      </p>

      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
        {tiles.map((tile, i) => (
          <div className="admin-card admin-stat" key={i}>
            <div className="icon-tile">{tile.icon}</div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.35rem' }}>{tile.value}</div>
              <div className="stat-label">{tile.label}</div>
            </div>
          </div>
        ))}
        <div className="admin-card admin-stat">
          <div className="icon-tile"><Star size={20} /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.35rem' }}>Live</div>
            <div className="stat-label">Website status</div>
          </div>
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.85rem' }}>
            <ShieldCheck size={16} style={{ verticalAlign: '-3px' }} /> Content health
          </h3>
          <ul className="health-list">
            {health.map((h, i) => (
              <li key={i} className={`health-${h.level}`}>{h.text}</li>
            ))}
          </ul>
        </div>

        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.85rem' }}>Quick actions</h3>
          <div className="quick-actions">
            <Link to="/admin/offers" className="btn btn-secondary">
              <BadgePercent size={15} /> New offer
            </Link>
            <Link to="/admin/offers" className="btn btn-secondary">
              <Ticket size={15} /> Publish offers
            </Link>
            {aboutLink && (
              <Link to={`/admin/sections/${aboutLink.templateSectionId}`} className="btn btn-secondary">
                <LayoutDashboard size={15} /> Edit about
              </Link>
            )}
            <a href="/" target="_blank" rel="noreferrer" className="btn btn-secondary">
              <Star size={15} /> View live site
            </a>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Your sections</h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              type="search"
              placeholder="Filter sections…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '2rem', minWidth: 220 }}
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--muted-foreground)' }}>No sections match “{query}”.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.75rem' }}>
            {filtered.map((s) => (
              <Link
                key={s.templateSectionId}
                to={`/admin/sections/${s.templateSectionId}`}
                className="admin-nav-link"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
              >
                <LayoutDashboard size={16} /> {s.displayName || s.sectionKey}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}