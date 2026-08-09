import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { useWebsite } from './hooks/useWebsite';
import {
  AboutPage, DestinationsPage, GalleryPage, Home, OffersPage,
  PackagesPage, SupportPage,
} from './pages/Pages';
import { NotFound } from './pages/NotFound';
import { AdminLayout } from './admin/AdminLayout';
import { Overview } from './admin/Overview';
import { SectionEditor } from './admin/SectionEditor';
import { Login } from './admin/Login';
import type { AdminSection } from './types';
import { useCallback, useState } from 'react';

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
        ? <div className="section"><div className="container"><div className="skeleton" style={{ height: '4rem' }} /></div></div>
        : error
          ? <div className="section"><div className="container"><div className="error-state" role="alert"><h3>Could not load website content</h3><p>{error.message}</p><button type="button" className="btn btn-secondary" onClick={reload}>Retry</button></div></div></div>
          : element}
    </PublicLayout>
  );

  return (
    <Routes>
      <Route path="/" element={publicRoute(<Home data={data} />)} />
      <Route path="/about" element={publicRoute(<AboutPage data={data} />)} />
      <Route path="/packages" element={publicRoute(<PackagesPage data={data} />)} />
      <Route path="/destinations" element={publicRoute(<DestinationsPage data={data} />)} />
      <Route path="/offers" element={publicRoute(<OffersPage data={data} />)} />
      <Route path="/gallery" element={publicRoute(<GalleryPage data={data} />)} />
      <Route path="/support" element={publicRoute(<SupportPage data={data} />)} />
      <Route path="/404" element={publicRoute(<NotFound />)} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="sections/:templateSectionId" element={<SectionEditor />} />
      </Route>
      <Route
        path="/admin/login"
        element={authedSections ? <Navigate to="/admin" replace /> : <Login onAuthed={handleAuthed} />}
      />
      <Route path="*" element={<Navigate to="/404" replace state={{ from: location.pathname }} />} />
    </Routes>
  );
}
