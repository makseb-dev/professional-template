import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Plus,
  Trash2,
} from 'lucide-react';
import { fetchSectionDetails, saveSectionContent } from '../api/agency';
import type { FieldSchema, SectionContent, SectionDetails } from '../types';
import { buildGroups, type FieldGroup } from './sectionGroups';
import { PreviewPane } from './PreviewPane';
import { isImageFieldKey } from './imageField';
import { ImageUploader } from './fields';

const HIDDEN_FIELDS: Record<string, string[]> = {
  hero: ['backgroundImage'],
};

const FRIENDLY_LABELS: Record<string, string> = {
  heading: 'Heading', eyebrow: 'Eyebrow', title: 'Title', subtitle: 'Subtitle',
  tagline: 'Tagline', intro: 'Intro', description: 'Description', content: 'Content',
  paragraph: 'Paragraph', lead: 'Lead', badge: 'Badge', text: 'Text',
  image: 'Image', imageUrl: 'Image URL', hero: 'Hero image', logo: 'Logo',
  avatar: 'Avatar', banner: 'Banner', thumb: 'Thumbnail', photo: 'Photo',
  picture: 'Picture', cover: 'Cover image', backgroundImage: 'Background image',
  images: 'Images', gallery: 'Gallery', photos: 'Photos', media: 'Media',
  phone: 'Phone', phoneNumber: 'Phone number', email: 'Email', address: 'Address',
  map: 'Map', location: 'Location', latitude: 'Latitude', longitude: 'Longitude',
  coordinates: 'Coordinates', city: 'City', country: 'Country',
  ctaLink: 'Button link', ctaText: 'Button text', buttonText: 'Button text',
  buttonLink: 'Button link', whatsapp: 'WhatsApp number', link: 'Link', url: 'URL',
  items: 'Items', cards: 'Cards', list: 'List', offers: 'Offers',
  packages: 'Packages', destinations: 'Destinations', testimonials: 'Testimonials',
  faqs: 'FAQ items', posts: 'Posts', blog: 'Blog posts',
  instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube',
  twitter: 'Twitter', linkedin: 'LinkedIn', social: 'Social links',
  hours: 'Opening hours', schedule: 'Schedule', timing: 'Timing',
  opening: 'Opening hours', worktime: 'Working time',
  validFrom: 'Valid from', validTo: 'Valid until', departureDate: 'Departure date',
  returnDate: 'Return date', priceFrom: 'Price from', currency: 'Currency',
  discountPercentage: 'Discount %', durationDays: 'Days', durationNights: 'Nights',
  rating: 'Rating', reviewsCount: 'Reviews count', countryFlag: 'Country flag',
  slug: 'Link', statistics: 'Stats', members: 'Team members', partners: 'Partners',
  activities: 'Activities', flyer: 'Flyer', paragraph1: 'Paragraph 1',
  paragraph2: 'Paragraph 2', mission: 'Mission', vision: 'Vision',
};

function humanLabel(name: string): string {
  const known = FRIENDLY_LABELS[name];
  if (known) return known;
  return String(name)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

function looksLikeDate(v: unknown): boolean {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v);
}

function isDateField(name: string, field: FieldSchema, value: unknown): boolean {
  return (
    field.type === 'string' &&
    !field.options &&
    /(date|valid|depart|return|arrival)/i.test(name) &&
    (!value || looksLikeDate(value))
  );
}

