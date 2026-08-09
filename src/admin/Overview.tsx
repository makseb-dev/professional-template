import { useOutletContext, Link } from 'react-router-dom';
import { LayoutDashboard, Package, Shapes, Star } from 'lucide-react';
import type { AdminSection } from '../types';

export function Overview() {
  const { sections } = useOutletContext<{ sections: AdminSection[] }>();
  const editable = sections ?? [];

  return (
    <div>
      <h2 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
        Overview
      </h2>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
        Manage the sections of your website. Pick a section to edit its content.
      </p>

      <div className="admin-stats">
        <div className="admin-card admin-stat">
          <div className="icon-tile"><Shapes size={20} /></div>
          <div><div className="stat-value" style={{ fontSize: '1.5rem' }}>{editable.length}</div><div className="stat-label">Editable sections</div></div>
        </div>
        <div className="admin-card admin-stat">
          <div className="icon-tile"><Package size={20} /></div>
          <div><div className="stat-value" style={{ fontSize: '1.5rem' }}>12</div><div className="stat-label">Total sections</div></div>
        </div>
        <div className="admin-card admin-stat">
          <div className="icon-tile"><Star size={20} /></div>
          <div><div className="stat-value" style={{ fontSize: '1.5rem' }}>Live</div><div className="stat-label">Website status</div></div>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Your sections</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.75rem' }}>
          {editable.map((s) => (
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
      </div>
    </div>
  );
}
