import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { ScrollToTop } from './components/ScrollToTop';
import { useWebsite } from './hooks/useWebsite';
import {
  AboutPage, BlogPage, DestinationsPage, GalleryPage, Home, OffersPage,
  PackagesPage, SupportPage,
} from './pages/Pages';
import { OfferDetail } from './pages/OfferDetail';
import { PackageDetail } from './pages/PackageDetail';
import { DestinationDetail } from './pages/DestinationDetail';
import { BlogDetail } from './pages/BlogDetail';
import { NotFound } from './pages/NotFound';
import { AdminLayout } from './admin/AdminLayout';
import { Overview } from './admin/Overview';
import { SectionEditor } from './admin/SectionEditor';
import { WebsiteSections } from './admin/WebsiteSections';
import { OffersEditor } from './admin/OffersEditor';
import { Login } from './admin/Login';
import type { AdminSection, WebsiteData } from './types';
import { useCallback, useState } from 'react';

function OfferDetailRoute({ data }: { data: WebsiteData | null }) {
  const { slug = '' } = useParams();
  return <OfferDetail data={data} slug={slug} />;
}

function PackageDetailRoute({ data }: { data: WebsiteData | null }) {
  const { slug = '' } = useParams();
  return <PackageDetail data={data} slug={slug} />;
}

function DestinationDetailRoute({ data }: { data: WebsiteData | null }) {
  const { slug = '' } = useParams();
  return <DestinationDetail data={data} slug={slug} />;
}

function BlogDetailRoute({ data }: { data: WebsiteData | null }) {
  const { slug = '' } = useParams();
  return <BlogDetail data={data} slug={slug} />;
}

export default function App() {
  const { data, loading, error, reload } = useWebsite();
  const [authedSections, setAuthedSections] = useState<AdminSection[] | null>(null);
  const location = useLocation();

  const handleAuthed = useCallback((sections: AdminSection[]) => {
    setAuthedSections(sections);
  }, []);

  const publicRoute = (element: React.ReactNode) => (
    <PublicLayout data={data}>
      {loading
        ? (
          <div className="site-skeleton" aria-busy="true">
            <div className="skeleton hero-band" />
            <div className="container">
              <div className="skeleton" style={{ height: '1.2rem', width: '240px', margin: '3rem auto 1rem' }} />
              <div className="skeleton" style={{ height: '1rem', width: '320px', margin: '0 auto 2rem' }} />
              <div className="site-skeleton-grid">
                {[0, 1, 2].map((i) => (
                  <div className="skeleton-card" key={i}>
                    <div className="skeleton-media" />
                    <div className="skeleton-line" style={{ width: '70%' }} />
                    <div className="skeleton-line" style={{ width: '90%' }} />
                    <div className="skeleton-line" style={{ width: '50%' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
        : error
          ? <div className="section"><div className="container"><div className="error-state" role="alert"><h3>Could not load website content</h3><p>{error.message}</p><button type="button" className="btn btn-secondary" onClick={reload}>Retry</button></div></div></div>
          : element}
    </PublicLayout>
  );

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={publicRoute(<Home data={data} />)} />
      <Route path="/about" element={publicRoute(<AboutPage data={data} />)} />
      <Route path="/packages" element={publicRoute(<PackagesPage data={data} />)} />
      <Route path="/packages/:slug" element={publicRoute(<PackageDetailRoute data={data} />)} />
      <Route path="/destinations" element={publicRoute(<DestinationsPage data={data} />)} />
      <Route path="/destinations/:slug" element={publicRoute(<DestinationDetailRoute data={data} />)} />
      <Route path="/offers" element={publicRoute(<OffersPage data={data} />)} />
      <Route path="/offers/:slug" element={publicRoute(<OfferDetailRoute data={data} />)} />
      <Route path="/gallery" element={publicRoute(<GalleryPage data={data} />)} />
      <Route path="/blog" element={publicRoute(<BlogPage data={data} />)} />
      <Route path="/blog/:slug" element={publicRoute(<BlogDetailRoute data={data} />)} />
      <Route path="/support" element={publicRoute(<SupportPage data={data} />)} />
      <Route path="/404" element={publicRoute(<NotFound />)} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="sections/:templateSectionId" element={<SectionEditor />} />
        <Route path="website-sections" element={<WebsiteSections />} />
        <Route path="offers" element={<OffersEditor />} />
      </Route>
      <Route
        path="/admin/login"
        element={authedSections ? <Navigate to="/admin" replace /> : <Login onAuthed={handleAuthed} />}
      />
      <Route path="*" element={<Navigate to="/404" replace state={{ from: location.pathname }} />} />
      </Routes>
    </>
  );
}
