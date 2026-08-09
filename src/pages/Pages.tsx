import type { WebsiteData } from '../types';
import { renderPageSections, getSectionContent, PageHero } from '../components/SectionsView';
import {
  About, Blog, Contact, Destinations, Faq, Gallery, Hero, Offers, Packages, Services, Testimonials,
} from '../components/SectionRenderers';

export function PageView({
  data,
  page,
}: {
  data: WebsiteData | null;
  page: string;
}) {
  const sections = data?.sections ?? [];
  return <>{renderPageSections(sections, page)}</>;
}

export function Home({ data }: { data: WebsiteData | null }) {
  const sections = data?.sections ?? [];
  const byKey = (key: string) => getSectionContent(sections, key);
  const hero = byKey('hero');
  const about = byKey('about');
  const services = byKey('services');
  const destinations = byKey('destinations');
  const packages = byKey('packages');
  const offers = byKey('offers');
  const gallery = byKey('gallery');
  const testimonials = byKey('testimonials');
  const faq = byKey('faq');
  const blog = byKey('blog');
  const contact = byKey('contact');

  return (
    <>
      {hero && <Hero content={hero.content} />}
      {about && <About content={about.content} />}
      {services && <Services content={services.content} />}
      {destinations && <Destinations content={destinations.content} featured />}
      {packages && <Packages content={packages.content} featured />}
      {offers && <Offers content={offers.content} featured />}
      {gallery && <Gallery content={gallery.content} featured />}
      {testimonials && <Testimonials content={testimonials.content} />}
      {faq && <Faq content={faq.content} featured />}
      {blog && <Blog content={blog.content} featured />}
      {contact && <Contact content={contact.content} compact />}
    </>
  );
}

export function AboutPage({ data }: { data: WebsiteData | null }) {
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="about" title="About Us" subtitle="The story, mission, and people behind professional traveling." />
      {renderPageSections(sections, '/about')}
    </>
  );
}

export function DestinationsPage({ data }: { data: WebsiteData | null }) {
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="destinations" title="Destinations" subtitle="Explore the world with our curated destinations." />
      {renderPageSections(sections, '/destinations')}
    </>
  );
}

export function PackagesPage({ data }: { data: WebsiteData | null }) {
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="packages" title="Packages" subtitle="Premium travel packages designed around you." />
      {renderPageSections(sections, '/packages')}
    </>
  );
}

export function OffersPage({ data }: { data: WebsiteData | null }) {
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="offers" title="Offers" subtitle="Limited-time deals for spontaneous travelers." />
      {renderPageSections(sections, '/offers')}
    </>
  );
}

export function GalleryPage({ data }: { data: WebsiteData | null }) {
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="gallery" title="Gallery" subtitle="Moments captured from journeys around the world." />
      {renderPageSections(sections, '/gallery')}
    </>
  );
}

export function SupportPage({ data }: { data: WebsiteData | null }) {
  const sections = data?.sections ?? [];
  return (
    <>
      <PageHero sections={sections} key="contact" title="Support" subtitle="Questions? Get in touch or browse our FAQ." />
      {renderPageSections(sections, '/support')}
    </>
  );
}
