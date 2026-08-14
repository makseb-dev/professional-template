import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  BadgePercent, Check, ChevronDown, Copy, Pencil, Plus, Trash2, X,
} from 'lucide-react';
import { saveSectionContent } from '../api/agency';
import type { AdminSection, SectionContent } from '../types';
import { num, str } from '../types';
import { isOfferActive, OfferCard } from '../components/SectionRenderers';
import type { OfferItem } from '../components/SectionRenderers';
import { slugify } from '../offer';
import {
  ConfirmDialog, DateInput, ImageUploader, ListEditor, NumberInput,
  SelectInput, TextArea, TextInput,
} from './fields';

type OfferRow = Record<string, unknown>;

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function blankOffer(isNew = false): OfferRow {
  const base: OfferRow = {
    id: `offer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: '',
    subtitle: '',
    tagline: '',
    destination: '',
    country: '',
    countryFlag: '',
    imageUrl: '',
    priceFrom: 0,
    currency: 'DZD',
    discountPercentage: 0,
    durationDays: 0,
    durationNights: 0,
    rating: 0,
    reviewsCount: 0,
    validFrom: '',
    validTo: '',
    departureDate: '',
    returnDate: '',
    slug: '',
    ctaLink: '',
    overview: '',
    highlights: [],
    included: [],
    excluded: [],
    requirements: '',
    conditions: '',
    flight: {},
    hotel: {},
    activities: [],
    gallery: [],
    reviews: [],
    translations: {},
  };
  if (isNew) {
    base.validFrom = toISODate(new Date());
    base.validTo = toISODate(addDays(new Date(), 60));
    base.departureDate = toISODate(addDays(new Date(), 14));
    base.returnDate = toISODate(addDays(new Date(), 21));
  }
  return base;
}

function getGal(draft: OfferRow): string[] {
  const g = draft.gallery;
  if (Array.isArray(g) && g.length > 0) return g as string[];
  const cover = str(draft, 'imageUrl');
  return cover ? [cover] : [];
}

function humanError(e: unknown): string {
  const raw = (e as Error)?.message ?? '';
  if (
    raw.includes('500') ||
    raw.includes('Network') ||
    raw.includes('ECONN') ||
    raw.includes('fetch failed')
  ) {
    return "We couldn't reach the server. Please check your connection and try again.";
  }
  return "We couldn't save your changes. Please check the highlighted fields and try again.";
}

export function OffersEditor() {
  const { sections } = useOutletContext<{ sections: AdminSection[] }>();
  const offersSection = sections?.find((s) => s.sectionKey === 'offers');

  const [items, setItems] = useState<OfferRow[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
  const [draft, setDraft] = useState<OfferRow>(blankOffer());
  const [modalKey, setModalKey] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = (offersSection?.content ?? {}) as SectionContent;
    const arr = raw.items;
    setItems(Array.isArray(arr) ? (arr as OfferRow[]) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offersSection?.templateSectionId]);

  const liveCount = useMemo(
    () => items.filter((it) => isOfferActive(it as any)).length,
    [items],
  );

  if (!offersSection) {
    return (
      <div className="error-banner">
        Offers section not found in this agency's sections.
      </div>
    );
  }

  const openAdd = () => {
    setEditing(items.length);
    setDraft(blankOffer(true));
    setError('');
    setSaved(false);
    setModalKey((k) => k + 1);
  };

  const openEdit = (index: number) => {
    setEditing(index);
    setDraft({ ...items[index] });
    setError('');
    setSaved(false);
    setModalKey((k) => k + 1);
  };

  const duplicateOffer = (index: number) => {
    const src = items[index];
    const copy: OfferRow = {
      ...JSON.parse(JSON.stringify(src)),
      id: `offer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: `${str(src, 'title', 'Offer')} (copy)`,
      slug: '',
    };
    const next = [...items, copy];
    setItems(next);
    setSaved(false);
  };

  const removeOffer = () => {
    if (confirmRemove === null) return;
    setItems(items.filter((_, i) => i !== confirmRemove));
    setConfirmRemove(null);
    setEditing(null);
    setSaved(false);
  };

  const makeSlug = (title: string): string => {
    let slug = slugify(title) || `offer-${Date.now()}`;
    let i = 2;
    while (items.some((it) => str(it, 'slug') === slug)) {
      slug = `${slugify(title) || 'offer'}-${i}`;
      i += 1;
    }
    return slug;
  };

  const saveDraft = () => {
    const title = str(draft, 'title', '').trim();
    if (!title) {
      setError('Give this offer a title before saving.');
      return;
    }
    if (editing === null) {
      setError('Nothing selected to save.');
      return;
    }
    const ready: OfferRow = { ...draft, title };
    if (!str(ready, 'slug', '').trim()) {
      ready.slug = makeSlug(title);
    }
    const next = [...items];
    if (editing >= items.length) {
      next.push(ready);
    } else {
      next[editing] = ready;
    }
    setItems(next);
    setEditing(null);
    setDraft(blankOffer());
    setModalKey((k) => k + 1);
    setSaved(false);
  };

  const publish = async () => {
    setSaving(true);
    setError('');
    try {
      await saveSectionContent(offersSection.templateSectionId, {
        ...(offersSection.content ?? {}),
        items,
      } as SectionContent);
      setSaved(true);
    } catch (e) {
      setError(humanError(e));
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ maxWidth: 980 }}>
      <Link to="/admin" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>← Overview</Link>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 className="section-title" style={{ fontSize: '1.75rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            Offers
          </h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Add, edit and publish the travel offers shown on your offers page and home page.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> New offer
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {saved && (
        <div className="success-banner">
          <Check size={14} /> Published — the public site now shows your latest offers.
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-row admin-table-head">
          <span className="admin-thumb" />
          <span>Offer</span>
          <span>Price</span>
          <span>Duration</span>
          <span>Rating</span>
          <span>Valid until</span>
          <span>Status</span>
          <span />
        </div>
        {items.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            No offers yet. Click “New offer” to create your first one.
          </div>
        )}
        {items.map((it, i) => (
          <div className="admin-table-row" key={str(it, 'id') || i}>
            <span className="admin-thumb">
              {getGal(it)[0] ? (
                <img
                  src={getGal(it)[0]}
                  alt=""
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  style={{ width: 46, height: 34, objectFit: 'cover', borderRadius: '6px' }}
                />
              ) : (
                <span style={{ width: 46, height: 34, borderRadius: '6px', background: 'var(--muted)', display: 'block' }} />
              )}
            </span>
            <span>
              <strong>{str(it, 'title')}</strong>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                {str(it, 'countryFlag')} {str(it, 'country') || '—'}
              </span>
            </span>
            <span style={{ fontWeight: 700 }}>
              {num(it, 'priceFrom', 0).toLocaleString()} <small style={{ color: 'var(--muted-foreground)' }}>{str(it, 'currency', 'DZD')}</small>
            </span>
            <span>{num(it, 'durationDays', 0) ? `${num(it, 'durationDays', 0)}d${num(it, 'durationNights', 0) ? `/${num(it, 'durationNights', 0)}n` : ''}` : '—'}</span>
            <span>{num(it, 'rating', 0) > 0 ? `★ ${num(it, 'rating', 0).toFixed(1)}` : '—'}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
              {str(it, 'validTo') ? new Date(str(it, 'validTo')).toLocaleDateString() : '—'}
            </span>
            <span>
              <span className={`badge ${isOfferActive(it as any) ? 'badge-live' : 'badge-off'}`}>
                {isOfferActive(it as any) ? 'Live' : 'Expired'}
              </span>
            </span>
            <span style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
              <button type="button" className="icon-btn" onClick={() => duplicateOffer(i)} title="Duplicate offer" aria-label={`Duplicate ${str(it, 'title')}`}>
                <Copy size={14} />
              </button>
              <button type="button" className="icon-btn" onClick={() => openEdit(i)} title="Edit" aria-label={`Edit ${str(it, 'title')}`}>
                <Pencil size={15} />
              </button>
              <button type="button" className="icon-btn icon-btn-danger" onClick={() => setConfirmRemove(i)} title="Delete" aria-label={`Delete ${str(it, 'title')}`}>
                <Trash2 size={15} />
              </button>
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
          <BadgePercent size={14} style={{ verticalAlign: '-2px' }} /> {items.length} offers · {liveCount} live
        </span>
        <button className="btn btn-primary" onClick={publish} disabled={saving}>
          {saving ? 'Publishing…' : 'Publish changes'}
        </button>
      </div>

      {editing !== null && (
        <OfferModal
          key={modalKey}
          draft={draft}
          isNew={editing >= items.length}
          setField={setField}
          onClose={() => setEditing(null)}
          onSave={saveDraft}
          error={error}
        />
      )}

      <ConfirmDialog
        open={confirmRemove !== null}
        title="Delete this offer?"
        confirmLabel="Delete offer"
        tone="danger"
        message={
          <>
            <strong>{confirmRemove !== null ? str(items[confirmRemove], 'title', 'This offer') : ''}</strong>{' '}
            will be removed from your site. This action cannot be undone.
          </>
        }
        onConfirm={removeOffer}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}

/* --------------------------------------------------------------------
   OfferModal — human-friendly offer editor. No JSON, no arrays, no
   technical field names. Everything is converted internally.
   -------------------------------------------------------------------- */

function OfferModal({
  draft,
  isNew,
  setField,
  onClose,
  onSave,
  error,
}: {
  draft: OfferRow;
  isNew: boolean;
  setField: (key: string, value: unknown) => void;
  onClose: () => void;
  onSave: () => void;
  error: string;
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['basics']));

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const photos = getGal(draft);
  const setPhotos = (list: string[]) => {
    setField('gallery', list);
    setField('imageUrl', list[0] ?? '');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isNew ? 'New offer' : `Edit: ${str(draft, 'title') || 'untitled'}`}</h3>
          <button type="button" className="icon-btn" onClick={onClose} title="Close" aria-label="Close">
            <X size={17} />
          </button>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <div className="modal-body">
          <div className="modal-offer-preview">
            <span className="modal-offer-preview-label">Live card preview</span>
            <div style={{ pointerEvents: 'none' }}>
              <OfferCard offer={draft as unknown as OfferItem} />
            </div>
          </div>

          <ModalAccordion id="basics" label="Offer details" description="Title, destination and tagline shown on cards and the detail page." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <TextInput label="Title" required value={str(draft, 'title')} onChange={(v) => setField('title', v)} placeholder="e.g. Summer trip to Istanbul" hint="The name of the trip. Shown everywhere." />
            <TextInput label="Tagline" value={str(draft, 'tagline')} onChange={(v) => setField('tagline', v)} placeholder="e.g. Domes, bazaars & Bosphorus sunsets" hint="A short, catchy line under the title." />
            <div className="field-row">
              <TextInput label="Destination" value={str(draft, 'destination')} onChange={(v) => setField('destination', v)} placeholder="e.g. Istanbul" />
              <TextInput label="Country" value={str(draft, 'country')} onChange={(v) => setField('country', v)} placeholder="e.g. Türkiye" />
            </div>
            <TextInput label="Country flag" value={str(draft, 'countryFlag')} onChange={(v) => setField('countryFlag', v)} placeholder="e.g. 🇹🇷" hint="A flag emoji shown next to the destination." />
          </ModalAccordion>

          <ModalAccordion id="media" label="Photos" description="Upload the pictures of this trip. The first photo is the cover." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <ImageUploader images={photos} onChange={setPhotos} label="Trip photos" />
          </ModalAccordion>

          <ModalAccordion id="dates" label="Travel dates" description="When the trip leaves and returns, and how long the offer stays published." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <div className="field-row">
              <DateInput label="Departure date" value={str(draft, 'departureDate')} onChange={(v) => setField('departureDate', v)} />
              <DateInput label="Return date" value={str(draft, 'returnDate')} onChange={(v) => setField('returnDate', v)} />
            </div>
            <div className="field-row">
              <DateInput label="Offer valid from" value={str(draft, 'validFrom')} onChange={(v) => setField('validFrom', v)} />
              <DateInput label="Offer valid until" value={str(draft, 'validTo')} onChange={(v) => setField('validTo', v)} hint="After this date the offer is hidden from the site." />
            </div>
          </ModalAccordion>

          <ModalAccordion id="pricing" label="Pricing & rating" description="Starting price, discount and customer rating." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <div className="field-row">
              <NumberInput label="Price from" value={num(draft, 'priceFrom', 0)} onChange={(v) => setField('priceFrom', v)} prefix={str(draft, 'currency', 'DZD')} placeholder="85000" />
              <NumberInput label="Discount" value={num(draft, 'discountPercentage', 0)} onChange={(v) => setField('discountPercentage', v)} suffix="%" hint="e.g. 20 for −20%" />
            </div>
            <div className="field-row">
              <SelectInput label="Currency" value={str(draft, 'currency', 'DZD')} onChange={(v) => setField('currency', v)} options={['DZD', 'EUR', 'USD', 'MAD', 'TND']} />
              <NumberInput label="Rating" value={num(draft, 'rating', 0)} onChange={(v) => setField('rating', Math.min(5, Math.max(0, v)))} min={0} max={5} step={0.1} hint="0 to 5 stars" />
            </div>
            <NumberInput label="Number of reviews" value={num(draft, 'reviewsCount', 0)} onChange={(v) => setField('reviewsCount', Math.max(0, Math.floor(v)))} min={0} />
          </ModalAccordion>

          <ModalAccordion id="duration" label="Trip length" description="How long the trip lasts." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <div className="field-row">
              <NumberInput label="Days" value={num(draft, 'durationDays', 0)} onChange={(v) => setField('durationDays', Math.max(0, Math.floor(v)))} min={0} placeholder="7" />
              <NumberInput label="Nights" value={num(draft, 'durationNights', 0)} onChange={(v) => setField('durationNights', Math.max(0, Math.floor(v)))} min={0} placeholder="6" />
            </div>
          </ModalAccordion>

          <ModalAccordion id="trip" label="What's included" description="Description, highlights and inclusions shown on the offer page." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <TextArea label="Description" value={str(draft, 'overview')} onChange={(v) => setField('overview', v)} placeholder="e.g. Discover Istanbul with our 7-day travel package…" rows={4} />
            <ListEditor label="Highlights" value={arrOf(draft.highlights)} onChange={(v) => setField('highlights', v)} placeholder="e.g. 5★ Bosphorus hotel, direct flights…" addLabel="Add highlight" />
            <ListEditor label="Included" value={arrOf(draft.included)} onChange={(v) => setField('included', v)} placeholder="e.g. Round-trip flights, daily breakfast…" addLabel="Add included item" />
            <ListEditor label="Not included" value={arrOf(draft.excluded)} onChange={(v) => setField('excluded', v)} placeholder="e.g. Travel insurance…" addLabel="Add not-included item" />
          </ModalAccordion>

          <ModalAccordion id="flight" label="Flight" description="Flight information shown on the offer page." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <FlightFields draft={draft} setField={setField} />
          </ModalAccordion>

          <ModalAccordion id="hotel" label="Hotel" description="Where travellers stay. Shown on the offer page." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <HotelFields draft={draft} setField={setField} />
          </ModalAccordion>

          <ModalAccordion id="terms" label="Requirements & conditions" description="Documents travellers need and cancellation rules." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <TextArea label="Documents & requirements" value={str(draft, 'requirements')} onChange={(v) => setField('requirements', v)} placeholder="e.g. Valid passport with 6+ months, visa required…" rows={3} />
            <TextArea label="Cancellation & conditions" value={str(draft, 'conditions')} onChange={(v) => setField('conditions', v)} placeholder="e.g. Free cancellation 14 days before departure…" rows={3} />
          </ModalAccordion>

          <ModalAccordion id="advanced" label="Link & advanced" description="Optional technical settings. You can usually leave these alone." openGroups={openGroups} onToggle={(id) => toggleGroup(id)}>
            <TextInput label="Web link" value={str(draft, 'slug')} onChange={(v) => setField('slug', v)} placeholder="auto-created from the title" hint="Leave empty — we create a link from the title automatically." />
            <TextInput label="Button link (optional)" value={str(draft, 'ctaLink')} onChange={(v) => setField('ctaLink', v)} placeholder="e.g. /offers/istanbul-cultural-escape" hint="Advanced. Most offers don't need this." />
          </ModalAccordion>
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>
            <Check size={15} /> Save offer
          </button>
        </div>
      </div>
    </div>
  );
}

function arrOf(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

function sub(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function FlightFields({
  draft,
  setField,
}: {
  draft: OfferRow;
  setField: (key: string, value: unknown) => void;
}) {
  const f = sub(draft.flight);
  const set = (k: string, v: string) => setField('flight', { ...f, [k]: v });
  return (
    <>
      <div className="field-row">
        <TextInput label="Airline" value={str(f, 'airline')} onChange={(v) => set('airline', v)} placeholder="e.g. Turkish Airlines" />
        <TextInput label="Flight duration" value={str(f, 'duration')} onChange={(v) => set('duration', v)} placeholder="e.g. 3h 15m" />
      </div>
      <div className="field-row">
        <TextInput label="Departure city" value={str(f, 'departureCity')} onChange={(v) => set('departureCity', v)} placeholder="e.g. Algiers" />
        <TextInput label="Departure airport" value={str(f, 'departureAirport')} onChange={(v) => set('departureAirport', v)} placeholder="e.g. ALG — Houari Boumediene" />
      </div>
      <div className="field-row">
        <TextInput label="Arrival city" value={str(f, 'arrivalCity')} onChange={(v) => set('arrivalCity', v)} placeholder="e.g. Istanbul" />
        <TextInput label="Arrival airport" value={str(f, 'arrivalAirport')} onChange={(v) => set('arrivalAirport', v)} placeholder="e.g. IST — Istanbul Airport" />
      </div>
      <div className="field-row">
        <DateInput label="Departure" value={str(f, 'departureDate')} onChange={(v) => set('departureDate', v)} hint="Shown as a date on the site" />
        <TextInput label="Return flight" value={str(f, 'returnDepartureTime')} onChange={(v) => set('returnDepartureTime', v)} placeholder="e.g. 18:30" hint="Return departure time, if known" />
      </div>
    </>
  );
}

function HotelFields({
  draft,
  setField,
}: {
  draft: OfferRow;
  setField: (key: string, value: unknown) => void;
}) {
  const h = sub(draft.hotel);
  const set = (k: string, v: unknown) => setField('hotel', { ...h, [k]: v });
  return (
    <>
      <div className="field-row">
        <TextInput label="Hotel name" value={str(h, 'name')} onChange={(v) => set('name', v)} placeholder="e.g. Pera Palace Hotel" />
        <NumberInput label="Stars" value={num(h, 'stars', 0)} onChange={(v) => set('stars', Math.min(5, Math.max(0, v)))} min={0} max={5} />
      </div>
      <TextArea label="Hotel description" value={str(h, 'description')} onChange={(v) => set('description', v)} rows={3} placeholder="e.g. Boutique hotel overlooking the Golden Horn…" />
      <ListEditor label="Amenities" value={arrOf(h.amenities)} onChange={(v) => set('amenities', v)} placeholder="e.g. Free Wi-Fi, breakfast included…" addLabel="Add amenity" />
    </>
  );
}

function ModalAccordion({
  id,
  label,
  description,
  openGroups,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  openGroups: Set<string>;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const open = openGroups.has(id);
  return (
    <div className={`field-group ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="field-accordion-summary modal-accordion-summary"
        onClick={() => onToggle(id)}
      >
        <ChevronDown size={16} className="field-accordion-chevron" />
        <span className="field-accordion-title">
          <strong>{label}</strong>
          {description && <em className="field-accordion-desc">{description}</em>}
        </span>
      </button>
      {open && <div className="field-accordion-body">{children}</div>}
    </div>
  );
}