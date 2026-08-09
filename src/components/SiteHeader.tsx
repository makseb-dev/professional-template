import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Moon, Plane, Sun, X } from 'lucide-react';
import type { WebsiteData } from '../types';
import { BRAND, NAV_LINKS } from '../config';
import { useTheme } from '../hooks/useTheme';

export function SiteHeader({ data }: { data: WebsiteData | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const brandName = data?.agency?.name || BRAND.name;

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-tile">
            <Plane size={20} style={{ transform: 'rotate(45deg)' }} />
          </span>
          <span>
            <span className="brand-name">{brandName}</span>
            <span className="brand-tag">{BRAND.tagline}</span>
          </span>
        </Link>

        <nav className="nav-desktop" aria-label="Primary">
          {NAV_LINKS.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="icon-btn"
            aria-label="Toggle dark mode"
            onClick={toggle}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/packages"
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.2rem' }}
          >
            Book Now
          </Link>
          <button
            className="menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>☰</span>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-menu" aria-label="Mobile">
          {NAV_LINKS.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {n.label}
            </NavLink>
          ))}
          <button
            className="icon-btn"
            style={{ alignSelf: 'flex-start' }}
            aria-label="Toggle dark mode"
            onClick={toggle}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      )}
    </header>
  );
}
