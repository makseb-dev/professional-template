import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import type { WebsiteData } from '../types';

export function PublicLayout({
  data,
  children,
}: {
  data: WebsiteData | null;
  children: React.ReactNode;
}) {
  return (
    <div className="app">
      <SiteHeader data={data} />
      <main>{children}</main>
      <SiteFooter data={data} />
    </div>
  );
}
