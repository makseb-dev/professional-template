import { useState, useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowLeft, BadgePercent, FileText, HelpCircle, Home, Image, Info,
  LayoutDashboard, LayoutPanelTop, Mail, MapPin, Package, PanelLeftClose, PanelLeftOpen,
  Plane, Star, Wrench,
} from 'lucide-react';
import { fetchMe, fetchSections } from '../api/agency';
import type { AdminSection } from '../types';

// PROFESSIONAL-tier section keys (7 STARTER + hero + packages/offers/testimonials/faq/blog).
// team / statistics / partners are ENTERPRISE and excluded from this build.
export const EDITABLE_KEYS = [
  'hero',
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

const SECTION_ICONS: Record<string, typeof Home> = {
  hero: Home,
  about: Info,
  services: Wrench,
  destinations: MapPin,
  packages: Package,
  offers: BadgePercent,
  gallery: Image,
  testimonials: Star,
  faq: HelpCircle,
  blog: FileText,
  contact: Mail,
};

export function filterEditable(sections: AdminSection[]): AdminSection[] {
  return sections.filter((s) => EDITABLE_KEYS.includes(s.sectionKey));
}

const COLLAPSE_KEY = 'adminSidebarCollapsed';

export function AdminLayout() {
  const [sections, setSections] = useState<AdminSection[] | null>(null);
  const [checked, setChecked] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
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

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const toggleCollapsed = () => setCollapsed((c) => !c);

  const editable = filterEditable(sections ?? []);

  const isActive = (to: string) =>
    to === '/admin'
      ? location.pathname === '/admin' || location.pathname === '/admin/'
      : location.pathname.startsWith(to);

  const navClass = (to: string) =>
    `admin-nav-link${isActive(to) ? ' is-active' : ''}`;

  if (!checked) {
    return (
      <div className="admin-splash" aria-busy="true">
        <div className="admin-splash-inner">
          <div className="skeleton" style={{ height: '2rem', width: '60%', marginBottom: '2rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '40%', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '35%', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '45%', marginBottom: '3rem' }} />
          <div className="skeleton" style={{ height: '12rem' }} />
        </div>
      </div>
    );
  }

  if (!sections) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const shellClass = `admin-shell${collapsed ? ' collapsed' : ''}`;

  return (
    <div className={shellClass}>
      <aside className={`admin-sidebar${collapsed ? ' is-collapsed' : ''}`}>
        <div className="brand">
          <button
            type="button"
            className="brand-collapse-btn"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <span className="brand-tile"><Plane size={18} style={{ transform: 'rotate(45deg)' }} /></span>
          <span className="brand-text">
            <span className="brand-name">Admin</span>
            <span className="brand-tag">Sections editor</span>
          </span>
        </div>
        <nav className="admin-nav" aria-label="Admin sections">
          <Link
            to="/admin"
            className={navClass('/admin')}
            title={collapsed ? 'Overview' : undefined}
            aria-current={isActive('/admin') ? 'page' : undefined}
          >
            <LayoutDashboard size={16} />
            <span className="nav-link-text">Overview</span>
          </Link>
          <Link
            to="/admin/offers"
            className={navClass('/admin/offers')}
            title={collapsed ? 'Offers quick edit' : undefined}
            aria-current={isActive('/admin/offers') ? 'page' : undefined}
          >
            <BadgePercent size={16} />
            <span className="nav-link-text">Offers quick edit</span>
          </Link>
          <Link
            to="/admin/website-sections"
            className={navClass('/admin/website-sections')}
            title={collapsed ? 'Website sections' : undefined}
            aria-current={isActive('/admin/website-sections') ? 'page' : undefined}
          >
            <LayoutPanelTop size={16} />
            <span className="nav-link-text">Website sections</span>
          </Link>
          <span className="admin-nav-group">
            <span className="nav-link-text">Sections</span>
          </span>
          {editable.map((s) => {
            const Icon = SECTION_ICONS[s.sectionKey] ?? FileText;
            return (
              <Link
                key={s.templateSectionId}
                to={`/admin/sections/${s.templateSectionId}`}
                className={navClass(`/admin/sections/${s.templateSectionId}`)}
                title={collapsed ? (s.displayName || s.sectionKey) : undefined}
                aria-current={isActive(`/admin/sections/${s.templateSectionId}`) ? 'page' : undefined}
              >
                <Icon size={16} />
                <span className="nav-link-text">{s.displayName || s.sectionKey}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          to="/"
          className="admin-nav-link"
          style={{ marginTop: 'auto' }}
          title={collapsed ? 'Back to site' : undefined}
        >
          <ArrowLeft size={16} />
          <span className="nav-link-text">Back to site</span>
        </Link>
      </aside>

      <div className="admin-body">
        <Outlet context={{ sections: editable }} />
      </div>
    </div>
  );
}
