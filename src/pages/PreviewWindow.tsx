import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useWebsite } from '../hooks/useWebsite';
import { PublicLayout } from '../components/PublicLayout';
import { Home } from './Pages';
import type { SectionEntry, WebsiteData } from '../types';

const PREVIEW_KEY = 'websitePreviewDraft';

type PreviewDraft = { sections: SectionEntry[] };

function readDraft(): PreviewDraft | null {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviewDraft;
    return Array.isArray(parsed?.sections) ? parsed : null;
  } catch {
    return null;
  }
}

export function PreviewWindow() {
  const { data, loading, error, reload } = useWebsite();
  const [draft, setDraft] = useState<PreviewDraft | null>(readDraft);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== PREVIEW_KEY) return;
      setDraft(readDraft());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isDraft = Boolean(draft?.sections.length);

  const previewData: WebsiteData | null = data
    ? {
        agency: data.agency,
        template: data.template,
        sections: isDraft ? draft!.sections : data.sections,
      }
    : null;

  return (
    <div>
      <div className="preview-banner">
        <span className="preview-banner-text">
          <Eye size={15} />
          {isDraft
            ? 'Live preview — unsaved changes are shown. Edits in the admin update this page automatically.'
            : 'Live preview — showing the published site.'}
        </span>
        <Link to="/admin/website-sections" className="preview-banner-link">Back to admin</Link>
      </div>
      <PublicLayout data={previewData}>
        {loading ? (
          <div className="site-skeleton" aria-busy="true">
            <div className="skeleton hero-band" />
            <div className="container">
              <div className="skeleton" style={{ height: '1rem', width: '260px', margin: '3rem auto' }} />
              <div className="skeleton" style={{ height: '12rem' }} />
            </div>
          </div>
        ) : error ? (
          <div className="section">
            <div className="container">
              <div className="error-state" role="alert">
                <h3>Could not load website content</h3>
                <p>{error.message}</p>
                <button type="button" className="btn btn-secondary" onClick={reload}>Retry</button>
              </div>
            </div>
          </div>
        ) : data ? (
          <Home data={previewData} />
        ) : null}
      </PublicLayout>
    </div>
  );
}