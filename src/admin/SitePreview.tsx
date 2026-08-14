import { useState } from 'react';
import { renderHomeSections, renderPageSections } from '../components/SectionsView';
import type { SectionEntry } from '../types';
import { PreviewPane } from './PreviewPane';

const PAGE_OPTIONS = [
  { value: '/', label: 'Home' },
  { value: '/about', label: 'About' },
  { value: '/packages', label: 'Packages' },
  { value: '/destinations', label: 'Destinations' },
  { value: '/offers', label: 'Offers' },
  { value: '/gallery', label: 'Gallery' },
  { value: '/support', label: 'Support' },
];

export function SitePreview({ sections }: { sections: SectionEntry[] }) {
  const [page, setPage] = useState('/');

  const current = PAGE_OPTIONS.find((o) => o.value === page) ?? PAGE_OPTIONS[0];
  const content = page === '/' ? renderHomeSections(sections) : renderPageSections(sections, page);

  return (
    <PreviewPane
      sectionKey="site-preview"
      label={`Live preview — ${current.label}`}
      externalHref={page}
      select={
        <select
          className="preview-page-select"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          aria-label="Preview page"
        >
          {PAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      }
    >
      <div className="site-preview-canvas">{content}</div>
    </PreviewPane>
  );
}