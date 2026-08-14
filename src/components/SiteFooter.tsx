import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Plane, Share2, AtSign } from 'lucide-react';
import type { WebsiteData } from '../types';
import { arr, str } from '../types';
import { BRAND } from '../config';
import { useI18n } from '../i18n';

interface QuickLink { label: string; url: string }
interface Social { platform: string; url: string }
interface DestTitle { title: string }

export function SiteFooter({ data }: { data: WebsiteData | null }) {
  const { t } = useI18n();
  const footerSection = data?.sections?.find((s) => s.sectionKey === 'footer');
  const contact = data?.sections?.find((s) => s.sectionKey === 'contact');
  const destinations = data?.sections?.find((s) => s.sectionKey === 'destinations');
  const brandName = data?.agency?.name || BRAND.name;

  const footerContent = footerSection ? footerSection.content : {};
  const contactContent = contact ? contact.content : {};

  const quickLinks = arr<QuickLink>(footerContent, 'quickLinks');
  const socials = arr<Social>(footerContent, 'socialIcons');
  const destCards = arr<DestTitle>(destinations ? destinations.content : {}, 'cards');

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: '0.75rem' }}>
              <span className="brand-tile">
                <Plane size={18} style={{ transform: 'rotate(45deg)' }} />
              </span>
              <span>
                <span className="brand-name">{brandName}</span>
                <span className="brand-tag">{BRAND.tagline}</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
              {str(
                footerContent,
                'description',
                'Curated journeys. Elevated service. Your trusted partner for unforgettable travel.',
              )}
            </p>
            <div className="social-row">
              {(socials.length ? socials : [
                { platform: 'instagram', url: '#' },
                { platform: 'facebook', url: '#' },
              ]).map((s, i) => (
                <a key={i} className="social-btn" href={s.url || '#'} aria-label={s.platform || 'social'}>
                  {(s.platform || '').includes('inst')
                    ? <AtSign size={18} />
                    : <Share2 size={18} />}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>{t('footer.explore')}</h4>
            <div className="footer-links">
              {(quickLinks.length ? quickLinks : [
                { label: t('nav.home'), url: '/' },
                { label: t('nav.destinations'), url: '/destinations' },
                { label: t('nav.packages'), url: '/packages' },
                { label: t('nav.offers'), url: '/offers' },
                { label: t('nav.support'), url: '/support' },
              ]).map((l, i) => (
                <Link key={i} to={l.url || '/'}>{l.label || 'Link'}</Link>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>{t('footer.destinations')}</h4>
            <div className="footer-links">
              {destCards.slice(0, 5).map((d, i) => (
                <span key={i}>{d.title}</span>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>{t('footer.contact')}</h4>
            <div className="footer-contact-row">
              <MapPin className="icon" size={16} />
              {str(contactContent, 'address', BRAND.address)}
            </div>
            <div className="footer-contact-row">
              <Phone className="icon" size={16} />
              {str(contactContent, 'phone', BRAND.phoneDisplay)}
            </div>
            <div className="footer-contact-row">
              <Mail className="icon" size={16} />
              <a href={`mailto:${str(contactContent, 'email', BRAND.email)}`}>
                {str(contactContent, 'email', BRAND.email)}
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {brandName}. {t('footer.rights')}</span>
          <span>{t('footer.crafted')}</span>
        </div>
      </div>
    </footer>
  );
}
