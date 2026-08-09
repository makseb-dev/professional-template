import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSectionDetails, saveSectionContent } from '../api/agency';
import type { FieldSchema, SectionContent, SectionDetails } from '../types';

export function SectionEditor() {
  const { templateSectionId = '' } = useParams();
  const [details, setDetails] = useState<SectionDetails | null>(null);
  const [draft, setDraft] = useState<SectionContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchSectionDetails(templateSectionId);
      setDetails(d);
      setDraft((d.content ?? {}) as SectionContent);
      setErrors([]);
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
    } catch (e) {
      const err = e as Error & { fieldErrors?: { field: string; message: string }[] };
      setErrors(err.fieldErrors ?? [{ field: '_', message: err.message }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '4rem' }}>Loading section…</div>;

  if (!details) {
    return <div className="error-banner">Could not load section.</div>;
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <Link to="/admin" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>← Overview</Link>
      <h2 className="section-title" style={{ fontSize: '1.75rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
        {details.displayName}
      </h2>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Section key: <code>{details.sectionKey}</code>
        {details.schema.description ? ` — ${details.schema.description}` : ''}
      </p>

      {errors.filter((e) => e.field === '_').map((e, i) => (
        <div className="error-banner" key={i}>{e.message}</div>
      ))}
      {saved && (
        <div className="success-banner">
          Section saved successfully.
        </div>
      )}

      <div className="admin-card">
        {Object.entries(details.schema.fields).map(([key, field]) => (
          <FieldEditor
            key={key}
            name={key}
            field={field}
            value={draft[key]}
            errors={errors.filter((e) => e.field === key || e.field.startsWith(`${key}.`) || e.field.startsWith(`${key}[`))}
            onChange={(v) => setValue([key], v)}
          />
        ))}
      </div>

      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save section'}
      </button>
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
  return (
    <div className="field" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
      <label htmlFor={`field-${name}`}>
        {name} {field.required ? ' *' : ''}
        {field.description && <span style={{ textTransform: 'none', letterSpacing: 0 }}> — {field.description}</span>}
      </label>

      {field.type === 'string' && (
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
        <select id={`field-${name}`} value={value === true ? 'true' : value === false ? 'false' : ''} onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value === 'true')}>
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
    <div style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

function ArrayEditor({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: unknown[];
  onChange: (v: unknown) => void;
}) {
  const isItemObj = !!field.itemShape;
  const itemShape = field.itemShape;

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
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      {(value as unknown[]).map((item, i) => (
        <div key={i} style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem' }}>
          {isItemObj && itemShape ? (
            <ObjectEditor
              fields={itemShape}
              value={(item && typeof item === 'object' && !Array.isArray(item) ? item : {}) as Record<string, unknown>}
              onChange={(v) => updateItem(i, v)}
            />
          ) : (
            <input
              type="text"
              value={typeof item === 'string' ? item : typeof item === 'number' ? String(item) : ''}
              onChange={(e) => updateItem(i, field.arrayItemType === 'number' ? Number(e.target.value) : e.target.value)}
            />
          )}
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
