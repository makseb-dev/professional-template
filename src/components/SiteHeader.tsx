import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Globe, Moon, Plane, Sun, X } from 'lucide-react';
import type { WebsiteData } from '../types';
import { BRAND, NAV_LINKS } from '../config';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../i18n';

const NAV_KEY: Record<string, string> = {
  '/': 'nav.home',
  '/destinations': 'nav.destinations',
  '/packages': 'nav.packages',
  '/offers': 'nav.offers',
  '/gallery': 'nav.gallery',
  '/blog': 'nav.blog',
  '/about': 'nav.about',
  '/support': 'nav.support',
};

export function SiteHeader({ data }: { data: WebsiteData | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { t, locale, setLocale } = useI18n();

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
  const switchLocale = () => setLocale(locale === 'fr' ? 'en' : 'fr');

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
              {t(NAV_KEY[n.to] ?? n.label)}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="lang-switch"
            aria-label="Switch language"
            onClick={switchLocale}
          >
            <Globe size={16} style={{ color: 'var(--primary)' }} />
            {locale.toUpperCase()}
          </button>
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
            {t('detail.bookNow')}
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
              {t(NAV_KEY[n.to] ?? n.label)}
            </NavLink>
          ))}
          <button
            className="lang-switch"
            onClick={switchLocale}
          >
            <Globe size={16} /> {locale === 'fr' ? 'EN' : 'FR'}
          </button>
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
