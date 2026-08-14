import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronRight, User } from 'lucide-react';
import type { WebsiteData } from '../types';
import { arr, str } from '../types';
import { useI18n } from '../i18n';
import { itemSlug } from '../offer';
import type { BlogItem } from '../components/SectionRenderers';

interface Props {
  data: WebsiteData | null;
  slug: string;
}

export function BlogDetail({ data, slug }: Props) {
  const { t } = useI18n();

  const post = useMemo(() => {
    const section = (data?.sections ?? []).find((s) => s.sectionKey === 'blog');
    const items = arr<BlogItem>(section ? section.content : {}, 'items');
    return items.find((b, i) => itemSlug(b, str(b, 'title'), i) === slug) ?? null;
  }, [data, slug]);

  if (!post) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 720, textAlign: 'center', padding: '4rem 1rem' }}>
          <h1 className="section-title">{t('detail.notFound')}</h1>
          <p style={{ color: 'var(--muted-foreground)', margin: '1rem 0 1.5rem' }}>{t('detail.notFoundText')}</p>
          <Link className="btn btn-primary" to="/blog">{t('nav.blog')}</Link>
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
            <Link to="/blog">{t('nav.blog')}</Link>
            <ChevronRight size={13} />
            <span>{str(post, 'title')}</span>
          </nav>
        </div>
      </div>
      <div className="container" style={{ maxWidth: 800, paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        <Link to="/blog" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={16} /> {t('detail.back')}
        </Link>
        <article style={{ marginTop: '1.5rem' }}>
          {str(post, 'cover') && (
            <div className="media-card" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <img src={str(post, 'cover')} alt={str(post, 'title')} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge" style={{ background: 'var(--accent)' }}><CalendarDays size={12} /> {str(post, 'date')}</span>
            <span className="badge" style={{ background: 'var(--accent)' }}><User size={12} /> {str(post, 'author')}</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem' }}>{str(post, 'title')}</h1>
          <div style={{ lineHeight: 1.75, color: 'var(--foreground)', fontSize: '1.02rem' }}>
            {str(post, 'content').split('\n').filter(Boolean).map((p, i) => (
              <p key={i} style={{ marginBottom: '1rem' }}>{p}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
