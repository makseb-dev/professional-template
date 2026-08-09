import { useState, useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plane } from 'lucide-react';
import { fetchMe, fetchSections } from '../api/agency';
import type { AdminSection } from '../types';

// PROFESSIONAL-tier section keys (7 STARTER + packages/offers/testimonials/faq/blog).
// team / statistics / partners are ENTERPRISE and excluded from this build.
export const EDITABLE_KEYS = [
  'about',
  'services',
  'destinations',
  'packages',
  'offers',
  'gallery',
  'testimonials',
  'faq',
  'blog',
  'contact',
];

export function filterEditable(sections: AdminSection[]): AdminSection[] {
  return sections.filter((s) => !s.isFixed && EDITABLE_KEYS.includes(s.sectionKey));
}

export function AdminLayout() {
  const [sections, setSections] = useState<AdminSection[] | null>(null);
  const [checked, setChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await fetchMe();
      if (!me) {
        if (alive) setChecked(true);
        return;
      }
      const list = await fetchSections();
      if (alive) {
        setSections(list);
        setChecked(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const editable = filterEditable(sections ?? []);

  if (!checked) return null;

  if (!sections) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <span className="brand-tile"><Plane size={18} style={{ transform: 'rotate(45deg)' }} /></span>
          <span>
            <span className="brand-name">Admin</span>
            <span className="brand-tag">Sections editor</span>
          </span>
        </div>
        <nav className="admin-nav" aria-label="Admin sections">
          <Link to="/admin" className="admin-nav-link">
            <LayoutDashboard size={16} /> Overview
          </Link>
          {editable.map((s) => (
            <Link
              key={s.templateSectionId}
              to={`/admin/sections/${s.templateSectionId}`}
              className="admin-nav-link"
            >
              <span style={{ flex: 1 }}>{s.displayName || s.sectionKey}</span>
            </Link>
          ))}
        </nav>
        <Link to="/" className="admin-nav-link" style={{ marginTop: 'auto' }}>← Back to site</Link>
      </aside>

      <div className="admin-body">
        <Outlet context={{ sections: editable }} />
      </div>
    </div>
  );
}