export function SectionEditor() {
  const { templateSectionId = '' } = useParams();
  const [details, setDetails] = useState<SectionDetails | null>(null);
  const [draft, setDraft] = useState<SectionContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const formRef = useRef<HTMLDivElement>(null);
  const previewStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = formRef.current;
    const stage = previewStageRef.current;
    if (!form || !stage) return;

    const syncRatio = (ratio: number) => {
      if (stage.scrollHeight <= stage.clientHeight) return;
      stage.scrollTop = Math.min(
        1,
        Math.max(0, ratio),
      ) * (stage.scrollHeight - stage.clientHeight);
    };

    let raf = 0;
    const syncFromScroll = () => {
      raf = 0;
      const rect = form.getBoundingClientRect();
      const total = form.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      syncRatio(Math.max(0, -rect.top) / total);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(syncFromScroll);
    };
    const onResize = () => syncFromScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const syncToElement = (el: HTMLElement) => {
      const formRect = form.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const center = elRect.top + elRect.height / 2 - formRect.top;
      if (form.scrollHeight <= 0) return;
      syncRatio(center / form.scrollHeight);
    };

    const onFormFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) syncToElement(target);
    };
    const onFormClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest(
        '.field-accordion-summary, .item-accordion-summary, .field, button',
      ) as HTMLElement | null;
      if (target) syncToElement(target);
    };

    form.addEventListener('focusin', onFormFocus);
    form.addEventListener('click', onFormClick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      form.removeEventListener('focusin', onFormFocus);
      form.removeEventListener('click', onFormClick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [details]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchSectionDetails(templateSectionId);
      setDetails(d);
      setDraft((d.content ?? {}) as SectionContent);
      setErrors([]);
      setDirty(false);
    } catch (e) {
      setErrors([{ field: '_', message: (e as Error).message }]);
    } finally {
      setLoading(false);
    }
  }, [templateSectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setValue = (path: string[], value: unknown) => {
    setSaved(false);
    setDirty(true);
    setErrors([]);
    setDraft((prev) => {
      const next: SectionContent = { ...prev };
      let cur: Record<string, unknown> = next;
      for (let i = 0; i < path.length - 1; i++) {
        const existing = cur[path[i]];
        if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
          cur[path[i]] = { ...(existing as Record<string, unknown>) };
        } else {
          cur[path[i]] = {};
        }
        cur = cur[path[i]] as Record<string, unknown>;
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setErrors([]);
    setSaved(false);
    try {
      await saveSectionContent(templateSectionId, draft);
      setSaved(true);
      setDirty(false);
    } catch (e) {
      const err = e as Error & { fieldErrors?: { field: string; message: string }[] };
      setErrors(err.fieldErrors ?? [{ field: '_', message: err.message }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="editor-skeleton" aria-busy="true" />;

  if (!details) {
    return <div className="error-banner">Could not load section.</div>;
  }

  const hidden = HIDDEN_FIELDS[details.sectionKey] ?? [];
  const groups = buildGroups(
    details.sectionKey,
    Object.keys(details.schema.fields).filter((k) => !hidden.includes(k)),
  );

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenGroups(new Set(groups.map((g) => g.id)));
  const collapseAll = () => setOpenGroups(new Set());

  return (
    <div className="sec-editor">
      <div className="sec-editor-top">
        <div className="sec-editor-top-info">
          <Link to="/admin" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            ← Overview
          </Link>
          <h2 className="section-title" style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>
            {details.displayName}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', margin: 0, fontSize: '0.85rem' }}>
            Section key: <code>{details.sectionKey}</code>
            {details.schema.description ? ` — ${details.schema.description}` : ''}
          </p>
        </div>
        <div className="sec-editor-top-actions">
          <button type="button" className="btn btn-secondary" onClick={collapseAll} title="Collapse all groups">
            <ChevronsDownUp size={15} /> Collapse
          </button>
          <button type="button" className="btn btn-secondary" onClick={expandAll} title="Expand all groups">
            <ChevronsUpDown size={15} /> Expand
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : dirty ? 'Save changes' : 'Save section'}
          </button>
        </div>
      </div>

      {errors.filter((e) => e.field === '_').map((e, i) => (
        <div className="error-banner" key={i}>{e.message}</div>
      ))}
      {saved && <div className="success-banner">Section saved successfully.</div>}

      <div className="sec-editor-grid">
        <div className="sec-editor-form" ref={formRef}>
          <div className="admin-card" style={{ padding: '0.5rem 0' }}>
            {groups.map((group) => (
              <FieldAccordion
                key={group.id}
                group={group}
                open={openGroups.has(group.id)}
                onToggle={() => toggleGroup(group.id)}
              >
                {group.fields.map((key) => {
                  const field = details.schema.fields[key];
                  if (!field) return null;
                  return (
                    <FieldEditor
                      key={key}
                      name={key}
                      field={field}
                      value={draft[key]}
                      errors={errors.filter(
                        (e) => e.field === key || e.field.startsWith(`${key}.`) || e.field.startsWith(`${key}[`),
                      )}
                      onChange={(v) => setValue([key], v)}
                    />
                  );
                })}
              </FieldAccordion>
            ))}
          </div>
        </div>

        <aside className="sec-editor-preview">
          <PreviewPane sectionKey={details.sectionKey} content={draft} label={`${details.displayName} — live preview`} stageRef={previewStageRef} />
        </aside>
      </div>
    </div>
  );
}

function FieldAccordion({
  group,
  open,
  onToggle,
  children,
}: {
  group: FieldGroup;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`field-accordion ${open ? 'is-open' : ''}`}>
      <button type="button" className="field-accordion-summary" onClick={onToggle}>
        <ChevronDown size={16} className="field-accordion-chevron" />
        <span className="field-accordion-title">
          <strong>{group.label}</strong>
          {group.description && (
            <em className="field-accordion-desc">{group.description}</em>
          )}
        </span>
        <span className="field-accordion-count">
          {group.fields.length} {group.fields.length === 1 ? 'field' : 'fields'}
        </span>
      </button>
      {open && <div className="field-accordion-body">{children}</div>}
    </div>
  );
}

function FieldEditor({
  name,
  field,
  value,
  errors,
  onChange,
}: {
  name: string;
  field: FieldSchema;
  value: unknown;
  errors: { field: string; message: string }[];
  onChange: (v: unknown) => void;
}) {
  const label = humanLabel(name);
  const date = isDateField(name, field, value);
  const singleImage = field.type === 'string' && !date && isImageFieldKey(name);
  const imageArray =
    field.type === 'array' &&
    field.arrayItemType === 'string' &&
    isImageFieldKey(name) &&
    value !== undefined;
  return (
    <div className="field" style={{ marginBottom: '1rem' }}>
      {singleImage && (
        <ImageUploader
          label={`${label}${field.required ? ' *' : ''}${field.description ? ` — ${field.description}` : ''}`}
          images={typeof value === 'string' && value ? [value] : []}
          onChange={(v) => onChange(v[0] ?? '')}
        />
      )}
      {imageArray && (
        <ImageUploader
          label={`${label}${field.required ? ' *' : ''}${field.description ? ` — ${field.description}` : ''}`}
          images={Array.isArray(value) ? (value as string[]) : []}
          onChange={(v) => onChange(v)}
        />
      )}
      {!singleImage && !imageArray && (
        <>
          <label htmlFor={`field-${name}`}>
            {label} {field.required ? ' *' : ''}
            {field.description && (
              <span style={{ textTransform: 'none', letterSpacing: 0 }}> — {field.description}</span>
            )}
          </label>
          {date && (
            <input
              id={`field-${name}`}
              type="date"
              value={looksLikeDate(value) ? String(value) : ''}
              onChange={(e) => onChange(e.target.value || undefined)}
            />
          )}
          {!date && field.type === 'string' && field.options && (
            <select
              id={`field-${name}`}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
            >
              <option value="">—</option>
              {field.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )}
          {!date && field.type === 'string' && !field.options && (
            <input
              id={`field-${name}`}
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
          {field.type === 'number' && (
            <input
              id={`field-${name}`}
              type="number"
              step="any"
              value={typeof value === 'number' ? value : ''}
              onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          )}
          {field.type === 'boolean' && (
            <select
              id={`field-${name}`}
              value={value === true ? 'true' : value === false ? 'false' : ''}
              onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">—</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          )}
          {field.type === 'object' && field.fields && (
            <ObjectEditor
              fields={field.fields}
              value={(value && typeof value === 'object' && !Array.isArray(value) ? value : {}) as Record<string, unknown>}
              onChange={onChange}
            />
          )}
          {field.type === 'array' && (
            <ArrayEditor
              field={field}
              value={Array.isArray(value) ? value : []}
              onChange={onChange}
            />
          )}
          {field.type === 'json' && (
            <JsonEditor value={value} onChange={onChange} errors={errors} />
          )}
        </>
      )}

      {errors.map((e, i) => (
        <div key={i} style={{ color: 'var(--destructive)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{e.message}</div>
      ))}
    </div>
  );
}

function JsonEditor({
  value,
  onChange,
  errors,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  errors: { field: string; message: string }[];
}) {
  const [text, setText] = useState<string>(() =>
    value === undefined || value === null ? '' : JSON.stringify(value, null, 2),
  );
  const [invalid, setInvalid] = useState<string | null>(null);

  const apply = (raw: string) => {
    setText(raw);
    if (!raw.trim()) {
      setInvalid(null);
      onChange(undefined);
      return;
    }
    try {
      onChange(JSON.parse(raw));
      setInvalid(null);
    } catch (e) {
      setInvalid((e as Error).message);
    }
  };

  return (
    <div>
      <textarea
        rows={8}
        spellCheck={false}
        value={text}
        onChange={(e) => apply(e.target.value)}
        style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }}
        placeholder="{ }"
      />
      {invalid && (
        <div style={{ color: 'var(--destructive)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
          Invalid JSON: {invalid}
        </div>
      )}
      {errors.map((e, i) => (
        <div key={i} style={{ color: 'var(--destructive)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{e.message}</div>
      ))}
    </div>
  );
}

function ObjectEditor({
  fields,
  value,
  onChange,
}: {
  fields: Record<string, FieldSchema>;
  value: Record<string, unknown>;
  onChange: (v: unknown) => void;
}) {
  return (
    <div className="object-editor">
      {Object.entries(fields).map(([key, field]) => (
        <FieldEditor
          key={key}
          name={key}
          field={field}
          value={value[key]}
          errors={[]}
          onChange={(v) => onChange({ ...value, [key]: v })}
        />
      ))}
    </div>
  );
}

const ITEM_TITLE_KEYS = [
  'title',
  'name',
  'heading',
  'label',
  'destination',
  'offer',
  'package',
  'city',
  'country',
];

function deriveItemTitle(item: unknown, index: number): string {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const rec = item as Record<string, unknown>;
    for (const k of ITEM_TITLE_KEYS) {
      const v = rec[k];
      if (typeof v === 'string' && v.trim()) {
        return v.trim().length > 42 ? `${v.trim().slice(0, 42)}…` : v.trim();
      }
    }
  }
  return `Item ${index + 1}`;
}

function ArrayEditor({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: unknown[];
  onChange: (v: unknown) => void;
}) {
  const itemShape = field.itemShape;
  const isItemObj = !!itemShape;
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const updateItem = (index: number, v: unknown) => {
    const next = [...value];
    next[index] = v;
    onChange(next);
  };
  const addItem = () => {
    const next = [...value];
    if (isItemObj && itemShape) {
      const blank: Record<string, unknown> = {};
      for (const k of Object.keys(itemShape)) blank[k] = '';
      next.push(blank);
    } else {
      next.push('');
    }
    onChange(next);
  };
  const removeItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set<number>();
      for (const i of prev) next.add(i > index ? i - 1 : i);
      return next;
    });
    onChange(value.filter((_, i) => i !== index));
  };
  const moveItem = (index: number, dir: number) => {
    const j = index + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
    setOpenItems((prev) => {
      const s = new Set(prev);
      const hasIndex = s.has(index);
      const hasJ = s.has(j);
      if (hasIndex && !hasJ) {
        s.delete(index);
        s.add(j);
      } else if (hasJ && !hasIndex) {
        s.delete(j);
        s.add(index);
      }
      return s;
    });
  };
  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };
  const expandAll = () => setOpenItems(new Set(value.map((_, i) => i)));
  const collapseAll = () => setOpenItems(new Set());

  if (!isItemObj || !itemShape) {
    return (
      <div>
        {(value as unknown[]).map((item, i) => (
          <div key={i} className="array-editor-item">
            <input
              type="text"
              value={typeof item === 'string' ? item : typeof item === 'number' ? String(item) : ''}
              onChange={(e) => updateItem(i, field.arrayItemType === 'number' ? Number(e.target.value) : e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              style={{ marginTop: '0.5rem', color: 'var(--destructive)', background: 'none', border: 'none', fontSize: '0.8rem' }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          + Add item
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="array-editor-toolbar">
        <span className="array-editor-count">
          {value.length} {value.length === 1 ? 'item' : 'items'}
        </span>
        <div className="array-editor-toolbar-actions">
          <button type="button" className="icon-btn" onClick={collapseAll} title="Collapse all items">
            <ChevronsDownUp size={14} />
          </button>
          <button type="button" className="icon-btn" onClick={expandAll} title="Expand all items">
            <ChevronsUpDown size={14} />
          </button>
        </div>
      </div>

      <div className="array-editor-list">
        {(value as unknown[]).map((item, i) => {
          const open = openItems.has(i);
          return (
            <div key={i} className={`item-accordion${open ? ' is-open' : ''}`}>
              <div className="item-accordion-summary">
                <button
                  type="button"
                  className="item-accordion-toggle"
                  onClick={() => toggleItem(i)}
                  aria-expanded={open}
                >
                  <ChevronDown size={15} className="item-accordion-chevron" />
                  <span className="item-accordion-title">{deriveItemTitle(item, i)}</span>
                </button>
                <div className="item-accordion-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => moveItem(i, -1)}
                    disabled={i === 0}
                    title="Move up"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => moveItem(i, 1)}
                    disabled={i === value.length - 1}
                    title="Move down"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn item-accordion-remove"
                    onClick={() => removeItem(i)}
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {open && (
                <div className="item-accordion-body">
                  <ObjectEditor
                    fields={itemShape}
                    value={(item && typeof item === 'object' && !Array.isArray(item) ? item : {}) as Record<string, unknown>}
                    onChange={(v) => updateItem(i, v)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="btn btn-secondary"
        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
      >
        <Plus size={14} /> Add item
      </button>
    </div>
  );
}