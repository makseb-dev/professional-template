import type { ReactNode } from 'react';
import type { SectionEntry } from '../types';
import { isEnabled, str } from '../types';
import { SECTION_RENDERERS } from './SectionRenderers';

export function renderSection(section: SectionEntry): ReactNode | null {
  if (!isEnabled(section)) return null;
  const Renderer = SECTION_RENDERERS[section.sectionKey];
  if (!Renderer) {
    return null;
  }
  return <Renderer content={section.content} />;
}

const PAGE_SECTIONS: Record<string, string[]> = {
  '/': ['hero', 'about', 'services', 'destinations', 'packages', 'offers', 'gallery', 'testimonials', 'faq', 'blog', 'contact'],
  '/about': ['about'],
  '/packages': ['packages'],
  '/destinations': ['destinations'],
  '/offers': ['offers'],
  '/gallery': ['gallery'],
  '/support': ['faq', 'contact'],
};

export function renderPageSections(
  sections: SectionEntry[],
  page: string,
): ReactNode[] {
  const keys = PAGE_SECTIONS[page] ?? PAGE_SECTIONS['/'];
  return sections
    .filter((s) => isEnabled(s) && keys.includes(s.sectionKey))
    .map((s) => renderSection(s))
    .filter((n): n is ReactNode => n !== null);
}

export function getSectionContent(
  sections: SectionEntry[],
  key: string,
): SectionEntry | undefined {
  return sections.find((s) => s.sectionKey === key && isEnabled(s));
}

export function PageHero({
  sections,
  key: sectionKey,
  title,
  subtitle,
}: {
  sections: SectionEntry[];
  key: string;
  title: string;
  subtitle: string;
}) {
  const section = getSectionContent(sections, sectionKey);
  const heading = section ? str(section.content, 'heading', title) : title;
  const lead = section ? str(section.content, 'description', subtitle) : subtitle;
  return (
    <section className="page-hero">
      <div className="container">
        <span className="eyebrow">{sectionKey}</span>
        <h1>{heading}</h1>
        <p>{lead}</p>
      </div>
    </section>
  );
}
